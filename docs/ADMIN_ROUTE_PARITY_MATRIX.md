# Admin Route & Permission Parity Inventory (Phase 0)

**Generated:** 2026-11-06
**Coverage:** 58 Admin Controllers across 320 Blade routes mapped to API implementations, permissions, side effects, and frontend screens.

---

## 1. Domain Classification & Disposition

Each route has one of four dispositions:
- **`API Work`**: An API endpoint exists or must be added under `/api/admin-workspace/`.
- **`Blade UI View (Out of Scope)`**: HTML rendering routes (e.g. `*.create`, `*.edit`) that only serve Blade forms; replaced on the frontend by React modal/page forms.
- **`Frontend Work`**: Dedicated UI screen in `management-frontend` consuming the API.
- **`Security Restricted`**: Server-only actions (arbitrary shell commands, raw filemanager, zip extractions) that must NOT be exposed as public APIs.

---

## 2. Route & Permission Mapping Matrix

### Phase 1: Core Commerce Operations

| Controller & Action | Method & Web Route | Permission Name | Side Effects / Safeguards | API Status & Path | Management Screen |
|:---|:---|:---|:---|:---|:---|
| `ShopController@index` | `GET admin/shops` | `admin.shop.index` | Paginated vendor list with product/order counts | ✅ `GET /api/admin-workspace/shops` | `/admin/shops` |
| `ShopController@show` | `GET admin/shops/{shop}` | `admin.shop.show` | Read receipt notifications for shop URL | ✅ `GET /api/admin-workspace/shops/{shop}` | `/admin/shops` (Drawer) |
| `ShopController@statusToggle` | `GET admin/shops/{shop}/status-toggle` | `admin.shop.status.toggle` | Toggles owner active state; protects root & demo shop | ✅ `POST /api/admin-workspace/shops/{shop}/toggle` | `/admin/shops` Toggle |
| `ShopController@store` | `POST admin/shops/store` | `admin.shop.store` | Creates user, assigns shop role, provisions shop record | 🔄 `POST /api/admin-workspace/shops` | `/admin/shops` Create Dialog |
| `ShopController@update` | `POST admin/shops/{shop}/update` | `admin.shop.update` | Updates name, phone, address, commission; demo protect | 🔄 `PUT /api/admin-workspace/shops/{shop}` | `/admin/shops` Edit Dialog |
| `ShopController@resetPassword` | `POST admin/shops/{shop}/reset-password` | `admin.shop.reset.password` | Hashes new password; demo protect | 🔄 `POST /api/admin-workspace/shops/{shop}/reset-password` | `/admin/shops` Password Dialog |
| `ShopController@orders` | `GET admin/shops/{shop}/orders` | `admin.order.index` | Scoped orders by shop | ✅ `GET /api/admin-workspace/shops/{shop}/orders` | Shop details orders tab |
| `ShopController@products` | `GET admin/shops/{shop}/products` | `admin.product.index` | Scoped products by shop | ✅ `GET /api/admin-workspace/shops/{shop}/products` | Shop details products tab |
| `ShopController@categories` | `GET admin/shops/{shop}/categories` | `admin.category.index` | Scoped category links | ✅ `GET /api/admin-workspace/shops/{shop}/categories` | Shop details categories tab |
| `ShopController@reviews` | `GET admin/shops/{shop}/reviews` | `admin.review.index` | Global scope disabled for unapproved reviews | ✅ `GET /api/admin-workspace/shops/{shop}/reviews` | Shop details reviews tab |
| `CustomerController@index` | `GET admin/customers` | `admin.customer.index` | Lists active/inactive users with role customer | ✅ `GET /api/admin-workspace/customers` | `/admin/customers` |
| `CustomerController@show` | `GET admin/customer/{user}` | `admin.customer.show` | Returns customer details, address & orders | ✅ `GET /api/admin-workspace/customers/{user}` | Customer Drawer |
| `CustomerController@statusToggle` | `GET admin/customer/{user}/toggle` | `admin.customer.toggle` | Toggles user active state | ✅ `POST /api/admin-workspace/customers/{user}/toggle` | `/admin/customers` Toggle |
| `CustomerController@store` | `POST admin/customer/store` | `admin.customer.store` | Creates user, wallet, customer profile, assigns role | 🔄 `POST /api/admin-workspace/customers` | `/admin/customers` Create Dialog |
| `CustomerController@update` | `PUT admin/customer/{user}/update` | `admin.customer.update` | Updates customer credentials & media | 🔄 `PUT /api/admin-workspace/customers/{user}` | `/admin/customers` Edit Dialog |
| `CustomerController@destroy` | `GET admin/customer/{user}/destroy` | `admin.customer.destroy` | Soft-deletes user, cleans media & wallet, strips roles | 🔄 `DELETE /api/admin-workspace/customers/{user}` | `/admin/customers` Delete Action |
| `CustomerController@resetPassword` | `POST admin/customer/{user}/reset-password` | `admin.customer.reset.password` | Updates customer password | ✅ `POST /api/admin-workspace/customers/{user}/reset-password` | Password Dialog |
| `RiderController@index` | `GET admin/riders` | `admin.rider.index` | Lists riders, filters by approved/active status | ✅ `GET /api/admin-workspace/riders` | `/admin/riders` |
| `RiderController@show` | `GET admin/rider/{user}` | `admin.rider.show` | Computes completed/pending deliveries, cash collected, wallet | 🔄 `GET /api/admin-workspace/riders/{rider}` | Rider Drawer |
| `RiderController@statusToggle` | `GET admin/rider/{user}/toggle` | `admin.rider.toggle` | Toggles driver active state | ✅ `POST /api/admin-workspace/riders/{rider}/toggle` | `/admin/riders` Toggle |
| `RiderController@store` | `POST admin/rider/store` | `admin.rider.store` | Creates user with driver role and driver record | 🔄 `POST /api/admin-workspace/riders` | `/admin/riders` Create Dialog |
| `RiderController@update` | `PUT admin/rider/{user}/update` | `admin.rider.update` | Updates license, vehicle type, credentials | 🔄 `PUT /api/admin-workspace/riders/{rider}` | `/admin/riders` Edit Dialog |
| `RiderController@assignOrder` | `POST admin/rider/{order}/assign` | `admin.rider.assign` | Checks digital items, location, transitions order | 🔄 `POST /api/admin-workspace/orders/{order}/assign-rider` | Order detail rider assign |
| `RiderController@riderLocation` | `GET admin/rider/{id}/location` | `admin.rider.location` | Returns coordinates for real-time tracking | 🔄 `GET /api/admin-workspace/riders/{rider}/location` | Order/rider map |
| `OrderController@index` | `GET admin/orders` | `admin.order.index` | Filters by status, date, payment, shop | ✅ `GET /api/admin-workspace/orders` | `/admin/orders` |
| `OrderController@show` | `GET admin/order/{order}` | `admin.order.show` | Order items, customer info, delivery address, history | ✅ `GET /api/admin-workspace/orders/{order}` | `/admin/orders` Drawer |
| `OrderController@statusUpdate` | `POST admin/order/{order}/status` | `admin.order.status` | State transitions, restocks if cancelled, notifies | ✅ `POST /api/admin-workspace/orders/{order}/status` | Status Selector |
| `OrderController@paymentStatusToggle` | `POST admin/order/{order}/payment` | `admin.order.payment` | Marks order as paid, creates transaction | ✅ `POST /api/admin-workspace/orders/{order}/paid` | Payment toggle |
| `OrderController@assignCourier` | `POST admin/order/{order}/courier` | `admin.order.courier` | Dispatches courier tracking API & assigns tracking code | ✅ `POST /api/admin-workspace/orders/{order}/assign-courier` | Courier Dialog |
| `ProductController@index` | `GET admin/products` | `admin.product.index` | List products with approval and stock filters | ✅ `GET /api/admin-workspace/products` | `/admin/products` |
| `ProductController@show` | `GET admin/product/{product}` | `admin.product.show` | Full product specs, tiers, gallery, reviews | 🔄 `GET /api/admin-workspace/products/{product}` | Product Details Screen |
| `ProductController@approve` | `GET admin/product/{product}/approve` | `admin.product.approve` | Fires ProductApproveEvent and notifies seller | ✅ `POST /api/admin-workspace/products/{product}/approve` | Approve button |
| `ProductController@statusToggle` | `GET admin/product/{product}/toggle` | `admin.product.toggle` | Toggles product active visibility | 🔄 `POST /api/admin-workspace/products/{product}/toggle` | Product row toggle |
| `ProductController@destroy` | `DELETE admin/product/{product}/destroy`| `admin.product.destroy` | Deletes product thumbnails, colors, sizes, media | ✅ `DELETE /api/admin-workspace/products/{product}` | Delete action |
| `ReturnOrderController@index` | `GET admin/returns` | `admin.returnOrder.index` | Lists customer returns | ✅ `GET /api/admin-workspace/returns` | `/admin/returns` |
| `ReturnOrderController@show` | `GET admin/return/{returnOrder}` | `admin.returnOrder.show`| Return order details, evidence photos, items | 🔄 `GET /api/admin-workspace/returns/{returnOrder}` | Return details drawer |
| `ReturnOrderController@update` | `POST admin/return/{returnOrder}/update`| `admin.returnOrder.update`| Validates approved/rejected state transition | ✅ `POST /api/admin-workspace/returns/{returnOrder}/status` | Return decision dialog |
| `ReturnOrderController@refund` | `POST admin/return/{returnOrder}/refund`| `admin.returnOrder.refund`| Credits customer wallet & updates accounting | ✅ `POST /api/admin-workspace/returns/{returnOrder}/refund` | Refund trigger |
| `WithdrawController@index` | `GET admin/withdraws` | `admin.withdraw.index` | Lists seller withdrawal requests | ✅ `GET /api/admin-workspace/withdrawals` | `/admin/withdrawals` |
| `WithdrawController@show` | `GET admin/withdraw/{withdraw}/show` | `admin.withdraw.show` | Withdrawal details, bank details, vendor wallet history | 🔄 `GET /api/admin-workspace/withdrawals/{withdraw}` | Withdrawal drawer |
| `WithdrawController@update` | `POST admin/withdraw/{withdraw}/update` | `admin.withdraw.update` | Approves or denies with reason; debits/restores wallet | ✅ `POST /api/admin-workspace/withdrawals/{withdraw}/status` | Approval decision dialog |
| `ReviewsController@index` | `GET admin/reviews` | `admin.review.index` | Marketplace-wide reviews moderation list | ✅ `GET /api/admin-workspace/reviews` | `/admin/reviews` |
| `ReviewsController@toggle` | `GET admin/review/{review}/toggle` | `admin.review.toggle` | Toggles review public visibility | ✅ `POST /api/admin-workspace/reviews/{review}/toggle` | Review toggle |

---

### Phase 2: Merchandising & Promotion Management

| Controller & Action | Method & Web Route | Permission Name | Side Effects / Safeguards | API Status & Path |
|:---|:---|:---|:---|:---|
| `BannerController@*` | `admin/banners`, `admin/banner/*` | `admin.banner.*` | Banner image lifecycle, link destination | ✅ List/Toggle, 🔄 Store/Update/Delete |
| `AdController@*` | `admin/ads`, `admin/ads/*` | `admin.ad.*` | Merchandising interstitial ads, status toggle | 🔄 `/api/admin-workspace/ads` |
| `CouponController@*` | `admin/coupons`, `admin/coupon/*` | `admin.coupon.*` | Discount codes, usage caps, min spend, shop scoping | ✅ Full CRUD under `/api/admin-workspace/coupons` |
| `FlashSaleController@*` | `admin/flash-sales`, `admin/flash-sale/*` | `admin.flashSale.*`| Time-bound promotional events and product items | ✅ Full CRUD under `/api/admin-workspace/flash-sales` |
| `CategoryController@*` | `admin/categories`, `admin/category/*` | `admin.category.*` | Category tree, thumbnails, icons | ✅ Via `/api/admin-workspace/catalog/categories` |
| `SubCategoryController@*` | `admin/subcategories`, `...` | `admin.subcategory.*` | Subcategories tied to primary categories | ✅ Via `/api/admin-workspace/catalog/subcategories` |
| `BrandController@*` | `admin/brands`, `admin/brand/*` | `admin.brand.*` | Mill brands, logos | ✅ Via `/api/admin-workspace/catalog/brands` |
| `ColorController@*`, `SizeController@*`, `UnitController@*` | `admin/colors`, `admin/sizes`, `admin/units` | `admin.catalog.*` | Product variant attributes | ✅ Via `/api/admin-workspace/catalog/{colors,sizes,units}` |
| `VatTaxController@*` | `admin/vat-taxes`, `admin/vat-tax/*` | `admin.vatTax.*` | Tax rates and order-tax calculation settings | 🔄 `/api/admin-workspace/vat-taxes` |

---

### Phase 3: Staff, Roles, Riders, and Subscriptions

| Controller & Action | Method & Web Route | Permission Name | Side Effects / Safeguards | API Status & Path |
|:---|:---|:---|:---|:---|
| `EmployeeManageController@*` | `admin/employees`, `...` | `admin.employee.*` | Admin staff CRUD, password resets, permission overrides | ✅ Full CRUD under `/api/admin-workspace/employees` |
| `RolePermissionController@*` | `admin/roles`, `admin/role/*` | `admin.role.*` | Spatie web guard roles, permission assignments | ✅ Full CRUD under `/api/admin-workspace/roles` |
| `SubscriptionPlanController@*` | `admin/subscription-plans`, `...` | `admin.subscription.*` | Vendor SaaS tiers, product upload limits | 🔄 `/api/admin-workspace/subscriptions` |

---

### Phase 4: Support & Customer Communications

| Controller & Action | Method & Web Route | Permission Name | Side Effects / Safeguards | API Status & Path |
|:---|:---|:---|:---|:---|
| `SupportTicketController@*` | `admin/support-tickets`, `...` | `admin.supportTicket.*`| Customer tickets, replies, message pinning | ✅ `/api/admin-workspace/support-tickets` |
| `TicketIssueTypeController@*` | `admin/ticket-issue-types`, `...` | `admin.ticketIssueType.*`| Ticket categorization taxonomy | 🔄 `/api/admin-workspace/ticket-issue-types` |
| `CustomerNotificationController@*`| `admin/customer-notifications`, `...` | `admin.notification.*` | Push/database notifications to customer segments | 🔄 `/api/admin-workspace/customer-notifications` |
| `NotificationController@*` | `admin/notifications`, `...` | `admin.notification.*` | Administrator alert inbox | 🔄 `/api/admin-workspace/notifications` |
| `SupportController@*`, `SupportItemController@*` | `admin/supports`, `admin/support-items` | `admin.support.*` | Support directory & contact entries | 🔄 `/api/admin-workspace/support-items` |

---

### Phase 5: CMS & Localization

| Controller & Action | Method & Web Route | Permission Name | Side Effects / Safeguards | API Status & Path |
|:---|:---|:---|:---|:---|
| `PageController@*` | `admin/pages`, `admin/page/*` | `admin.page.*` | Legal and informational CMS pages | ✅ Full CRUD under `/api/admin-workspace/pages` |
| `BlogController@*` | `admin/blogs`, `admin/blog/*` | `admin.blog.*` | Agricultural articles, recipes, AI generation | 🔄 `/api/admin-workspace/blogs` |
| `MenuController@*`, `FooterController@*` | `admin/menus`, `admin/footers` | `admin.menu.*`, `admin.footer.*` | Header/footer navigation links and order | 🔄 `/api/admin-workspace/navigation` |
| `LanguageController@*` | `admin/languages`, `...` | `admin.language.*` | Localization keys, default language, JSON exports | 🔄 `/api/admin-workspace/languages` |

---

### Phase 6: Store, Logistics & Integration Settings

| Controller & Action | Method & Web Route | Permission Name | Safeguards | API Status & Path |
|:---|:---|:---|:---|:---|
| `GeneraleSettingController@*`, `BusinessSetupController@*` | `admin/business-setting`, `admin/settings/*` | `admin.setting.*` | Platform metadata, currency, timezone, logos | 🔄 `/api/admin-workspace/settings/store` |
| `DeliverySettingController@*`, `DeliveryChargeController@*`, `WeightDeliveryChargeController@*` | `admin/delivery-charge/*`, `admin/weight-wise/*` | `admin.deliveryCharge.*` | Distance & weight shipping fees | 🔄 `/api/admin-workspace/settings/logistics` |
| `AreaController@*`, `CountryController@*` | `admin/areas`, `admin/countries` | `admin.area.*` | Geographic delivery zones and polygon coordinates | 🔄 `/api/admin-workspace/settings/areas` |
| `PaymentGatewayController@*` | `admin/payment-gateways`, `...` | `admin.paymentGateway.*` | Stripe, bKash, SSLCommerz keys (masked secrets) | 🔄 `/api/admin-workspace/settings/integrations/payment` |
| `CourierConfigurationController@*`, `CourierTrackingController@*` | `admin/courier-configuration`, `...` | `admin.courier.*` | SteadFast / Pathao integration keys | 🔄 `/api/admin-workspace/settings/integrations/courier` |
| `GoogleMapConfigController@*`, `GoogleReCaptchaController@*`, `FirebaseController@*`, `MailConfigurationController@*`, `SMSGatewaySetupController@*`, `SocialAuthController@*`, `PusherConfigController@*`, `MetaPixelEventController@*` | `admin/*-configuration` | `admin.setting.*` | Cloud credentials masked on output; secret replacement | 🔄 `/api/admin-workspace/settings/integrations/services` |
| `Filemanager / Addon / Command Exec` | `admin/laravel-filemanager/*`, `admin/addon/*` | `root` | Raw filesystem & zip extraction | ⛔ **Out of Scope / Security Restricted** |

---

### Continuation status — 2026-11-06

Management APIs and screens now cover the listed employee/role, support, subscriptions, CMS/localization metadata, store, delivery, payment, mail, courier, maps, Pusher, Firebase, reCAPTCHA, and social login groups. The new screens live in `management-frontend/src/app/(admin)/admin/`. Settings routes are registered under `/api/admin-workspace/settings/*` and use existing web-guard permissions. Secret fields are masked on read and preserved when submitted blank. This work was validated by TypeScript checking, PHP lint, and Laravel route listing; actions were not individually exercised through HTTP.

Remaining parity work includes Telnyx (the existing Blade controller has no complete provider handler), integration audit history, Meta Pixel event-log management, per-session language preference switching, and some existing Blade settings/edit workflows. Arbitrary shell, filemanager, and add-on package actions remain excluded.

## 3. Route Summary

- **Total Analyzed Web Routes:** 320
- **Existing API Routes (Baseline):** 66
- **Phase 1 Target Additions:** 16 core commerce endpoints (Shops CRUD/passwords, Customers CRUD, Riders CRUD/location/assignment, Products details/toggle, Returns & Withdrawals details).
- **Security Restricted / Excluded:** 8 routes (raw `laravel-filemanager` and dynamic add-on zip installation).
