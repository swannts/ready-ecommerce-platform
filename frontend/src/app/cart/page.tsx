"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  ShoppingCart,
  ArrowLeft,
  ArrowRight,
  Trash2,
  Building2,
  Plus,
  Minus,
  Tag,
  CheckCircle2,
  X,
  CreditCard,
  Truck,
  Loader2,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectCartItems,
  selectCartSubtotal,
  selectCartDiscount,
  selectCartDeliveryFee,
  selectCartGrandTotal,
  updateQuantity,
  removeFromCart,
  clearCart,
  applyCouponThunk,
  removeCoupon,
  checkoutThunk,
  resetCheckoutStatus,
} from "@/store/slices/cartSlice";
import { CheckoutCustomerInfo } from "@/types/cart";

export default function CartPage() {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartSubtotal);
  const discount = useAppSelector(selectCartDiscount);
  const deliveryFee = useAppSelector(selectCartDeliveryFee);
  const grandTotal = useAppSelector(selectCartGrandTotal);

  const couponCode = useAppSelector((state) => state.cart.couponCode);
  const couponStatus = useAppSelector((state) => state.cart.couponStatus);
  const couponMessage = useAppSelector((state) => state.cart.couponMessage);
  const checkoutStatus = useAppSelector((state) => state.cart.checkoutStatus);
  const lastOrder = useAppSelector((state) => state.cart.lastOrder);
  const checkoutError = useAppSelector((state) => state.cart.checkoutError);

  const [inputCoupon, setInputCoupon] = useState("");
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);

  // Checkout form state
  const [formData, setFormData] = useState<CheckoutCustomerInfo>({
    fullName: "Kamal Uddin",
    email: "kamal.uddin@example.com",
    phone: "+880 1712-345678",
    shippingAddress: "House 24, Road 7, Sector 3, Uttara",
    city: "Dhaka",
    postalCode: "1230",
    paymentMethod: "cod",
    notes: "Please call before dispatching from the mill depot.",
  });

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;
    dispatch(applyCouponThunk(inputCoupon.trim()));
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(checkoutThunk(formData));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6EF]">
      <Header />

      <main className="grow py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#183A20] hover:text-[#B88A35] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>

          {cartItems.length > 0 && (
            <button
              type="button"
              onClick={() => dispatch(clearCart())}
              className="text-xs font-semibold text-[#686C64] hover:text-red-600 transition-colors self-start sm:self-auto"
            >
              Clear Cart
            </button>
          )}
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#19221B] mb-2">
          Your Shopping Cart
        </h1>
        <p className="text-sm text-[#686C64] mb-8">
          Review your selected rice sacks, packaging sizes, and mill origin dispatch details.
        </p>

        {/* Empty State */}
        {cartItems.length === 0 && !lastOrder ? (
          <div className="bg-[#FFFDF8] rounded-3xl border border-[#E7E1D7] p-12 text-center max-w-2xl mx-auto shadow-xs">
            <div className="w-20 h-20 rounded-full bg-[#FAF6EF] border border-[#E7E1D7] flex items-center justify-center mx-auto mb-4 text-[#B88A35]">
              <ShoppingCart className="w-10 h-10" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#19221B] mb-2">
              Your Cart is Empty
            </h2>
            <p className="text-sm text-[#686C64] max-w-md mx-auto mb-6">
              You haven&apos;t added any rice products to your cart yet. Browse our verified mill selections to find your preferred variety.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#183A20] hover:bg-[#102C1B] text-[#FFFDF8] font-bold text-sm transition-colors shadow-xs"
            >
              <span>Explore Rice Catalog</span>
              <ArrowRight className="w-4 h-4 text-[#B88A35]" />
            </Link>
          </div>
        ) : lastOrder && cartItems.length === 0 ? (
          /* Success Receipt Card */
          <div className="bg-[#FFFDF8] rounded-3xl border border-[#B88A35]/30 p-8 sm:p-10 max-w-2xl mx-auto shadow-xl">
            <div className="w-16 h-16 rounded-full bg-[#183A20] text-[#FFFDF8] flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-[#B88A35]" />
            </div>
            <div className="text-center mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#B88A35]">
                Order Confirmed
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#19221B] mt-1">
                Thank You for Your Order!
              </h2>
              <p className="text-sm text-[#686C64] mt-1">
                Order Reference: <span className="font-mono font-bold text-[#183A20]">{lastOrder.orderId}</span>
              </p>
            </div>

            <div className="bg-[#FAF6EF] rounded-2xl p-5 border border-[#E7E1D7] mb-6 space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between border-b border-[#E7E1D7]/60 pb-2">
                <span className="text-[#686C64]">Delivery Destination:</span>
                <span className="font-semibold text-[#19221B] text-right">
                  {lastOrder.customer.shippingAddress}, {lastOrder.customer.city}
                </span>
              </div>
              <div className="flex justify-between border-b border-[#E7E1D7]/60 pb-2">
                <span className="text-[#686C64]">Payment Method:</span>
                <span className="font-semibold uppercase text-[#183A20]">
                  {lastOrder.customer.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between border-b border-[#E7E1D7]/60 pb-2">
                <span className="text-[#686C64]">Total Items:</span>
                <span className="font-semibold text-[#19221B]">
                  {lastOrder.items.reduce((acc, it) => acc + it.quantity, 0)} sacks
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#183A20] pt-1">
                <span>Total Paid:</span>
                <span className="font-serif text-lg">{formatCurrency(lastOrder.total)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => dispatch(resetCheckoutStatus())}
                className="px-6 py-3 rounded-xl bg-[#FAF6EF] hover:bg-[#EFE7D8] text-[#183A20] text-sm font-bold border border-[#E7E1D7]"
              >
                Place Another Order
              </button>
              <Link
                href="/shop"
                className="px-6 py-3 rounded-xl bg-[#183A20] hover:bg-[#102C1B] text-[#FFFDF8] text-sm font-bold text-center"
              >
                Browse Catalog
              </Link>
            </div>
          </div>
        ) : (
          /* Active Cart Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#FFFDF8] rounded-2xl border border-[#E7E1D7] p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs hover:border-[#B88A35]/40 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-[#FAF6EF] flex items-center justify-center shrink-0 text-[#183A20] border border-[#E7E1D7]">
                      <ShoppingCart className="w-7 h-7 text-[#B88A35]" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-base text-[#19221B]">
                        {item.name}
                      </h3>
                      <div className="text-xs text-[#686C64] mt-0.5">
                        Packaging:{" "}
                        <span className="font-semibold text-[#183A20]">
                          {item.packagingSize}
                        </span>{" "}
                        • Mill: {item.supplierName}
                      </div>
                      <div className="text-sm font-bold text-[#183A20] mt-1.5">
                        {formatCurrency(item.unitPrice)} each
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6 self-end sm:self-center">
                    {/* Quantity Controls */}
                    <div className="flex items-center rounded-lg border border-[#E7E1D7] bg-[#FAF6EF]">
                      <button
                        type="button"
                        onClick={() =>
                          dispatch(
                            updateQuantity({
                              id: item.id,
                              quantity: item.quantity - 1,
                            })
                          )
                        }
                        className="p-1.5 text-[#19221B] hover:text-[#183A20] hover:bg-[#E7E1D7]/50 rounded-l-lg transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-9 text-center text-xs font-bold text-[#19221B]">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          dispatch(
                            updateQuantity({
                              id: item.id,
                              quantity: item.quantity + 1,
                            })
                          )
                        }
                        className="p-1.5 text-[#19221B] hover:text-[#183A20] hover:bg-[#E7E1D7]/50 rounded-r-lg transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Subtotal for line item */}
                    <div className="text-right min-w-[75px]">
                      <div className="text-base font-bold text-[#19221B]">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </div>
                    </div>

                    {/* Remove Action */}
                    <button
                      type="button"
                      onClick={() => dispatch(removeFromCart(item.id))}
                      className="p-2 text-[#686C64] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label="Remove item"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-[#FFFDF8] rounded-2xl border border-[#E7E1D7] p-6 shadow-xs space-y-4">
                <h2 className="font-serif text-xl font-bold text-[#19221B] border-b border-[#E7E1D7] pb-3">
                  Order Summary
                </h2>

                <div className="flex justify-between text-sm">
                  <span className="text-[#686C64]">Subtotal</span>
                  <span className="font-bold text-[#19221B]">
                    {formatCurrency(subtotal)}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-sm text-[#183A20]">
                    <span className="flex items-center gap-1 font-medium">
                      <Tag className="w-3.5 h-3.5 text-[#B88A35]" />
                      Discount ({couponCode})
                    </span>
                    <span className="font-bold">-{formatCurrency(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-[#686C64]">Direct Mill Freight</span>
                  <span className="font-semibold text-[#183A20]">
                    {deliveryFee === 0 ? "FREE (Orders $100+)" : formatCurrency(deliveryFee)}
                  </span>
                </div>

                <div className="pt-3 border-t border-[#E7E1D7] flex justify-between text-base">
                  <span className="font-bold text-[#19221B]">Grand Total</span>
                  <span className="font-serif text-2xl font-bold text-[#183A20]">
                    {formatCurrency(grandTotal)}
                  </span>
                </div>

                {/* Promotional Coupon Thunk Form */}
                <form
                  onSubmit={handleApplyCoupon}
                  className="pt-2 border-t border-[#E7E1D7]/60"
                >
                  <label
                    htmlFor="coupon-input"
                    className="block text-xs font-bold text-[#686C64] uppercase tracking-wider mb-2"
                  >
                    Promotional Voucher
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="coupon-input"
                      type="text"
                      placeholder="e.g. RICEMART10"
                      value={inputCoupon}
                      onChange={(e) => setInputCoupon(e.target.value)}
                      className="grow px-3 py-2 rounded-xl text-xs bg-[#FAF6EF] border border-[#E7E1D7] focus:outline-none focus:border-[#183A20]"
                    />
                    <button
                      type="submit"
                      disabled={couponStatus === "loading"}
                      className="px-4 py-2 rounded-xl bg-[#FAF6EF] hover:bg-[#EFE7D8] text-xs font-bold text-[#183A20] border border-[#E7E1D7] transition-colors disabled:opacity-60"
                    >
                      {couponStatus === "loading" ? "Validating..." : "Apply"}
                    </button>
                  </div>

                  {couponMessage && (
                    <div
                      className={`text-xs mt-2 flex items-center justify-between ${
                        couponStatus === "valid"
                          ? "text-emerald-700 font-semibold"
                          : "text-rose-700"
                      }`}
                    >
                      <span>{couponMessage}</span>
                      {couponStatus === "valid" && (
                        <button
                          type="button"
                          onClick={() => dispatch(removeCoupon())}
                          className="underline hover:text-red-700 text-[11px]"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  )}
                  <p className="text-[11px] text-[#686C64] mt-1">
                    Try code <code className="font-mono font-bold text-[#183A20]">RICEMART10</code> for 10% off.
                  </p>
                </form>

                <button
                  type="button"
                  onClick={() => setCheckoutModalOpen(true)}
                  className="w-full py-4 rounded-xl bg-[#183A20] hover:bg-[#102C1B] text-[#FFFDF8] font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 text-[#B88A35]" />
                </button>

                <div className="pt-2 text-center">
                  <Link
                    href="/wholesale"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B88A35] hover:underline"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Looking to buy in 500+ kg bulk? Get B2B Quote</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Checkout Modal using Redux Thunk */}
      {checkoutModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#102C1B]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-[#FFFDF8] rounded-3xl border border-[#E7E1D7] w-full max-w-xl p-6 sm:p-8 shadow-2xl relative my-8">
            <button
              type="button"
              onClick={() => setCheckoutModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-[#686C64] hover:bg-[#FAF6EF]"
              aria-label="Close checkout"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-bold text-[#B88A35] tracking-widest uppercase mb-1">
              <Truck className="w-4 h-4" />
              <span>Mill Direct Checkout</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#19221B] mb-2">
              Delivery & Payment Details
            </h2>
            <p className="text-xs text-[#686C64] mb-6">
              Total Payable:{" "}
              <span className="font-bold text-[#183A20]">
                {formatCurrency(grandTotal)}
              </span>{" "}
              for {cartItems.reduce((acc, i) => acc + i.quantity, 0)} sacks
            </p>

            {checkoutError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                {checkoutError}
              </div>
            )}

            <form onSubmit={handleCheckout} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#19221B] mb-1">
                  Recipient Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-[#FAF6EF] border border-[#E7E1D7] focus:outline-none focus:border-[#183A20]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#19221B] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-[#FAF6EF] border border-[#E7E1D7] focus:outline-none focus:border-[#183A20]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#19221B] mb-1">
                    Contact Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-[#FAF6EF] border border-[#E7E1D7] focus:outline-none focus:border-[#183A20]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#19221B] mb-1">
                  Street Delivery Address
                </label>
                <input
                  type="text"
                  required
                  value={formData.shippingAddress}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      shippingAddress: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-[#FAF6EF] border border-[#E7E1D7] focus:outline-none focus:border-[#183A20]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#19221B] mb-1">
                    City / District
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-[#FAF6EF] border border-[#E7E1D7] focus:outline-none focus:border-[#183A20]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#19221B] mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.postalCode}
                    onChange={(e) =>
                      setFormData({ ...formData, postalCode: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-[#FAF6EF] border border-[#E7E1D7] focus:outline-none focus:border-[#183A20]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#19221B] mb-1">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold cursor-pointer transition-colors ${
                      formData.paymentMethod === "cod"
                        ? "border-[#183A20] bg-[#183A20]/5 text-[#183A20]"
                        : "border-[#E7E1D7] bg-[#FAF6EF] text-[#686C64]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === "cod"}
                      onChange={() =>
                        setFormData({ ...formData, paymentMethod: "cod" })
                      }
                      className="sr-only"
                    />
                    <Truck className="w-4 h-4 text-[#B88A35]" />
                    <span>Cash on Delivery</span>
                  </label>

                  <label
                    className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold cursor-pointer transition-colors ${
                      formData.paymentMethod === "card"
                        ? "border-[#183A20] bg-[#183A20]/5 text-[#183A20]"
                        : "border-[#E7E1D7] bg-[#FAF6EF] text-[#686C64]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={formData.paymentMethod === "card"}
                      onChange={() =>
                        setFormData({ ...formData, paymentMethod: "card" })
                      }
                      className="sr-only"
                    />
                    <CreditCard className="w-4 h-4 text-[#B88A35]" />
                    <span>Card / Online</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={checkoutStatus === "submitting"}
                className="w-full py-4 rounded-xl bg-[#183A20] hover:bg-[#102C1B] text-[#FFFDF8] font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-75"
              >
                {checkoutStatus === "submitting" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#B88A35]" />
                    <span>Processing Order via Redux Thunk...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Place Order ({formatCurrency(grandTotal)})</span>
                    <ArrowRight className="w-4 h-4 text-[#B88A35]" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
