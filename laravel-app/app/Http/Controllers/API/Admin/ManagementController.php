<?php

namespace App\Http\Controllers\API\Admin;

use App\Events\ProductApproveEvent;
use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Banner;
use App\Models\Ad;
use App\Models\VatTax;
use App\Models\Coupon;
use App\Models\Customer;
use App\Models\Driver;
use App\Models\FlashSale;
use App\Models\CourierTracking;
use App\Models\Order;
use App\Models\Product;
use App\Models\ReturnOrder;
use App\Models\Review;
use App\Models\Shop;
use App\Models\User;
use App\Models\Withdraw;
use App\Models\UserNonPermission;
use App\Models\SupportTicket;
use App\Models\SupportTicketMessage;
use App\Models\Page;
use App\Enums\PaymentStatus;
use App\Enums\PaymentMethod;
use App\Enums\Roles;
use App\Http\Requests\ShopCreateRequest;
use App\Http\Requests\RiderRequest;
use App\Http\Requests\BannerRequest;
use App\Http\Requests\VatTaxRequest;
use App\Http\Resources\DriverLocationResource;
use App\Repositories\ShopRepository;
use App\Repositories\CustomerRepository;
use App\Repositories\UserRepository;
use App\Repositories\DriverRepository;
use App\Repositories\NotificationRepository;
use App\Repositories\TransactionRepository;
use App\Repositories\WalletRepository;
use App\Repositories\WithdrawRepository;
use App\Repositories\MediaRepository;
use App\Repositories\BannerRepository;
use App\Repositories\AdsRepository;
use App\Repositories\VatTaxRepository;
use App\Services\NotificationServices;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class ManagementController extends Controller
{
    public function dashboard(Request $request)
    {
        $this->authorizeAdminRoute($request, 'admin.dashboard.index');
        return $this->json('Admin overview.', [
            'summary' => [
                'shops' => Shop::count(),
                'active_shops' => Shop::whereHas('user', fn ($query) => $query->where('is_active', true))->count(),
                'orders' => Order::count(),
                'customers' => Customer::count(),
                'products' => Product::count(),
                'pending_products' => Product::where('is_approve', false)->count(),
                'riders' => User::role('driver')->count(),
            ],
            'recent_orders' => Order::with(['customer.user', 'shop'])->latest('id')->limit(8)->get(),
            'pending_products' => Product::with('shop')->where('is_approve', false)->latest('id')->limit(8)->get(),
        ]);
    }

    public function shops(Request $request)
    {
        $this->authorizeAdminRoute($request, 'admin.shop.index');
        $shops = Shop::with('user:id,name,email,phone,is_active')
            ->withCount(['products', 'orders'])
            ->when($request->filled('search'), fn ($query) => $query->where('name', 'like', '%'.$request->string('search').'%'))
            ->latest('id')->paginate(min($request->integer('per_page', 20), 100));

        return $this->json('Shops.', ['items' => $shops->items(), 'total' => $shops->total(), 'current_page' => $shops->currentPage()]);
    }

    public function toggleShop(Request $request, Shop $shop)
    {
        $this->authorizeAdminRoute($request, 'admin.shop.status.toggle');
        if ($shop->user?->hasRole('root')) {
            return $this->json('The primary root shop cannot be disabled.', [], 422);
        }
        if (app()->environment('local') && $shop->user?->email === 'shop@readyecommerce.com') {
            return $this->json('The demo shop cannot be disabled.', [], 422);
        }

        $shop->user()->update(['is_active' => ! $shop->user->is_active]);

        return $this->json('Shop status updated.', ['shop' => $shop->load('user:id,name,email,is_active')]);
    }

    public function shopDetails(Request $request, Shop $shop)
    {
        $this->authorizeAdminRoute($request, 'admin.shop.show');
        return $this->json('Shop details.', ['shop' => $shop->load(['user:id,name,email,phone,is_active', 'mediaLogo', 'mediaBanner'])->loadCount(['products', 'orders', 'reviews'])]);
    }

    public function shopResources(Request $request, Shop $shop, string $resource)
    {
        $permissions = ['orders' => 'admin.order.index', 'products' => 'admin.product.index', 'categories' => 'admin.category.index', 'reviews' => 'admin.review.index'];
        abort_unless(isset($permissions[$resource]), 404);
        $this->authorizeAdminRoute($request, $permissions[$resource]);
        $relation = $shop->{$resource}();
        if ($resource === 'reviews') $relation->withoutGlobalScopes();
        $items = $relation->latest('id')->paginate(min($request->integer('per_page', 20), 100));
        return $this->json(ucfirst($resource).'.', ['items' => $items->items(), 'total' => $items->total(), 'current_page' => $items->currentPage()]);
    }

    public function storeShop(ShopCreateRequest $request)
    {
        $this->authorizeAdminRoute($request, 'admin.shop.store');
        $shop = ShopRepository::storeByRequest($request);

        return $this->json('Shop created successfully.', ['shop' => $shop->load(['user:id,name,email,phone,is_active', 'mediaLogo', 'mediaBanner'])], 201);
    }

    public function updateShop(ShopCreateRequest $request, Shop $shop)
    {
        $this->authorizeAdminRoute($request, 'admin.shop.update');
        if (app()->environment('local') && $shop->user?->email === 'shop@readyecommerce.com') {
            return $this->json('You cannot update the demo shop in local demo mode.', [], 422);
        }

        $shop = ShopRepository::updateByRequest($shop, $request);

        return $this->json('Shop updated successfully.', ['shop' => $shop->load(['user:id,name,email,phone,is_active', 'mediaLogo', 'mediaBanner'])]);
    }

    public function resetShopPassword(Request $request, Shop $shop)
    {
        $this->authorizeAdminRoute($request, 'admin.shop.reset.password');
        if (app()->environment('local') && $shop->user?->email === 'shop@readyecommerce.com') {
            return $this->json('You cannot reset password for the demo shop in local demo mode.', [], 422);
        }

        $data = $request->validate([
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ]);

        $shop->user()->update([
            'password' => \Illuminate\Support\Facades\Hash::make($data['password']),
        ]);

        return $this->json('Shop password reset successfully.');
    }

    public function products(Request $request)
    {
        $this->authorizeAdminRoute($request, 'admin.product.index');
        $products = Product::with('shop:id,name')
            ->when($request->has('approved'), fn ($query) => $query->where('is_approve', $request->boolean('approved')))
            ->when($request->filled('search'), fn ($query) => $query->where('name', 'like', '%'.$request->string('search').'%'))
            ->latest('id')->paginate(min($request->integer('per_page', 20), 100));

        return $this->json('Products.', ['items' => $products->items(), 'total' => $products->total(), 'current_page' => $products->currentPage()]);
    }

    public function approveProduct(Request $request, Product $product)
    {
        $this->authorizeAdminRoute($request, 'admin.product.approve');
        $product->update(['is_approve' => true, 'is_new' => false, 'is_active' => true]);
        try {
            ProductApproveEvent::dispatch('Product Approved', $product->shop_id);
        } catch (\Throwable $th) {
        }
        NotificationRepository::storeByRequest((object) [
            'title' => 'Product Approved',
            'content' => 'Your product approved from admin',
            'url' => '/shop/product/'.$product->id.'/show',
            'icon' => 'bi-bag-check-fill',
            'type' => 'success',
            'shop_id' => $product->shop_id,
        ]);

        return $this->json('Product approved.', ['product' => $product->fresh()->load('shop:id,name')]);
    }

    public function deleteProduct(Request $request, Product $product)
    {
        $this->authorizeAdminRoute($request, 'admin.product.destroy');
        $shopId = $product->shop_id;
        $product->load('media', 'medias');
        if ($product->media && Storage::exists($product->media->src)) {
            Storage::delete($product->media->src);
        }
        $product->media()->delete();
        $product->sizes()->delete();
        $product->colors()->delete();
        $product->reviews()->delete();
        $product->categories()->detach();
        foreach ($product->medias as $media) {
            if ($media && Storage::exists($media->src)) {
                Storage::delete($media->src);
            }
            $media->delete();
        }
        $product->delete();
        try {
            ProductApproveEvent::dispatch('Product Deleted', $shopId);
        } catch (\Throwable $th) {
        }
        NotificationRepository::storeByRequest((object) [
            'title' => 'Product Deleted',
            'content' => 'Your product deleted from admin',
            'url' => null,
            'icon' => 'bi-x-octagon-fill',
            'type' => 'danger',
            'shop_id' => $shopId,
        ]);

        return $this->json('Product removed.');
    }

    public function productDetails(Request $request, Product $product)
    {
        $this->authorizeAdminRoute($request, 'admin.product.show');
        return $this->json('Product details.', [
            'product' => $product->load([
                'categories',
                'brand',
                'shop.user:id,name,email',
                'media',
                'medias',
                'sizes',
                'colors',
                'unit',
                'reviews.customer.user:id,name',
            ]),
        ]);
    }

    public function toggleProduct(Request $request, Product $product)
    {
        $this->authorizeAdminRoute($request, 'admin.product.toggle');
        $product->update(['is_active' => ! $product->is_active]);

        return $this->json('Product status updated.', ['product' => $product->fresh()]);
    }

    public function updateProduct(Request $request, Product $product)
    {
        $this->authorizeAdminRoute($request, 'admin.product.update');
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'price' => ['sometimes', 'numeric', 'min:0'],
            'discount_price' => ['nullable', 'numeric', 'min:0'],
            'quantity' => ['sometimes', 'integer', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
            'is_approve' => ['sometimes', 'boolean'],
            'short_description' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'grain_type' => ['nullable', 'string'],
            'processing_type' => ['nullable', 'string'],
            'origin_district' => ['nullable', 'string'],
            'harvest_season' => ['nullable', 'string'],
            'moisture_percentage' => ['nullable', 'numeric'],
            'broken_grain_ratio' => ['nullable', 'numeric'],
            'wholesale_tiers' => ['nullable', 'array'],
        ]);

        $product->update($data);

        return $this->json('Product updated successfully.', ['product' => $product->fresh()]);
    }

    public function orders(Request $request)
    {
        $this->authorizeAdminRoute($request, 'admin.order.index');
        $orders = Order::with(['customer.user:id,name,phone', 'shop:id,name'])
            ->when($request->filled('status'), fn ($query) => $query->where('order_status', $request->string('status')))
            ->latest('id')->paginate(min($request->integer('per_page', 20), 100));

        return $this->json('Orders.', ['items' => $orders->items(), 'total' => $orders->total(), 'current_page' => $orders->currentPage(), 'statuses' => array_map(fn ($status) => $status->value, OrderStatus::cases())]);
    }

    public function orderDetails(Request $request, Order $order)
    {
        $this->authorizeAdminRoute($request, 'admin.order.show');
        return $this->json('Order details.', ['order' => $order->load(['customer.user', 'shop', 'products', 'address']), 'courier_tracking' => CourierTracking::where('order_id', $order->id)->latest('id')->first(), 'riders' => Driver::whereHas('user', fn ($q) => $q->where('is_active', true))->with('user:id,name,phone')->get()]);
    }

    public function markOrderPaid(Request $request, Order $order)
    {
        $this->authorizeAdminRoute($request, 'admin.order.payment.status.toggle');
        if ($order->payment_status?->value === PaymentStatus::PAID->value) return $this->json('Order is already paid.', [], 422);
        $order->update(['payment_status' => PaymentStatus::PAID->value]);
        return $this->json('Payment status updated.', ['order' => $order->fresh()]);
    }

    public function assignOrderCourier(Request $request, Order $order)
    {
        $this->authorizeAdminRoute($request, 'admin.order.assign.courier');
        if (!config('steadfast.active')) return $this->json('SteadFast courier is not active.', [], 422);
        if (in_array($order->order_status, [OrderStatus::CANCELLED, OrderStatus::DELIVERED])) return $this->json('Courier cannot be assigned.', [], 422);
        if (CourierTracking::where('order_id', $order->id)->exists()) return $this->json('Order has already been sent to courier.', [], 422);
        $result = (new \App\Services\SteadFastService)->createCourierOrder($order);
        if (!$result['success']) return $this->json($result['message'] ?? 'Courier assignment failed.', [], 422);
        return $this->json('Order sent to SteadFast courier.', ['tracking' => CourierTracking::where('order_id', $order->id)->latest('id')->first()]);
    }

    public function updateOrderStatus(Request $request, Order $order)
    {
        $this->authorizeAdminRoute($request, 'admin.order.status.change');
        $data = $request->validate(['status' => ['required', Rule::in(array_map(fn ($status) => $status->value, OrderStatus::cases()))]]);
        $order->update(['order_status' => $data['status']]);
        $order->loadMissing(['customer.user.devices', 'products']);
        $title = 'Order status updated';
        $message = 'Your order status updated to '.$data['status'];
        $deviceKeys = $order->customer?->user?->devices?->pluck('key')->all() ?? [];
        if ($data['status'] === OrderStatus::CANCELLED->value) {
            foreach ($order->products as $product) {
                $quantity = $product->pivot->quantity;
                $product->update(['quantity' => $product->quantity + $quantity]);
                $flashSale = $product->flashSales?->first();
                $saleProduct = $flashSale?->products()->where('id', $product->id)->first();
                if ($saleProduct && $product->pivot?->price && $saleProduct->pivot->sale_quantity >= $quantity && $product->pivot->price == $saleProduct->pivot->price) {
                    $flashSale->products()->updateExistingPivot($product->id, ['sale_quantity' => $saleProduct->pivot->sale_quantity - $quantity]);
                }
            }
            if (function_exists('module_exists') && module_exists('Purchase')) {
                $order->productStockOuts()->delete();
            }
        }
        try {
            NotificationServices::sendNotification($message, $deviceKeys, $title);
        } catch (\Throwable $th) {
        }
        if ($order->customer?->user_id) {
            NotificationRepository::storeByRequest((object) [
                'title' => $title,
                'content' => $message,
                'user_id' => $order->customer->user_id,
                'type' => 'order',
            ]);
        }

        return $this->json('Order status updated.', ['order' => $order->fresh()]);
    }

    public function customers(Request $request)
    {
        $this->authorizeAdminRoute($request, 'admin.customer.index');
        $customers = Customer::with('user:id,name,email,phone,is_active')->latest('id')->paginate(min($request->integer('per_page', 20), 100));

        return $this->json('Customers.', ['items' => $customers->items(), 'total' => $customers->total(), 'current_page' => $customers->currentPage()]);
    }

    public function customerDetails(Request $request, User $user)
    {
        $this->authorizeAdminRoute($request, 'admin.customer.show');
        abort_unless($user->hasRole('customer'), 404);
        return $this->json('Customer details.', [
            'customer' => $user->load([
                'media',
                'customer.orders' => fn ($q) => $q->latest('id')->limit(20),
                'customer.addresses',
                'wallet',
            ]),
        ]);
    }

    public function storeCustomer(Request $request)
    {
        $this->authorizeAdminRoute($request, 'admin.customer.store');
        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['nullable', 'string', 'max:255'],
            'email' => ['required', 'string', 'email:rfc,dns', 'max:255', 'unique:users,email'],
            'phone' => ['required', 'string', 'max:20', 'unique:users,phone'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
            'gender' => ['nullable', 'string'],
        ]);

        $user = UserRepository::registerNewUser(new Request([
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'] ?? null,
            'name' => trim($data['first_name'].' '.($data['last_name'] ?? '')),
            'email' => $data['email'],
            'phone' => $data['phone'],
            'password' => $data['password'],
            'gender' => $data['gender'] ?? null,
        ]));

        CustomerRepository::storeByRequest($user);
        WalletRepository::storeByRequest($user);
        $user->assignRole(Roles::CUSTOMER->value);

        return $this->json('Customer created successfully.', ['customer' => $user->load(['media', 'wallet'])], 201);
    }

    public function updateCustomer(Request $request, User $user)
    {
        $this->authorizeAdminRoute($request, 'admin.customer.update');
        abort_unless($user->hasRole('customer'), 404);

        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['nullable', 'string', 'max:255'],
            'email' => ['required', 'string', 'email:rfc,dns', 'max:255', 'unique:users,email,'.$user->id],
            'phone' => ['required', 'string', 'max:20', 'unique:users,phone,'.$user->id],
            'gender' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $user->update([
            'name' => trim($data['first_name'].' '.($data['last_name'] ?? '')),
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'] ?? null,
            'email' => $data['email'],
            'phone' => $data['phone'],
            'gender' => $data['gender'] ?? $user->gender,
            'is_active' => isset($data['is_active']) ? (bool) $data['is_active'] : $user->is_active,
        ]);

        return $this->json('Customer updated successfully.', ['customer' => $user->fresh(['media', 'wallet'])]);
    }

    public function deleteCustomer(Request $request, User $user)
    {
        $this->authorizeAdminRoute($request, 'admin.customer.destroy');
        abort_unless($user->hasRole('customer'), 404);

        $media = $user->media;
        if ($media && Storage::exists($media->src)) {
            Storage::delete($media->src);
        }

        $user->wallet()?->delete();
        $user->syncPermissions([]);
        $user->syncRoles([]);

        $delTime = now()->format('YmdHis');
        $user->update([
            'phone' => $user->phone.'_deleted:'.$delTime,
            'email' => $user->email.'_deleted:'.$delTime,
            'deleted_at' => now(),
            'is_active' => false,
        ]);

        $media?->delete();

        return $this->json('Customer deleted successfully.');
    }

    public function toggleCustomer(Request $request, User $user)
    {
        $this->authorizeAdminRoute($request, 'admin.customer.toggle');
        abort_unless($user->hasRole('customer'), 404);
        $user->update(['is_active' => !$user->is_active]);
        return $this->json('Customer status updated.', ['customer' => $user->fresh()]);
    }

    public function resetCustomerPassword(Request $request, User $user)
    {
        $this->authorizeAdminRoute($request, 'admin.customer.reset-password');
        abort_unless($user->hasRole('customer'), 404);
        $data = $request->validate(['password' => ['required', 'string', 'min:8', 'confirmed']]);
        $user->update(['password' => \Illuminate\Support\Facades\Hash::make($data['password'])]);
        return $this->json('Customer password reset.');
    }

    public function coupons(Request $request)
    {
        $this->authorizeAdminRoute($request, 'admin.coupon.index');
        $rootShop = generaleSetting('rootShop');
        $items = Coupon::with('shops:id,name')->where(fn ($q) => $q->whereNull('shop_id')->orWhere('shop_id', $rootShop?->id))->latest('id')->paginate(min($request->integer('per_page', 20), 100));
        return $this->json('Coupons.', ['items' => $items->items(), 'total' => $items->total(), 'current_page' => $items->currentPage()]);
    }

    public function couponDetails(Request $request, Coupon $coupon)
    {
        $this->authorizeAdminRoute($request, 'admin.coupon.index');
        return $this->json('Coupon details.', ['coupon' => $coupon->load('shops:id,name')]);
    }

    public function storeCoupon(Request $request)
    {
        $this->authorizeAdminRoute($request, 'admin.coupon.create');
        $data = $request->validate([
            'code' => ['required', 'string', 'max:255', 'unique:coupons,code'],
            'discount' => ['required', 'numeric', 'min:0'],
            'discount_type' => ['required', Rule::in(['Amount', 'Percentage'])],
            'start_date' => ['required', 'date'], 'start_time' => ['required'],
            'expired_date' => ['required', 'date', 'after_or_equal:start_date'], 'expired_time' => ['required'],
            'min_order_amount' => ['required', 'numeric', 'min:0'], 'limit_for_user' => ['nullable', 'integer', 'min:0'],
            'max_discount_amount' => ['nullable', 'numeric', 'min:0'], 'shops' => ['nullable', 'array'], 'shops.*' => ['integer', 'exists:shops,id'],
        ]);
        $singleShop = generaleSetting('setting')?->shop_type === 'single' ? generaleSetting('rootShop') : null;
        $coupon = Coupon::create([
            'code' => $data['code'], 'discount' => $data['discount'], 'type' => $data['discount_type'],
            'started_at' => $data['start_date'].' '.$data['start_time'], 'expired_at' => $data['expired_date'].' '.$data['expired_time'],
            'min_amount' => $data['min_order_amount'], 'limit_for_user' => $data['limit_for_user'] ?? null,
            'max_discount_amount' => $data['max_discount_amount'] ?? null, 'shop_id' => $singleShop?->id, 'is_active' => true,
        ]);
        $shopIds = $singleShop ? [$singleShop->id] : ($data['shops'] ?? []);
        $coupon->shops()->sync($shopIds);
        return $this->json('Coupon created.', ['coupon' => $coupon->load('shops:id,name')], 201);
    }

    public function updateCoupon(Request $request, Coupon $coupon)
    {
        $this->authorizeAdminRoute($request, 'admin.coupon.edit');
        $data = $request->validate([
            'code' => ['required', 'string', 'max:255', Rule::unique('coupons', 'code')->ignore($coupon->id)],
            'discount' => ['required', 'numeric', 'min:0'], 'discount_type' => ['required', Rule::in(['Amount', 'Percentage'])],
            'start_date' => ['required', 'date'], 'start_time' => ['required'], 'expired_date' => ['required', 'date', 'after_or_equal:start_date'],
            'expired_time' => ['required'], 'min_order_amount' => ['required', 'numeric', 'min:0'], 'limit_for_user' => ['nullable', 'integer', 'min:0'],
            'max_discount_amount' => ['nullable', 'numeric', 'min:0'], 'shops' => ['nullable', 'array'], 'shops.*' => ['integer', 'exists:shops,id'],
        ]);
        $coupon->update([
            'code' => $data['code'], 'discount' => $data['discount'], 'type' => $data['discount_type'],
            'started_at' => $data['start_date'].' '.$data['start_time'], 'expired_at' => $data['expired_date'].' '.$data['expired_time'],
            'min_amount' => $data['min_order_amount'], 'limit_for_user' => $data['limit_for_user'] ?? null,
            'max_discount_amount' => $data['max_discount_amount'] ?? null,
        ]);
        if (array_key_exists('shops', $data)) $coupon->shops()->sync($data['shops']);
        return $this->json('Coupon updated.', ['coupon' => $coupon->fresh()->load('shops:id,name')]);
    }

    public function toggleCoupon(Request $request, Coupon $coupon)
    {
        $this->authorizeAdminRoute($request, 'admin.coupon.edit');
        $coupon->update(['is_active' => !$coupon->is_active]);
        return $this->json('Coupon status updated.', ['coupon' => $coupon->fresh()]);
    }

    public function deleteCoupon(Request $request, Coupon $coupon)
    {
        $this->authorizeAdminRoute($request, 'admin.coupon.destroy');
        $coupon->shops()->detach();
        $coupon->delete();
        return $this->json('Coupon deleted.');
    }

    public function flashSales(Request $request)
    {
        $this->authorizeAdminRoute($request, 'admin.flashSale.index');
        $items = FlashSale::with('media')->withCount('products')->latest('id')->paginate(min($request->integer('per_page', 20), 100));
        return $this->json('Flash sales.', ['items' => $items->items(), 'total' => $items->total(), 'current_page' => $items->currentPage()]);
    }

    public function flashSaleDetails(Request $request, FlashSale $flashSale)
    {
        $this->authorizeAdminRoute($request, 'admin.flashSale.index');
        return $this->json('Flash sale products.', ['flash_sale' => $flashSale->load(['media', 'products'])]);
    }

    public function storeFlashSale(Request $request)
    {
        $this->authorizeAdminRoute($request, 'admin.flashSale.create');
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'], 'discount' => ['required', 'numeric', 'min:0', 'max:100'],
            'start_date' => ['required', 'date'], 'end_date' => ['required', 'date', 'after:start_date'],
            'start_time' => ['required'], 'end_time' => ['required'], 'description' => ['nullable', 'string', 'max:191'],
            'thumbnail' => ['required', 'image', 'mimes:png,jpg,jpeg,gif,svg', 'max:2048'],
        ]);
        $media = MediaRepository::storeByRequest($request->file('thumbnail'), 'flash_sales', 'thumbnail', 'image');
        $sale = FlashSale::create([
            'name' => $data['name'], 'discount' => $data['discount'], 'start_date' => $data['start_date'],
            'start_time' => $data['start_time'], 'end_date' => $data['end_date'], 'end_time' => $data['end_time'],
            'description' => $data['description'] ?? null, 'media_id' => $media?->id, 'status' => true,
        ]);
        return $this->json('Flash sale created.', ['flash_sale' => $sale->load('media')], 201);
    }

    public function updateFlashSale(Request $request, FlashSale $flashSale)
    {
        $this->authorizeAdminRoute($request, 'admin.flashSale.edit');
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'], 'discount' => ['required', 'numeric', 'min:0', 'max:100'],
            'start_date' => ['required', 'date'], 'end_date' => ['required', 'date', 'after:start_date'],
            'start_time' => ['required'], 'end_time' => ['required'], 'description' => ['nullable', 'string', 'max:191'],
            'thumbnail' => ['nullable', 'image', 'mimes:png,jpg,jpeg,gif,svg', 'max:2048'],
        ]);
        if ($request->hasFile('thumbnail')) {
            $media = MediaRepository::updateByRequest($request->file('thumbnail'), 'flash_sales', 'image', $flashSale->media);
            $flashSale->media_id = $media?->id;
        }
        $flashSale->fill(collect($data)->except('thumbnail')->all())->save();
        return $this->json('Flash sale updated.', ['flash_sale' => $flashSale->fresh()->load('media')]);
    }

    public function toggleFlashSale(Request $request, FlashSale $flashSale)
    {
        $this->authorizeAdminRoute($request, 'admin.flashSale.toggle');
        $flashSale->update(['status' => !$flashSale->status]);
        return $this->json('Flash sale status updated.', ['flash_sale' => $flashSale->fresh()]);
    }

    public function deleteFlashSale(Request $request, FlashSale $flashSale)
    {
        $this->authorizeAdminRoute($request, 'admin.flashSale.destroy');
        DB::transaction(function () use ($flashSale) {
            $flashSale->products()->detach();
            if ($flashSale->media && Storage::exists($flashSale->media->src)) Storage::delete($flashSale->media->src);
            $flashSale->media?->delete();
            $flashSale->delete();
        });
        return $this->json('Flash sale deleted.');
    }

    public function roles(Request $request)
    {
        $this->authorizeAdminRoute($request, 'admin.role.index');
        $roles = Role::whereNotIn('name', ['shop', 'customer', 'driver'])->with('permissions:id,name')->orderBy('id')->get();
        $roles->each(fn ($role) => $role->setAttribute('users_count', User::role($role->name)->count()));
        return $this->json('Management roles.', ['items' => $roles, 'permissions' => Permission::where('guard_name', 'web')->orderBy('name')->get(['id', 'name'])]);
    }

    public function storeRole(Request $request)
    {
        $this->authorizeAdminRoute($request, 'admin.role.store');
        $data = $request->validate(['name' => ['required', 'string', 'max:100', 'unique:roles,name'], 'for_shop' => ['sometimes', 'boolean']]);
        $role = Role::create(['name' => $data['name'], 'guard_name' => 'web', 'is_shop' => $data['for_shop'] ?? false]);
        return $this->json('Role created.', ['role' => $role], 201);
    }

    public function updateRole(Request $request, Role $role)
    {
        $this->authorizeAdminRoute($request, 'admin.role.update');
        abort_if(in_array($role->name, ['root', 'admin', 'shop', 'customer', 'driver']), 422, 'Built-in roles cannot be renamed.');
        $data = $request->validate(['name' => ['required', 'string', 'max:100', Rule::unique('roles', 'name')->ignore($role->id)], 'for_shop' => ['sometimes', 'boolean']]);
        $role->update(['name' => $data['name'], 'is_shop' => $data['for_shop'] ?? $role->is_shop]);
        return $this->json('Role updated.', ['role' => $role->fresh()->load('permissions')]);
    }

    public function setRolePermissions(Request $request, Role $role)
    {
        $this->authorizeAdminRoute($request, 'admin.role.permission.update');
        abort_if($role->name === 'root', 422, 'Root permissions cannot be changed.');
        $data = $request->validate(['permissions' => ['present', 'array'], 'permissions.*' => ['string', 'exists:permissions,name']]);
        $role->syncPermissions($data['permissions']);
        return $this->json('Role permissions updated.', ['role' => $role->fresh()->load('permissions')]);
    }

    public function deleteRole(Request $request, Role $role)
    {
        $this->authorizeAdminRoute($request, 'admin.role.destroy');
        abort_if(in_array($role->name, ['root', 'admin', 'shop', 'customer', 'driver']) || $role->users()->exists(), 422, 'Built-in or assigned roles cannot be deleted.');
        $role->delete();
        return $this->json('Role deleted.');
    }

    public function supportTickets(Request $request)
    {
        $this->authorizeAdminRoute($request, 'admin.supportTicket.index');
        $tickets = SupportTicket::with('user:id,name,email,phone')->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))
            ->latest('id')->paginate(min($request->integer('per_page', 20), 100));
        return $this->json('Support tickets.', ['items' => $tickets->items(), 'total' => $tickets->total(), 'current_page' => $tickets->currentPage()]);
    }

    public function supportTicketDetails(Request $request, SupportTicket $supportTicket)
    {
        $this->authorizeAdminRoute($request, 'admin.supportTicket.show');
        return $this->json('Support ticket.', ['ticket' => $supportTicket->load(['user:id,name,email,phone', 'mediaAttachments']), 'messages' => $supportTicket->messages()->with('sender:id,name')->oldest('id')->get()]);
    }

    public function sendSupportMessage(Request $request, SupportTicket $supportTicket)
    {
        $this->authorizeAdminRoute($request, 'admin.supportTicket.sendMessage');
        $data = $request->validate(['message' => ['required', 'string', 'max:10000']]);
        $message = $supportTicket->messages()->create(['sender_id' => $request->user()->id, 'message' => $data['message']]);
        try { \App\Events\SupportTicketMessageEvent::dispatch($supportTicket->ticket_number); } catch (\Throwable $e) {}
        return $this->json('Message sent.', ['message' => $message->load('sender:id,name')], 201);
    }

    public function updateSupportTicket(Request $request, SupportTicket $supportTicket)
    {
        $this->authorizeAdminRoute($request, 'admin.supportTicket.updateStatus');
        $data = $request->validate(['status' => ['required', Rule::in(['pending', 'confirm', 'completed', 'cancel'])], 'user_chat' => ['sometimes', 'boolean']]);
        $supportTicket->update($data);
        try { \App\Events\SupportTicketMessageEvent::dispatch($supportTicket->ticket_number); } catch (\Throwable $e) {}
        return $this->json('Support ticket updated.', ['ticket' => $supportTicket->fresh()]);
    }

    public function toggleSupportMessagePin(Request $request, SupportTicketMessage $supportTicketMessage)
    {
        $this->authorizeAdminRoute($request, 'admin.supportTicket.pinMessage');
        $supportTicketMessage->update(['is_highlighted' => !$supportTicketMessage->is_highlighted]);
        return $this->json('Message pin updated.', ['message' => $supportTicketMessage->fresh()]);
    }

    public function employees(Request $request)
    {
        $this->authorizeAdminRoute($request, 'admin.employee.index');
        $users = User::whereHas('roles', fn ($q) => $q->whereNotIn('name', ['shop', 'customer', 'driver']))
            ->whereNull('shop_id')->with(['roles:id,name', 'media'])->latest('id')
            ->paginate(min($request->integer('per_page', 20), 100));
        return $this->json('Management employees.', ['items' => $users->items(), 'total' => $users->total(), 'current_page' => $users->currentPage()]);
    }

    public function employeePermissions(Request $request, User $user)
    {
        $this->authorizeAdminRoute($request, 'admin.employee.permission');
        abort_unless($user->roles()->whereNotIn('name', ['shop', 'customer', 'driver'])->exists(), 404);
        return $this->json('Employee permission details.', [
            'user' => $user->load('roles:id,name'),
            'roles' => Role::whereNotIn('name', ['shop', 'customer', 'driver'])->get(['id', 'name']),
            'permissions' => Permission::where('guard_name', 'web')->orderBy('name')->get(['id', 'name']),
            'role_permissions' => $user->getPermissionsViaRoles()->pluck('name')->values(),
            'custom_permissions' => $user->getDirectPermissions()->pluck('name')->values(),
            'denied_permissions' => UserNonPermission::where('user_id', $user->id)->pluck('name'),
        ]);
    }

    public function updateEmployeePermissions(Request $request, User $user)
    {
        $this->authorizeAdminRoute($request, 'admin.employee.permission.update');
        abort_unless($user->roles()->whereNotIn('name', ['shop', 'customer', 'driver'])->exists(), 404);
        $data = $request->validate(['permissions' => ['present', 'array'], 'permissions.*' => ['string', 'exists:permissions,name']]);
        $rolePermissions = $user->getPermissionsViaRoles()->pluck('name')->all();
        $selected = array_values(array_unique($data['permissions']));
        $user->syncPermissions(array_values(array_diff($selected, $rolePermissions)));
        UserNonPermission::where('user_id', $user->id)->delete();
        foreach (array_diff($rolePermissions, $selected) as $permission) {
            UserNonPermission::create(['user_id' => $user->id, 'name' => $permission]);
        }
        \Illuminate\Support\Facades\Cache::forget('user_permissions_'.$user->id);
        \Illuminate\Support\Facades\Cache::forget('user_non_permissions_'.$user->id);
        return $this->json('Employee permissions updated.', ['user' => $user->fresh()->load('roles:id,name')]);
    }

    public function resetEmployeePassword(Request $request, User $user)
    {
        $this->authorizeAdminRoute($request, 'admin.employee.reset-password');
        abort_unless($user->roles()->whereNotIn('name', ['shop', 'customer', 'driver'])->exists(), 404);
        $data = $request->validate(['password' => ['required', 'string', 'min:8', 'confirmed']]);
        $user->update(['password' => \Illuminate\Support\Facades\Hash::make($data['password'])]);
        return $this->json('Employee password reset.');
    }

    public function pages(Request $request)
    {
        $this->authorizeAdminRoute($request, 'admin.page.index');
        $pages = Page::orderBy('id')->paginate(min($request->integer('per_page', 50), 100));
        return $this->json('Content pages.', ['items' => $pages->items(), 'total' => $pages->total(), 'current_page' => $pages->currentPage()]);
    }

    public function storePage(Request $request)
    {
        $this->authorizeAdminRoute($request, 'admin.page.store');
        $data = $request->validate(['title' => ['required', 'string', 'max:255'], 'title_ar' => ['nullable', 'string', 'max:255'], 'content' => ['required', 'string'], 'content_ar' => ['nullable', 'string'], 'icon' => ['nullable', 'string', 'max:255']]);
        $slug = \Illuminate\Support\Str::slug($data['title']);
        $page = Page::create(['title' => $data['title'], 'title_ar' => $data['title_ar'] ?? null, 'slug' => $slug, 'url' => 'page/'.$slug, 'description' => $data['content'], 'description_ar' => $data['content_ar'] ?? null, 'icon' => $data['icon'] ?? null, 'is_active' => true, 'is_default' => false, 'is_editable' => true]);
        return $this->json('Page created.', ['page' => $page], 201);
    }

    public function updatePage(Request $request, Page $page)
    {
        $this->authorizeAdminRoute($request, 'admin.page.update');
        abort_unless($page->is_editable, 422, 'This page is not editable.');
        $data = $request->validate(['title' => ['required', 'string', 'max:255'], 'title_ar' => ['nullable', 'string', 'max:255'], 'content' => ['required', 'string'], 'content_ar' => ['nullable', 'string'], 'icon' => ['nullable', 'string', 'max:255']]);
        $slug = $page->is_default ? $page->slug : \Illuminate\Support\Str::slug($data['title']);
        $page->update(['title' => $data['title'], 'title_ar' => $data['title_ar'] ?? $page->title_ar, 'slug' => $slug, 'url' => $page->is_default ? $page->url : 'page/'.$slug, 'description' => $data['content'], 'description_ar' => $data['content_ar'] ?? $page->description_ar, 'icon' => $data['icon'] ?? $page->getRawOriginal('icon')]);
        return $this->json('Page updated.', ['page' => $page->fresh()]);
    }

    public function deletePage(Request $request, Page $page)
    {
        $this->authorizeAdminRoute($request, 'admin.page.destroy');
        abort_if($page->is_default, 422, 'Default pages cannot be deleted.');
        $page->delete();
        return $this->json('Page deleted.');
    }

    public function categories(Request $request)
    {
        $this->authorizeAdminRoute($request, 'admin.category.index');
        return $this->json('Categories.', ['items' => Category::withCount('products')->orderBy('name')->get()]);
    }

    public function returns(Request $request)
    {
        $this->authorizeAdminRoute($request, 'admin.returnOrder.index');
        $returns = ReturnOrder::with(['order:id,order_code,order_status', 'shop:id,name', 'customer.user:id,name,email', 'returnProduct.product:id,name'])
            ->latest('id')->paginate(min($request->integer('per_page', 20), 100));

        return $this->json('Return requests.', ['items' => $returns->items(), 'total' => $returns->total(), 'current_page' => $returns->currentPage()]);
    }

    public function updateReturn(Request $request, ReturnOrder $returnOrder)
    {
        $this->authorizeAdminRoute($request, 'admin.returnOrder.reject');
        $data = $request->validate([
            'status' => ['required', Rule::in(['Pending', 'Approved', 'Damaged', 'Mismatch', 'Cancelled'])],
            'reject_note' => ['nullable', 'string', 'max:2000'],
        ]);
        if ($returnOrder->payment_status && $data['status'] !== 'Refunded') {
            return $this->json('A completed refund cannot be changed.', [], 422);
        }
        $returnOrder->update(['status' => $data['status'], 'reject_note' => $data['reject_note'] ?? $returnOrder->reject_note]);

        return $this->json('Return request updated.', ['return' => $returnOrder->fresh()->load(['order:id,order_code', 'shop:id,name'])]);
    }

    public function refundReturn(Request $request, ReturnOrder $returnOrder)
    {
        $this->authorizeAdminRoute($request, 'admin.returnOrder.payment.status');
        if ($returnOrder->status === 'Pending' || $returnOrder->status === 'Cancelled' || $returnOrder->payment_status) {
            return $this->json('Only approved, unpaid return requests can be refunded.', [], 422);
        }

        DB::transaction(function () use ($returnOrder) {
            $setting = generaleSetting('setting');
            $commission = 0;
            if ($setting?->commission_charge !== 'monthly') {
                $commission = $setting?->commission_type === 'fixed'
                    ? ($setting->commission ?? 0)
                    : ($returnOrder->amount * ($setting->commission ?? 0) / 100);
            }
            $wallet = $returnOrder->shop->user->wallet;
            WalletRepository::updateByRequest($wallet, $returnOrder->amount, 'debit');
            TransactionRepository::storeByRefundRequest($wallet, $commission, 'credit', true, true, 'admin commission removal for refund order', 'refundorder');
            $returnOrder->update(['payment_status' => 1, 'status' => 'Refunded']);
        });

        return $this->json('Refund completed.', ['return' => $returnOrder->fresh()]);
    }

    public function returnDetails(Request $request, ReturnOrder $returnOrder)
    {
        $this->authorizeAdminRoute($request, 'admin.returnOrder.show');
        return $this->json('Return order details.', [
            'return_order' => $returnOrder->load([
                'order.customer.user:id,name,email,phone',
                'shop:id,name,phone',
                'returnProduct.product:id,name',
                'media',
            ]),
        ]);
    }

    public function withdrawals(Request $request)
    {
        $this->authorizeAdminRoute($request, 'admin.withdraw.index');
        $withdrawals = Withdraw::with(['shop:id,name,user_id', 'user:id,name,email'])->when(
            $request->filled('status'), fn ($query) => $query->where('status', $request->string('status'))
        )->latest('id')->paginate(min($request->integer('per_page', 20), 100));

        return $this->json('Withdrawal requests.', ['items' => $withdrawals->items(), 'total' => $withdrawals->total(), 'current_page' => $withdrawals->currentPage()]);
    }

    public function updateWithdrawal(Request $request, Withdraw $withdraw)
    {
        $this->authorizeAdminRoute($request, 'admin.withdraw.update');
        $data = $request->validate(['status' => ['required', Rule::in(['approved', 'denied'])], 'reason' => ['nullable', 'string', 'max:2000']]);
        if ($withdraw->status !== 'pending') {
            return $this->json('Only pending withdrawal requests can be reviewed.', [], 422);
        }
        DB::transaction(fn () => WithdrawRepository::updateWithdraw($withdraw, new Request($data)));

        return $this->json('Withdrawal request updated.', ['withdrawal' => $withdraw->fresh()->load('shop:id,name')]);
    }

    public function withdrawalDetails(Request $request, Withdraw $withdraw)
    {
        $this->authorizeAdminRoute($request, 'admin.withdraw.show');
        return $this->json('Withdrawal details.', [
            'withdrawal' => $withdraw->load([
                'user.shop',
                'user.wallet',
            ]),
        ]);
    }

    public function reviews(Request $request)
    {
        $this->authorizeAdminRoute($request, 'admin.review.index');
        $reviews = Review::withoutGlobalScopes()->with(['customer.user:id,name', 'product:id,name'])
            ->latest('id')->paginate(min($request->integer('per_page', 20), 100));

        return $this->json('Product reviews.', ['items' => $reviews->items(), 'total' => $reviews->total(), 'current_page' => $reviews->currentPage()]);
    }

    public function toggleReview(Request $request, int $reviewId)
    {
        $this->authorizeAdminRoute($request, 'admin.review.toggle');
        $review = Review::withoutGlobalScopes()->findOrFail($reviewId);
        $review->update(['is_active' => ! $review->is_active]);

        return $this->json('Review visibility updated.', ['review' => $review->fresh()]);
    }

    public function riders(Request $request)
    {
        $this->authorizeAdminRoute($request, 'admin.rider.index');
        $riders = User::role('driver')->with('driver.driverLocation')->when(
            $request->filled('status'), fn ($query) => $query->where('is_active', $request->string('status') === 'active')
        )->latest('id')->paginate(min($request->integer('per_page', 20), 100));

        return $this->json('Delivery riders.', ['items' => $riders->items(), 'total' => $riders->total(), 'current_page' => $riders->currentPage()]);
    }

    public function toggleRider(Request $request, User $rider)
    {
        $this->authorizeAdminRoute($request, 'admin.rider.toggle');
        abort_unless($rider->hasRole('driver'), 404);
        $rider->update(['is_active' => ! $rider->is_active]);

        return $this->json('Rider status updated.', ['rider' => $rider->fresh()]);
    }

    public function riderDetails(Request $request, User $rider)
    {
        $this->authorizeAdminRoute($request, 'admin.rider.show');
        abort_unless($rider->hasRole('driver'), 404);

        $driver = $rider->driver;
        $totalDelivery = $driver ? $driver->driverOrders()->where('is_completed', true)->count() : 0;
        $totalPending = $driver ? $driver->driverOrders()->where('is_completed', false)->count() : 0;
        $allCashCollected = $driver ? $driver->orders()->where('order_status', OrderStatus::DELIVERED->value)->where('payment_method', PaymentMethod::CASH->value)->sum('payable_amount') : 0;
        $wallet = $driver ? DriverRepository::getWallet($driver) : null;
        $alreadyWithdraw = $rider->withdraws()->where('status', 'approved')->sum('amount');
        $pendingWithdraw = $rider->withdraws()->where('status', 'pending')->sum('amount');
        $deniedWithdraw = $rider->withdraws()->where('status', 'denied')->sum('amount');

        return $this->json('Rider details.', [
            'rider' => $rider->load(['media', 'driver.driverLocation']),
            'stats' => [
                'total_delivery' => $totalDelivery,
                'total_pending' => $totalPending,
                'cash_collected' => $allCashCollected,
                'wallet' => $wallet,
                'already_withdraw' => $alreadyWithdraw,
                'pending_withdraw' => $pendingWithdraw,
                'denied_withdraw' => $deniedWithdraw,
            ],
        ]);
    }

    public function storeRider(RiderRequest $request)
    {
        $this->authorizeAdminRoute($request, 'admin.rider.store');
        $user = UserRepository::storeByRequest($request);
        $user->assignRole(Roles::DRIVER->value);

        DriverRepository::storeByUser($user);
        $user->update(['is_active' => true]);

        return $this->json('Rider created successfully.', ['rider' => $user->load(['media', 'driver'])], 201);
    }

    public function updateRider(RiderRequest $request, User $rider)
    {
        $this->authorizeAdminRoute($request, 'admin.rider.update');
        abort_unless($rider->hasRole('driver'), 404);

        UserRepository::updateByRequest($request, $rider);

        return $this->json('Rider updated successfully.', ['rider' => $rider->fresh(['media', 'driver'])]);
    }

    public function deleteRider(Request $request, User $rider)
    {
        $this->authorizeAdminRoute($request, 'admin.rider.destroy');
        abort_unless($rider->hasRole('driver'), 404);

        $rider->driver()?->delete();
        $rider->syncRoles([]);
        $rider->syncPermissions([]);
        $delTime = now()->format('YmdHis');
        $rider->update([
            'phone' => $rider->phone.'_deleted:'.$delTime,
            'email' => $rider->email.'_deleted:'.$delTime,
            'deleted_at' => now(),
            'is_active' => false,
        ]);

        return $this->json('Rider deleted successfully.');
    }

    public function riderLocation(Request $request, User $rider)
    {
        $this->authorizeAdminRoute($request, 'admin.rider.location');
        abort_unless($rider->hasRole('driver'), 404);

        $driver = $rider->driver;
        if (! $driver || ! $driver->driverLocation) {
            return $this->json('Rider location not found.', [], 404);
        }

        return $this->json('Location fetched successfully.', [
            'location' => DriverLocationResource::make($driver->driverLocation),
        ]);
    }

    public function assignOrderRider(Request $request, Order $order)
    {
        $this->authorizeAdminRoute($request, 'admin.rider.assign');
        if (in_array($order->order_status, [OrderStatus::CANCELLED, OrderStatus::DELIVERED])) {
            return $this->json('Rider cannot be assigned to cancelled or delivered orders.', [], 422);
        }

        $driver = Driver::find($request->rider_id ?? $request->rider);
        if (! $driver) {
            return $this->json('Rider not found.', [], 404);
        }
        if (! $driver->driverLocation()->exists()) {
            return $this->json('Rider location not found. Please assign location first.', [], 422);
        }
        if ($order->products()->where('is_digital', true)->exists()) {
            return $this->json('Digital products cannot be assigned to riders.', [], 422);
        }

        DriverRepository::assignOrder($order, $driver);

        return $this->json('Rider assigned to order successfully.', ['order' => $order->fresh(['driverOrder.driver.user'])]);
    }

    public function banners(Request $request)
    {
        $this->authorizeAdminRoute($request, 'admin.banner.index');
        $banners = Banner::with('media')->latest('id')->paginate(min($request->integer('per_page', 20), 100));

        return $this->json('Marketplace banners.', ['items' => $banners->items(), 'total' => $banners->total(), 'current_page' => $banners->currentPage()]);
    }

    public function bannerDetails(Request $request, Banner $banner)
    {
        $this->authorizeAdminRoute($request, 'admin.banner.index');

        return $this->json('Banner details.', ['banner' => $banner->load('media', 'shop:id,name')]);
    }

    public function storeBanner(BannerRequest $request)
    {
        $this->authorizeAdminRoute($request, 'admin.banner.create');
        $banner = BannerRepository::storeByRequest($request);

        return $this->json('Banner created successfully.', ['banner' => $banner->fresh()->load('media')], 201);
    }

    public function updateBanner(BannerRequest $request, Banner $banner)
    {
        $this->authorizeAdminRoute($request, 'admin.banner.edit');
        $banner = BannerRepository::updateByRequest($request, $banner);

        return $this->json('Banner updated successfully.', ['banner' => $banner->fresh()->load('media')]);
    }

    public function toggleBanner(Request $request, Banner $banner)
    {
        $this->authorizeAdminRoute($request, 'admin.banner.toggle');
        $banner->update(['status' => ! $banner->status]);

        return $this->json('Banner status updated.', ['banner' => $banner->fresh()]);
    }

    public function deleteBanner(Request $request, Banner $banner)
    {
        $this->authorizeAdminRoute($request, 'admin.banner.destroy');
        BannerRepository::destroy($banner);

        return $this->json('Banner deleted successfully.');
    }

    public function ads(Request $request)
    {
        $this->authorizeAdminRoute($request, 'admin.ad.index');
        $ads = Ad::with('media')->latest('id')->paginate(min($request->integer('per_page', 20), 100));

        return $this->json('Ads listing.', ['items' => $ads->items(), 'total' => $ads->total(), 'current_page' => $ads->currentPage()]);
    }

    public function adDetails(Request $request, Ad $ad)
    {
        $this->authorizeAdminRoute($request, 'admin.ad.index');

        return $this->json('Ad details.', ['ad' => $ad->load('media')]);
    }

    public function storeAd(BannerRequest $request)
    {
        $this->authorizeAdminRoute($request, 'admin.ad.create');
        $ad = AdsRepository::storeByRequest($request);

        return $this->json('Ad created successfully.', ['ad' => $ad->fresh()->load('media')], 201);
    }

    public function updateAd(BannerRequest $request, Ad $ad)
    {
        $this->authorizeAdminRoute($request, 'admin.ad.edit');
        $ad = AdsRepository::updateByRequest($request, $ad);

        return $this->json('Ad updated successfully.', ['ad' => $ad->fresh()->load('media')]);
    }

    public function toggleAd(Request $request, Ad $ad)
    {
        $this->authorizeAdminRoute($request, 'admin.ad.toggle');
        $ad->update(['status' => ! $ad->status]);

        return $this->json('Ad status updated.', ['ad' => $ad->fresh()]);
    }

    public function deleteAd(Request $request, Ad $ad)
    {
        $this->authorizeAdminRoute($request, 'admin.ad.destroy');
        AdsRepository::destroy($ad);

        return $this->json('Ad deleted successfully.');
    }

    public function vatTaxes(Request $request)
    {
        $this->authorizeAdminRoute($request, 'admin.vatTax.index');
        $taxes = VatTax::latest('id')->paginate(min($request->integer('per_page', 20), 100));

        return $this->json('VAT taxes.', ['items' => $taxes->items(), 'total' => $taxes->total(), 'current_page' => $taxes->currentPage()]);
    }

    public function vatTaxDetails(Request $request, VatTax $vatTax)
    {
        $this->authorizeAdminRoute($request, 'admin.vatTax.index');

        return $this->json('VAT tax details.', ['vat_tax' => $vatTax]);
    }

    public function storeVatTax(VatTaxRequest $request)
    {
        $this->authorizeAdminRoute($request, 'admin.vatTax.store');
        $tax = VatTaxRepository::storeByRequest($request);

        return $this->json('VAT tax created successfully.', ['vat_tax' => $tax], 201);
    }

    public function updateVatTax(VatTaxRequest $request, VatTax $vatTax)
    {
        $this->authorizeAdminRoute($request, 'admin.vatTax.update');
        VatTaxRepository::updateByRequest($vatTax, $request);

        return $this->json('VAT tax updated successfully.', ['vat_tax' => $vatTax->fresh()]);
    }

    public function toggleVatTax(Request $request, VatTax $vatTax)
    {
        $this->authorizeAdminRoute($request, 'admin.vatTax.toggle');
        VatTaxRepository::toggle($vatTax);

        return $this->json('VAT tax status updated.', ['vat_tax' => $vatTax->fresh()]);
    }

    public function deleteVatTax(Request $request, VatTax $vatTax)
    {
        $this->authorizeAdminRoute($request, 'admin.vatTax.destroy');
        $vatTax->delete();

        return $this->json('VAT tax deleted successfully.');
    }

    private function authorizeAdminRoute(Request $request, string $permission): void
    {
        $user = $request->user();
        abort_unless($user && ($user->hasRole('root') || (
            $user->hasPermissionTo($permission, 'web')
            && ! UserNonPermission::where('user_id', $user->id)->where('name', $permission)->exists()
        )), 403);
    }
}
