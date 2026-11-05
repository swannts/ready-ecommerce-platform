"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { CategoryGridSkeleton } from "@/components/ui/Skeleton";
import { useLocale } from "@/lib/i18n";

export const RiceVarietySection: React.FC = () => {
  const riceCategories = useAppSelector((state) => state.products.categories);
  const { t } = useLocale();
  const categoriesStatus = useAppSelector(
    (state) => state.products.categoriesStatus,
  );
  return (
    <section
      id="rice-varieties"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 scroll-mt-24"
    >
      {/* Header with Title and "View All Varieties" */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-12">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#B88A35] tracking-widest uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t("Curated Grains")}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-4xl font-bold text-[#19221B]">
            {t("Shop by Rice Variety")}
          </h2>
          <p className="text-sm sm:text-base text-[#686C64] mt-1 max-w-xl">
            {t(
              "From regal aged Basmati to aromatic Chinigura and everyday Miniket staples.",
            )}
          </p>
        </div>

        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#183A20] hover:text-[#B88A35] transition-colors group shrink-0"
        >
          <span>{t("View All Varieties")}</span>
          <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </div>

      {/* 6 Category Cards Grid */}
      {categoriesStatus === "loading" && riceCategories.length === 0 ? (
        <CategoryGridSkeleton />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {riceCategories.map((category) => (
            <Link
              key={category.id}
              href={`/shop?category=${category.slug}`}
              className="group relative flex flex-col rounded-2xl bg-[#FFFDF8] border border-[#E7E1D7] p-3 sm:p-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 hover:border-[#B88A35]/50 overflow-hidden"
            >
              {/* Top Image Container with Warm Pastel Gradient */}
              <div
                className={`relative w-full aspect-square rounded-xl bg-gradient-to-b ${category.colorBg} overflow-hidden p-3 flex items-center justify-center transition-transform duration-300 group-hover:scale-105`}
              >
                <Image
                  src={category.image}
                  alt={`${category.name} in traditional bowl`}
                  fill
                  className="object-contain p-2"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                />
              </div>

              {/* Content info */}
              <div className="mt-3.5 flex flex-col grow justify-between">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#B88A35] block truncate">
                    {category.grainDetail}
                  </span>
                  <h3 className="font-serif font-bold text-base sm:text-lg text-[#19221B] group-hover:text-[#183A20] transition-colors mt-0.5 leading-snug">
                    {category.name}
                  </h3>
                </div>

                {/* Bottom bar with Count and Circular Arrow button */}
                <div className="mt-4 pt-3 border-t border-[#E7E1D7]/60 flex items-center justify-between">
                  <span className="text-xs text-[#686C64] font-medium">
                    {category.productCount} {t("Varieties")}
                  </span>

                  <div className="w-7 h-7 rounded-full bg-[#183A20]/8 text-[#183A20] group-hover:bg-[#183A20] group-hover:text-[#FFFDF8] flex items-center justify-center transition-colors shrink-0 shadow-2xs">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};
