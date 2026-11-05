"use client";

import { useLocale } from "@/lib/i18n";

import React from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  Heart,
  ArrowLeft,
  ShoppingCart,
  Trash2,
  Building2,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectWishlistIds,
  removeFromWishlist,
  clearWishlist,
} from "@/store/slices/wishlistSlice";
import { addToCart } from "@/store/slices/cartSlice";
import { formatCurrency } from "@/lib/currency";
import { RiceProduct } from "@/types/product";

export default function WishlistPage() {
  const { t } = useLocale();
  const dispatch = useAppDispatch();
  const wishlistIds = useAppSelector(selectWishlistIds);
  const products = useAppSelector((state) => state.products.items);

  const savedProducts = products.filter((product) =>
    wishlistIds.includes(product.id),
  );

  const handleMoveToCart = (product: RiceProduct) => {
    const pkg = product.packagingOptions[0] || {
      size: "5 kg Sack",
      weightKg: 5,
      price: product.retailPricePerKg * 5,
    };

    dispatch(
      addToCart({
        productId: product.id,
        productSlug: product.slug,
        name: product.name,
        variety: product.variety,
        image: product.images[0] || "/images/hero/hero-rice-composition.svg",
        packagingSize: pkg.size,
        weightKg: pkg.weightKg,
        unitPrice: pkg.price,
        quantity: 1,
        supplierName: product.supplierName,
      }),
    );
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
            <span>{t("Continue Shopping")}</span>
          </Link>

          {savedProducts.length > 0 && (
            <button
              type="button"
              onClick={() => dispatch(clearWishlist())}
              className="text-xs font-semibold text-[#686C64] hover:text-red-600 transition-colors self-start sm:self-auto"
            >
              {" "}
              {t("Clear All Saved Items")}{" "}
            </button>
          )}
        </div>

        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-[#B88A35]">
            {" "}
            {t("Saved Collections")}{" "}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#19221B] mt-1">
            {" "}
            {t("Your Saved Rice Varieties")}{" "}
          </h1>
          <p className="text-sm text-[#686C64] mt-1">
            {" "}
            {t(
              "Keep track of favorite harvests and mill specials for quick reordering.",
            )}{" "}
          </p>
        </div>

        {savedProducts.length === 0 ? (
          <div className="bg-[#FFFDF8] rounded-3xl border border-[#E7E1D7] p-12 text-center max-w-xl mx-auto shadow-xs">
            <div className="w-20 h-20 rounded-full bg-[#FAF6EF] border border-[#E7E1D7] flex items-center justify-center mx-auto mb-4 text-[#B88A35]">
              <Heart className="w-9 h-9" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#19221B] mb-2">
              {" "}
              {t("No Saved Items Yet")}{" "}
            </h2>
            <p className="text-sm text-[#686C64] max-w-sm mx-auto mb-6">
              {" "}
              {t(
                "Tap the heart icon on any rice product card to save it here for later.",
              )}{" "}
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#183A20] hover:bg-[#102C1B] text-[#FFFDF8] font-bold text-sm transition-colors shadow-xs"
            >
              <span>{t("Explore Rice Catalog")}</span>
              <ArrowRight className="w-4 h-4 text-[#B88A35]" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedProducts.map((product) => {
              const lowestWholesale =
                product.wholesaleTiers[product.wholesaleTiers.length - 1];
              return (
                <div
                  key={product.id}
                  className="bg-[#FFFDF8] rounded-2xl border border-[#E7E1D7] p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <span className="text-xs font-bold text-[#B88A35] uppercase">
                          {product.variety}
                        </span>
                        <h3 className="font-serif font-bold text-lg text-[#19221B] mt-0.5">
                          {product.name}
                        </h3>
                        <p className="text-xs text-[#686C64] mt-0.5 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#183A20]" />
                          <span>{product.supplierName}</span>
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => dispatch(removeFromWishlist(product.id))}
                        className="p-2 text-[#686C64] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label={t("Remove from wishlist")}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="bg-[#FAF6EF] rounded-xl p-3 border border-[#E7E1D7] my-3 flex justify-between items-center text-xs">
                      <div>
                        <span className="text-[#686C64] block">
                          {" "}
                          {t("Retail Price")}{" "}
                        </span>
                        <span className="font-bold text-sm text-[#183A20]">
                          {formatCurrency(product.retailPricePerKg)} / kg
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[#B88A35] font-semibold flex items-center justify-end gap-1">
                          <Building2 className="w-3 h-3" />{" "}
                          {t("B2B Wholesale")}{" "}
                        </span>
                        <span className="font-bold text-[#19221B]">
                          from {formatCurrency(lowestWholesale.unitPricePerKg)}
                          /kg
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleMoveToCart(product)}
                      className="grow flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#183A20] hover:bg-[#102C1B] text-[#FFFDF8] text-xs font-bold transition-colors"
                    >
                      <ShoppingCart className="w-3.5 h-3.5 text-[#B88A35]" />
                      <span>{t("Add to Cart")}</span>
                    </button>
                    <Link
                      href={`/shop/${product.slug}`}
                      className="px-3.5 py-2.5 rounded-xl border border-[#E7E1D7] hover:bg-[#FAF6EF] text-xs font-semibold text-[#19221B] transition-colors"
                    >
                      {" "}
                      {t("Details")}{" "}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
