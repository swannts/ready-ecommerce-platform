import React from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { suppliers } from "@/data/suppliers";
import { ArrowLeft, CheckCircle2, Star, MapPin } from "lucide-react";

export default function SuppliersPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6EF]">
      <Header />
      <main className="grow py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#183A20] hover:text-[#B88A35] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </Link>
        <div className="mt-4 mb-8">
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#19221B]">
            Verified Rice Mills & Cooperatives
          </h1>
          <p className="text-[#686C64] text-base mt-2">
            Every supplier on RiceMart undergoes rigorous on-site facility verification and moisture/purity checks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {suppliers.map((sup) => (
            <div
              key={sup.id}
              className="bg-[#FFFDF8] rounded-2xl border border-[#E7E1D7] p-6 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-[#686C64] mb-2">
                  <span className="font-semibold text-[#B88A35]">{sup.type}</span>
                  <span className="flex items-center gap-1 text-[#183A20] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#B88A35]" />
                    Verified
                  </span>
                </div>
                <h3 className="font-serif text-xl font-bold text-[#19221B]">{sup.name}</h3>
                <div className="flex items-center gap-1.5 text-xs text-[#686C64] mt-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{sup.location}, {sup.country}</span>
                </div>

                <div className="mt-4 pt-4 border-t border-[#E7E1D7] space-y-2 text-xs text-[#19221B]">
                  <div className="flex justify-between">
                    <span className="text-[#686C64]">Monthly Capacity:</span>
                    <span className="font-bold">{sup.capacityMetricTonsMonthly} Metric Tons</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#686C64]">Established:</span>
                    <span className="font-bold">{sup.establishedYear}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#686C64]">Rating:</span>
                    <span className="font-bold flex items-center gap-1 text-[#B88A35]">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      {sup.rating} / 5.0
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-4">
                  {sup.certifications.map((cert) => (
                    <span
                      key={cert}
                      className="px-2 py-0.5 rounded bg-[#FAF6EF] text-[10px] font-semibold text-[#183A20] border border-[#E7E1D7]"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#E7E1D7]">
                <Link
                  href={`/shop?supplier=${sup.slug}`}
                  className="w-full inline-flex items-center justify-center py-2.5 rounded-xl bg-[#183A20] hover:bg-[#102C1B] text-[#FFFDF8] text-xs font-bold transition-colors"
                >
                  View Mill Catalog →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
