"use client";

import { useLocale } from "@/lib/i18n";

import React from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ArrowLeft, Truck, Sprout } from "lucide-react";

export default function AboutPage() {
  const { t } = useLocale();
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6EF]">
      <Header />
      <main className="grow py-12 max-w-4xl mx-auto px-4 sm:px-6 w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#183A20] hover:text-[#B88A35] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t("Back to Marketplace")}</span>
        </Link>

        <div className="text-xs font-bold text-[#B88A35] tracking-widest uppercase mb-2">
          {" "}
          {t("Our Heritage & Mission")}{" "}
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#19221B] mb-6">
          {" "}
          {t("Direct From Paddy Fields to Homes and Commercial Kitchens")}{" "}
        </h1>

        <div className="prose prose-lg text-[#686C64] space-y-5 leading-relaxed">
          <p>
            {" "}
            {t(
              "RiceMart was founded with a unified mission: to modernize the age-old rice trade by eliminating multiple layers of middlemen, empowering farmers and accredited mills, and delivering pure, authentic grain varieties directly to families and businesses.",
            )}{" "}
          </p>
          <p>
            {" "}
            {t(
              "Traditional grain distribution is plagued by adulteration, artificial polishing, and opaque pricing. RiceMart provides a transparent, tech-enabled digital marketplace where every sack is traceable to its certified mill and harvest region.",
            )}{" "}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-8 not-prose">
            <div className="p-5 rounded-2xl bg-[#FFFDF8] border border-[#E7E1D7]">
              <div className="w-10 h-10 rounded-xl bg-[#183A20]/10 text-[#183A20] flex items-center justify-center mb-3">
                <Sprout className="w-5 h-5 text-[#B88A35]" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#183A20]">
                {" "}
                {t("For Households (B2C)")}{" "}
              </h3>
              <p className="text-xs text-[#686C64] mt-1">
                {" "}
                {t(
                  "Access aromatic, organic, and daily rice varieties in convenient 1 kg to 25 kg bags with doorstep delivery.",
                )}{" "}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FFFDF8] border border-[#E7E1D7]">
              <div className="w-10 h-10 rounded-xl bg-[#183A20]/10 text-[#183A20] flex items-center justify-center mb-3">
                <Truck className="w-5 h-5 text-[#B88A35]" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#183A20]">
                {" "}
                {t("For Enterprise & B2B")}{" "}
              </h3>
              <p className="text-xs text-[#686C64] mt-1">
                {" "}
                {t(
                  "Transparent volume pricing, custom quotations, laboratory moisture reports, and steady scheduled shipments for hotels, restaurants, and retailers.",
                )}{" "}
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
