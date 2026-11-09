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
use App\Models\SubscriptionPlan;
use App\Models\ShopSubscription;
use App\Models\TicketIssueType;
use App\Models\Notification;
use App\Models\DeviceKey;
use App\Models\SupportItem;
use App\Models\Language;
use App\Models\Menu;
use App\Models\Footer;
use App\Models\FooterItem;
use App\Models\DeliveryCharge;
use App\Models\WeightDeliveryCharge;
use App\Models\Area;
use App\Models\Country;
use App\Models\Currency;
use App\Models\PaymentGateway;
use App\Models\GoogleReCaptcha;
use App\Models\SocialAuth;
use App\Models\SMSConfig;
use App\Models\GeneraleSetting;
use App\Models\Blog;
use App\Models\Tag;
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
use Illuminate\Support\Str;
use Mews\Purifier\Facades\Purifier;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;
use App\Enums\SubscriptionStatus;
use App\Services\NotificationServices;
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
        $this->authorizeAdminRoute($request, 'admin.role.create');
        $data = $request->validate(['name' => ['required', 'string', 'max:100', 'unique:roles,name'], 'for_shop' => ['sometimes', 'boolean']]);
        $role = Role::create(['name' => $data['name'], 'guard_name' => 'web', 'is_shop' => $data['for_shop'] ?? false]);
        return $this->json('Role created.', ['role' => $role], 201);
    }

    public function updateRole(Request $request, Role $role)
    {
        $this->authorizeAdminRoute($request, 'admin.role.edit');
        abort_if(in_array($role->name, ['root', 'admin', 'shop', 'customer', 'driver']), 422, 'Built-in roles cannot be renamed.');
        $data = $request->validate(['name' => ['required', 'string', 'max:100', Rule::unique('roles', 'name')->ignore($role->id)], 'for_shop' => ['sometimes', 'boolean']]);
        $role->update(['name' => $data['name'], 'is_shop' => $data['for_shop'] ?? $role->is_shop]);
        return $this->json('Role updated.', ['role' => $role->fresh()->load('permissions')]);
    }

    public function setRolePermissions(Request $request, Role $role)
    {
        $this->authorizeAdminRoute($request, 'admin.role.permission.update');
        abort_if(in_array($role->name, ['root', 'admin', 'shop', 'customer', 'driver'], true), 422, 'Built-in role permissions cannot be changed.');
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

    public function scheduleSupportTicket(Request $request, SupportTicket $supportTicket)
    {
        $this->authorizeAdminRoute($request, 'admin.supportTicket.setScheduled');
        $data = $request->validate(['start_date' => ['required', 'date'], 'end_date' => ['required', 'date', 'after_or_equal:start_date'], 'start_time' => ['required', 'date_format:H:i'], 'end_time' => ['required', 'date_format:H:i'], 'highlight' => ['sometimes', 'boolean']]);
        $start = Carbon::parse($data['start_date'].' '.$data['start_time']);
        $end = Carbon::parse($data['end_date'].' '.$data['end_time']);
        abort_if($end->lessThanOrEqualTo($start), 422, 'The scheduled end must be later than the start.');
        $message = DB::transaction(function () use ($supportTicket, $request, $data, $start, $end) {
            $supportTicket->update(['ticket_start' => $start, 'ticket_end' => $end, 'status' => $supportTicket->status === 'pending' ? 'confirm' : $supportTicket->status]);
            return $supportTicket->messages()->create(['sender_id' => $request->user()->id, 'message' => 'Your support ticket is scheduled from '.$start->format('d F, Y H:i').' to '.$end->format('d F, Y H:i').'.', 'is_highlighted' => $data['highlight'] ?? false]);
        });
        try { \App\Events\SupportTicketMessageEvent::dispatch($supportTicket->ticket_number); } catch (\Throwable $exception) { report($exception); }
        return $this->json('Ticket schedule saved.', ['ticket' => $supportTicket->fresh(), 'message' => $message->load('sender:id,name')]);
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

    public function storeEmployee(Request $request)
    {
        $this->authorizeAdminRoute($request, 'admin.employee.create');
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['required', 'string', 'max:40', 'unique:users,phone'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role' => ['required', 'string', 'exists:roles,name'],
        ]);
        abort_if(in_array($data['role'], ['shop', 'customer', 'driver'], true), 422, 'Choose an administrative role.');

        $employee = DB::transaction(function () use ($data) {
            $employee = User::create([
                'name' => $data['name'],
                'email' => $data['email'] ?? null,
                'phone' => $data['phone'],
                'password' => \Illuminate\Support\Facades\Hash::make($data['password']),
                'is_active' => true,
            ]);
            $employee->assignRole($data['role']);
            WalletRepository::storeByRequest($employee);
            return $employee;
        });

        return $this->json('Employee created.', ['employee' => $employee->load('roles:id,name')], 201);
    }

    public function updateEmployee(Request $request, User $user)
    {
        $this->authorizeAdminRoute($request, 'admin.employee.edit');
        abort_unless($user->roles()->whereNotIn('name', ['shop', 'customer', 'driver'])->exists(), 404);
        abort_if($user->hasRole('root'), 422, 'The root account cannot be changed here.');
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'phone' => ['required', 'string', 'max:40', Rule::unique('users', 'phone')->ignore($user->id)],
            'role' => ['required', 'string', 'exists:roles,name'],
        ]);
        abort_if(in_array($data['role'], ['shop', 'customer', 'driver'], true), 422, 'Choose an administrative role.');
        $user->fill(collect($data)->except('role')->all())->save();
        $user->syncRoles([$data['role']]);
        return $this->json('Employee updated.', ['employee' => $user->fresh()->load('roles:id,name')]);
    }

    public function deleteEmployee(Request $request, User $user)
    {
        $this->authorizeAdminRoute($request, 'admin.employee.destroy');
        abort_unless($user->roles()->whereNotIn('name', ['shop', 'customer', 'driver'])->exists(), 404);
        abort_if($user->hasRole('root') || $user->is($request->user()), 422, 'You cannot remove this administrator account.');
        DB::transaction(function () use ($user) {
            $media = $user->media;
            if ($media && Storage::exists($media->src)) Storage::delete($media->src);
            $user->tokens()->delete();
            $user->syncRoles([]);
            $user->syncPermissions([]);
            UserNonPermission::where('user_id', $user->id)->delete();
            $user->wallet()?->delete();
            $user->forceDelete();
            $media?->delete();
        });
        return $this->json('Employee removed.');
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
        $this->authorizeAdminRoute($request, 'admin.employee.reset.password');
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
        $this->authorizeAdminRoute($request, 'admin.page.create');
        $data = $request->validate(['title' => ['required', 'string', 'max:255'], 'title_ar' => ['nullable', 'string', 'max:255'], 'content' => ['required', 'string'], 'content_ar' => ['nullable', 'string'], 'icon' => ['nullable', 'string', 'max:255']]);
        $slug = \Illuminate\Support\Str::slug($data['title']);
        $page = Page::create(['title' => $data['title'], 'title_ar' => $data['title_ar'] ?? null, 'slug' => $slug, 'url' => 'page/'.$slug, 'description' => $data['content'], 'description_ar' => $data['content_ar'] ?? null, 'icon' => $data['icon'] ?? null, 'is_active' => true, 'is_default' => false, 'is_editable' => true]);
        return $this->json('Page created.', ['page' => $page], 201);
    }

    public function updatePage(Request $request, Page $page)
    {
        $this->authorizeAdminRoute($request, 'admin.page.edit');
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

    public function togglePage(Request $request, Page $page)
    {
        $this->authorizeAdminRoute($request, 'admin.page.edit');
        abort_unless($page->is_editable, 422, 'This page is not editable.');
        $page->update(['is_active' => ! $page->is_active]);
        return $this->json('Page visibility updated.', ['page' => $page->fresh()]);
    }

    public function blogs(Request $request)
    {
        $this->authorizeAdminRoute($request, 'admin.blog.index');
        $blogs = Blog::with(['category:id,name', 'user:id,name', 'tags:id,name', 'media:id,src'])->withCount('views')
            ->when($request->filled('search'), fn ($query) => $query->where('title', 'like', '%'.$request->string('search')->toString().'%'))
            ->latest('id')->paginate(min($request->integer('per_page', 20), 100));
        return $this->json('Blog articles.', ['items' => $blogs->items(), 'total' => $blogs->total(), 'current_page' => $blogs->currentPage(), 'categories' => Category::orderBy('name')->get(['id', 'name']), 'tags' => Tag::orderBy('name')->limit(200)->get(['id', 'name'])]);
    }

    public function storeBlog(Request $request)
    {
        $this->authorizeAdminRoute($request, 'admin.blog.create');
        $data = $request->validate(['title' => ['required', 'string', 'max:200'], 'title_ar' => ['nullable', 'string', 'max:200'], 'category_id' => ['nullable', 'integer', 'exists:categories,id'], 'description' => ['required', 'string'], 'description_ar' => ['nullable', 'string'], 'thumbnail' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'], 'tags' => ['nullable', 'array'], 'tags.*' => ['string', 'max:50']]);
        $blog = DB::transaction(function () use ($request, $data) {
            $path = $request->hasFile('thumbnail') ? Storage::disk('public')->putFile('blogs', $request->file('thumbnail')) : null;
            $blog = Blog::create(['user_id' => $request->user()->id, 'title' => $data['title'], 'title_ar' => $data['title_ar'] ?? null, 'category_id' => $data['category_id'] ?? null, 'description' => Purifier::clean($data['description']), 'description_ar' => isset($data['description_ar']) ? Purifier::clean($data['description_ar']) : null, 'blog_thumbnail' => $path, 'is_active' => true]);
            $this->syncBlogTags($blog, $data['tags'] ?? []);
            return $blog;
        });
        return $this->json('Blog article created.', ['blog' => $blog->load(['category', 'tags', 'user'])->refresh()], 201);
    }

    public function updateBlog(Request $request, Blog $blog)
    {
        $this->authorizeAdminRoute($request, 'admin.blog.edit');
        $data = $request->validate(['title' => ['required', 'string', 'max:200'], 'title_ar' => ['nullable', 'string', 'max:200'], 'category_id' => ['nullable', 'integer', 'exists:categories,id'], 'description' => ['required', 'string'], 'description_ar' => ['nullable', 'string'], 'thumbnail' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'], 'tags' => ['nullable', 'array'], 'tags.*' => ['string', 'max:50']]);
        DB::transaction(function () use ($request, $data, $blog) {
            $path = $blog->blog_thumbnail;
            if ($request->hasFile('thumbnail')) {
                if ($path && Storage::disk('public')->exists($path)) Storage::disk('public')->delete($path);
                $path = Storage::disk('public')->putFile('blogs', $request->file('thumbnail'));
            }
            $blog->update(['title' => $data['title'], 'title_ar' => $data['title_ar'] ?? $blog->title_ar, 'category_id' => $data['category_id'] ?? null, 'description' => Purifier::clean($data['description']), 'description_ar' => isset($data['description_ar']) ? Purifier::clean($data['description_ar']) : $blog->description_ar, 'blog_thumbnail' => $path]);
            $this->syncBlogTags($blog, $data['tags'] ?? []);
        });
        return $this->json('Blog article updated.', ['blog' => $blog->fresh()->load(['category', 'tags', 'user'])]);
    }

    public function toggleBlog(Request $request, Blog $blog)
    {
        $this->authorizeAdminRoute($request, 'admin.blog.toggle');
        $blog->update(['is_active' => ! $blog->is_active]);
        return $this->json('Blog visibility updated.', ['blog' => $blog->fresh()]);
    }

    public function deleteBlog(Request $request, Blog $blog)
    {
        $this->authorizeAdminRoute($request, 'admin.blog.destroy');
        DB::transaction(function () use ($blog) {
            $blog->tags()->detach();
            if ($blog->blog_thumbnail && Storage::disk('public')->exists($blog->blog_thumbnail)) Storage::disk('public')->delete($blog->blog_thumbnail);
            if ($blog->media && Storage::disk('public')->exists($blog->media->src)) Storage::disk('public')->delete($blog->media->src);
            $media = $blog->media;
            $blog->delete();
            $media?->delete();
        });
        return $this->json('Blog article deleted.');
    }

    private function syncBlogTags(Blog $blog, array $tagNames): void
    {
        $tagIds = collect($tagNames)->map(function ($name) {
            $name = trim($name);
            if ($name === '') return null;
            return Tag::firstOrCreate(['slug' => Str::slug($name)], ['name' => $name])->id;
        })->filter()->unique()->values()->all();
        $blog->tags()->sync($tagIds);
    }

    public function navigation(Request $request)
    {
        $user = $request->user();
        $canManageMenus = $user?->hasPermissionTo('admin.menu.index', 'web') && ! UserNonPermission::where('user_id', $user->id)->where('name', 'admin.menu.index')->exists();
        $canManageFooter = $user?->hasPermissionTo('admin.footer.index', 'web') && ! UserNonPermission::where('user_id', $user->id)->where('name', 'admin.footer.index')->exists();
        abort_unless($user && ($user->hasRole('root') || $canManageMenus || $canManageFooter), 403);
        return $this->json('Navigation and footer content.', ['menus' => Menu::orderBy('order')->get(), 'footers' => Footer::with(['items' => fn ($query) => $query->orderBy('order')])->orderBy('order')->get(), 'pages' => Page::where('is_active', true)->orderBy('title')->get(['id', 'title', 'url']), 'language_fields' => ['primary' => 'English', 'secondary' => 'Legacy ar_* columns']]);
    }

    public function storeMenu(Request $request)
    {
        $this->authorizeAdminRoute($request, 'admin.menu.create');
        $data = $request->validate(['name' => ['required', 'string', 'max:255'], 'ar_name' => ['nullable', 'string', 'max:255'], 'url' => ['required', 'string', 'max:2048'], 'target' => ['nullable', Rule::in(['_self', '_blank'])], 'is_external' => ['sometimes', 'boolean'], 'is_active' => ['sometimes', 'boolean'], 'order' => ['sometimes', 'integer', 'min:0']]);
        $this->validateNavigationUrl($data['url'], (bool) ($data['is_external'] ?? false));
        $menu = Menu::create($data + ['title' => $data['name'], 'original_name' => $data['name'], 'original_url' => $data['url'], 'order' => (Menu::max('order') ?? 0) + 1, 'target' => '_self', 'is_active' => true, 'is_default' => false]);
        return $this->json('Menu item created.', ['menu' => $menu], 201);
    }

    public function updateMenu(Request $request, Menu $menu)
    {
        $this->authorizeAdminRoute($request, 'admin.menu.edit');
        $data = $request->validate(['name' => ['required', 'string', 'max:255'], 'ar_name' => ['nullable', 'string', 'max:255'], 'url' => ['nullable', 'string', 'max:2048'], 'target' => ['nullable', Rule::in(['_self', '_blank'])], 'is_external' => ['sometimes', 'boolean'], 'order' => ['sometimes', 'integer', 'min:0']]);
        if (! $menu->is_default && isset($data['url'])) $this->validateNavigationUrl($data['url'], (bool) ($data['is_external'] ?? $menu->is_external));
        $menu->update(['name' => $data['name'], 'ar_name' => $data['ar_name'] ?? $menu->ar_name, 'title' => $data['name'], 'url' => $menu->is_default ? $menu->url : ($data['url'] ?? $menu->url), 'target' => $data['target'] ?? $menu->target, 'is_external' => $menu->is_default ? $menu->is_external : ($data['is_external'] ?? $menu->is_external), 'order' => $data['order'] ?? $menu->order]);
        return $this->json('Menu item updated.', ['menu' => $menu->fresh()]);
    }

    public function toggleMenu(Request $request, Menu $menu)
    {
        $this->authorizeAdminRoute($request, 'admin.menu.remove');
        $menu->update(['is_active' => ! $menu->is_active]);
        return $this->json('Menu visibility updated.', ['menu' => $menu->fresh()]);
    }

    public function deleteMenu(Request $request, Menu $menu)
    {
        $this->authorizeAdminRoute($request, 'admin.menu.destroy');
        abort_if($menu->is_default, 422, 'Default menu items cannot be deleted.');
        $menu->delete();
        return $this->json('Menu item deleted.');
    }

    public function updateFooter(Request $request, Footer $footer)
    {
        $this->authorizeAdminRoute($request, 'admin.footer.update');
        $footer->update($request->validate(['title' => ['required', 'string', 'max:255'], 'ar_title' => ['nullable', 'string', 'max:255'], 'description' => ['nullable', 'string', 'max:2000'], 'is_active' => ['required', 'boolean'], 'order' => ['required', 'integer', 'min:0']]));
        return $this->json('Footer section updated.', ['footer' => $footer->fresh()]);
    }

    public function addFooterItem(Request $request, Footer $footer)
    {
        $this->authorizeAdminRoute($request, 'admin.footer.update');
        $data = $request->validate(['source_type' => ['required', Rule::in(['menu', 'page'])], 'source_id' => ['required', 'integer'], 'order' => ['nullable', 'integer', 'min:0']]);
        if ($data['source_type'] === 'menu') {
            $source = Menu::findOrFail($data['source_id']);
            $url = '/'.ltrim($source->url, '/');
            $target = $source->target;
            $title = $source->name;
        } else {
            $source = Page::where('is_active', true)->findOrFail($data['source_id']);
            $url = '/'.ltrim($source->url, '/');
            $target = '_self';
            $title = $source->title;
        }
        $item = FooterItem::create(['footer_id' => $footer->id, 'type' => 'link', 'title' => $title, 'url' => $url, 'order' => $data['order'] ?? (($footer->items()->max('order') ?? 0) + 1), 'target' => $target, 'is_active' => true, 'is_default' => false]);
        return $this->json('Footer link added.', ['item' => $item], 201);
    }

    public function updateFooterItem(Request $request, FooterItem $footerItem)
    {
        $this->authorizeAdminRoute($request, 'admin.footer.update');
        $data = $request->validate(['title' => ['required', 'string', 'max:255'], 'ar_title' => ['nullable', 'string', 'max:255'], 'url' => ['nullable', 'string', 'max:2048'], 'icon' => ['nullable', 'string', 'max:255'], 'order' => ['required', 'integer', 'min:0']]);
        if (isset($data['url']) && $data['url'] !== '') $this->validateNavigationUrl($data['url'], str_starts_with($data['url'], 'http'));
        $footerItem->update($data);
        return $this->json('Footer link updated.', ['item' => $footerItem->fresh()]);
    }

    public function toggleFooterItem(Request $request, FooterItem $footerItem)
    {
        $this->authorizeAdminRoute($request, 'admin.footer.update');
        $footerItem->update(['is_active' => ! $footerItem->is_active]);
        return $this->json('Footer link visibility updated.', ['item' => $footerItem->fresh()]);
    }

    public function deleteFooterItem(Request $request, FooterItem $footerItem)
    {
        $this->authorizeAdminRoute($request, 'admin.footer.update');
        if ($footerItem->is_default) $footerItem->update(['is_active' => false]);
        else $footerItem->delete();
        return $this->json($footerItem->is_default ? 'Default footer link disabled.' : 'Footer link deleted.');
    }

    private function validateNavigationUrl(string $url, bool $external): void
    {
        if ($external) {
            abort_unless(filter_var($url, FILTER_VALIDATE_URL) && in_array(parse_url($url, PHP_URL_SCHEME), ['http', 'https'], true), 422, 'External links must use a valid http or https URL.');
            return;
        }
        abort_unless(str_starts_with($url, '/') && ! str_starts_with($url, '//'), 422, 'Internal links must use a single-leading-slash path.');
    }

    public function languages(Request $request)
    {
        $this->authorizeAdminRoute($request, 'admin.language.index');
        $items = Language::orderBy('title')->get()->map(function (Language $language) {
            $path = base_path('lang/'.$language->name.'.json');
            return $language->setAttribute('translation_file_exists', is_file($path));
        });
        return $this->json('Language metadata.', ['items' => $items, 'default' => config('app.locale')]);
    }

    public function storeLanguage(Request $request)
    {
        $this->authorizeAdminRoute($request, 'admin.language.create');
        $data = $request->validate(['title' => ['required', 'string', 'max:100'], 'name' => ['required', 'regex:/^[a-z]{2,3}(?:-[A-Z]{2})?$/', 'unique:languages,name'], 'direction' => ['required', Rule::in(['ltr', 'rtl'])]]);
        $path = base_path('lang/'.$data['name'].'.json');
        abort_if(file_exists($path), 422, 'A translation file already exists for this language code.');
        abort_unless(is_writable(dirname($path)), 500, 'The translation directory is not writable.');
        \Illuminate\Support\Facades\File::put($path, "{}\n");
        $language = Language::create($data);
        return $this->json('Language added.', ['language' => $language->setAttribute('translation_file_exists', true)], 201);
    }

    public function updateLanguage(Request $request, Language $language)
    {
        $this->authorizeAdminRoute($request, 'admin.language.edit');
        $language->update($request->validate(['title' => ['required', 'string', 'max:100'], 'direction' => ['required', Rule::in(['ltr', 'rtl'])]]));
        \Illuminate\Support\Facades\Cache::forget('languages');
        return $this->json('Language metadata updated.', ['language' => $language->fresh()]);
    }

    public function setDefaultLanguage(Request $request, Language $language)
    {
        $this->authorizeAdminRoute($request, 'admin.language.edit');
        $locale = $language->name;
        abort_unless(preg_match('/^[a-z]{2,3}(?:-[A-Z]{2})?$/', $locale), 422, 'Invalid locale code.');
        abort_unless(is_file(base_path('lang/'.$locale.'.json')), 422, 'Create the translation file before selecting this language.');
        $encoded = '"'.str_replace(['\\', '"'], ['\\\\', '\\"'], $locale).'"';
        $this->writeEnvironmentSetting('APP_LOCALE', $encoded);
        \Illuminate\Support\Facades\Artisan::call('config:clear');
        \Illuminate\Support\Facades\Cache::forget('languages');
        return $this->json('Default language updated for requests without a session locale.', ['default' => $locale]);
    }

    public function deleteLanguage(Request $request, Language $language)
    {
        $this->authorizeAdminRoute($request, 'admin.language.destroy');
        abort_if($language->name === 'en' || $language->name === config('app.locale'), 422, 'The base or currently configured language cannot be deleted.');
        $path = base_path('lang/'.$language->name.'.json');
        DB::transaction(function () use ($language, $path) {
            $language->delete();
            if (is_file($path)) \Illuminate\Support\Facades\File::delete($path);
        });
        \Illuminate\Support\Facades\Cache::forget('languages');
        return $this->json('Language removed.');
    }

    public function exportLanguage(Request $request, Language $language)
    {
        $this->authorizeAdminRoute($request, 'admin.language.export');
        $path = base_path('lang/'.$language->name.'.json');
        abort_unless(is_file($path), 404, 'Translation file not found.');
        $translations = json_decode(file_get_contents($path), true);
        abort_if(json_last_error() !== JSON_ERROR_NONE || ! is_array($translations), 422, 'Translation file contains invalid JSON.');
        return $this->json('Translation file exported.', ['name' => $language->name.'.json', 'translations' => $translations]);
    }

    public function importLanguage(Request $request, Language $language)
    {
        $this->authorizeAdminRoute($request, 'admin.language.import');
        $data = $request->validate(['file' => ['required', 'file', 'mimes:json,txt', 'max:1024']]);
        $path = base_path('lang/'.$language->name.'.json');
        abort_unless(is_file($path), 404, 'Translation file not found.');
        $content = file_get_contents($data['file']->getRealPath());
        $translations = json_decode($content, true);
        abort_if(json_last_error() !== JSON_ERROR_NONE || ! is_array($translations) || array_is_list($translations), 422, 'Upload a valid JSON object of translation keys and values.');
        abort_unless(is_writable($path), 500, 'The translation file is not writable.');
        \Illuminate\Support\Facades\File::put($path, json_encode($translations, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR)."\n");
        \Illuminate\Support\Facades\Cache::forget('languages');
        return $this->json('Translation file imported.', ['keys' => count($translations)]);
    }

    public function subscriptionPlans(Request $request)
    {
        $this->authorizeAdminRoute($request, 'admin.subscription-plan.index');
        return $this->json('Subscription plans.', ['items' => SubscriptionPlan::withCount('subscriptions')->orderBy('price')->get(), 'subscriptions' => ShopSubscription::with(['shop:id,name', 'plan:id,name'])->latest('id')->paginate(min($request->integer('per_page', 50), 100))]);
    }

    public function storeSubscriptionPlan(Request $request)
    {
        $this->authorizeAdminRoute($request, 'admin.subscription-plan.create');
        $data = $request->validate(['name' => ['required', 'string', 'max:255'], 'short_description' => ['nullable', 'string', 'max:255'], 'description' => ['nullable', 'string'], 'price' => ['required', 'numeric', 'min:0'], 'duration' => ['nullable', 'integer', 'min:0'], 'sale_limit' => ['nullable', 'integer', 'min:0'], 'is_popular' => ['sometimes', 'boolean']]);
        $plan = SubscriptionPlan::create($data + ['is_active' => true]);
        return $this->json('Subscription plan created.', ['plan' => $plan], 201);
    }

    public function updateSubscriptionPlan(Request $request, SubscriptionPlan $subscriptionPlan)
    {
        $this->authorizeAdminRoute($request, 'admin.subscription-plan.edit');
        $subscriptionPlan->update($request->validate(['name' => ['required', 'string', 'max:255'], 'short_description' => ['nullable', 'string', 'max:255'], 'description' => ['nullable', 'string'], 'price' => ['required', 'numeric', 'min:0'], 'duration' => ['nullable', 'integer', 'min:0'], 'sale_limit' => ['nullable', 'integer', 'min:0'], 'is_popular' => ['sometimes', 'boolean'] ]));
        return $this->json('Subscription plan updated.', ['plan' => $subscriptionPlan->fresh()]);
    }

    public function toggleSubscriptionPlan(Request $request, SubscriptionPlan $subscriptionPlan)
    {
        $this->authorizeAdminRoute($request, 'admin.subscription-plan.toggle');
        $subscriptionPlan->update(['is_active' => ! $subscriptionPlan->is_active]);
        return $this->json('Subscription plan status updated.', ['plan' => $subscriptionPlan->fresh()]);
    }

    public function deleteSubscriptionPlan(Request $request, SubscriptionPlan $subscriptionPlan)
    {
        $this->authorizeAdminRoute($request, 'admin.subscription-plan.destroy');
        abort_if($subscriptionPlan->subscriptions()->whereIn('status', [SubscriptionStatus::ACTIVE->value, SubscriptionStatus::PENDING->value])->exists(), 422, 'A plan with active or pending subscriptions cannot be deleted.');
        $subscriptionPlan->delete();
        return $this->json('Subscription plan deleted.');
    }

    public function shopSubscriptions(Request $request)
    {
        $this->authorizeAdminRoute($request, 'admin.subscription-plan.subscription.list');
        $subscriptions = ShopSubscription::with(['shop:id,name', 'plan:id,name', 'payment:id,status,payment_method'])
            ->when($request->filled('shop_id'), fn ($query) => $query->where('shop_id', $request->integer('shop_id')))
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')))
            ->latest('id')->paginate(min($request->integer('per_page', 20), 100));
        return $this->json('Shop subscriptions.', ['items' => $subscriptions->items(), 'total' => $subscriptions->total(), 'current_page' => $subscriptions->currentPage(), 'shops' => Shop::orderBy('name')->get(['id', 'name'])]);
    }

    public function activateShopSubscription(Request $request, ShopSubscription $shopSubscription)
    {
        $this->authorizeAdminRoute($request, 'admin.subscription-plan.subscription.status');
        abort_if($shopSubscription->status === SubscriptionStatus::CANCELLED->value, 422, 'Cancelled subscriptions cannot be activated.');
        DB::transaction(function () use ($shopSubscription) {
            $previous = ShopSubscription::where('shop_id', $shopSubscription->shop_id)->where('status', SubscriptionStatus::ACTIVE->value)->where('id', '!=', $shopSubscription->id)->latest('id')->first();
            ShopSubscription::where('shop_id', $shopSubscription->shop_id)->where('status', SubscriptionStatus::ACTIVE->value)->where('id', '!=', $shopSubscription->id)->update(['status' => SubscriptionStatus::CANCELLED->value]);
            $remaining = $shopSubscription->sale_limit;
            if ($shopSubscription->sale_limit !== null) {
                if ($previous?->remaining_sales !== null) $remaining += $previous->remaining_sales;
            }
            $shopSubscription->update(['starts_at' => now(), 'ends_at' => $shopSubscription->duration ? now()->addDays($shopSubscription->duration) : null, 'remaining_sales' => $remaining, 'status' => SubscriptionStatus::ACTIVE->value]);
        });
        return $this->json('Shop subscription activated.', ['subscription' => $shopSubscription->fresh()->load(['shop:id,name', 'plan:id,name'])]);
    }

    public function ticketIssueTypes(Request $request)
    {
        $this->authorizeAdminRoute($request, 'admin.ticketIssueType.index');
        return $this->json('Ticket issue types.', ['items' => TicketIssueType::latest('id')->get()]);
    }

    public function storeTicketIssueType(Request $request)
    {
        $this->authorizeAdminRoute($request, 'admin.ticketIssueType.create');
        $item = TicketIssueType::create($request->validate(['name' => ['required', 'string', 'max:50']]));
        return $this->json('Issue type created.', ['item' => $item], 201);
    }

    public function updateTicketIssueType(Request $request, TicketIssueType $ticketIssueType)
    {
        $this->authorizeAdminRoute($request, 'admin.ticketIssueType.edit');
        $ticketIssueType->update($request->validate(['name' => ['required', 'string', 'max:50']]));
        return $this->json('Issue type updated.', ['item' => $ticketIssueType->fresh()]);
    }

    public function toggleTicketIssueType(Request $request, TicketIssueType $ticketIssueType)
    {
        $this->authorizeAdminRoute($request, 'admin.ticketIssueType.toggle');
        $ticketIssueType->update(['is_active' => ! $ticketIssueType->is_active]);
        return $this->json('Issue type status updated.', ['item' => $ticketIssueType->fresh()]);
    }

    public function deleteTicketIssueType(Request $request, TicketIssueType $ticketIssueType)
    {
        $this->authorizeAdminRoute($request, 'admin.ticketIssueType.delete');
        $ticketIssueType->delete();
        return $this->json('Issue type deleted.');
    }

    public function notificationRecipients(Request $request)
    {
        $this->authorizeAdminRoute($request, 'admin.customerNotification.index');
        $users = User::role(Roles::CUSTOMER->value)->whereHas('devices', fn ($query) => $query->when($request->filled('device_type') && $request->string('device_type') !== 'all', fn ($devices) => $devices->where('device_type', $request->string('device_type'))))
            ->orderBy('name')->get(['id', 'name', 'email', 'phone']);
        return $this->json('Push notification recipients.', ['items' => $users]);
    }

    public function sendCustomerNotification(Request $request)
    {
        $this->authorizeAdminRoute($request, 'admin.customerNotification.send');
        $data = $request->validate(['title' => ['required', 'string', 'max:255'], 'message' => ['required', 'string', 'max:4000'], 'user_ids' => ['required', 'array', 'min:1'], 'user_ids.*' => ['integer', 'distinct', 'exists:users,id']]);
        $customerIds = User::role(Roles::CUSTOMER->value)->whereIn('id', $data['user_ids'])->pluck('id');
        abort_if($customerIds->isEmpty(), 422, 'Choose at least one customer account.');
        $keys = DeviceKey::whereIn('user_id', $customerIds)->pluck('key')->filter()->values()->all();
        abort_if(empty($keys), 422, 'The selected customers do not have registered notification devices.');
        try {
            $result = NotificationServices::sendNotification($data['message'], $keys, $data['title']);
        } catch (\Throwable $exception) {
            report($exception);
            return $this->json('Push notification delivery failed.', ['recipients' => $customerIds->count()], 502);
        }
        if (! ($result['success'] ?? false)) return $this->json($result['message'] ?? 'Push notification delivery failed.', ['recipients' => $customerIds->count()], 422);
        return $this->json('Customer notification sent.', ['recipients' => $customerIds->count(), 'devices' => count($keys)]);
    }

    public function adminNotifications(Request $request)
    {
        $this->authorizeAdminRoute($request, 'admin.notification.index');
        $notifications = Notification::whereNull('user_id')->whereNull('shop_id')->latest('id')->paginate(min($request->integer('per_page', 30), 100));
        return $this->json('Administrative notifications.', ['items' => $notifications->items(), 'total' => $notifications->total(), 'unread' => Notification::whereNull('user_id')->whereNull('shop_id')->where('is_read', false)->count()]);
    }

    public function readAdminNotification(Request $request, Notification $notification)
    {
        $this->authorizeAdminRoute($request, 'admin.notification.read');
        abort_unless($notification->user_id === null && $notification->shop_id === null, 404);
        $notification->update(['is_read' => true]);
        return $this->json('Notification marked as read.', ['notification' => $notification->fresh()]);
    }

    public function readAllAdminNotifications(Request $request)
    {
        $this->authorizeAdminRoute($request, 'admin.notification.read');
        Notification::whereNull('user_id')->whereNull('shop_id')->where('is_read', false)->update(['is_read' => true]);
        return $this->json('Administrative notifications marked as read.');
    }

    public function deleteAdminNotification(Request $request, Notification $notification)
    {
        $this->authorizeAdminRoute($request, 'admin.notification.destroy');
        abort_unless($notification->user_id === null && $notification->shop_id === null, 404);
        $notification->delete();
        return $this->json('Notification deleted.');
    }

    public function supportItems(Request $request)
    {
        $this->authorizeAdminRoute($request, 'admin.support-item.index');
        return $this->json('Support content.', ['items' => SupportItem::orderBy('order')->get()]);
    }

    public function updateSupportItem(Request $request, SupportItem $supportItem)
    {
        $this->authorizeAdminRoute($request, 'admin.support-item.update');
        $supportItem->update($request->validate(['title' => ['required', 'string', 'max:255'], 'ar_title' => ['nullable', 'string', 'max:255'], 'description' => ['required', 'string', 'max:255'], 'ar_description' => ['nullable', 'string', 'max:255'], 'order' => ['required', 'integer', 'min:0'], 'is_active' => ['required', 'boolean'] ]));
        return $this->json('Support content updated.', ['item' => $supportItem->fresh()]);
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

    public function adminSettings(Request $request)
    {
        $this->authorizeAdminRoute($request, 'admin.generale-setting.index');
        $setting = GeneraleSetting::query()->first();
        $allowed = ['name', 'title', 'mobile', 'email', 'address', 'google_playstore_url', 'app_store_url', 'primary_color', 'secondary_color', 'footer_text', 'footer_description', 'commission', 'commission_type', 'commission_charge', 'shop_pos', 'shop_register', 'new_product_approval', 'update_product_approval', 'min_withdraw', 'max_withdraw', 'withdraw_request', 'is_weight_charge', 'is_distance_charge', 'is_delivery_free', 'return_order_within_days', 'show_product_stock', 'shop_type', 'business_based_on', 'show_sku', 'show_download_app', 'default_delivery_charge', 'cash_on_delivery', 'online_payment', 'low_stock_alert', 'low_stock_mail_notification', 'low_stock_alert_quantity', 'product_description', 'page_description', 'blog_description', 'currency_id', 'meta_pixel_id', 'meta_pixel_enabled'];
        $columns = array_intersect($allowed, Schema::getColumnListing('generate_settings'));
        $values = $setting ? $setting->only($columns) : [];
        return $this->json('Store settings.', ['settings' => $values, 'currencies' => Currency::orderBy('name')->get(['id', 'name', 'code', 'symbol', 'is_default'])]);
    }

    public function updateAdminSettings(Request $request)
    {
        $this->authorizeAdminRoute($request, 'admin.generale-setting.update');
        $allowed = ['name', 'title', 'mobile', 'email', 'address', 'google_playstore_url', 'app_store_url', 'primary_color', 'secondary_color', 'footer_text', 'footer_description', 'commission', 'commission_type', 'commission_charge', 'shop_pos', 'shop_register', 'new_product_approval', 'update_product_approval', 'min_withdraw', 'max_withdraw', 'withdraw_request', 'is_weight_charge', 'is_distance_charge', 'is_delivery_free', 'return_order_within_days', 'show_product_stock', 'shop_type', 'business_based_on', 'show_sku', 'show_download_app', 'default_delivery_charge', 'cash_on_delivery', 'online_payment', 'low_stock_alert', 'low_stock_mail_notification', 'low_stock_alert_quantity', 'product_description', 'page_description', 'blog_description', 'currency_id', 'meta_pixel_id', 'meta_pixel_enabled'];
        $columns = array_intersect($allowed, Schema::getColumnListing('generate_settings'));
        $rules = [];
        foreach (['name', 'title', 'mobile', 'email', 'address', 'google_playstore_url', 'app_store_url', 'primary_color', 'secondary_color', 'footer_text', 'footer_description', 'commission_type', 'shop_type', 'business_based_on', 'product_description', 'page_description', 'blog_description', 'meta_pixel_id'] as $field) $rules[$field] = ['nullable', 'string', 'max:5000'];
        foreach (['commission', 'commission_charge', 'min_withdraw', 'max_withdraw', 'default_delivery_charge', 'low_stock_alert_quantity', 'return_order_within_days'] as $field) $rules[$field] = ['nullable', 'numeric', 'min:0'];
        foreach (['shop_pos', 'shop_register', 'new_product_approval', 'update_product_approval', 'withdraw_request', 'is_weight_charge', 'is_distance_charge', 'is_delivery_free', 'show_product_stock', 'show_sku', 'show_download_app', 'cash_on_delivery', 'online_payment', 'low_stock_alert', 'low_stock_mail_notification', 'meta_pixel_enabled'] as $field) $rules[$field] = ['sometimes', 'boolean'];
        $rules['currency_id'] = ['nullable', 'integer', 'exists:currencies,id'];
        $data = $request->validate(array_intersect_key($rules, array_flip($columns)));
        foreach (['shop_pos', 'shop_register', 'new_product_approval', 'update_product_approval', 'withdraw_request', 'is_weight_charge', 'is_distance_charge', 'is_delivery_free', 'show_product_stock', 'show_sku', 'show_download_app', 'cash_on_delivery', 'online_payment', 'low_stock_alert', 'low_stock_mail_notification', 'meta_pixel_enabled'] as $flag) {
            if (array_key_exists($flag, $data)) $data[$flag] = $request->boolean($flag);
        }
        $setting = GeneraleSetting::query()->first() ?? new GeneraleSetting();
        $setting->fill($data)->save();
        return $this->json('Store settings updated.', ['settings' => $setting->only($columns)]);
    }

    public function logisticsSettings(Request $request)
    {
        $this->authorizeAdminRoute($request, 'admin.deliveryCharge.index');
        return $this->json('Logistics settings.', [
            'delivery_charges' => DeliveryCharge::orderBy('min_qty')->get(),
            'weight_charges' => WeightDeliveryCharge::orderBy('min_weight')->get(),
            'areas' => Area::orderBy('name')->get(),
            'countries' => Country::orderBy('name')->get(),
            'currencies' => Currency::orderBy('name')->get(),
        ]);
    }

    public function saveDeliveryCharge(Request $request)
    {
        $deliveryCharge = $request->route('deliveryCharge') ? DeliveryCharge::findOrFail($request->route('deliveryCharge')) : null;
        $this->authorizeAdminRoute($request, $deliveryCharge ? 'admin.deliveryCharge.edit' : 'admin.deliveryCharge.create');
        $data = $request->validate(['name' => ['required', 'string', 'max:120'], 'min_qty' => ['required', 'integer', 'min:0'], 'max_qty' => ['required', 'integer', 'gte:min_qty'], 'charge' => ['required', 'numeric', 'min:0']]);
        $record = $deliveryCharge ?? new DeliveryCharge(); $record->fill($data)->save();
        return $this->json('Delivery charge saved.', ['delivery_charge' => $record], $deliveryCharge ? 200 : 201);
    }

    public function deleteDeliveryCharge(Request $request, DeliveryCharge $deliveryCharge)
    {
        $this->authorizeAdminRoute($request, 'admin.deliveryCharge.destroy'); $deliveryCharge->delete(); return $this->json('Delivery charge deleted.');
    }

    public function saveWeightCharge(Request $request)
    {
        $weightDeliveryCharge = $request->route('weightDeliveryCharge') ? WeightDeliveryCharge::findOrFail($request->route('weightDeliveryCharge')) : null;
        $this->authorizeAdminRoute($request, $weightDeliveryCharge ? 'admin.weightWiseDeliveryCharge.edit' : 'admin.weightWiseDeliveryCharge.create');
        $data = $request->validate(['min_weight' => ['required', 'numeric', 'min:0'], 'max_weight' => ['required', 'numeric', 'gte:min_weight'], 'delivery_charge' => ['required', 'numeric', 'min:0']]);
        $record = $weightDeliveryCharge ?? new WeightDeliveryCharge(); $record->fill($data)->save();
        return $this->json('Weight delivery charge saved.', ['weight_charge' => $record], $weightDeliveryCharge ? 200 : 201);
    }

    public function deleteWeightCharge(Request $request, WeightDeliveryCharge $weightDeliveryCharge)
    {
        $this->authorizeAdminRoute($request, 'admin.weightWiseDeliveryCharge.destroy'); $weightDeliveryCharge->delete(); return $this->json('Weight delivery charge deleted.');
    }

    public function saveArea(Request $request)
    {
        $area = $request->route('area') ? Area::findOrFail($request->route('area')) : null;
        $this->authorizeAdminRoute($request, $area ? 'admin.area.edit' : 'admin.area.create');
        $columns = Schema::getColumnListing('areas');
        $rules = ['name' => ['required', 'string', 'max:255'], 'delivery_amount' => ['nullable', 'numeric', 'min:0'], 'distance' => ['nullable', 'numeric', 'min:0'], 'latitude' => ['nullable', 'numeric', 'between:-90,90'], 'longitude' => ['nullable', 'numeric', 'between:-180,180'], 'price_per_km' => ['nullable', 'numeric', 'min:0'], 'price_per_min' => ['nullable', 'numeric', 'min:0'], 'polygon_coordinates' => ['nullable', 'json'], 'country_id' => ['nullable', 'integer', 'exists:countries,id']];
        $data = $request->validate(array_intersect_key($rules, array_flip($columns)));
        $record = $area ?? new Area(); $record->fill($data)->save();
        return $this->json('Area saved.', ['area' => $record->fresh()], $area ? 200 : 201);
    }

    public function toggleArea(Request $request, Area $area)
    {
        $this->authorizeAdminRoute($request, 'admin.area.toggle'); $area->update(['is_active' => ! $area->is_active]); return $this->json('Area status updated.', ['area' => $area->fresh()]);
    }

    public function deleteArea(Request $request, Area $area)
    {
        $this->authorizeAdminRoute($request, 'admin.area.destroy');
        if ($area->getAddresses()->exists()) return $this->json('This area is linked to saved addresses and cannot be deleted.', [], 422);
        $area->delete(); return $this->json('Area deleted.');
    }

    public function saveCountry(Request $request)
    {
        $country = $request->route('country') ? Country::findOrFail($request->route('country')) : null;
        $this->authorizeAdminRoute($request, $country ? 'admin.country.edit' : 'admin.country.create');
        $data = $request->validate(['name' => ['required', 'string', 'max:100'], 'phone_code' => ['required', 'string', 'max:10'], 'numeric_code' => ['nullable', 'string', 'max:5'], 'capital' => ['nullable', 'string', 'max:100'], 'currency' => ['nullable', 'string', 'max:10'], 'currency_name' => ['nullable', 'string', 'max:100'], 'currency_symbol' => ['nullable', 'string', 'max:20'], 'region' => ['nullable', 'string', 'max:100'], 'is_active' => ['sometimes', 'boolean']]);
        $record = $country ?? new Country(); $record->fill($data)->save();
        return $this->json('Country saved.', ['country' => $record], $country ? 200 : 201);
    }

    public function deleteCountry(Request $request, Country $country)
    {
        $this->authorizeAdminRoute($request, 'admin.country.destroy'); $country->delete(); return $this->json('Country deleted.');
    }

    public function saveCurrency(Request $request)
    {
        $currency = $request->route('currency') ? Currency::findOrFail($request->route('currency')) : null;
        $this->authorizeAdminRoute($request, $currency ? 'admin.currency.edit' : 'admin.currency.create');
        $data = $request->validate(['name' => ['required', 'string', 'max:100'], 'code' => ['nullable', 'string', 'max:10'], 'symbol' => ['required', 'string', 'max:10'], 'rate' => ['required', 'numeric', 'gt:0'], 'is_active' => ['sometimes', 'boolean'], 'is_default' => ['sometimes', 'boolean']]);
        return DB::transaction(function () use ($data, $currency) {
            if (!empty($data['is_default'])) Currency::where('is_default', true)->update(['is_default' => false]);
            $record = $currency ?? new Currency(); $record->fill($data)->save();
            return $this->json('Currency saved.', ['currency' => $record], $currency ? 200 : 201);
        });
    }

    public function toggleCurrency(Request $request, Currency $currency)
    {
        $this->authorizeAdminRoute($request, 'admin.currency.toggle');
        if ($currency->is_default) return $this->json('The default currency cannot be disabled.', [], 422);
        $currency->update(['is_active' => ! $currency->is_active]); return $this->json('Currency status updated.', ['currency' => $currency->fresh()]);
    }

    public function deleteCurrency(Request $request, Currency $currency)
    {
        $this->authorizeAdminRoute($request, 'admin.currency.destroy');
        if ($currency->is_default || GeneraleSetting::where('currency_id', $currency->id)->exists()) return $this->json('The default or currently assigned currency cannot be deleted.', [], 422);
        $currency->delete(); return $this->json('Currency deleted.');
    }

    public function environmentIntegrationSettings(Request $request)
    {
        $service = (string) $request->route('service');
        $definitions = $this->environmentIntegrationDefinitions();
        abort_unless(isset($definitions[$service]), 404);
        [$permission, $fields] = $definitions[$service];
        $this->authorizeAdminRoute($request, $permission[0]);
        $values = [];
        foreach ($fields as $field => $meta) {
            [$configKey, $secret] = $meta;
            $raw = (string) config($configKey, '');
            $values[$field] = $secret && filled($raw) ? '••••••••' : $raw;
        }
        return $this->json('Integration settings.', ['service' => $service, 'values' => $values]);
    }

    public function updateEnvironmentIntegrationSettings(Request $request)
    {
        $service = (string) $request->route('service');
        $definitions = $this->environmentIntegrationDefinitions();
        abort_unless(isset($definitions[$service]), 404);
        [$permission, $fields] = $definitions[$service];
        $this->authorizeAdminRoute($request, $permission[1]);
        $rules = [];
        foreach ($fields as $field => [, $secret]) $rules[$field] = $secret ? ['nullable', 'string', 'max:2000', 'not_regex:/[\r\n]/'] : ['nullable', 'string', 'max:1000', 'not_regex:/[\r\n]/'];
        if ($service === 'mail') { $rules['mailer'] = ['sometimes', Rule::in(['smtp', 'sendmail', 'mailgun', 'ses', 'postmark', 'log', 'array'])]; $rules['port'] = ['sometimes', 'nullable', 'integer', 'between:1,65535']; $rules['encryption'] = ['sometimes', 'nullable', Rule::in(['tls', 'ssl', ''])]; $rules['from_address'] = ['sometimes', 'nullable', 'email']; }
        if ($service === 'courier') { $rules['base_url'] = ['sometimes', 'nullable', 'url', 'max:1000']; $rules['default_delivery_type'] = ['sometimes', Rule::in(['0', '1', 0, 1])]; $rules['is_active'] = ['sometimes', 'boolean']; }
        $data = $request->validate($rules);
        foreach ($fields as $field => [$configKey, $secret, $envKey]) {
            if (!array_key_exists($field, $data)) continue;
            $value = $data[$field];
            if ($secret && (blank($value) || $value === '••••••••')) continue;
            $encoded = '"'.str_replace(['\\', '"'], ['\\\\', '\\"'], (string) ($value ?? '')).'"';
            $this->writeEnvironmentSetting($envKey, $encoded);
        }
        \Illuminate\Support\Facades\Artisan::call('config:clear');
        return $this->json('Integration settings updated.');
    }

    private function writeEnvironmentSetting(string $key, string $encodedValue): void
    {
        $path = app()->environmentFilePath();
        $contents = @file_get_contents($path);
        if ($contents === false) throw new \RuntimeException('The application environment file is not readable.');
        $pattern = '/^'.preg_quote($key, '/').'=.*$/m';
        $line = $key.'='.$encodedValue;
        if (preg_match($pattern, $contents)) $contents = preg_replace_callback($pattern, fn () => $line, $contents);
        else $contents = rtrim($contents)."\n".$line."\n";
        if (@file_put_contents($path, $contents, LOCK_EX) === false) throw new \RuntimeException('The application environment file could not be updated.');
    }

    private function environmentIntegrationDefinitions(): array
    {
        return [
            'mail' => [['admin.mailConfig.index', 'admin.mailConfig.update'], ['mailer' => ['mail.default', false, 'MAIL_MAILER'], 'host' => ['mail.mailers.smtp.host', false, 'MAIL_HOST'], 'port' => ['mail.mailers.smtp.port', false, 'MAIL_PORT'], 'username' => ['mail.mailers.smtp.username', false, 'MAIL_USERNAME'], 'password' => ['mail.mailers.smtp.password', true, 'MAIL_PASSWORD'], 'encryption' => ['mail.mailers.smtp.encryption', false, 'MAIL_ENCRYPTION'], 'from_address' => ['mail.from.address', false, 'MAIL_FROM_ADDRESS']]],
            'courier' => [['admin.courierConfig.index', 'admin.courierConfig.update'], ['api_key' => ['services.steadfast.api_key', true, 'STEADFAST_API_KEY'], 'secret_key' => ['services.steadfast.secret_key', true, 'STEADFAST_SECRET_KEY'], 'base_url' => ['services.steadfast.base_url', false, 'STEADFAST_BASE_URL'], 'default_delivery_type' => ['services.steadfast.default_delivery_type', false, 'STEADFAST_DEFAULT_DELIVERY_TYPE'], 'is_active' => ['services.steadfast.active', false, 'STEADFAST_ACTIVE']]],
            'google-maps' => [['admin.googleMaps.index', 'admin.googleMaps.update'], ['api_key' => ['services.google_maps.key', true, 'GOOGLE_MAPS_AI_PKEY']]],
            'pusher' => [['admin.pusher.index', 'admin.pusher.update'], ['app_id' => ['broadcasting.connections.pusher.app_id', false, 'PUSHER_APP_ID'], 'app_key' => ['broadcasting.connections.pusher.key', false, 'PUSHER_APP_KEY'], 'app_secret' => ['broadcasting.connections.pusher.secret', true, 'PUSHER_APP_SECRET'], 'app_cluster' => ['broadcasting.connections.pusher.options.cluster', false, 'PUSHER_APP_CLUSTER']]],
        ];
    }

    public function smsGateways(Request $request)
    {
        $this->authorizeAdminRoute($request, 'admin.sms-gateway.index');
        $items = SMSConfig::orderBy('provider')->get()->map(function ($item) {
            $data = is_array($item->data) ? $item->data : (json_decode($item->data ?? '{}', true) ?: []);
            foreach ($data as $key => $value) if (preg_match('/token|secret|password|api_key/i', $key) && filled($value)) $data[$key] = '••••••••';
            $item->data = $data; return $item;
        });
        return $this->json('SMS gateway settings.', ['items' => $items]);
    }

    public function updateSmsGateway(Request $request)
    {
        $this->authorizeAdminRoute($request, 'admin.sms-gateway.update');
        $providers = ['twilio' => ['twilio_sid', 'twilio_token', 'twilio_from'], 'telesign' => ['customer_id', 'api_key'], 'nexmo' => ['nexmo_key', 'nexmo_secret', 'nexmo_from'], 'message_bird' => ['api_key', 'from']];
        $data = $request->validate(['provider' => ['required', Rule::in(array_keys($providers))], 'data' => ['required', 'array'], 'status' => ['required', 'boolean']]);
        $provider = $data['provider']; $allowed = $providers[$provider];
        abort_unless(count(array_diff(array_keys($data['data']), $allowed)) === 0, 422, 'Unsupported field for this SMS provider.');
        $record = SMSConfig::firstOrNew(['provider' => $provider]);
        $stored = is_array($record->data) ? $record->data : (json_decode($record->data ?? '{}', true) ?: []);
        foreach ($allowed as $key) {
            if (!array_key_exists($key, $data['data'])) continue;
            $value = $data['data'][$key];
            if (preg_match('/token|secret|password|api_key/i', $key) && (blank($value) || $value === '••••••••')) continue;
            if (!is_string($value) || strlen($value) > 2000 || preg_match('/[\\r\\n]/', $value)) abort(422, 'Invalid SMS gateway field.');
            $stored[$key] = $value;
        }
        $required = match ($provider) { 'twilio' => ['twilio_sid', 'twilio_token', 'twilio_from'], 'telesign' => ['customer_id', 'api_key'], 'nexmo' => ['nexmo_key', 'nexmo_secret', 'nexmo_from'], 'message_bird' => ['api_key', 'from'] };
        foreach ($required as $key) if (blank($stored[$key] ?? null)) abort(422, "The {$key} field is required.");
        DB::transaction(function () use ($record, $stored, $data, $provider) {
            if ($data['status']) SMSConfig::where('provider', '!=', $provider)->update(['status' => false]);
            $record->data = json_encode($stored); $record->status = $data['status']; $record->save();
        });
        return $this->json('SMS gateway settings updated.');
    }

    public function firebaseSettings(Request $request)
    {
        $this->authorizeAdminRoute($request, 'admin.firebase.index');
        $file = 'firebase_credentials.json';
        $hasConfig = Storage::disk('public')->exists($file);
        $projectId = null;
        if ($hasConfig) { $parsed = json_decode(Storage::disk('public')->get($file), true); $projectId = is_array($parsed) ? ($parsed['project_id'] ?? null) : null; }
        return $this->json('Firebase settings.', ['configured' => $hasConfig, 'project_id' => $projectId]);
    }

    public function updateFirebaseSettings(Request $request)
    {
        $this->authorizeAdminRoute($request, 'admin.firebase.update');
        $data = $request->validate(['file' => ['required', 'file', 'mimes:json', 'max:1024']]);
        $config = json_decode(file_get_contents($data['file']->getRealPath()), true);
        foreach (['type', 'project_id', 'private_key', 'client_email', 'client_id'] as $key) if (!is_array($config) || empty($config[$key])) return $this->json('The uploaded file is not a valid Firebase service account JSON.', [], 422);
        Storage::disk('public')->put('firebase_credentials.json', file_get_contents($data['file']->getRealPath()));
        return $this->json('Firebase service account updated.', ['configured' => true, 'project_id' => $config['project_id']]);
    }

    public function recaptchaSettings(Request $request)
    {
        $this->authorizeAdminRoute($request, 'admin.googleReCaptcha.index');
        $config = GoogleReCaptcha::query()->first();
        $data = $config?->only(['id', 'site_key', 'is_active']) ?? [];
        $data['secret_key'] = filled($config?->secret_key) ? '••••••••' : '';
        return $this->json('reCAPTCHA settings.', ['settings' => $data]);
    }

    public function updateRecaptchaSettings(Request $request)
    {
        $this->authorizeAdminRoute($request, 'admin.googleReCaptcha.update');
        $data = $request->validate(['site_key' => ['required', 'string', 'max:2000'], 'secret_key' => ['nullable', 'string', 'max:2000'], 'is_active' => ['required', 'boolean']]);
        $config = GoogleReCaptcha::query()->first() ?? new GoogleReCaptcha();
        $config->site_key = $data['site_key']; $config->is_active = $data['is_active'];
        if (filled($data['secret_key']) && $data['secret_key'] !== '••••••••') $config->secret_key = $data['secret_key'];
        $config->save();
        return $this->json('reCAPTCHA settings updated.', ['settings' => ['id' => $config->id, 'site_key' => $config->site_key, 'secret_key' => filled($config->secret_key) ? '••••••••' : '', 'is_active' => $config->is_active]]);
    }

    public function socialAuthSettings(Request $request)
    {
        $this->authorizeAdminRoute($request, 'admin.socialAuth.index');
        $items = SocialAuth::orderBy('id')->get()->map(function ($item) {
            if (filled($item->client_secret)) $item->client_secret = '••••••••';
            return $item;
        });
        return $this->json('Social login providers.', ['items' => $items]);
    }

    public function updateSocialAuth(Request $request, SocialAuth $socialAuth)
    {
        $this->authorizeAdminRoute($request, 'admin.socialAuth.update');
        $data = $request->validate(['client_id' => ['nullable', 'string', 'max:1000'], 'client_secret' => ['nullable', 'string', 'max:2000'], 'redirect' => ['nullable', 'url', 'max:2000']]);
        if (!array_key_exists('client_secret', $data) || blank($data['client_secret']) || $data['client_secret'] === '••••••••') unset($data['client_secret']);
        $socialAuth->fill($data)->save();
        $socialAuth->client_secret = filled($socialAuth->client_secret) ? '••••••••' : null;
        return $this->json('Social login provider updated.', ['provider' => $socialAuth]);
    }

    public function toggleSocialAuth(Request $request, SocialAuth $socialAuth)
    {
        $this->authorizeAdminRoute($request, 'admin.socialAuth.toggle'); $socialAuth->update(['is_active' => ! $socialAuth->is_active]);
        $socialAuth->client_secret = filled($socialAuth->client_secret) ? '••••••••' : null;
        return $this->json('Social login provider status updated.', ['provider' => $socialAuth]);
    }

    public function paymentGateways(Request $request)
    {
        $this->authorizeAdminRoute($request, 'admin.paymentGateway.index');
        return $this->json('Payment gateways.', ['items' => PaymentGateway::with('media')->orderBy('id')->get()->map(fn ($gateway) => $this->maskedGateway($gateway))]);
    }

    public function updatePaymentGateway(Request $request, PaymentGateway $paymentGateway)
    {
        $this->authorizeAdminRoute($request, 'admin.paymentGateway.update');
        $data = $request->validate(['config' => ['required', 'array'], 'is_active' => ['sometimes', 'boolean']]);
        $config = is_array($paymentGateway->config) ? $paymentGateway->config : (json_decode($paymentGateway->config ?? '{}', true) ?: []);
        foreach ($data['config'] as $key => $value) {
            abort_unless(is_string($key) && preg_match('/^[a-zA-Z0-9_]+$/', $key), 422, 'Invalid gateway config key.');
            if (!(is_string($value) && $value === '••••••••') && !(preg_match('/secret|token|password|private|key/i', $key) && blank($value))) $config[$key] = $value;
        }
        $paymentGateway->config = $config;
        if (array_key_exists('is_active', $data)) $paymentGateway->is_active = $data['is_active'];
        $paymentGateway->save();
        return $this->json('Payment gateway updated.', ['gateway' => $this->maskedGateway($paymentGateway->fresh())]);
    }

    public function togglePaymentGateway(Request $request, PaymentGateway $paymentGateway)
    {
        $this->authorizeAdminRoute($request, 'admin.paymentGateway.toggle'); $paymentGateway->update(['is_active' => ! $paymentGateway->is_active]); return $this->json('Payment gateway status updated.', ['gateway' => $this->maskedGateway($paymentGateway->fresh())]);
    }

    private function maskedGateway(PaymentGateway $gateway): PaymentGateway
    {
        $config = is_array($gateway->config) ? $gateway->config : (json_decode($gateway->config ?? '{}', true) ?: []);
        foreach ($config as $key => $value) if (preg_match('/secret|token|password|private|key/i', (string) $key) && filled($value)) $config[$key] = '••••••••';
        $gateway->config = $config;
        return $gateway;
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
