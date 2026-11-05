import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RiceProduct, RiceCategory } from "@/types/product";

export interface ProductsFilterCriteria {
  categorySlug?: string;
  grainType?: string;
  searchQuery?: string;
  supplierSlug?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "featured" | "price-asc" | "price-desc" | "rating";
}
export interface ProductsState {
  items: RiceProduct[];
  filteredItems: RiceProduct[];
  categories: RiceCategory[];
  selectedProduct: RiceProduct | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  categoriesStatus: "idle" | "loading" | "succeeded" | "failed";
  productDetailsStatus: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  filters: ProductsFilterCriteria;
}

const initialState: ProductsState = {
  items: [],
  filteredItems: [],
  categories: [],
  selectedProduct: null,
  status: "idle",
  categoriesStatus: "idle",
  productDetailsStatus: "idle",
  error: null,
  filters: { sortBy: "featured" },
};

function applyFilters(state: ProductsState) {
  const {
    categorySlug,
    grainType,
    searchQuery,
    supplierSlug,
    minPrice,
    maxPrice,
    sortBy,
  } = state.filters;
  const query = searchQuery?.trim().toLocaleLowerCase();
  const results = state.items.filter((product) => {
    const price = product.retailPricePerKg;
    return (
      (!categorySlug || product.categorySlug === categorySlug) &&
      (!grainType || product.grainType === grainType) &&
      (!supplierSlug || product.supplierSlug === supplierSlug) &&
      (minPrice === undefined || price >= minPrice) &&
      (maxPrice === undefined || price <= maxPrice) &&
      (!query ||
        `${product.name} ${product.variety} ${product.brand}`
          .toLocaleLowerCase()
          .includes(query))
    );
  });
  if (sortBy === "price-asc")
    results.sort((a, b) => a.retailPricePerKg - b.retailPricePerKg);
  if (sortBy === "price-desc")
    results.sort((a, b) => b.retailPricePerKg - a.retailPricePerKg);
  if (sortBy === "rating") results.sort((a, b) => b.rating - a.rating);
  state.filteredItems = results;
}

export const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    hydrateCatalog: (
      state,
      action: PayloadAction<{
        items: RiceProduct[];
        categories: RiceCategory[];
      }>,
    ) => {
      state.items = action.payload.items;
      state.filteredItems = action.payload.items;
      state.categories = action.payload.categories;
      state.status = "succeeded";
      state.categoriesStatus = "succeeded";
      state.error = null;
      applyFilters(state);
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.filters.searchQuery = action.payload || undefined;
      applyFilters(state);
    },
    setCategoryFilter: (state, action: PayloadAction<string | undefined>) => {
      state.filters.categorySlug = action.payload;
      applyFilters(state);
    },
    setGrainTypeFilter: (state, action: PayloadAction<string | undefined>) => {
      state.filters.grainType = action.payload;
      applyFilters(state);
    },
    setSupplierFilter: (state, action: PayloadAction<string | undefined>) => {
      state.filters.supplierSlug = action.payload;
      applyFilters(state);
    },
    setSortBy: (
      state,
      action: PayloadAction<ProductsFilterCriteria["sortBy"]>,
    ) => {
      state.filters.sortBy = action.payload;
      applyFilters(state);
    },
    resetFilters: (state) => {
      state.filters = { sortBy: "featured" };
      applyFilters(state);
    },
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
      state.productDetailsStatus = "idle";
    },
  },
});

export const {
  hydrateCatalog,
  setSearchQuery,
  setCategoryFilter,
  setGrainTypeFilter,
  setSupplierFilter,
  setSortBy,
  resetFilters,
  clearSelectedProduct,
} = productsSlice.actions;
export default productsSlice.reducer;
