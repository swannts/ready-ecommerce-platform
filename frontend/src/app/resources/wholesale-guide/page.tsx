"use client";

import { useLocale } from "@/lib/i18n";

import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useAppSelector } from "@/store/hooks";
import { formatCurrency } from "@/lib/currency";
import { SkeletonBlock } from "@/components/ui/Skeleton";

export default function WholesaleGuidePage() {
  const { t } = useLocale();
  const {
    items: products,
    status,
    error,
  } = useAppSelector((state) => state.products);
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6EF]">
      <Header />
      <main className="grow max-w-7xl mx-auto w-full px-4 sm:px-6 py-12">
        <Link
          href="/wholesale"
          className="text-sm font-semibold text-[#183A20]"
        >
          {" "}
          {t("← Wholesale overview")}{" "}
        </Link>
        <p className="mt-8 text-xs font-bold uppercase tracking-widest text-[#B88A35]">
          {" "}
          {t("Buyer resource")}{" "}
        </p>
        <h1 className="font-serif text-4xl font-bold mt-2">
          {" "}
          {t("Volume Tier Guide")}{" "}
        </h1>
        <p className="mt-3 mb-8 max-w-3xl text-[#686C64]">
          {" "}
          {t(
            "Compare the current wholesale breaks supplied by each product listing. Prices and minimum quantities come from the live catalog.",
          )}{" "}
        </p>
        {status === "loading" && products.length === 0 ? (
          <div
            role="status"
            aria-label={t("Loading volume tiers")}
            aria-busy="true"
            className="grid md:grid-cols-2 gap-5"
          >
            {Array.from({ length: 4 }, (_, index) => (
              <article
                key={index}
                className="rounded-2xl border border-[#E7E1D7] bg-[#FFFDF8] p-6"
              >
                <SkeletonBlock className="h-3 w-1/3" />
                <SkeletonBlock className="mt-3 h-6 w-4/5" />
                <SkeletonBlock className="mt-3 h-4 w-1/2" />
                <SkeletonBlock className="mt-6 h-20 w-full" />
              </article>
            ))}
          </div>
        ) : error && products.length === 0 ? (
          <p role="alert" className="rounded-xl bg-white p-6 text-red-700">
            Could not load live product tiers: {error}
          </p>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {products.map((product) => (
              <article
                key={product.id}
                className="rounded-2xl border border-[#E7E1D7] bg-[#FFFDF8] p-6"
              >
                <p className="text-xs font-bold uppercase tracking-wider text-[#B88A35]">
                  {product.variety}
                </p>
                <h2 className="font-serif text-xl font-bold mt-1">
                  {product.name}
                </h2>
                <p className="text-sm text-[#686C64] mt-1">
                  Minimum order: {product.minOrderQuantityKg} kg ·{" "}
                  {product.supplierName}
                </p>
                <div className="mt-4 divide-y divide-[#E7E1D7]">
                  {product.wholesaleTiers.map((tier) => (
                    <div
                      key={tier.label}
                      className="flex justify-between py-2 text-sm"
                    >
                      <span>{tier.label}</span>
                      <strong>
                        {formatCurrency(tier.unitPricePerKg)} / kg
                      </strong>
                    </div>
                  ))}
                </div>
                <Link
                  href={`/shop/${product.slug}`}
                  className="inline-block mt-4 text-sm font-semibold text-[#183A20]"
                >
                  {" "}
                  {t("View product →")}{" "}
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
