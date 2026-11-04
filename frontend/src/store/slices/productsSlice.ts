import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RiceProduct, RiceCategory } from "@/types/product";
import { mockProducts } from "@/data/products";
import { riceCategories } from "@/data/riceCategories";

export interface ProductsFilterCriteria {
  categorySlug?: string;
  grainType?: string;
  searchQuery?: string;
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
  productDetailsStatus: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  filters: ProductsFilterCriteria;
}

const initialState: ProductsState = {
  items: mockProducts,
  filteredItems: mockProducts,
  categories: riceCategories,
  selectedProduct: null,
  status: "idle",
  productDetailsStatus: "idle",
  error: null,
  filters: {
    sortBy: "featured",
  },
};

// Async Thunk: Simulate API fetch of all rice products with optional filter query
export const fetchProducts = createAsyncThunk<
  RiceProduct[],
  ProductsFilterCriteria | undefined,
  { rejectValue: string }
>("products/fetchProducts", async (criteria, { rejectWithValue }) => {
  try {
    // Simulate real network delay for thunk demonstration
    await new Promise((resolve) => setTimeout(resolve, 350));

    let results = [...mockProducts];

    if (criteria?.searchQuery) {
      const q = criteria.searchQuery.toLowerCase();
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.variety.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.supplierName.toLowerCase().includes(q)
      );
    }

    if (criteria?.categorySlug) {
      results = results.filter((p) => p.categorySlug === criteria.categorySlug);
    }

    if (criteria?.grainType) {
      results = results.filter((p) => p.grainType === criteria.grainType);
    }

    if (criteria?.minPrice !== undefined) {
      results = results.filter((p) => p.retailPricePerKg >= criteria.minPrice!);
    }

    if (criteria?.maxPrice !== undefined) {
      results = results.filter((p) => p.retailPricePerKg <= criteria.maxPrice!);
    }

    if (criteria?.sortBy === "price-asc") {
      results.sort((a, b) => a.retailPricePerKg - b.retailPricePerKg);
    } else if (criteria?.sortBy === "price-desc") {
      results.sort((a, b) => b.retailPricePerKg - a.retailPricePerKg);
    } else if (criteria?.sortBy === "rating") {
      results.sort((a, b) => b.rating - a.rating);
    }

    return results;
  } catch {
    return rejectWithValue("Failed to fetch products from catalog.");
  }
});

// Async Thunk: Fetch single rice product by slug
export const fetchProductBySlug = createAsyncThunk<
  RiceProduct,
  string,
  { rejectValue: string }
>("products/fetchProductBySlug", async (slug, { rejectWithValue }) => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 250));
    const found = mockProducts.find((p) => p.slug === slug);
    if (!found) {
      return rejectWithValue(`Product with slug "${slug}" not found.`);
    }
    return found;
  } catch {
    return rejectWithValue("Failed to load product specifications.");
  }
});

export const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.filters.searchQuery = action.payload;
      state.filteredItems = applyInternalFilters(state.items, state.filters);
    },
    setCategoryFilter: (state, action: PayloadAction<string | undefined>) => {
      state.filters.categorySlug = action.payload;
      state.filteredItems = applyInternalFilters(state.items, state.filters);
    },
    setGrainTypeFilter: (state, action: PayloadAction<string | undefined>) => {
      state.filters.grainType = action.payload;
      state.filteredItems = applyInternalFilters(state.items, state.filters);
    },
    setSortBy: (
      state,
      action: PayloadAction<ProductsFilterCriteria["sortBy"]>
    ) => {
      state.filters.sortBy = action.payload;
      state.filteredItems = applyInternalFilters(state.items, state.filters);
    },
    resetFilters: (state) => {
      state.filters = { sortBy: "featured" };
      state.filteredItems = [...state.items];
    },
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
      state.productDetailsStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    // fetchProducts
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.filteredItems = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Unknown error loading catalog.";
      });

    // fetchProductBySlug
    builder
      .addCase(fetchProductBySlug.pending, (state) => {
        state.productDetailsStatus = "loading";
        state.error = null;
      })
      .addCase(fetchProductBySlug.fulfilled, (state, action) => {
        state.productDetailsStatus = "succeeded";
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductBySlug.rejected, (state, action) => {
        state.productDetailsStatus = "failed";
        state.error = action.payload || "Product not found.";
      });
  },
});

function applyInternalFilters(
  items: RiceProduct[],
  filters: ProductsFilterCriteria
): RiceProduct[] {
  let list = [...items];

  if (filters.searchQuery?.trim()) {
    const q = filters.searchQuery.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.variety.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.supplierName.toLowerCase().includes(q)
    );
  }

  if (filters.categorySlug) {
    list = list.filter((p) => p.categorySlug === filters.categorySlug);
  }

  if (filters.grainType) {
    list = list.filter((p) => p.grainType === filters.grainType);
  }

  if (filters.sortBy === "price-asc") {
    list.sort((a, b) => a.retailPricePerKg - b.retailPricePerKg);
  } else if (filters.sortBy === "price-desc") {
    list.sort((a, b) => b.retailPricePerKg - a.retailPricePerKg);
  } else if (filters.sortBy === "rating") {
    list.sort((a, b) => b.rating - a.rating);
  }

  return list;
}

export const {
  setSearchQuery,
  setCategoryFilter,
  setGrainTypeFilter,
  setSortBy,
  resetFilters,
  clearSelectedProduct,
} = productsSlice.actions;

export default productsSlice.reducer;

