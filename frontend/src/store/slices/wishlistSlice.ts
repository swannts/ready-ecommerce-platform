import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../index";

export interface WishlistState {
  itemIds: string[];
  status: "idle" | "syncing" | "succeeded";
}

const initialState: WishlistState = {
  itemIds: [],
  status: "idle",
};

// Async Thunk: Toggle wishlist and simulate user sync / local persistence
export const toggleWishlistThunk = createAsyncThunk<
  { productId: string; isSaved: boolean },
  string,
  { state: RootState }
>("wishlist/toggle", async (productId, { getState }) => {
  // Simulate network or storage latency
  await new Promise((resolve) => setTimeout(resolve, 150));
  const currentWishlist = getState().wishlist.itemIds;
  const isSaved = !currentWishlist.includes(productId);
  return { productId, isSaved };
});

export const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    toggleWishlist: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.itemIds.includes(id)) {
        state.itemIds = state.itemIds.filter((item) => item !== id);
      } else {
        state.itemIds.push(id);
      }
    },
    removeFromWishlist: (state, action: PayloadAction<string>) => {
      state.itemIds = state.itemIds.filter((item) => item !== action.payload);
    },
    clearWishlist: (state) => {
      state.itemIds = [];
    },
    hydrateWishlist: (state, action: PayloadAction<string[]>) => {
      if (action.payload) {
        state.itemIds = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(toggleWishlistThunk.pending, (state) => {
        state.status = "syncing";
      })
      .addCase(toggleWishlistThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        const { productId, isSaved } = action.payload;
        if (isSaved && !state.itemIds.includes(productId)) {
          state.itemIds.push(productId);
        } else if (!isSaved) {
          state.itemIds = state.itemIds.filter((id) => id !== productId);
        }
      });
  },
});

export const {
  toggleWishlist,
  removeFromWishlist,
  clearWishlist,
  hydrateWishlist,
} = wishlistSlice.actions;

// Selectors
export const selectWishlistIds = (state: RootState) => state.wishlist.itemIds;
export const selectWishlistCount = (state: RootState) =>
  state.wishlist.itemIds.length;
export const selectIsWishlisted = (productId: string) => (state: RootState) =>
  state.wishlist.itemIds.includes(productId);

export default wishlistSlice.reducer;

