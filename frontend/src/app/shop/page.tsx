"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  ArrowLeft,
  Search,
  ShoppingCart,
  Heart,
  CheckCircle2,
  Building2,
  Filter,
  RotateCcw,
  Check,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchProducts,
  setCategoryFilter,
  setGrainTypeFilter,
  setSearchQuery,
  setSortBy,
  resetFilters,
  setSupplierFilter,
} from "@/store/slices/productsSlice";
import { addToCart } from "@/store/slices/cartSlice";
import { selectWishlistIds, toggleWishlist } from "@/store/slices/wishlistSlice";
import { formatCurrency } from "@/lib/currency";
import { RiceProduct } from "@/types/product";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";

export default function ShopPage() {
  const dispatch = useAppDispatch();
  const { filteredItems, categories, status, filters, error } = useAppSelector(
    (state) => state.products
  );
  const wishlistIds = useAppSelector(selectWishlistIds);

  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});
  const [searchInput, setSearchInput] = useState(filters.searchQuery || "");

  // Dispatch Redux thunk to fetch catalog
  useEffect(() => {
    dispatch(fetchProducts(filters));
  }, [dispatch, filters]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get("category") || undefined;
    const supplier = params.get("supplier") || undefined;
    if (category) dispatch(setCategoryFilter(category));
    if (supplier) dispatch(setSupplierFilter(supplier));
  }, [dispatch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setSearchQuery(searchInput));
  };

  const handleAddToCart = (product: RiceProduct) => {
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
      })
    );

    setAddedMap((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedMap((prev) => ({ ...prev, [product.id]: false }));
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6EF]">
      <Header />

      <main className="grow py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#183A20] hover:text-[#B88A35] transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Homepage</span>
        </Link>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#B88A35]">
            Live Marketplace Catalog
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#19221B] mt-1">
              All Rice Varieties & Packaging
            </h1>
            <p className="text-[#686C64] text-sm mt-1 max-w-2xl">
              Showing verified origin-direct rice grains. Available from 1 kg household packs to 50 kg retail sacks and full metric-ton pallets.
            </p>
          </div>

          {/* Quick Search */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Search variety, brand..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs bg-[#FFFDF8] border border-[#E7E1D7] text-[#19221B] placeholder-[#686C64] focus:outline-none focus:border-[#183A20]"
            />
            <Search className="w-4 h-4 text-[#B88A35] absolute left-3 top-3" />
          </form>
        </div>

        {/* Filter Bar */}
        <div className="bg-[#FFFDF8] rounded-2xl border border-[#E7E1D7] p-4 mb-8 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-[#19221B] flex items-center gap-1 mr-2">
              <Filter className="w-3.5 h-3.5 text-[#B88A35]" />
              Variety:
            </span>

            <button
              type="button"
              onClick={() => dispatch(setCategoryFilter(undefined))}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                !filters.categorySlug
                  ? "bg-[#183A20] text-[#FFFDF8]"
                  : "bg-[#FAF6EF] text-[#686C64] hover:text-[#19221B]"
              }`}
            >
              All Varieties
            </button>

            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => dispatch(setCategoryFilter(c.slug))}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  filters.categorySlug === c.slug
                    ? "bg-[#183A20] text-[#FFFDF8]"
                    : "bg-[#FAF6EF] text-[#686C64] hover:text-[#19221B]"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* Grain Length Filter */}
            <select
              value={filters.grainType || ""}
              onChange={(e) =>
                dispatch(
                  setGrainTypeFilter(e.target.value ? e.target.value : undefined)
                )
              }
              aria-label="Filter by grain type"
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#FAF6EF] border border-[#E7E1D7] text-[#19221B] focus:outline-none"
            >
              <option value="">All Grain Types</option>
              <option value="Extra Long">Extra Long</option>
              <option value="Long Grain">Long Grain</option>
              <option value="Medium Grain">Medium Grain</option>
              <option value="Short Grain">Short Grain</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={filters.sortBy || "featured"}
              onChange={(e) =>
                dispatch(
                  setSortBy(
                    e.target.value as "featured" | "price-asc" | "price-desc" | "rating"
                  )
                )
              }
              aria-label="Sort products"
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#FAF6EF] border border-[#E7E1D7] text-[#19221B] focus:outline-none"
            >
              <option value="featured">Featured First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>

            {/* Reset Filters */}
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                dispatch(resetFilters());
              }}
              className="p-1.5 rounded-lg text-[#686C64] hover:text-[#183A20] hover:bg-[#FAF6EF] transition-colors"
              title="Reset Filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Catalog Grid */}
        {status === "loading" ? (
          <ProductGridSkeleton />
        ) : status === "failed" ? (
          <div className="py-16 text-center text-sm text-red-700">Could not load products from the marketplace API. {error}</div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-[#FFFDF8] rounded-3xl border border-[#E7E1D7] p-12 text-center max-w-lg mx-auto">
            <h3 className="font-serif text-xl font-bold text-[#19221B] mb-2">
              No Matching Products Found
            </h3>
            <p className="text-xs text-[#686C64] mb-4">
              Try adjusting your filter criteria or search keyword.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                dispatch(resetFilters());
              }}
              className="px-4 py-2 rounded-xl bg-[#183A20] text-[#FFFDF8] text-xs font-bold"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredItems.map((product) => {
              const isWishlisted = wishlistIds.includes(product.id);
              const isAdded = !!addedMap[product.id];
              const lowestWholesale =
                product.wholesaleTiers[product.wholesaleTiers.length - 1];

              return (
                <div
                  key={product.id}
                  className="group flex flex-col rounded-2xl bg-[#FFFDF8] border border-[#E7E1D7] overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative aspect-4/3 w-full bg-[#FAF6EF] p-4 flex items-center justify-center">
                    <div className="relative w-full h-full flex items-center justify-center">
                      <svg
                        viewBox="0 0 200 160"
                        className="w-32 h-32 drop-shadow-md"
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

                    {/* Wishlist Button */}
                    <button
                      type="button"
                      onClick={() => dispatch(toggleWishlist(product.id))}
                      aria-label="Wishlist"
                      className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-xs transition-colors ${
                        isWishlisted
                          ? "bg-[#183A20] text-[#FFFDF8]"
                          : "bg-[#FFFDF8]/90 text-[#686C64] hover:text-[#183A20]"
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 transition-transform ${
                          isWishlisted ? "fill-current text-[#B88A35] scale-110" : ""
                        }`}
                      />
                    </button>
                  </div>

                  <div className="p-4 sm:p-5 flex flex-col grow justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-[#686C64] mb-1">
                        <span>{product.origin}</span>
                        <span className="flex items-center gap-1 text-[#183A20] font-medium">
                          <CheckCircle2 className="w-3 h-3 text-[#B88A35]" />
                          Verified
                        </span>
                      </div>

                      <span className="text-xs font-bold text-[#B88A35] tracking-wide uppercase">
                        {product.variety}
                      </span>
                      <h3 className="font-serif text-base font-bold text-[#19221B] mt-0.5 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-xs text-[#686C64] mt-1 line-clamp-2">
                        {product.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#E7E1D7] space-y-3">
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

                        <div className="text-right">
                          <span className="text-[10px] uppercase font-semibold text-[#B88A35] flex items-center justify-end gap-1">
                            <Building2 className="w-3 h-3" />
                            Wholesale Tier
                          </span>
                          <span className="text-xs font-bold text-[#19221B]">
                            from {formatCurrency(lowestWholesale.unitPricePerKg)}/kg
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddToCart(product)}
                        className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all active:scale-[0.99] shadow-2xs ${
                          isAdded
                            ? "bg-[#B88A35] text-[#FFFDF8]"
                            : "bg-[#183A20] hover:bg-[#102C1B] text-[#FFFDF8]"
                        }`}
                      >
                        {isAdded ? (
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
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
