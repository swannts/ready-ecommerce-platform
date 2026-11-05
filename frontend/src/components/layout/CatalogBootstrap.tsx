"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { fetchCategories, fetchProducts } from "@/store/slices/productsSlice";

export function CatalogBootstrap() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchProducts({ sortBy: "featured" }));
  }, [dispatch]);
  return null;
}
