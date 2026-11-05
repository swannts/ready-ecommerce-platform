import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RiceProduct, RiceCategory } from "@/types/product";
import { getCategories, getProduct, getProducts } from "@/lib/api";

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
  items: [], filteredItems: [], categories: [], selectedProduct: null,
  status: "idle", categoriesStatus: "idle", productDetailsStatus: "idle", error: null,
  filters: { sortBy: "featured" },
};

export const fetchProducts = createAsyncThunk<RiceProduct[], ProductsFilterCriteria | undefined, { rejectValue: string }>(
  "products/fetchProducts", async (criteria, { rejectWithValue }) => {
    try { return await getProducts(criteria); }
    catch (error) { return rejectWithValue(error instanceof Error ? error.message : "Failed to load products."); }
  }
);
export const fetchCategories = createAsyncThunk<RiceCategory[], void, { rejectValue: string }>(
  "products/fetchCategories", async (_, { rejectWithValue }) => {
    try { return await getCategories(); }
    catch (error) { return rejectWithValue(error instanceof Error ? error.message : "Failed to load categories."); }
  }
);
export const fetchProductBySlug = createAsyncThunk<RiceProduct, string, { rejectValue: string }>(
  "products/fetchProductBySlug", async (slug, { rejectWithValue }) => {
    try { return await getProduct(slug); }
    catch (error) { return rejectWithValue(error instanceof Error ? error.message : "Product not found."); }
  }
);

export const productsSlice = createSlice({
  name: "products", initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => { state.filters.searchQuery = action.payload || undefined; },
    setCategoryFilter: (state, action: PayloadAction<string | undefined>) => { state.filters.categorySlug = action.payload; },
    setGrainTypeFilter: (state, action: PayloadAction<string | undefined>) => { state.filters.grainType = action.payload; },
    setSupplierFilter: (state, action: PayloadAction<string | undefined>) => { state.filters.supplierSlug = action.payload; },
    setSortBy: (state, action: PayloadAction<ProductsFilterCriteria["sortBy"]>) => { state.filters.sortBy = action.payload; },
    resetFilters: (state) => { state.filters = { sortBy: "featured" }; },
    clearSelectedProduct: (state) => { state.selectedProduct = null; state.productDetailsStatus = "idle"; },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchProducts.pending, (state) => { state.status = "loading"; state.error = null; })
      .addCase(fetchProducts.fulfilled, (state, action) => { state.status = "succeeded"; state.items = action.payload; state.filteredItems = action.payload; })
      .addCase(fetchProducts.rejected, (state, action) => { state.status = "failed"; state.error = action.payload || "Could not load products."; })
      .addCase(fetchCategories.pending, (state) => { state.categoriesStatus = "loading"; })
      .addCase(fetchCategories.fulfilled, (state, action) => { state.categoriesStatus = "succeeded"; state.categories = action.payload; })
      .addCase(fetchCategories.rejected, (state, action) => { state.categoriesStatus = "failed"; state.error = action.payload || "Could not load categories."; })
      .addCase(fetchProductBySlug.pending, (state) => { state.productDetailsStatus = "loading"; state.error = null; })
      .addCase(fetchProductBySlug.fulfilled, (state, action) => { state.productDetailsStatus = "succeeded"; state.selectedProduct = action.payload; })
      .addCase(fetchProductBySlug.rejected, (state, action) => { state.productDetailsStatus = "failed"; state.error = action.payload || "Product not found."; });
  },
});

export const { setSearchQuery, setCategoryFilter, setGrainTypeFilter, setSupplierFilter, setSortBy, resetFilters, clearSelectedProduct } = productsSlice.actions;
export default productsSlice.reducer;
