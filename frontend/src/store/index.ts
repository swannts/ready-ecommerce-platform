import { configureStore } from "@reduxjs/toolkit";
import productsReducer from "./slices/productsSlice";
import cartReducer from "./slices/cartSlice";
import wishlistReducer from "./slices/wishlistSlice";
import b2bQuoteReducer from "./slices/b2bQuoteSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      products: productsReducer,
      cart: cartReducer,
      wishlist: wishlistReducer,
      b2bQuote: b2bQuoteReducer,
    },
    devTools: process.env.NODE_ENV !== "production",
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
