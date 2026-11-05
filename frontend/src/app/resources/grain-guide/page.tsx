"use client";

import { useLocale } from "@/lib/i18n";

import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useAppSelector } from "@/store/hooks";
import { CategoryGridSkeleton } from "@/components/ui/Skeleton";

export default function GrainGuidePage() {
  const { t } = useLocale();
  const { categories, categoriesStatus, error } = useAppSelector(
    (state) => state.products,
  );
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6EF]">
      <Header />
      <main className="grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/shop" className="text-sm font-semibold text-[#183A20]">
          {" "}
          {t("← Browse the rice catalog")}{" "}
        </Link>
        <p className="mt-8 text-xs font-bold uppercase tracking-widest text-[#B88A35]">
          {" "}
          {t("Buyer resource")}{" "}
        </p>
        <h1 className="font-serif text-4xl font-bold mt-2">
          {" "}
          {t("Rice Grain Quality Guide")}{" "}
        </h1>
        <p className="mt-3 mb-8 max-w-3xl text-[#686C64]">
          {" "}
          {t(
            "Explore grain details and common uses for the varieties currently listed in the RiceMart catalog.",
          )}{" "}
        </p>
        {categoriesStatus === "loading" && categories.length === 0 ? (
          <CategoryGridSkeleton />
        ) : categoriesStatus === "failed" && categories.length === 0 ? (
          <p role="alert" className="rounded-xl bg-white p-6 text-red-700">
            Could not load rice varieties: {error}
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((category) => (
              <article
                key={category.id}
                className="rounded-2xl border border-[#E7E1D7] bg-[#FFFDF8] p-6"
              >
                <p className="text-xs font-bold uppercase tracking-wider text-[#B88A35]">
                  {category.grainDetail}
                </p>
                <h2 className="font-serif text-2xl font-bold mt-2">
                  {category.name}
                </h2>
                <p className="text-sm text-[#686C64] mt-3">
                  {category.description}
                </p>
                <p className="mt-4 text-sm">
                  <span className="font-semibold">{t("Common uses:")} </span>
                  {category.popularUses}
                </p>
                <p className="mt-2 text-xs text-[#686C64]">
                  {category.productCount} catalog products
                </p>
                <Link
                  href={`/shop?category=${encodeURIComponent(category.slug)}`}
                  className="inline-block mt-4 text-sm font-semibold text-[#183A20]"
                >
                  {" "}
                  {t("Shop this variety →")}{" "}
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
