"use client";

import { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import { store, sessionRestored, type AppDispatch } from "@/lib/store";

const STORAGE_KEY = "ricemart-management-session";

function SessionHydrator({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      dispatch(sessionRestored(stored ? JSON.parse(stored) : null));
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
      dispatch(sessionRestored(null));
    }
  }, [dispatch]);

  return children;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return <Provider store={store}><SessionHydrator>{children}</SessionHydrator></Provider>;
}
