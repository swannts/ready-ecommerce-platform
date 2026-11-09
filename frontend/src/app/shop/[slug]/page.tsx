"use client";

import { useLocale } from "@/lib/i18n";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  ShoppingCart,
  Star,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToCart } from "@/store/slices/cartSlice";
import { formatCurrency } from "@/lib/currency";

export default function ProductDetailsPage() {
  const { t } = useLocale();
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state) => state.products);
  const product = items.find((item) => item.slug === slug);

  const addPackage = (pkg: {
    size: string;
    weightKg: number;
    price: number;
  }) => {
    if (!product) return;
    dispatch(
      addToCart({
        productId: product.id,
        productSlug: product.slug,
        name: product.name,
        variety: product.variety,
        image: product.images[0] || "",
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
      <main className="grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#183A20]"
        >
          <ArrowLeft className="w-4 h-4" /> {t("Back to catalog")}{" "}
        </Link>
        {!product ? (
          <div role="alert" className="py-24 text-center text-red-700">
            {t("Product not found.")}
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-10 mt-8">
            <div className="relative aspect-[4/3] w-full self-start overflow-hidden rounded-3xl border border-[#E7E1D7] bg-[#FFFDF8]">
              {product.images[0] ? (
                <Image
                  src={product.images[0]}
                  alt={`Illustrative rice photo for ${product.name}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  unoptimized
                  className="object-cover object-center"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-[#686C64]">
                  {product.variety}
                </div>
              )}
            </div>
            <div>
              <p className="uppercase tracking-widest text-xs font-bold text-[#B88A35]">
                {product.variety}
              </p>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold mt-2">
                {product.name}
              </h1>
              <p className="mt-4 text-[#686C64]">{product.description}</p>
              <div className="flex flex-wrap gap-4 mt-5 text-sm">
                <span className="inline-flex items-center gap-1">
                  <Star className="w-4 h-4 fill-current text-[#B88A35]" />
                  {product.rating} ({product.reviewCount} reviews)
                </span>
                <span>{product.origin}</span>
                {product.supplierVerified && (
                  <span className="inline-flex items-center gap-1 text-[#183A20]">
                    <CheckCircle2 className="w-4 h-4" />{" "}
                    {t("Verified supplier")}{" "}
                  </span>
                )}
              </div>
              <Link
                href="/suppliers"
                className="inline-flex items-center gap-2 mt-5 text-sm font-semibold text-[#183A20]"
              >
                <Building2 className="w-4 h-4" />
                {product.supplierName}
              </Link>
              <p className="mt-6 text-xl font-bold text-[#183A20]">
                {formatCurrency(product.retailPricePerKg)}{" "}
                <span className="text-sm font-normal">{t("/ kg")}</span>
              </p>
              <h2 className="font-serif text-xl font-bold mt-7 mb-3">
                {" "}
                {t("Available packages")}{" "}
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {product.packagingOptions.map((pkg) => (
                  <button
                    key={pkg.size}
                    type="button"
                    onClick={() => addPackage(pkg)}
                    className="rounded-xl border border-[#E7E1D7] bg-[#FFFDF8] p-4 text-left hover:border-[#183A20]"
                  >
                    <span className="block font-semibold">{pkg.size}</span>
                    <span className="block text-sm text-[#686C64]">
                      {formatCurrency(pkg.price)}
                    </span>
                    <span className="inline-flex items-center gap-2 mt-3 text-xs font-bold text-[#183A20]">
                      <ShoppingCart className="w-4 h-4" />{" "}
                      {t("Add package")}{" "}
                    </span>
                  </button>
                ))}
              </div>
              {product.wholesaleTiers.length > 0 && (
                <div className="mt-8 rounded-2xl bg-[#183A20]/5 p-5">
                  <h2 className="font-serif text-lg font-bold">
                    {" "}
                    {t("Wholesale pricing")}{" "}
                  </h2>
                  <div className="mt-3 space-y-2">
                    {product.wholesaleTiers.map((tier) => (
                      <div
                        key={tier.label}
                        className="flex justify-between text-sm"
                      >
                        <span>{tier.label}</span>
                        <strong>
                          {formatCurrency(tier.unitPricePerKg)} / kg
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
