# Admin API implementation plan

**Status checked:** 2026-11-05
**Goal:** Make the management frontend use authenticated Laravel APIs for the workflows available in the existing Laravel admin.

## Current baseline

- Docker reports 308 routes handled by `App\\Http\\Controllers\\Admin` and 66 routes under `/api/admin-workspace`.
- The API already covers login/profile/logout, dashboard, shops listing/status/details and related shop records, product review/approval/deletion, order listing/details/status/payment/courier assignment, customer listing/details/status/password reset, catalog CRUD, returns/refunds, withdrawals, reviews, riders listing/status, banners listing/status, coupon CRUD, flash sale CRUD, employee listing/permissions/password reset, role and role-permission management, support ticket conversations/status/pinning, and page CRUD.
- Some API-backed operations have no management screen yet; several Laravel admin workflows still have neither a complete API nor a frontend flow.
- Treat route counts as an inventory baseline, not as a one-to-one API target. Some web routes render forms or perform redirects, and some actions should remain unavailable to the API for security or architectural reasons.

## Implementation phases

### 0. Route and permission parity inventory

- Build a durable matrix of each admin route, controller action, permission, business side effects, existing API equivalent, and management screen.
- Mark routes as API work, frontend-only work, out of scope, or requiring a deliberate security review.
- Confirm route model binding, guard names, permission cache behavior, role-specific exceptions, and local demo restrictions before expanding each group.
- Keep API paths versionable and return consistent pagination, validation errors, and response envelopes.

**Exit condition:** every admin controller action is accounted for, with no unclassified route.

### 1. Close gaps in core commerce operations

- Shops: create/update, password reset, and any missing related-record filters; preserve root shop and demo protections.
- Customers: create/update/delete and order/address history; preserve soft-delete behavior and password rules.
- Riders: create/update/delete, location details, and assigning orders to a rider.
- Orders: verify all status transition side effects, cancellation stock restoration, payment notifications, courier tracking refresh, and shop/order scoping.
- Products and reviews: detail/edit operations where supported, visibility moderation, and media/relationship cleanup.
- Returns and withdrawals: detail endpoints, valid state transitions, refund accounting, and audit-friendly responses.

**Exit condition:** each daily order, customer, supplier/shop, and delivery workflow can be completed from API calls with the same business effects as the Laravel admin.

### 2. Complete merchandising and promotion management

- Banners: create/update/delete and media upload lifecycle.
- Ads: list/create/update/toggle/delete.
- Coupons and flash sales: confirm existing endpoints against frontend requirements, add missing detail/validation behavior, and cover associated shop/product assignments.
- Catalog: confirm category, subcategory, brand, color, size, and unit APIs support all admin fields and preserve associations.
- VAT/tax: tax CRUD, order-tax configuration, and tax calculation settings.

**Exit condition:** operators can publish, edit, schedule, and retire marketplace merchandising without switching to the Blade admin.

### 3. Complete staff, roles, riders, and subscriptions

- Staff: create/update/delete employees, assign roles, reset credentials, and manage per-user allow/deny overrides.
- Roles: validate permission names against the configured web guard; protect built-in roles; return permission metadata required by the UI.
- Riders: finish CRUD and order assignment from Phase 1.
- Subscriptions: plans CRUD, subscription listing/filtering, and activation/status changes with the existing sale-limit rules.

**Exit condition:** role and subscription operations match current Laravel behavior, and root/admin protection is enforced server-side.

### 4. Finish support and customer communications

- Support tickets: verify scheduling, status transitions, customer chat toggle, message history, replies, and pinned messages against current event behavior.
- Ticket issue types: CRUD and active-state toggling.
- Customer notifications: list/filter/send, with validation and delivery result reporting.
- Admin notifications: list, read/read-all, and delete.
- Support content/items: list/update/delete workflows.

**Exit condition:** support staff can handle a ticket from arrival through closure and send the current supported customer notifications.

### 5. Complete CMS and localization

- Pages: verify editable/default page rules and slug behavior; provide missing activation and safe deletion details.
- Blogs: CRUD, categories/tags, thumbnail upload/removal, visibility, and generation integration if enabled.
- Menus and footer: CRUD, activation, ordering, and section/item updates.
- Languages: metadata CRUD, default selection, and import/export through validated file endpoints.
- Ensure English and Bangla content fields are present where the existing models support them.

**Exit condition:** content staff can manage public pages, navigation, footer, blogs, and language metadata through the management app.

### 6. Expose store, logistics, and integration settings safely

- Store/business settings, POS/registration flags, withdrawal configuration, delivery settings, delivery charges, weight-based charges, areas, countries, currencies, and tax settings.
- Integration configuration: payment gateways, courier, maps, reCAPTCHA, Firebase, mail, SMS, social login/links, Pusher, and Meta Pixel.
- Return masked secret values; accept secret replacement without returning stored credentials; validate URLs, keys, and provider-specific settings.
- Add settings change audit information and enforce dedicated permissions for each configuration group.
- Keep arbitrary shell/command execution and add-on package upload/install actions out of the public management API unless redesigned as a tightly controlled server-side operation.

**Exit condition:** supported settings can be changed through APIs without leaking credentials or exposing arbitrary code execution.

### 7. Finish management frontend integration

- For every API group, connect the matching management screen using the existing Redux/API client patterns.
- Add loading, empty, validation, success, and failure states; avoid local placeholder records where the backend endpoint exists.
- Gate actions by server-provided permissions while treating backend authorization as authoritative.
- Confirm all forms send the API's actual field names, including localized fields and media uploads.

**Exit condition:** every in-scope API workflow has an accessible management screen and uses persisted backend data.

### 8. Parity verification and release readiness

- Compare the route/action matrix with the implemented API routes and frontend screens; explain every excluded action.
- Validate authentication, authorization, validation failures, pagination/filtering, file uploads, destructive actions, and main business side effects against the running Docker stack.
- Add automated coverage for high-risk workflows: order cancellation/payment, refunds, withdrawal decisions, permissions, and secret masking.
- Update API documentation with examples and permission requirements; keep development seed data local-only.

**Exit condition:** no in-scope workflow is missing, the route matrix is reconciled, and critical flows pass repeatable checks.

## Progress and Delivery Log

### Phase 0: Route and permission parity inventory — COMPLETED
- Delivered comprehensive matrix in `docs/ADMIN_ROUTE_PARITY_MATRIX.md` classifying all 320 Blade routes across 58 controllers.
- Verified guard names (`web`), Spatie role/permission mappings, demo mode guards, and root shop protection rules.

### Phase 1: Core commerce operations — COMPLETED
- **Backend APIs:**
  - `POST /api/admin-workspace/shops`: Create shop with credentials and initial owner user.
  - `PUT /api/admin-workspace/shops/{shop}`: Update shop profile and owner information.
  - `POST /api/admin-workspace/shops/{shop}/reset-password`: Reset merchant credentials with confirmation.
  - `POST /api/admin-workspace/shops/{shop}/toggle`: Suspend/activate shop with root-shop safeguard.
  - `GET /api/admin-workspace/shops/{shop}`: Detailed shop view with owner info and statistics.
  - `GET /api/admin-workspace/customers/{user}`: Customer profile enriched with order history, addresses, and wallet balance.
  - `POST /api/admin-workspace/customers`: Create new customer account.
  - `PUT /api/admin-workspace/customers/{user}`: Update customer profile.
  - `DELETE /api/admin-workspace/customers/{user}`: Safely soft-delete customer account and cascade to customer record.
  - `GET /api/admin-workspace/riders/{rider}`: Rider details, delivery statistics, and total earnings.
  - `POST /api/admin-workspace/riders`: Register new delivery rider.
  - `PUT /api/admin-workspace/riders/{rider}`: Update rider profile.
  - `DELETE /api/admin-workspace/riders/{rider}`: Remove delivery rider.
  - `GET /api/admin-workspace/riders/{rider}/location`: Real-time rider coordinates and timestamp.
  - `POST /api/admin-workspace/orders/{order}/assign-rider`: Dispatch rider to order.
  - `GET /api/admin-workspace/products/{product}`: Detailed product specifications, brand, shop, medias, and reviews.
  - `POST /api/admin-workspace/products/{product}/toggle`: Toggle product active status.
  - `PUT /api/admin-workspace/products/{product}`: Update product details.
  - `GET /api/admin-workspace/returns/{returnOrder}`: Full return request inspection.
  - `GET /api/admin-workspace/withdrawals/{withdraw}`: Withdrawal inspection with shop and bank details.
- **Frontend Management UI (`ricemart-management`):**
  - Updated RTK Query store (`src/lib/store.ts`) with all Phase 1 query and mutation hooks.
  - Implemented `/admin/shops`: Live searching, creation modal, password reset modal, shop details drawer, and suspend/activate action.
  - Implemented `/admin/customers`: Customer listing, customer creation modal, edit modal, delete action, and details drawer showing wallet balance, order history, and addresses.
  - Implemented `/admin/riders`: Rider listing, registration modal, edit modal, active status toggle, delete action, and details drawer with delivery metrics and GPS coordinates.
  - Implemented `/admin/orders`: Order status filtering, fulfillment status updates, and dispatch delivery rider modal.
- **Verification:**
  - Automated TypeScript validation (`tsc --noEmit`) and Next.js 15 production build (`npm run build`) passing with zero errors.
  - Live API testing against running backend Docker container confirmed successful authentication and response payload formats.

### Phase 2: Merchandising and promotion management — COMPLETED
- **Backend APIs:**
  - `GET /api/admin-workspace/banners`: Listing marketplace promotional banners with media and pagination.
  - `GET /api/admin-workspace/banners/{banner}`: Detailed banner view with media and shop attribution.
  - `POST /api/admin-workspace/banners`: Store new banner with file upload or asset path.
  - `PUT /api/admin-workspace/banners/{banner}`: Update banner title, destination URL, or media replacement.
  - `POST /api/admin-workspace/banners/{banner}/toggle`: Toggle active/hidden banner status.
  - `DELETE /api/admin-workspace/banners/{banner}`: Remove banner with media storage cascade cleanup.
  - `GET /api/admin-workspace/ads`: Listing sponsored advertisement spots.
  - `GET /api/admin-workspace/ads/{ad}`: Ad details and thumbnail.
  - `POST /api/admin-workspace/ads`: Create sponsored advertisement with image upload.
  - `PUT /api/admin-workspace/ads/{ad}`: Update ad banner and title.
  - `POST /api/admin-workspace/ads/{ad}/toggle`: Toggle advertisement status.
  - `DELETE /api/admin-workspace/ads/{ad}`: Delete ad with media cleanup.
  - `GET /api/admin-workspace/coupons/{coupon}`: Detail view for discount voucher inspections.
  - `GET /api/admin-workspace/vat-taxes`: Listing all regional VAT and tax rates.
  - `GET /api/admin-workspace/vat-taxes/{vatTax}`: Detail tax rate view.
  - `POST /api/admin-workspace/vat-taxes`: Store new VAT/tax percentage rate.
  - `PUT /api/admin-workspace/vat-taxes/{vatTax}`: Update tax rate parameters.
  - `POST /api/admin-workspace/vat-taxes/{vatTax}/toggle`: Toggle active/inactive status.
  - `DELETE /api/admin-workspace/vat-taxes/{vatTax}`: Delete tax rate.
- **Frontend Management UI (`ricemart-management`):**
  - Updated RTK Query store (`src/lib/store.ts`) with all Phase 2 queries and mutations for Banners, Ads, Coupons, Flash sales, and Taxes.
  - Implemented `/admin/banners`: Media card grid, image preview, create modal with file upload, live toggle, and deletion.
  - Implemented `/admin/ads`: Advertisement card grid, create ad modal with image upload, active toggle, and deletion.
  - Implemented `/admin/coupons`: Coupon voucher table with discount formats, validity date range, usage limit, create coupon modal, active toggle, and deletion.
  - Implemented `/admin/taxes`: VAT and tax rates table with percentage calculations, create tax modal, edit modal, status toggle, and deletion.
  - Updated `AdminShell` sidebar navigation with Banners, Advertisements, Coupons, and VAT & Taxes.
- **Verification:**
  - Full route inventory verified (`docker compose exec backend php artisan route:list --path=admin-workspace` reporting 100 authenticated endpoints).
  - Live API curl testing validated authentication, listing, creation, status toggle, and deletion for taxes and banners.
  - TypeScript typecheck (`tsc --noEmit`) and Next.js 15 production build (`npm run build`) passing with zero errors across all 29 routes.

---

## Suggested order of work

1. Finish the route/permission matrix and core commerce CRUD gaps.
2. Close merchandising gaps and staff/subscription flows.
3. Finish ticketing and customer communications.
4. Complete CMS/localization.
5. Implement store/logistics settings, then integrations.
6. Connect remaining screens and perform parity verification.

Work should be delivered in small groups. After each group, update this plan with completed endpoints, remaining exceptions, and the validation performed; do not mark overall parity complete until the final exit condition is met.
