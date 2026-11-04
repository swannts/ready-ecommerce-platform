import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { CartItem, CheckoutCustomerInfo, PlacedOrder } from "@/types/cart";
import { RootState } from "../index";

export interface CartState {
  items: CartItem[];
  couponCode: string | null;
  discountPercentage: number;
  couponStatus: "idle" | "loading" | "valid" | "invalid";
  couponMessage: string | null;
  checkoutStatus: "idle" | "submitting" | "succeeded" | "failed";
  lastOrder: PlacedOrder | null;
  checkoutError: string | null;
}

const initialItems: CartItem[] = [
  {
    id: "rice-basmati-royal-5kg",
    productId: "rice-basmati-royal",
    productSlug: "royal-aged-super-kernel-basmati",
    name: "Royal 2-Year Aged Super Kernel Basmati Rice",
    variety: "Basmati",
    image: "/images/hero/hero-rice-composition.svg",
    packagingSize: "5 kg Family Sack",
    weightKg: 5,
    unitPrice: 17.5,
    quantity: 2,
    supplierName: "Golden Harvest Agro Mills",
  },
  {
    id: "rice-miniket-prime-25kg",
    productId: "rice-miniket-prime",
    productSlug: "premium-silky-white-miniket",
    name: "Premium Silky White Miniket Rice (Single Boiled)",
    variety: "Miniket",
    image: "/images/hero/hero-rice-composition.svg",
    packagingSize: "25 kg Sack",
    weightKg: 25,
    unitPrice: 27.5,
    quantity: 1,
    supplierName: "Heritage Valley Farmer Cooperative",
  },
];

const initialState: CartState = {
  items: initialItems,
  couponCode: null,
  discountPercentage: 0,
  couponStatus: "idle",
  couponMessage: null,
  checkoutStatus: "idle",
  lastOrder: null,
  checkoutError: null,
};

// Async Thunk: Apply promotional voucher with realistic server validation
export const applyCouponThunk = createAsyncThunk<
  { code: string; discountPercentage: number; message: string },
  string,
  { rejectValue: string }
>("cart/applyCoupon", async (rawCode, { rejectWithValue }) => {
  const code = rawCode.trim().toUpperCase();
  await new Promise((resolve) => setTimeout(resolve, 400));

  const validVouchers: Record<string, { discount: number; msg: string }> = {
    RICEMART10: { discount: 10, msg: "10% Welcome Discount applied!" },
    HARVEST20: { discount: 20, msg: "20% Seasonal Harvest Discount applied!" },
    BULKSAVE15: { discount: 15, msg: "15% Bulk Business Discount applied!" },
  };

  if (validVouchers[code]) {
    return {
      code,
      discountPercentage: validVouchers[code].discount,
      message: validVouchers[code].msg,
    };
  }

  return rejectWithValue(
    `Coupon code "${rawCode}" is invalid or has expired. Try RICEMART10.`
  );
});

// Async Thunk: Submit retail / wholesale order checkout
export const checkoutThunk = createAsyncThunk<
  PlacedOrder,
  CheckoutCustomerInfo,
  { state: RootState; rejectValue: string }
>("cart/checkout", async (customer, { getState, rejectWithValue }) => {
  try {
    const state = getState();
    const cart = state.cart;

    if (cart.items.length === 0) {
      return rejectWithValue("Your cart is empty. Add items before checkout.");
    }

    // Simulate payment / gateway latency
    await new Promise((resolve) => setTimeout(resolve, 800));

    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );
    const discount = (subtotal * cart.discountPercentage) / 100;
    const deliveryFee = subtotal > 100 ? 0 : 5.0;
    const total = Math.max(0, subtotal - discount + deliveryFee);

    const order: PlacedOrder = {
      orderId: `RM-${Date.now().toString(36).toUpperCase()}-${Math.floor(
        1000 + Math.random() * 9000
      )}`,
      placedAt: new Date().toISOString(),
      customer,
      items: [...cart.items],
      subtotal,
      discount,
      deliveryFee,
      total,
      paymentMethod: customer.paymentMethod,
      status: "confirmed",
    };

    return order;
  } catch {
    return rejectWithValue("Failed to process transaction. Please retry.");
  }
});

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Omit<CartItem, "id">>) => {
      const payload = action.payload;
      const compositeId = `${payload.productId}-${payload.packagingSize.replace(/\s+/g, "_")}`;
      const existing = state.items.find((item) => item.id === compositeId);

      if (existing) {
        existing.quantity += payload.quantity;
      } else {
        state.items.push({
          ...payload,
          id: compositeId,
        });
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) => {
      const { id, quantity } = action.payload;
      if (quantity <= 0) {
        state.items = state.items.filter((item) => item.id !== id);
      } else {
        const item = state.items.find((item) => item.id === id);
        if (item) {
          item.quantity = quantity;
        }
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.couponCode = null;
      state.discountPercentage = 0;
      state.couponStatus = "idle";
      state.couponMessage = null;
    },
    removeCoupon: (state) => {
      state.couponCode = null;
      state.discountPercentage = 0;
      state.couponStatus = "idle";
      state.couponMessage = null;
    },
    resetCheckoutStatus: (state) => {
      state.checkoutStatus = "idle";
      state.checkoutError = null;
    },
    hydrateCart: (state, action: PayloadAction<CartItem[]>) => {
      if (action.payload && action.payload.length > 0) {
        state.items = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    // applyCouponThunk
    builder
      .addCase(applyCouponThunk.pending, (state) => {
        state.couponStatus = "loading";
        state.couponMessage = null;
      })
      .addCase(applyCouponThunk.fulfilled, (state, action) => {
        state.couponStatus = "valid";
        state.couponCode = action.payload.code;
        state.discountPercentage = action.payload.discountPercentage;
        state.couponMessage = action.payload.message;
      })
      .addCase(applyCouponThunk.rejected, (state, action) => {
        state.couponStatus = "invalid";
        state.couponMessage =
          action.payload || "Failed to validate promo voucher.";
        state.discountPercentage = 0;
      });

    // checkoutThunk
    builder
      .addCase(checkoutThunk.pending, (state) => {
        state.checkoutStatus = "submitting";
        state.checkoutError = null;
      })
      .addCase(checkoutThunk.fulfilled, (state, action) => {
        state.checkoutStatus = "succeeded";
        state.lastOrder = action.payload;
        state.items = []; // Empty cart after successful placement
        state.couponCode = null;
        state.discountPercentage = 0;
      })
      .addCase(checkoutThunk.rejected, (state, action) => {
        state.checkoutStatus = "failed";
        state.checkoutError = action.payload || "Order placement failed.";
      });
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  removeCoupon,
  resetCheckoutStatus,
  hydrateCart,
} = cartSlice.actions;

// Selectors
export const selectCartItems = (state: RootState) => state.cart.items;
export const selectCartTotalQuantity = (state: RootState) =>
  state.cart.items.reduce((total, item) => total + item.quantity, 0);
export const selectCartSubtotal = (state: RootState) =>
  state.cart.items.reduce(
    (total, item) => total + item.unitPrice * item.quantity,
    0
  );
export const selectCartDiscount = (state: RootState) => {
  const subtotal = selectCartSubtotal(state);
  return (subtotal * state.cart.discountPercentage) / 100;
};
export const selectCartDeliveryFee = (state: RootState) => {
  const subtotal = selectCartSubtotal(state);
  if (subtotal === 0) return 0;
  return subtotal >= 100 ? 0 : 5.0;
};
export const selectCartGrandTotal = (state: RootState) => {
  const subtotal = selectCartSubtotal(state);
  const discount = selectCartDiscount(state);
  const delivery = selectCartDeliveryFee(state);
  return Math.max(0, subtotal - discount + delivery);
};

export default cartSlice.reducer;

