"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Heart,
  Star,
  CheckCircle2,
  Building2,
  ArrowRight,
  Check,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToCart } from "@/store/slices/cartSlice";
import { selectWishlistIds, toggleWishlist } from "@/store/slices/wishlistSlice";
import { RiceProduct } from "@/types/product";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";

export const FeaturedProductsSection: React.FC = () => {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<"all" | "retail" | "wholesale">("all");
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  const wishlist = useAppSelector(selectWishlistIds);
  const products = useAppSelector((state) => state.products.items);
  const productStatus = useAppSelector((state) => state.products.status);
  const visibleProducts = products.filter((product) => activeTab === "all" || (activeTab === "wholesale" ? product.wholesaleTiers.length > 0 : product.packagingOptions.length > 0)).slice(0, 4);

  const handleToggleWishlist = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(toggleWishlist(id));
  };

  const handleAddToCart = (product: RiceProduct) => {
    const defaultPackage = product.packagingOptions[0] || {
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
        packagingSize: defaultPackage.size,
        weightKg: defaultPackage.weightKg,
        unitPrice: defaultPackage.price,
        quantity: 1,
        supplierName: product.supplierName,
      })
    );

    setAddedProductId(product.id);
    setTimeout(() => {
      setAddedProductId((current) => (current === product.id ? null : current));
    }, 1600);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-10">
        <div>
          <div className="text-xs font-bold text-[#B88A35] tracking-widest uppercase mb-1.5">
            Verified Mill Selections
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#19221B]">
            Featured Rice Products
          </h2>
          <p className="text-sm sm:text-base text-[#686C64] mt-1 max-w-xl">
            Directly sourced and packaged at origin. Available for both home retail and bulk business orders.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#E7E1D7]/50 border border-[#E7E1D7] self-start md:self-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-3.5 py-1.5 rounded-lg transition-colors ${
              activeTab === "all"
                ? "bg-[#183A20] text-[#FFFDF8] shadow-xs"
                : "text-[#686C64] hover:text-[#19221B]"
            }`}
          >
            All Products
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("retail")}
            className={`px-3.5 py-1.5 rounded-lg transition-colors ${
              activeTab === "retail"
                ? "bg-[#183A20] text-[#FFFDF8] shadow-xs"
                : "text-[#686C64] hover:text-[#19221B]"
            }`}
          >
            Household (B2C)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("wholesale")}
            className={`px-3.5 py-1.5 rounded-lg transition-colors ${
              activeTab === "wholesale"
                ? "bg-[#183A20] text-[#FFFDF8] shadow-xs"
                : "text-[#686C64] hover:text-[#19221B]"
            }`}
          >
            Wholesale (B2B)
          </button>
        </div>
      </div>

      {/* Product Cards Grid */}
      {productStatus === "loading" && products.length === 0 ? <ProductGridSkeleton count={4} /> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {visibleProducts.map((product) => {
          const isWishlisted = wishlist.includes(product.id);
          const lowestWholesaleTier = product.wholesaleTiers[product.wholesaleTiers.length - 1];

          return (
            <div
              key={product.id}
              className="group flex flex-col rounded-2xl bg-[#FFFDF8] border border-[#E7E1D7] overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              {/* Image & Badges */}
              <div className="relative aspect-4/3 w-full bg-[#FAF6EF] p-4 flex items-center justify-center overflow-hidden">
                {/* SVG Rice Sack / Bowl rendering */}
                <div className="relative w-full h-full flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
                  <svg
                    viewBox="0 0 200 160"
                    className="w-36 h-36 drop-shadow-md"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <ellipse cx="100" cy="115" rx="70" ry="32" fill="#D9C3A3" opacity="0.6"/>
                    <path
                      d="M60 55 C65 35, 135 35, 140 55 C155 80, 160 125, 140 140 C120 150, 80 150, 60 140 C40 125, 45 80, 60 55 Z"
                      fill="#CBB597"
                    />
                    <path d="M65 65 Q100 75 135 65" stroke="#7E5C35" strokeWidth="4" strokeLinecap="round"/>
                    <rect x="75" y="90" width="50" height="30" rx="3" fill="#FFFDF8" opacity="0.9"/>
                    <text x="100" y="105" fontFamily="serif" fontSize="7" fontWeight="bold" fill="#183A20" textAnchor="middle">
                      {product.variety.split(" ")[0]}
                    </text>
                    <text x="100" y="114" fontFamily="sans-serif" fontSize="5" fill="#B88A35" textAnchor="middle">
                      GRADE A+
                    </text>
                  </svg>
                </div>

                {/* Badges on top */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  {product.isOrganic && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#183A20] text-[#FFFDF8] tracking-wider uppercase">
                      Organic
                    </span>
                  )}
                  {product.isPopular && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#B88A35] text-[#FFFDF8] tracking-wider uppercase">
                      Popular
                    </span>
                  )}
                </div>

                {/* Wishlist Button */}
                <button
                  type="button"
                  onClick={(e) => handleToggleWishlist(product.id, e)}
                  aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-xs transition-colors ${
                    isWishlisted
                      ? "bg-[#183A20] text-[#FFFDF8]"
                      : "bg-[#FFFDF8]/90 text-[#686C64] hover:text-[#183A20] hover:bg-[#FFFDF8]"
                  }`}
                >
                  <Heart className={`w-4 h-4 transition-transform ${isWishlisted ? "fill-current text-[#B88A35] scale-110" : ""}`} />
                </button>
              </div>

              {/* Content Body */}
              <div className="p-4 sm:p-5 flex flex-col grow justify-between">
                <div>
                  {/* Origin & Supplier */}
                  <div className="flex items-center justify-between text-xs text-[#686C64] mb-1.5">
                    <span className="truncate">{product.origin}</span>
                    <span className="flex items-center gap-1 text-[#183A20] font-medium shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-[#B88A35]" />
                      Verified
                    </span>
                  </div>

                  {/* Product Title */}
                  <h3 className="font-serif font-bold text-base text-[#19221B] group-hover:text-[#183A20] transition-colors line-clamp-2 leading-snug">
                    <Link href={`/shop/${product.slug}`}>
                      {product.name}
                    </Link>
                  </h3>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="flex items-center text-[#B88A35]">
                      <Star className="w-3.5 h-3.5 fill-current" />
                    </div>
                    <span className="text-xs font-bold text-[#19221B]">{product.rating}</span>
                    <span className="text-xs text-[#686C64]">({product.reviewCount} reviews)</span>
                  </div>

                  {/* Packaging Sizes Chips */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {product.packagingOptions.slice(0, 3).map((pack) => (
                      <span
                        key={pack.size}
                        className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#FAF6EF] text-[#686C64] border border-[#E7E1D7]"
                      >
                        {pack.size}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Pricing & CTA */}
                <div className="mt-5 pt-3.5 border-t border-[#E7E1D7] space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-[#686C64] block">
                        Retail Price
                      </span>
                      <span className="text-xl font-serif font-bold text-[#183A20]">
                        {formatCurrency(product.retailPricePerKg)}
                        <span className="text-xs font-normal text-[#686C64]"> / kg</span>
                      </span>
                    </div>

                    {/* Wholesale Pill */}
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-semibold text-[#B88A35] flex items-center justify-end gap-1">
                        <Building2 className="w-3 h-3" />
                        Wholesale Tier
                      </span>
                      <span className="text-xs font-bold text-[#19221B]">
                        from {formatCurrency(lowestWholesaleTier.unitPricePerKg)}/kg
                      </span>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    type="button"
                    onClick={() => handleAddToCart(product)}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all active:scale-[0.99] shadow-2xs ${
                      addedProductId === product.id
                        ? "bg-[#B88A35] text-[#FFFDF8]"
                        : "bg-[#183A20] hover:bg-[#102C1B] text-[#FFFDF8]"
                    }`}
                  >
                    {addedProductId === product.id ? (
                      <>
                        <Check className="w-4 h-4 text-[#FFFDF8]" />
                        <span>Added to Cart!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4 text-[#B88A35]" />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>}

      {/* Explore More CTA */}
      <div className="mt-10 text-center">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#FAF6EF] hover:bg-[#EFE7D8] text-[#183A20] font-bold text-sm border-2 border-[#183A20]/20 transition-all hover:border-[#183A20]"
        >
          <span>Explore All 120+ Rice Products</span>
          <ArrowRight className="w-4 h-4 text-[#B88A35]" />
        </Link>
      </div>
    </section>
  );
};
