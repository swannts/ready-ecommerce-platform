"use client";

import React from "react";
import Link from "next/link";
import { RiceLogo } from "@/components/ui/RiceLogo";
import { ArrowLeft, Store } from "lucide-react";

export default function SupplierRegisterPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF6EF] p-4 sm:p-6 py-12">
      <div className="w-full max-w-lg bg-[#FFFDF8] rounded-3xl border border-[#E7E1D7] p-8 sm:p-10 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <RiceLogo />
          <Link
            href="/"
            className="text-xs font-semibold text-[#686C64] hover:text-[#183A20] flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Home
          </Link>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B88A35]/15 text-[#B88A35] text-xs font-bold uppercase tracking-wider mb-2">
          <Store className="w-3.5 h-3.5" />
          <span>Producer & Mill Onboarding</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#19221B]">
          Sell Rice on RiceMart
        </h1>
        <p className="text-xs sm:text-sm text-[#686C64] mt-1 mb-6">
          Join the national network of verified grain producers, automatic inventory syncing, and guaranteed timely settlements.
        </p>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#19221B] uppercase tracking-wider mb-1">
              Mill or Farm Cooperative Name
            </label>
            <input
              type="text"
              placeholder="e.g. Dinajpur Auto Rice Mills Ltd."
              className="w-full px-4 py-2.5 rounded-xl bg-[#FAF6EF] border border-[#E7E1D7] text-sm text-[#19221B] focus:outline-none focus:border-[#183A20]"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#19221B] uppercase tracking-wider mb-1">
                Facility Location (Division / District)
              </label>
              <input
                type="text"
                placeholder="District, Country"
                className="w-full px-4 py-2.5 rounded-xl bg-[#FAF6EF] border border-[#E7E1D7] text-sm text-[#19221B] focus:outline-none focus:border-[#183A20]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#19221B] uppercase tracking-wider mb-1">
                Monthly Milling Capacity (Tons)
              </label>
              <input
                type="number"
                placeholder="e.g. 1500"
                className="w-full px-4 py-2.5 rounded-xl bg-[#FAF6EF] border border-[#E7E1D7] text-sm text-[#19221B] focus:outline-none focus:border-[#183A20]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#19221B] uppercase tracking-wider mb-1">
              Primary Rice Varieties Produced
            </label>
            <input
              type="text"
              placeholder="e.g. Miniket, Chinigura Aromatic, Parboiled, Basmati"
              className="w-full px-4 py-2.5 rounded-xl bg-[#FAF6EF] border border-[#E7E1D7] text-sm text-[#19221B] focus:outline-none focus:border-[#183A20]"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-[#183A20] hover:bg-[#102C1B] text-[#FFFDF8] font-bold text-sm shadow-md transition-colors mt-2"
          >
            Apply to Become a Supplier
          </button>
        </form>
      </div>
    </div>
  );
}
