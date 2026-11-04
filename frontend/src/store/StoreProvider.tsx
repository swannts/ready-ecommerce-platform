"use client";

import React, { useRef, useEffect } from "react";
import { Provider } from "react-redux";
import { makeStore, AppStore } from "./index";
import { hydrateCart } from "./slices/cartSlice";
import { hydrateWishlist } from "./slices/wishlistSlice";

const CART_STORAGE_KEY = "ricemart_cart_v1";
const WISHLIST_STORAGE_KEY = "ricemart_wishlist_v1";

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef<AppStore | null>(null);

  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore();
  }

  // Optional: Client-side local persistence rehydration and sync
  useEffect(() => {
    if (!storeRef.current) return;
    const store = storeRef.current;

    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (storedCart) {
        const parsed = JSON.parse(storedCart);
        if (Array.isArray(parsed) && parsed.length > 0) {
          store.dispatch(hydrateCart(parsed));
        }
      }

      const storedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (storedWishlist) {
        const parsed = JSON.parse(storedWishlist);
        if (Array.isArray(parsed)) {
          store.dispatch(hydrateWishlist(parsed));
        }
      }
    } catch {
      // LocalStorage unavailable or invalid JSON
    }

    // Subscribe to persist changes to localStorage
    const unsubscribe = store.subscribe(() => {
      const state = store.getState();
      try {
        localStorage.setItem(
          CART_STORAGE_KEY,
          JSON.stringify(state.cart.items)
        );
        localStorage.setItem(
          WISHLIST_STORAGE_KEY,
          JSON.stringify(state.wishlist.itemIds)
        );
      } catch {
        // LocalStorage quota or access error
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return <Provider store={storeRef.current}>{children}</Provider>;
}

