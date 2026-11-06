import { configureStore, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export type ManagementUser = {
  id: number;
  first_name?: string;
  name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  profile_photo?: string;
  gender?: string;
  date_of_birth?: string;
  shop_status?: string;
  roles?: string[];
  permissions?: string[];
  shop?: { id: number; name: string; logo?: string; banner?: string; address?: string; description?: string; latitude?: string; longitude?: string; open_time?: string; close_time?: string; prefix?: string; estimated_delivery_time?: number; min_order_amount?: number; off_day?: string[]; total_products: number; rating: number; total_reviews: number };
};

export type DashboardSummary = {
  pending_order: number;
  to_pickup_order: number;
  today_order: number;
  to_delivery_order: number;
  this_manth_sales: string;
  wallet_balance: string;
  sales_chart_months: string[];
  sales_chart_values: number[];
};

export type ManagedProduct = {
  id: number;
  name: string;
  thumbnail?: string;
  price: number;
  discount_price: number;
  quantity: number;
  brand?: string;
  is_active: boolean;
};
export type ProductOptions = { categories: ApiRecord[]; brands: ApiRecord[]; units: ApiRecord[] };

export type ManagedOrder = {
  id: number;
  order_code: string;
  amount: number;
  order_status: string;
  payment_status: string;
  payment_method: string;
  order_placed: string;
  user: { name: string; phone?: string };
};

type AuthState = { token: string | null; user: ManagementUser | null; ready: boolean };
const initialAuthState: AuthState = { token: null, user: null, ready: false };
const authSlice = createSlice({
  name: "auth",
  initialState: initialAuthState,
  reducers: {
    sessionRestored: (_state, action: PayloadAction<{ token: string; user: ManagementUser } | null>) => ({
      token: action.payload?.token ?? null,
      user: action.payload?.user ?? null,
      ready: true,
    }),
    sessionEstablished: (state, action: PayloadAction<{ token: string; user: ManagementUser }>) => ({ ...action.payload, ready: true }),
    sessionCleared: () => ({ token: null, user: null, ready: true }),
  },
});

const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api").replace(/\/$/, "");
type Envelope<T> = { data: T; message?: string };
export type ApiRecord = Record<string, unknown>;

export const managementApi = createApi({
  reducerPath: "managementApi",
  baseQuery: fetchBaseQuery({
    baseUrl: apiBaseUrl,
    prepareHeaders: (headers, { getState }) => {
      headers.set("Accept", "application/json");
      const token = (getState() as RootState).auth.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Dashboard", "Product", "Order", "Session", "Banner", "Wallet", "Notification", "Return", "Chat", "Admin"],
  endpoints: (builder) => ({
    adminSignIn: builder.mutation<{ user: ManagementUser; token: string }, { contact: string; password: string }>({ query: (body) => ({ url: "/admin-workspace/login", method: "POST", body }), transformResponse: (response: Envelope<{ user: ManagementUser; token: string }>) => response.data }),
    adminSignOut: builder.mutation<unknown, void>({ query: () => ({ url: "/admin-workspace/logout", method: "POST" }) }),
    getAdminDashboard: builder.query<ApiRecord, void>({ query: () => "/admin-workspace/dashboard", transformResponse: (response: Envelope<ApiRecord>) => response.data }),
    getAdminShops: builder.query<{ items: ApiRecord[]; total: number }, { search?: string } | void>({ query: (args) => ({ url: "/admin-workspace/shops", params: args || undefined }), transformResponse: (response: Envelope<{ items: ApiRecord[]; total: number }>) => response.data, providesTags: ["Admin"] }),
    getAdminShopDetails: builder.query<{ shop: ApiRecord }, number>({ query: (id) => `/admin-workspace/shops/${id}`, transformResponse: (response: Envelope<{ shop: ApiRecord }>) => response.data, providesTags: ["Admin"] }),
    createAdminShop: builder.mutation<ApiRecord, FormData | Record<string, unknown>>({ query: (body) => ({ url: "/admin-workspace/shops", method: "POST", body }), invalidatesTags: ["Admin"] }),
    updateAdminShop: builder.mutation<ApiRecord, { id: number; body: FormData | Record<string, unknown> }>({ query: ({ id, body }) => ({ url: `/admin-workspace/shops/${id}`, method: "PUT", body }), invalidatesTags: ["Admin"] }),
    resetAdminShopPassword: builder.mutation<ApiRecord, { id: number; password: string; password_confirmation: string }>({ query: ({ id, ...body }) => ({ url: `/admin-workspace/shops/${id}/reset-password`, method: "POST", body }), invalidatesTags: ["Admin"] }),
    toggleAdminShop: builder.mutation<ApiRecord, number>({ query: (id) => ({ url: `/admin-workspace/shops/${id}/toggle`, method: "POST" }), invalidatesTags: ["Admin"] }),
    getAdminProducts: builder.query<{ items: ApiRecord[]; total: number }, { search?: string; approved?: boolean } | void>({ query: (args) => ({ url: "/admin-workspace/products", params: args || undefined }), transformResponse: (response: Envelope<{ items: ApiRecord[]; total: number }>) => response.data, providesTags: ["Admin"] }),
    getAdminProductDetails: builder.query<{ product: ApiRecord }, number>({ query: (id) => `/admin-workspace/products/${id}`, transformResponse: (response: Envelope<{ product: ApiRecord }>) => response.data, providesTags: ["Admin"] }),
    updateAdminProduct: builder.mutation<ApiRecord, { id: number; body: Record<string, unknown> }>({ query: ({ id, body }) => ({ url: `/admin-workspace/products/${id}`, method: "PUT", body }), invalidatesTags: ["Admin"] }),
    toggleAdminProduct: builder.mutation<ApiRecord, number>({ query: (id) => ({ url: `/admin-workspace/products/${id}/toggle`, method: "POST" }), invalidatesTags: ["Admin"] }),
    approveAdminProduct: builder.mutation<ApiRecord, number>({ query: (id) => ({ url: `/admin-workspace/products/${id}/approve`, method: "POST" }), invalidatesTags: ["Admin"] }),
    deleteAdminProduct: builder.mutation<ApiRecord, number>({ query: (id) => ({ url: `/admin-workspace/products/${id}`, method: "DELETE" }), invalidatesTags: ["Admin"] }),
    getAdminOrders: builder.query<{ items: ApiRecord[]; total: number; statuses: string[] }, { status?: string } | void>({ query: (args) => ({ url: "/admin-workspace/orders", params: args || undefined }), transformResponse: (response: Envelope<{ items: ApiRecord[]; total: number; statuses: string[] }>) => response.data, providesTags: ["Admin"] }),
    updateAdminOrderStatus: builder.mutation<ApiRecord, { id: number; status: string }>({ query: ({ id, status }) => ({ url: `/admin-workspace/orders/${id}/status`, method: "POST", body: { status } }), invalidatesTags: ["Admin"] }),
    assignAdminOrderRider: builder.mutation<ApiRecord, { id: number; rider_id: number }>({ query: ({ id, rider_id }) => ({ url: `/admin-workspace/orders/${id}/assign-rider`, method: "POST", body: { rider_id } }), invalidatesTags: ["Admin"] }),
    getAdminCustomers: builder.query<{ items: ApiRecord[]; total: number }, void>({ query: () => "/admin-workspace/customers", transformResponse: (response: Envelope<{ items: ApiRecord[]; total: number }>) => response.data, providesTags: ["Admin"] }),
    getAdminCustomerDetails: builder.query<{ customer: ApiRecord }, number>({ query: (id) => `/admin-workspace/customers/${id}`, transformResponse: (response: Envelope<{ customer: ApiRecord }>) => response.data, providesTags: ["Admin"] }),
    createAdminCustomer: builder.mutation<ApiRecord, Record<string, unknown>>({ query: (body) => ({ url: "/admin-workspace/customers", method: "POST", body }), invalidatesTags: ["Admin"] }),
    updateAdminCustomer: builder.mutation<ApiRecord, { id: number; body: Record<string, unknown> }>({ query: ({ id, body }) => ({ url: `/admin-workspace/customers/${id}`, method: "PUT", body }), invalidatesTags: ["Admin"] }),
    deleteAdminCustomer: builder.mutation<ApiRecord, number>({ query: (id) => ({ url: `/admin-workspace/customers/${id}`, method: "DELETE" }), invalidatesTags: ["Admin"] }),
    getAdminCategories: builder.query<{ items: ApiRecord[] }, void>({ query: () => "/admin-workspace/categories", transformResponse: (response: Envelope<{ items: ApiRecord[] }>) => response.data, providesTags: ["Admin"] }),
    getAdminCatalog: builder.query<{ items: ApiRecord[]; total: number }, { resource: string; search?: string }>({ query: ({ resource, ...params }) => ({ url: `/admin-workspace/catalog/${resource}`, params }), transformResponse: (response: Envelope<{ items: ApiRecord[]; total: number }>) => response.data, providesTags: ["Admin"] }),
    createAdminCatalogRecord: builder.mutation<ApiRecord, { resource: string; body: Record<string, unknown> }>({ query: ({ resource, body }) => ({ url: `/admin-workspace/catalog/${resource}`, method: "POST", body }), invalidatesTags: ["Admin"] }),
    updateAdminCatalogRecord: builder.mutation<ApiRecord, { resource: string; id: number; body: Record<string, unknown> }>({ query: ({ resource, id, body }) => ({ url: `/admin-workspace/catalog/${resource}/${id}`, method: "PUT", body }), invalidatesTags: ["Admin"] }),
    toggleAdminCatalogRecord: builder.mutation<ApiRecord, { resource: string; id: number }>({ query: ({ resource, id }) => ({ url: `/admin-workspace/catalog/${resource}/${id}/toggle`, method: "POST" }), invalidatesTags: ["Admin"] }),
    deleteAdminCatalogRecord: builder.mutation<ApiRecord, { resource: string; id: number }>({ query: ({ resource, id }) => ({ url: `/admin-workspace/catalog/${resource}/${id}`, method: "DELETE" }), invalidatesTags: ["Admin"] }),
    getAdminRiders: builder.query<{ items: ApiRecord[]; total: number }, { status?: string } | void>({ query: (args) => ({ url: "/admin-workspace/riders", params: args || undefined }), transformResponse: (response: Envelope<{ items: ApiRecord[]; total: number }>) => response.data, providesTags: ["Admin"] }),
    getAdminRiderDetails: builder.query<{ rider: ApiRecord; stats: ApiRecord }, number>({ query: (id) => `/admin-workspace/riders/${id}`, transformResponse: (response: Envelope<{ rider: ApiRecord; stats: ApiRecord }>) => response.data, providesTags: ["Admin"] }),
    createAdminRider: builder.mutation<ApiRecord, Record<string, unknown>>({ query: (body) => ({ url: "/admin-workspace/riders", method: "POST", body }), invalidatesTags: ["Admin"] }),
    updateAdminRider: builder.mutation<ApiRecord, { id: number; body: Record<string, unknown> }>({ query: ({ id, body }) => ({ url: `/admin-workspace/riders/${id}`, method: "PUT", body }), invalidatesTags: ["Admin"] }),
    deleteAdminRider: builder.mutation<ApiRecord, number>({ query: (id) => ({ url: `/admin-workspace/riders/${id}`, method: "DELETE" }), invalidatesTags: ["Admin"] }),
    getAdminRiderLocation: builder.query<{ location: ApiRecord }, number>({ query: (id) => `/admin-workspace/riders/${id}/location`, transformResponse: (response: Envelope<{ location: ApiRecord }>) => response.data }),
    toggleAdminRider: builder.mutation<ApiRecord, number>({ query: (id) => ({ url: `/admin-workspace/riders/${id}/toggle`, method: "POST" }), invalidatesTags: ["Admin"] }),
    getAdminReturns: builder.query<{ items: ApiRecord[]; total: number }, void>({ query: () => "/admin-workspace/returns", transformResponse: (response: Envelope<{ items: ApiRecord[]; total: number }>) => response.data, providesTags: ["Admin"] }),
    getAdminReturnDetails: builder.query<{ return_order: ApiRecord }, number>({ query: (id) => `/admin-workspace/returns/${id}`, transformResponse: (response: Envelope<{ return_order: ApiRecord }>) => response.data, providesTags: ["Admin"] }),
    updateAdminReturn: builder.mutation<ApiRecord, { id: number; status: string; reject_note?: string }>({ query: ({ id, ...body }) => ({ url: `/admin-workspace/returns/${id}/status`, method: "POST", body }), invalidatesTags: ["Admin"] }),
    refundAdminReturn: builder.mutation<ApiRecord, number>({ query: (id) => ({ url: `/admin-workspace/returns/${id}/refund`, method: "POST" }), invalidatesTags: ["Admin"] }),
    getAdminWithdrawals: builder.query<{ items: ApiRecord[]; total: number }, { status?: string } | void>({ query: (args) => ({ url: "/admin-workspace/withdrawals", params: args || undefined }), transformResponse: (response: Envelope<{ items: ApiRecord[]; total: number }>) => response.data, providesTags: ["Admin"] }),
    getAdminWithdrawalDetails: builder.query<{ withdrawal: ApiRecord }, number>({ query: (id) => `/admin-workspace/withdrawals/${id}`, transformResponse: (response: Envelope<{ withdrawal: ApiRecord }>) => response.data, providesTags: ["Admin"] }),
    updateAdminWithdrawal: builder.mutation<ApiRecord, { id: number; status: "approved" | "denied"; reason?: string }>({ query: ({ id, ...body }) => ({ url: `/admin-workspace/withdrawals/${id}/status`, method: "POST", body }), invalidatesTags: ["Admin"] }),
    getAdminReviews: builder.query<{ items: ApiRecord[]; total: number }, void>({ query: () => "/admin-workspace/reviews", transformResponse: (response: Envelope<{ items: ApiRecord[]; total: number }>) => response.data, providesTags: ["Admin"] }),
    toggleAdminReview: builder.mutation<ApiRecord, number>({ query: (id) => ({ url: `/admin-workspace/reviews/${id}/toggle`, method: "POST" }), invalidatesTags: ["Admin"] }),
    getAdminBanners: builder.query<{ items: ApiRecord[]; total: number }, void>({ query: () => "/admin-workspace/banners", transformResponse: (response: Envelope<{ items: ApiRecord[]; total: number }>) => response.data, providesTags: ["Admin"] }),
    getAdminBannerDetails: builder.query<{ banner: ApiRecord }, number>({ query: (id) => `/admin-workspace/banners/${id}`, transformResponse: (response: Envelope<{ banner: ApiRecord }>) => response.data, providesTags: ["Admin"] }),
    createAdminBanner: builder.mutation<ApiRecord, FormData | Record<string, unknown>>({ query: (body) => ({ url: "/admin-workspace/banners", method: "POST", body }), invalidatesTags: ["Admin"] }),
    updateAdminBanner: builder.mutation<ApiRecord, { id: number; body: FormData | Record<string, unknown> }>({ query: ({ id, body }) => ({ url: `/admin-workspace/banners/${id}`, method: "PUT", body }), invalidatesTags: ["Admin"] }),
    toggleAdminBanner: builder.mutation<ApiRecord, number>({ query: (id) => ({ url: `/admin-workspace/banners/${id}/toggle`, method: "POST" }), invalidatesTags: ["Admin"] }),
    deleteAdminBanner: builder.mutation<ApiRecord, number>({ query: (id) => ({ url: `/admin-workspace/banners/${id}`, method: "DELETE" }), invalidatesTags: ["Admin"] }),
    getAdminAds: builder.query<{ items: ApiRecord[]; total: number }, void>({ query: () => "/admin-workspace/ads", transformResponse: (response: Envelope<{ items: ApiRecord[]; total: number }>) => response.data, providesTags: ["Admin"] }),
    getAdminAdDetails: builder.query<{ ad: ApiRecord }, number>({ query: (id) => `/admin-workspace/ads/${id}`, transformResponse: (response: Envelope<{ ad: ApiRecord }>) => response.data, providesTags: ["Admin"] }),
    createAdminAd: builder.mutation<ApiRecord, FormData | Record<string, unknown>>({ query: (body) => ({ url: "/admin-workspace/ads", method: "POST", body }), invalidatesTags: ["Admin"] }),
    updateAdminAd: builder.mutation<ApiRecord, { id: number; body: FormData | Record<string, unknown> }>({ query: ({ id, body }) => ({ url: `/admin-workspace/ads/${id}`, method: "PUT", body }), invalidatesTags: ["Admin"] }),
    toggleAdminAd: builder.mutation<ApiRecord, number>({ query: (id) => ({ url: `/admin-workspace/ads/${id}/toggle`, method: "POST" }), invalidatesTags: ["Admin"] }),
    deleteAdminAd: builder.mutation<ApiRecord, number>({ query: (id) => ({ url: `/admin-workspace/ads/${id}`, method: "DELETE" }), invalidatesTags: ["Admin"] }),
    getAdminVatTaxes: builder.query<{ items: ApiRecord[]; total: number }, void>({ query: () => "/admin-workspace/vat-taxes", transformResponse: (response: Envelope<{ items: ApiRecord[]; total: number }>) => response.data, providesTags: ["Admin"] }),
    getAdminVatTaxDetails: builder.query<{ vat_tax: ApiRecord }, number>({ query: (id) => `/admin-workspace/vat-taxes/${id}`, transformResponse: (response: Envelope<{ vat_tax: ApiRecord }>) => response.data, providesTags: ["Admin"] }),
    createAdminVatTax: builder.mutation<ApiRecord, { name: string; percentage: number }>({ query: (body) => ({ url: "/admin-workspace/vat-taxes", method: "POST", body }), invalidatesTags: ["Admin"] }),
    updateAdminVatTax: builder.mutation<ApiRecord, { id: number; name: string; percentage: number }>({ query: ({ id, ...body }) => ({ url: `/admin-workspace/vat-taxes/${id}`, method: "PUT", body }), invalidatesTags: ["Admin"] }),
    toggleAdminVatTax: builder.mutation<ApiRecord, number>({ query: (id) => ({ url: `/admin-workspace/vat-taxes/${id}/toggle`, method: "POST" }), invalidatesTags: ["Admin"] }),
    deleteAdminVatTax: builder.mutation<ApiRecord, number>({ query: (id) => ({ url: `/admin-workspace/vat-taxes/${id}`, method: "DELETE" }), invalidatesTags: ["Admin"] }),
    getAdminCoupons: builder.query<{ items: ApiRecord[]; total: number }, void>({ query: () => "/admin-workspace/coupons", transformResponse: (response: Envelope<{ items: ApiRecord[]; total: number }>) => response.data, providesTags: ["Admin"] }),
    getAdminCouponDetails: builder.query<{ coupon: ApiRecord }, number>({ query: (id) => `/admin-workspace/coupons/${id}`, transformResponse: (response: Envelope<{ coupon: ApiRecord }>) => response.data, providesTags: ["Admin"] }),
    createAdminCoupon: builder.mutation<ApiRecord, Record<string, unknown>>({ query: (body) => ({ url: "/admin-workspace/coupons", method: "POST", body }), invalidatesTags: ["Admin"] }),
    updateAdminCoupon: builder.mutation<ApiRecord, { id: number; body: Record<string, unknown> }>({ query: ({ id, body }) => ({ url: `/admin-workspace/coupons/${id}`, method: "PUT", body }), invalidatesTags: ["Admin"] }),
    toggleAdminCoupon: builder.mutation<ApiRecord, number>({ query: (id) => ({ url: `/admin-workspace/coupons/${id}/toggle`, method: "POST" }), invalidatesTags: ["Admin"] }),
    deleteAdminCoupon: builder.mutation<ApiRecord, number>({ query: (id) => ({ url: `/admin-workspace/coupons/${id}`, method: "DELETE" }), invalidatesTags: ["Admin"] }),
    getAdminFlashSales: builder.query<{ items: ApiRecord[]; total: number }, void>({ query: () => "/admin-workspace/flash-sales", transformResponse: (response: Envelope<{ items: ApiRecord[]; total: number }>) => response.data, providesTags: ["Admin"] }),
    getAdminFlashSaleDetails: builder.query<{ flash_sale: ApiRecord }, number>({ query: (id) => `/admin-workspace/flash-sales/${id}`, transformResponse: (response: Envelope<{ flash_sale: ApiRecord }>) => response.data, providesTags: ["Admin"] }),
    createAdminFlashSale: builder.mutation<ApiRecord, FormData>({ query: (body) => ({ url: "/admin-workspace/flash-sales", method: "POST", body }), invalidatesTags: ["Admin"] }),
    updateAdminFlashSale: builder.mutation<ApiRecord, { id: number; body: FormData }>({ query: ({ id, body }) => ({ url: `/admin-workspace/flash-sales/${id}`, method: "PUT", body }), invalidatesTags: ["Admin"] }),
    toggleAdminFlashSale: builder.mutation<ApiRecord, number>({ query: (id) => ({ url: `/admin-workspace/flash-sales/${id}/toggle`, method: "POST" }), invalidatesTags: ["Admin"] }),
    deleteAdminFlashSale: builder.mutation<ApiRecord, number>({ query: (id) => ({ url: `/admin-workspace/flash-sales/${id}`, method: "DELETE" }), invalidatesTags: ["Admin"] }),
    signIn: builder.mutation<{ user: ManagementUser; access: { auth_type: string; token: string; expires_at: string } }, { contact: string; password: string }>({
      query: (body) => ({ url: "/seller/login", method: "POST", body }),
      transformResponse: (response: Envelope<{ user: ManagementUser; access: { auth_type: string; token: string; expires_at: string } }>) => response.data,
    }),
    signOut: builder.mutation<unknown, void>({ query: () => ({ url: "/seller/logout", method: "GET" }) }),
    getDashboard: builder.query<DashboardSummary, void>({
      query: () => "/seller/dashboard",
      transformResponse: (response: Envelope<DashboardSummary>) => response.data,
      providesTags: ["Dashboard"],
    }),
    getSellerDetails: builder.query<{ user: ManagementUser }, void>({
      query: () => "/seller/details",
      transformResponse: (response: Envelope<{ user: ManagementUser }>) => response.data,
      providesTags: ["Session"],
    }),
    updateSellerProfile: builder.mutation<{ user: ManagementUser }, FormData>({
      query: (body) => ({ url: "/seller/user-update", method: "POST", body }),
      transformResponse: (response: Envelope<{ user: ManagementUser }>) => response.data,
      invalidatesTags: ["Session"],
    }),
    updateShopInfo: builder.mutation<{ user: ManagementUser }, FormData>({
      query: (body) => ({ url: "/seller/shop-update", method: "POST", body }),
      transformResponse: (response: Envelope<{ user: ManagementUser }>) => response.data,
      invalidatesTags: ["Session"],
    }),
    updateShopSettings: builder.mutation<{ user: ManagementUser }, Record<string, string | string[]>>({
      query: (body) => ({ url: "/seller/shop-setting-update", method: "POST", body }),
      transformResponse: (response: Envelope<{ user: ManagementUser }>) => response.data,
      invalidatesTags: ["Session"],
    }),
    changeSellerPassword: builder.mutation<ApiRecord, Record<string, string>>({
      query: (body) => ({ url: "/seller/change-password", method: "POST", body }),
      transformResponse: (response: Envelope<ApiRecord>) => response.data,
    }),
    getBanners: builder.query<{ banners: ApiRecord[] }, void>({
      query: () => "/seller/banners",
      transformResponse: (response: Envelope<{ banners: ApiRecord[] }>) => response.data,
      providesTags: ["Banner"],
    }),
    createBanner: builder.mutation<ApiRecord, FormData>({
      query: (body) => ({ url: "/seller/banners/store", method: "POST", body }),
      transformResponse: (response: Envelope<ApiRecord>) => response.data,
      invalidatesTags: ["Banner"],
    }),
    updateBanner: builder.mutation<ApiRecord, FormData>({
      query: (body) => ({ url: "/seller/banners/update", method: "POST", body }),
      transformResponse: (response: Envelope<ApiRecord>) => response.data,
      invalidatesTags: ["Banner"],
    }),
    deleteBanner: builder.mutation<ApiRecord, number>({
      query: (id) => ({ url: `/seller/banners/${id}`, method: "DELETE" }),
      transformResponse: (response: Envelope<ApiRecord>) => response.data,
      invalidatesTags: ["Banner"],
    }),
    uploadShopImage: builder.mutation<{ path: string; url: string }, FormData>({
      query: (body) => ({ url: "/seller/filemanager/image-upload", method: "POST", body }),
      transformResponse: (response: Envelope<{ path: string; url: string }>) => response.data,
    }),
    getWallet: builder.query<ApiRecord, { filter_type?: string } | void>({
      query: (args) => ({ url: "/seller/wallet", params: args || undefined }),
      transformResponse: (response: Envelope<ApiRecord>) => response.data,
      providesTags: ["Wallet"],
    }),
    getWalletHistory: builder.query<{ total: number; withdraws: ApiRecord[] }, { page?: number; per_page?: number } | void>({
      query: (args) => ({ url: "/seller/wallet/history", params: args || { page: 1, per_page: 20 } }),
      transformResponse: (response: Envelope<{ total: number; withdraws: ApiRecord[] }>) => response.data,
      providesTags: ["Wallet"],
    }),
    requestWithdrawal: builder.mutation<ApiRecord, { amount: number; name: string; contact_number: string; message?: string }>({
      query: (body) => ({ url: "/seller/wallet/withdraw", method: "POST", body }),
      transformResponse: (response: Envelope<ApiRecord>) => response.data,
      invalidatesTags: ["Wallet", "Dashboard"],
    }),
    getNotifications: builder.query<{ notification: ApiRecord[] }, { page?: number; per_page?: number } | void>({
      query: (args) => ({ url: "/seller/notifications", params: args || { page: 1, per_page: 50 } }),
      transformResponse: (response: Envelope<{ notification: ApiRecord[] }>) => response.data,
      providesTags: ["Notification"],
    }),
    markNotificationRead: builder.mutation<ApiRecord, number>({
      query: (id) => ({ url: `/seller/notifications/${id}`, method: "POST" }),
      transformResponse: (response: Envelope<ApiRecord>) => response.data,
      invalidatesTags: ["Notification"],
    }),
    deleteNotification: builder.mutation<ApiRecord, number>({
      query: (id) => ({ url: `/seller/notifications/${id}`, method: "DELETE" }),
      transformResponse: (response: Envelope<ApiRecord>) => response.data,
      invalidatesTags: ["Notification"],
    }),
    getReturns: builder.query<{ total: number; returnOrders: ApiRecord[] }, { page?: number; per_page?: number } | void>({
      query: (args) => ({ url: "/seller/return-orders", params: args || { page: 1, per_page: 50 } }),
      transformResponse: (response: Envelope<{ total: number; returnOrders: ApiRecord[] }>) => response.data,
      providesTags: ["Return"],
    }),
    updateReturnStatus: builder.mutation<ApiRecord, { id: number; status: string }>({
      query: ({ id, status }) => ({ url: `/seller/return-order/${id}/status-change`, method: "POST", body: { status } }),
      transformResponse: (response: Envelope<ApiRecord>) => response.data,
      invalidatesTags: ["Return"],
    }),
    getChatUsers: builder.query<{ total: number; data: ApiRecord[] }, { search?: string } | void>({
      query: (args) => ({ url: "/seller/get-users", params: args || undefined }),
      transformResponse: (response: Envelope<{ total: number; data: ApiRecord[] }>) => response.data,
      providesTags: ["Chat"],
    }),
    getChatMessages: builder.query<{ data: ApiRecord[] }, { user_id: number }>({
      query: ({ user_id }) => ({ url: "/seller/get-message", params: { user_id } }),
      transformResponse: (response: Envelope<{ data: ApiRecord[] }>) => response.data,
      providesTags: (_result, _error, { user_id }) => [{ type: "Chat", id: user_id }],
    }),
    sendChatMessage: builder.mutation<ApiRecord, { user_id: number; message: string; type: string }>({
      query: (body) => ({ url: "/seller/send-message", method: "POST", body }),
      transformResponse: (response: Envelope<ApiRecord>) => response.data,
      invalidatesTags: (_result, _error, { user_id }) => [{ type: "Chat", id: user_id }, "Chat"],
    }),
    getProducts: builder.query<{ products: ManagedProduct[]; total: number }, { per_page?: number; search?: string } | void>({
      query: (args) => ({ url: "/seller/products", params: args || { per_page: 50 } }),
      transformResponse: (response: Envelope<{ products: ManagedProduct[]; total: number }>) => response.data,
      providesTags: (result) => ["Product", ...(result?.products || []).map(({ id }) => ({ type: "Product" as const, id }))],
    }),
    getProductOptions: builder.query<ProductOptions, void>({
      query: () => "/seller/product/create-data",
      transformResponse: (response: Envelope<ProductOptions>) => response.data,
    }),
    getSellerProduct: builder.query<{ product: ApiRecord }, number>({
      query: (id) => `/seller/product/${id}/show`,
      transformResponse: (response: Envelope<{ product: ApiRecord }>) => response.data,
      providesTags: (_result, _error, id) => [{ type: "Product", id }],
    }),
    createSellerProduct: builder.mutation<{ product: ManagedProduct }, FormData>({
      query: (body) => ({ url: "/seller/product/store", method: "POST", body }),
      transformResponse: (response: Envelope<{ product: ManagedProduct }>) => response.data,
      invalidatesTags: ["Product", "Dashboard"],
    }),
    updateSellerProduct: builder.mutation<{ product: ManagedProduct }, { id: number; body: FormData }>({
      query: ({ id, body }) => ({ url: `/seller/product/${id}/update`, method: "POST", body }),
      transformResponse: (response: Envelope<{ product: ManagedProduct }>) => response.data,
      invalidatesTags: (_result, _error, { id }) => [{ type: "Product", id }, "Product", "Dashboard"],
    }),
    deleteSellerProduct: builder.mutation<ApiRecord, number>({
      query: (id) => ({ url: `/seller/product/${id}/destroy`, method: "DELETE" }),
      transformResponse: (response: Envelope<ApiRecord>) => response.data,
      invalidatesTags: ["Product", "Dashboard"],
    }),
    toggleProductStatus: builder.mutation<{ product: ManagedProduct }, number>({
      query: (id) => ({ url: `/seller/product/status/toggle/${id}`, method: "POST" }),
      transformResponse: (response: Envelope<{ product: ManagedProduct }>) => response.data,
      invalidatesTags: (_result, _error, id) => [{ type: "Product", id }, "Product", "Dashboard"],
    }),
    getOrders: builder.query<{ orders: ManagedOrder[]; total_items: number }, { per_page?: number; search?: string; order_status?: string } | void>({
      query: (args) => ({ url: "/seller/orders", params: args || { per_page: 50 } }),
      transformResponse: (response: Envelope<{ orders: ManagedOrder[]; total_items: number }>) => response.data,
      providesTags: (result) => ["Order", ...(result?.orders || []).map(({ id }) => ({ type: "Order" as const, id }))],
    }),
    getSellerOrder: builder.query<{ order: ApiRecord }, number>({
      query: (id) => ({ url: "/seller/orders/details", params: { order_id: id } }),
      transformResponse: (response: Envelope<{ order: ApiRecord }>) => response.data,
      providesTags: (_result, _error, id) => [{ type: "Order", id }],
    }),
    updateOrderStatus: builder.mutation<{ order: ManagedOrder }, { order_id: number; order_status: "confirm" | "cancel" }>({
      query: (body) => ({ url: "/seller/orders/status-update", method: "POST", body }),
      transformResponse: (response: Envelope<{ order: ManagedOrder }>) => response.data,
      invalidatesTags: (_result, _error, { order_id }) => [{ type: "Order", id: order_id }, "Order", "Dashboard"],
    }),
  }),
});

export const { sessionEstablished, sessionRestored, sessionCleared } = authSlice.actions;
export const store = configureStore({
  reducer: { auth: authSlice.reducer, [managementApi.reducerPath]: managementApi.reducer },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(managementApi.middleware),
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const {
  useSignInMutation,
  useSignOutMutation,
  useGetDashboardQuery,
  useGetProductsQuery,
  useGetProductOptionsQuery,
  useGetSellerProductQuery,
  useCreateSellerProductMutation,
  useUpdateSellerProductMutation,
  useDeleteSellerProductMutation,
  useToggleProductStatusMutation,
  useGetOrdersQuery,
  useGetSellerOrderQuery,
  useUpdateOrderStatusMutation,
  useGetSellerDetailsQuery,
  useUpdateSellerProfileMutation,
  useUpdateShopInfoMutation,
  useUpdateShopSettingsMutation,
  useChangeSellerPasswordMutation,
  useGetBannersQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
  useUploadShopImageMutation,
  useGetWalletQuery,
  useGetWalletHistoryQuery,
  useRequestWithdrawalMutation,
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useDeleteNotificationMutation,
  useGetReturnsQuery,
  useUpdateReturnStatusMutation,
  useGetChatUsersQuery,
  useGetChatMessagesQuery,
  useSendChatMessageMutation,
  useAdminSignInMutation,
  useAdminSignOutMutation,
  useGetAdminDashboardQuery,
  useGetAdminShopsQuery,
  useGetAdminShopDetailsQuery,
  useCreateAdminShopMutation,
  useUpdateAdminShopMutation,
  useResetAdminShopPasswordMutation,
  useToggleAdminShopMutation,
  useGetAdminProductsQuery,
  useGetAdminProductDetailsQuery,
  useUpdateAdminProductMutation,
  useToggleAdminProductMutation,
  useApproveAdminProductMutation,
  useDeleteAdminProductMutation,
  useGetAdminOrdersQuery,
  useUpdateAdminOrderStatusMutation,
  useAssignAdminOrderRiderMutation,
  useGetAdminCustomersQuery,
  useGetAdminCustomerDetailsQuery,
  useCreateAdminCustomerMutation,
  useUpdateAdminCustomerMutation,
  useDeleteAdminCustomerMutation,
  useGetAdminCategoriesQuery,
  useGetAdminCatalogQuery,
  useCreateAdminCatalogRecordMutation,
  useUpdateAdminCatalogRecordMutation,
  useToggleAdminCatalogRecordMutation,
  useDeleteAdminCatalogRecordMutation,
  useGetAdminReturnsQuery,
  useGetAdminReturnDetailsQuery,
  useUpdateAdminReturnMutation,
  useRefundAdminReturnMutation,
  useGetAdminWithdrawalsQuery,
  useGetAdminWithdrawalDetailsQuery,
  useUpdateAdminWithdrawalMutation,
  useGetAdminReviewsQuery,
  useToggleAdminReviewMutation,
  useGetAdminRidersQuery,
  useGetAdminRiderDetailsQuery,
  useCreateAdminRiderMutation,
  useUpdateAdminRiderMutation,
  useDeleteAdminRiderMutation,
  useGetAdminRiderLocationQuery,
  useToggleAdminRiderMutation,
  useGetAdminBannersQuery,
  useGetAdminBannerDetailsQuery,
  useCreateAdminBannerMutation,
  useUpdateAdminBannerMutation,
  useToggleAdminBannerMutation,
  useDeleteAdminBannerMutation,
  useGetAdminAdsQuery,
  useGetAdminAdDetailsQuery,
  useCreateAdminAdMutation,
  useUpdateAdminAdMutation,
  useToggleAdminAdMutation,
  useDeleteAdminAdMutation,
  useGetAdminVatTaxesQuery,
  useGetAdminVatTaxDetailsQuery,
  useCreateAdminVatTaxMutation,
  useUpdateAdminVatTaxMutation,
  useToggleAdminVatTaxMutation,
  useDeleteAdminVatTaxMutation,
  useGetAdminCouponsQuery,
  useGetAdminCouponDetailsQuery,
  useCreateAdminCouponMutation,
  useUpdateAdminCouponMutation,
  useToggleAdminCouponMutation,
  useDeleteAdminCouponMutation,
  useGetAdminFlashSalesQuery,
  useGetAdminFlashSaleDetailsQuery,
  useCreateAdminFlashSaleMutation,
  useUpdateAdminFlashSaleMutation,
  useToggleAdminFlashSaleMutation,
  useDeleteAdminFlashSaleMutation,
} = managementApi;

export function apiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = error.data;
    if (typeof data === "object" && data !== null) {
      if ("errors" in data && typeof data.errors === "object" && data.errors !== null) {
        const firstError = Object.values(data.errors).flat()[0];
        if (typeof firstError === "string") return firstError;
      }
      if ("message" in data && typeof data.message === "string") return data.message;
    }
  }
  return fallback;
}
