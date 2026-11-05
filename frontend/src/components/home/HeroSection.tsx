"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  ShoppingCart,
  Building2,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { useLocale } from "@/lib/i18n";

export const HeroSection: React.FC = () => {
  const products = useAppSelector((state) => state.products.items);
  const { t } = useLocale();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // Quick suggestion matches
  const suggestions = query.trim()
    ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.variety.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 3)
    : [];

  return (
    <section className="relative overflow-hidden bg-[#FAF6EF] pt-6 pb-12 lg:pt-12 lg:pb-20">
      {/* Background Subtle Organic Glow Circles */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#FFF2D0]/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-[#183A20]/5 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* ================= LEFT COLUMN ================= */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#183A20]/10 text-[#183A20] text-xs font-bold tracking-widest uppercase mb-4 sm:mb-6 w-fit border border-[#183A20]/15">
              <Sparkles className="w-3.5 h-3.5 text-[#B88A35]" />
              <span>{t("From Farm to Your Business")}</span>
            </div>

            {/* Main Editorial Serif Heading */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#19221B] leading-[1.12] tracking-tight mb-5">
              {t("The Complete")} <br />
              <span className="text-[#183A20] relative inline-block">
                {t("Rice Marketplace")}
                {/* Handcrafted underline curve accent */}
                <svg
                  className="absolute left-0 -bottom-2 w-full h-3 text-[#B88A35]"
                  viewBox="0 0 250 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3 9C60 3 180 2 247 8"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-[#686C64] leading-relaxed max-w-xl mb-8">
              {t("Buy rice for your home or business — directly from verified farmers, mills, and suppliers.")}
            </p>

            {/* Two Prominent Action Buttons: B2C vs B2B */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-9">
              {/* Buy for Home (B2C) */}
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl bg-[#183A20] hover:bg-[#102C1B] text-[#FFFDF8] font-semibold text-base shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.99] group"
              >
                <ShoppingCart className="w-5 h-5 text-[#B88A35] group-hover:scale-110 transition-transform" />
                <span>{t("Buy for Home (B2C)")}</span>
              </Link>

              {/* Buy in Bulk (B2B) */}
              <Link
                href="/wholesale"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl bg-[#FAF6EF] hover:bg-[#EFE7D8] text-[#19221B] font-semibold text-base border-2 border-[#183A20]/25 shadow-xs hover:border-[#183A20] transition-all duration-200 active:scale-[0.99] group"
              >
                <Building2 className="w-5 h-5 text-[#183A20] group-hover:text-[#B88A35] transition-colors" />
                <span>{t("Buy in Bulk (B2B)")}</span>
                <ArrowRight className="w-4 h-4 ml-1 text-[#686C64] group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Interactive Search Bar */}
            <div className="relative max-w-xl mb-8">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (query.trim()) {
                    window.location.href = `/shop?q=${encodeURIComponent(query)}`;
                  }
                }}
                className={`relative flex items-center bg-[#FFFDF8] rounded-2xl shadow-lg border-2 transition-all p-1.5 ${
                  isFocused ? "border-[#183A20] ring-4 ring-[#183A20]/10" : "border-[#E7E1D7]"
                }`}
              >
                <div className="pl-4 pr-2 text-[#686C64]">
                  <Search className="w-5 h-5 text-[#183A20]" />
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                  placeholder={t("Search rice (e.g. Basmati, Miniket, Nazirshail...)")}
                  className="w-full bg-transparent py-3 pr-2 text-sm sm:text-base text-[#19221B] placeholder-[#686C64] focus:outline-none"
                  aria-label="Search rice varieties, categories, or suppliers"
                />
                <button
                  type="submit"
                  className="shrink-0 px-6 py-3.5 rounded-xl bg-[#183A20] hover:bg-[#102C1B] text-[#FFFDF8] font-semibold text-sm transition-colors shadow-xs"
                >
                  {t("Search")}
                </button>
              </form>

              {/* Instant Search Suggestions Dropdown */}
              {isFocused && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#FFFDF8] rounded-xl shadow-xl border border-[#E7E1D7] p-2 z-30">
                  <div className="text-[11px] font-bold text-[#686C64] uppercase px-3 py-1">
                    {t("Matching Varieties")}
                  </div>
                  {suggestions.map((p) => (
                    <Link
                      key={p.id}
                      href={`/shop/${p.slug}`}
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#FAF6EF] text-sm text-[#19221B]"
                    >
                      <span className="font-medium">{p.name}</span>
                      <span className="text-xs text-[#B88A35] font-semibold">
                        from ${p.retailPricePerKg.toFixed(2)}/kg
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Trust Indicators */}
            <div className="pt-2 border-t border-[#E7E1D7]/70 grid grid-cols-3 gap-2 sm:gap-4 max-w-xl">
              {/* Feature 1 */}
              <div className="flex items-center gap-2 sm:gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#183A20]/10 flex items-center justify-center shrink-0 text-[#183A20]">
                  <Truck className="w-4 h-4" />
                </div>
                <div className="text-xs sm:text-sm font-semibold text-[#19221B] leading-tight">
                  {t("Nationwide Delivery")}
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-center gap-2 sm:gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#B88A35]/15 flex items-center justify-center shrink-0 text-[#B88A35]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-xs sm:text-sm font-semibold text-[#19221B] leading-tight">
                  {t("Verified Suppliers")}
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-center gap-2 sm:gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#183A20]/10 flex items-center justify-center shrink-0 text-[#183A20]">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="text-xs sm:text-sm font-semibold text-[#19221B] leading-tight">
                  {t("Quality Assured")}
                </div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN (HERO PHOTOGRAPHY & BADGE) ================= */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            {/* Natural Organic Soft Card Container */}
            <div className="relative w-full max-w-[540px] aspect-4/3 sm:aspect-5/4 lg:aspect-4/3 rounded-3xl overflow-hidden shadow-2xl border-4 border-[#FFFDF8] bg-[#FAF6EF]">
              <Image
                src="/images/hero/hero-rice-composition.svg"
                alt="Premium white rice in wooden bowl with traditional burlap sacks and golden wheat ears"
                fill
                priority
                className="object-cover object-center transition-transform duration-700 hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 45vw"
              />

              {/* Subtle Ambient Sunlight Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#102C1B]/25 via-transparent to-transparent pointer-events-none" />

              {/* Decorative Promotional Badge: "Buy Bulk & Save Up to 30%" */}
              <div className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8 bg-[#FFFDF8]/95 backdrop-blur-md p-4 sm:p-5 rounded-2xl shadow-xl border border-[#B88A35]/30 flex items-center gap-3.5 transform hover:-translate-y-1 transition-transform">
                <div className="w-12 h-12 rounded-xl bg-[#183A20] text-[#B88A35] flex items-center justify-center shrink-0 shadow-xs">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs uppercase font-extrabold tracking-wider text-[#B88A35]">
                    Buy Bulk & Save
                  </div>
                  <div className="text-xl sm:text-2xl font-serif font-bold text-[#183A20] leading-none mt-0.5">
                    Up to 30%
                  </div>
                  <div className="text-[10px] text-[#686C64] mt-0.5 font-medium">
                    Verified B2B wholesale rates
                  </div>
                </div>
              </div>

              {/* Top Origin Tag */}
              <div className="absolute top-5 left-5 bg-[#183A20]/90 backdrop-blur-xs text-[#FFFDF8] px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#B88A35] animate-pulse" />
                <span>100% Direct From Source</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

