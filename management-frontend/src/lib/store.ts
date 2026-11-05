import { configureStore, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export type ManagementUser = {
  id: number;
  first_name: string;
  last_name?: string;
  email?: string;
  phone?: string;
  shop_status?: string;
  shop: { id: number; name: string; logo?: string; total_products: number; rating: number; total_reviews: number };
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
  tagTypes: ["Dashboard", "Product", "Order", "Session"],
  endpoints: (builder) => ({
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
    getProducts: builder.query<{ products: ManagedProduct[]; total: number }, { per_page?: number; search?: string } | void>({
      query: (args) => ({ url: "/seller/products", params: args || { per_page: 50 } }),
      transformResponse: (response: Envelope<{ products: ManagedProduct[]; total: number }>) => response.data,
      providesTags: (result) => ["Product", ...(result?.products || []).map(({ id }) => ({ type: "Product" as const, id }))],
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
export const { useSignInMutation, useSignOutMutation, useGetDashboardQuery, useGetProductsQuery, useToggleProductStatusMutation, useGetOrdersQuery, useUpdateOrderStatusMutation } = managementApi;

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
