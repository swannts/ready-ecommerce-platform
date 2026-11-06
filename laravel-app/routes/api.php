<?php

use App\Http\Controllers\API\AddressController;
use App\Http\Controllers\API\Admin\ManagementAuthController;
use App\Http\Controllers\API\Admin\ManagementController;
use App\Http\Controllers\API\Admin\CatalogController;
use App\Http\Controllers\API\Auth\AuthController;
use App\Http\Controllers\API\Auth\ForgotPasswordController;
use App\Http\Controllers\API\BannerController;
use App\Http\Controllers\API\BlogController;
use App\Http\Controllers\API\BrandController;
use App\Http\Controllers\API\CartController;
use App\Http\Controllers\API\CategoryController;
use App\Http\Controllers\API\ChatController;
use App\Http\Controllers\API\CountryController;
use App\Http\Controllers\API\CouponController;
use App\Http\Controllers\API\FlashSaleController;
use App\Http\Controllers\API\HomeController;
use App\Http\Controllers\API\LegalPageController;
use App\Http\Controllers\API\MasterController;
use App\Http\Controllers\API\MetaPixelController;
use App\Http\Controllers\API\OrderController;
use App\Http\Controllers\API\ProductController;
use App\Http\Controllers\API\ProductLicenseController;
use App\Http\Controllers\API\ReturnOrderController;
use App\Http\Controllers\API\ReviewController;
use App\Http\Controllers\API\ShopController;
use App\Http\Controllers\API\SocialAuthController;
use App\Http\Controllers\API\SubCategoryController;
use App\Http\Controllers\API\SupportController;
use App\Http\Controllers\API\SupportTicketController;
use App\Http\Controllers\API\SupportTicketMessageController;
use App\Http\Controllers\API\TicketIssueTypeController;
use App\Http\Controllers\API\UserController;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// auth token route
Route::prefix('/admin-workspace')->group(function () {
    Route::post('/login', [ManagementAuthController::class, 'login'])->middleware('throttle:10,1');

    Route::middleware(['auth:sanctum', 'role:root|admin'])->group(function () {
        Route::get('/me', [ManagementAuthController::class, 'me']);
        Route::post('/logout', [ManagementAuthController::class, 'logout']);
        Route::get('/dashboard', [ManagementController::class, 'dashboard']);
        Route::get('/shops', [ManagementController::class, 'shops']);
        Route::post('/shops', [ManagementController::class, 'storeShop']);
        Route::get('/shops/{shop}', [ManagementController::class, 'shopDetails']);
        Route::put('/shops/{shop}', [ManagementController::class, 'updateShop']);
        Route::post('/shops/{shop}/reset-password', [ManagementController::class, 'resetShopPassword']);
        Route::get('/shops/{shop}/{resource}', [ManagementController::class, 'shopResources']);
        Route::post('/shops/{shop}/toggle', [ManagementController::class, 'toggleShop']);
        Route::get('/products', [ManagementController::class, 'products']);
        Route::get('/products/{product}', [ManagementController::class, 'productDetails']);
        Route::put('/products/{product}', [ManagementController::class, 'updateProduct']);
        Route::post('/products/{product}/toggle', [ManagementController::class, 'toggleProduct']);
        Route::post('/products/{product}/approve', [ManagementController::class, 'approveProduct']);
        Route::delete('/products/{product}', [ManagementController::class, 'deleteProduct']);
        Route::get('/orders', [ManagementController::class, 'orders']);
        Route::get('/orders/{order}', [ManagementController::class, 'orderDetails']);
        Route::post('/orders/{order}/status', [ManagementController::class, 'updateOrderStatus']);
        Route::post('/orders/{order}/paid', [ManagementController::class, 'markOrderPaid']);
        Route::post('/orders/{order}/assign-courier', [ManagementController::class, 'assignOrderCourier']);
        Route::post('/orders/{order}/assign-rider', [ManagementController::class, 'assignOrderRider']);
        Route::get('/customers', [ManagementController::class, 'customers']);
        Route::post('/customers', [ManagementController::class, 'storeCustomer']);
        Route::get('/customers/{user}', [ManagementController::class, 'customerDetails']);
        Route::put('/customers/{user}', [ManagementController::class, 'updateCustomer']);
        Route::delete('/customers/{user}', [ManagementController::class, 'deleteCustomer']);
        Route::post('/customers/{user}/toggle', [ManagementController::class, 'toggleCustomer']);
        Route::post('/customers/{user}/reset-password', [ManagementController::class, 'resetCustomerPassword']);
        Route::get('/coupons', [ManagementController::class, 'coupons']);
        Route::get('/coupons/{coupon}', [ManagementController::class, 'couponDetails']);
        Route::post('/coupons', [ManagementController::class, 'storeCoupon']);
        Route::put('/coupons/{coupon}', [ManagementController::class, 'updateCoupon']);
        Route::post('/coupons/{coupon}/toggle', [ManagementController::class, 'toggleCoupon']);
        Route::delete('/coupons/{coupon}', [ManagementController::class, 'deleteCoupon']);
        Route::get('/flash-sales', [ManagementController::class, 'flashSales']);
        Route::post('/flash-sales', [ManagementController::class, 'storeFlashSale']);
        Route::get('/flash-sales/{flashSale}', [ManagementController::class, 'flashSaleDetails']);
        Route::put('/flash-sales/{flashSale}', [ManagementController::class, 'updateFlashSale']);
        Route::post('/flash-sales/{flashSale}/toggle', [ManagementController::class, 'toggleFlashSale']);
        Route::delete('/flash-sales/{flashSale}', [ManagementController::class, 'deleteFlashSale']);
        Route::get('/roles', [ManagementController::class, 'roles']);
        Route::post('/roles', [ManagementController::class, 'storeRole']);
        Route::put('/roles/{role}', [ManagementController::class, 'updateRole']);
        Route::put('/roles/{role}/permissions', [ManagementController::class, 'setRolePermissions']);
        Route::delete('/roles/{role}', [ManagementController::class, 'deleteRole']);
        Route::get('/employees', [ManagementController::class, 'employees']);
        Route::get('/employees/{user}/permissions', [ManagementController::class, 'employeePermissions']);
        Route::put('/employees/{user}/permissions', [ManagementController::class, 'updateEmployeePermissions']);
        Route::post('/employees/{user}/reset-password', [ManagementController::class, 'resetEmployeePassword']);
        Route::get('/support-tickets', [ManagementController::class, 'supportTickets']);
        Route::get('/support-tickets/{supportTicket}', [ManagementController::class, 'supportTicketDetails']);
        Route::post('/support-tickets/{supportTicket}/messages', [ManagementController::class, 'sendSupportMessage']);
        Route::put('/support-tickets/{supportTicket}', [ManagementController::class, 'updateSupportTicket']);
        Route::post('/support-ticket-messages/{supportTicketMessage}/pin', [ManagementController::class, 'toggleSupportMessagePin']);
        Route::get('/pages', [ManagementController::class, 'pages']);
        Route::post('/pages', [ManagementController::class, 'storePage']);
        Route::put('/pages/{page}', [ManagementController::class, 'updatePage']);
        Route::delete('/pages/{page}', [ManagementController::class, 'deletePage']);
        Route::get('/categories', [ManagementController::class, 'categories']);
        Route::get('/catalog/{resource}', [CatalogController::class, 'index']);
        Route::post('/catalog/{resource}', [CatalogController::class, 'store']);
        Route::put('/catalog/{resource}/{recordId}', [CatalogController::class, 'update']);
        Route::post('/catalog/{resource}/{recordId}/toggle', [CatalogController::class, 'toggle']);
        Route::delete('/catalog/{resource}/{recordId}', [CatalogController::class, 'destroy']);
        Route::get('/returns', [ManagementController::class, 'returns']);
        Route::get('/returns/{returnOrder}', [ManagementController::class, 'returnDetails']);
        Route::post('/returns/{returnOrder}/status', [ManagementController::class, 'updateReturn']);
        Route::post('/returns/{returnOrder}/refund', [ManagementController::class, 'refundReturn']);
        Route::get('/withdrawals', [ManagementController::class, 'withdrawals']);
        Route::get('/withdrawals/{withdraw}', [ManagementController::class, 'withdrawalDetails']);
        Route::post('/withdrawals/{withdraw}/status', [ManagementController::class, 'updateWithdrawal']);
        Route::get('/reviews', [ManagementController::class, 'reviews']);
        Route::post('/reviews/{review}/toggle', [ManagementController::class, 'toggleReview']);
        Route::get('/riders', [ManagementController::class, 'riders']);
        Route::post('/riders', [ManagementController::class, 'storeRider']);
        Route::get('/riders/{rider}', [ManagementController::class, 'riderDetails']);
        Route::put('/riders/{rider}', [ManagementController::class, 'updateRider']);
        Route::delete('/riders/{rider}', [ManagementController::class, 'deleteRider']);
        Route::get('/riders/{rider}/location', [ManagementController::class, 'riderLocation']);
        Route::post('/riders/{rider}/toggle', [ManagementController::class, 'toggleRider']);
        Route::get('/banners', [ManagementController::class, 'banners']);
        Route::get('/banners/{banner}', [ManagementController::class, 'bannerDetails']);
        Route::post('/banners', [ManagementController::class, 'storeBanner']);
        Route::put('/banners/{banner}', [ManagementController::class, 'updateBanner']);
        Route::post('/banners/{banner}/toggle', [ManagementController::class, 'toggleBanner']);
        Route::delete('/banners/{banner}', [ManagementController::class, 'deleteBanner']);
        Route::get('/ads', [ManagementController::class, 'ads']);
        Route::get('/ads/{ad}', [ManagementController::class, 'adDetails']);
        Route::post('/ads', [ManagementController::class, 'storeAd']);
        Route::put('/ads/{ad}', [ManagementController::class, 'updateAd']);
        Route::post('/ads/{ad}/toggle', [ManagementController::class, 'toggleAd']);
        Route::delete('/ads/{ad}', [ManagementController::class, 'deleteAd']);
        Route::get('/vat-taxes', [ManagementController::class, 'vatTaxes']);
        Route::get('/vat-taxes/{vatTax}', [ManagementController::class, 'vatTaxDetails']);
        Route::post('/vat-taxes', [ManagementController::class, 'storeVatTax']);
        Route::put('/vat-taxes/{vatTax}', [ManagementController::class, 'updateVatTax']);
        Route::post('/vat-taxes/{vatTax}/toggle', [ManagementController::class, 'toggleVatTax']);
        Route::delete('/vat-taxes/{vatTax}', [ManagementController::class, 'deleteVatTax']);
    });
});

Route::controller(SocialAuthController::class)->group(function () {
    Route::post('/social-auth', 'login');
    Route::post('/auth/{provider}/token', 'handleTokenExchange');
});

// country route
Route::controller(CountryController::class)->group(function () {
    Route::get('/countries', 'index');
    Route::get('/areas', 'indexAreas');
});

Route::controller(AuthController::class)->group(function () {
    Route::post('/registration', 'register');
    Route::post('/login', 'login');
});

Route::controller(ForgotPasswordController::class)->group(function () {
    Route::post('/send-otp', 'resendOTP');
    Route::post('/verify-otp', 'verifyOtp');
    Route::post('/reset-password', 'resetPassword');
});

// legal page route
Route::controller(LegalPageController::class)->group(function () {
    Route::get('/legal-pages/{slug}', 'index');
    Route::get('/contact-us', 'contactUs');
});

// support route
Route::controller(SupportController::class)->group(function () {
    Route::post('/support', 'store');
});

// master route
Route::controller(MasterController::class)->group(function () {
    Route::get('/master', 'index');
});

// home route
Route::controller(HomeController::class)->group(function () {
    Route::get('/home', 'index');
    Route::get('/recently-views', 'recentlyViews');
});

// Banner route
Route::controller(BannerController::class)->group(function () {
    Route::get('/banners', 'index');
});

// brand route
Route::controller(BrandController::class)->group(function () {
    Route::get('/brands', 'index');
});

// category route
Route::controller(CategoryController::class)->group(function () {
    Route::get('/categories', 'index');
});

// sub category route
Route::controller(SubCategoryController::class)->group(function () {
    Route::get('/sub-categories', 'index');
});

// category products route
Route::get('/category-products', [ProductController::class, 'index']);

// product route
Route::controller(ProductController::class)->group(function () {
    Route::get('/products', 'index');
    Route::get('/product-details', 'show');
});

// review route
Route::controller(ReviewController::class)->group(function () {
    Route::get('/reviews', 'index');
});

// shop route
Route::controller(ShopController::class)->group(function () {
    Route::get('/shops', 'index');
    Route::get('/shops/top', 'topShops');
    Route::get('/shop-categories', 'shopCategory');
    Route::get('/shops/popular-products', 'popularProducts');
    Route::get('/shops/{shop}', 'show');
});

// flash sale route
Route::controller(FlashSaleController::class)->group(function () {
    Route::get('/flash-sales', 'index');
    Route::get('/flash-sale/{name}/details', 'show');
});

// route for blog
Route::controller(BlogController::class)->group(function () {
    Route::get('/blogs', 'index');
    Route::get('/blog/{blog}/details', 'show');
});

// cart route
Route::controller(CartController::class)->group(function () {
    Route::get('/carts', 'index');
    Route::post('/cart/store', 'store');
    Route::post('/cart/increment', 'increment');
    Route::post('/cart/decrement', 'decrement');
    Route::post('/cart/delete', 'destroy');
    Route::post('/cart/checkout', 'checkout');
});

// order route
Route::controller(OrderController::class)->group(function () {
    Route::post('/place-order', 'store');
    Route::get('/order-payment/{order}/{paymentMethod?}', 'payment');
});

// auth middleware route
Route::middleware(['auth:sanctum', 'role:customer'])->group(function () {

    // user route
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::controller(UserController::class)->group(function () {
        Route::get('/profile', 'index');
        Route::post('/update-profile', 'update')->middleware('demoMode');
        Route::post('/change-password', 'changePassword')->middleware('demoMode');
    });

    // recently view route
    Route::controller(HomeController::class)->group(function () {
        Route::get('/recently-views', 'recentlyViews');
    });

    // favorite add or remove route
    Route::controller(ProductController::class)->group(function () {
        Route::post('/favorite-add-or-remove', 'addFavorite');
        Route::get('/favorite-products', 'favoriteProducts');
        Route::post('/product-review', 'storeReview');
    });

    // order route
    Route::controller(OrderController::class)->group(function () {
        Route::get('/orders', 'index');
        Route::get('/order-details', 'show');
        Route::post('/orders/cancel', 'cancel');
        Route::post('/place-order/again', 'reOrder');
    });

    // order route for version 1
    Route::controller(OrderController::class)->prefix('/v1')->group(function () {
        Route::post('/place-order', 'store');
    });

    // coupon route
    Route::controller(CouponController::class)->group(function () {
        Route::get('/get-vouchers', 'index');
        Route::post('/vouchers-collect', 'store')->name('voucher.collect');
        Route::get('/get-collected-vouchers', 'collectedVouchers');
        Route::post('/apply-voucher', 'applyVoucher')->name('voucher.apply');
        Route::post('/coupons/apply', 'getDiscount');
    });

    // address route
    Route::controller(AddressController::class)->group(function () {
        Route::get('/addresses', 'index');
        Route::post('/address/store', 'store');
        Route::post('/address/{address}/update', 'update');
        Route::delete('/address/{address}/delete', 'destroy');
    });

    // support ticket
    Route::controller(SupportTicketController::class)->group(function () {
        Route::get('/support-tickets', 'index');
        Route::post('/support-ticket', 'store');
        Route::get('/support-ticket/show', 'show');
    });

    // support ticket message
    Route::controller(SupportTicketMessageController::class)->group(function () {
        Route::get('/support-ticket-messages', 'index');
        Route::post('/support-ticket-message', 'store');
    });

    // ticket issue types
    Route::controller(TicketIssueTypeController::class)->group(function () {
        Route::get('ticket-issue-types', 'index');
    });

    // chating with shop and user
    Route::controller(ChatController::class)->group(function () {
        Route::get('/get-shops', 'getShops');
        Route::post('/store-message', 'storeMessage');
        Route::get('/get-message', 'getMessage');
        Route::post('/send-message', 'sendMessage');
    });

    // return order
    Route::controller(ReturnOrderController::class)->group(function () {
        Route::get('/return-orders', 'index');
        Route::get('/return-order-details/{returnOrder}', 'show');
        Route::post('/return-order', 'store');
    });

    // check user is online or not

    Route::post('/update-last-seen', function () {
        if (! auth()->check()) {
            return;
        }

        $auth = auth()->user();
        $auth->update(['last_online' => now()->addMinute(10)]);

        return response()->noContent();
    });
});

// Meta Conversions API bridge — public so guests are tracked too, throttled so
// it cannot be abused to flood the ad account.
Route::post('/meta-pixel/track', [MetaPixelController::class, 'track'])
    ->middleware('throttle:60,1');

Route::get('/unread-messages', [ChatController::class, 'unreadMessages']);

Route::get('/download-product-license/{license}/{order_id}', [ProductLicenseController::class, 'downloadLicensePdf'])->name('download.product.license');

// language route
Route::get('/lang/{locale}', function ($locale) {
    abort_unless(in_array($locale, ['en', 'bn'], true), 404);
    $path = base_path("lang/{$locale}.json");
    if (File::exists($path)) {
        return response()->json(json_decode(File::get($path), true, flags: JSON_THROW_ON_ERROR));
    }

    return response()->json(['error' => 'Language file not found'], 404);
});
