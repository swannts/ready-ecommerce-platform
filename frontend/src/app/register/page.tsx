"use client";

import { useLocale } from "@/lib/i18n";

import React, { useState } from "react";
import Link from "next/link";
import { RiceLogo } from "@/components/ui/RiceLogo";
import { LocaleToggle } from "@/components/layout/LocaleToggle";
import { ArrowLeft, User, Building2 } from "lucide-react";

export default function RegisterPage() {
  const { t } = useLocale();
  const [notice, setNotice] = useState("");
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF6EF] p-4 sm:p-6 py-12">
      <div className="w-full max-w-md bg-[#FFFDF8] rounded-3xl border border-[#E7E1D7] p-8 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <RiceLogo />
          <LocaleToggle />
          <Link
            href="/"
            className="text-xs font-semibold text-[#686C64] hover:text-[#183A20] flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> {t("Home")}{" "}
          </Link>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#183A20]/10 text-[#183A20] text-xs font-bold uppercase tracking-wider mb-2">
          <User className="w-3.5 h-3.5 text-[#B88A35]" />
          <span>{t("Household Customer (B2C)")}</span>
        </div>
        <h1 className="font-serif text-2xl font-bold text-[#19221B]">
          {" "}
          {t("Create Your Account")}{" "}
        </h1>
        <p className="text-xs text-[#686C64] mt-1 mb-6">
          {" "}
          {t(
            "Enjoy direct-from-mill prices, order tracking, and seasonal harvest drops.",
          )}{" "}
        </p>

        <form onSubmit={(e) => { e.preventDefault(); setNotice(t("Showcase only: a customer account was not created.")); }} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#19221B] uppercase tracking-wider mb-1">
              {" "}
              {t("Full Name")}{" "}
            </label>
            <input
              type="text"
              placeholder={t("Your Name")}
              className="w-full px-4 py-2.5 rounded-xl bg-[#FAF6EF] border border-[#E7E1D7] text-sm text-[#19221B] focus:outline-none focus:border-[#183A20]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#19221B] uppercase tracking-wider mb-1">
              {" "}
              {t("Email or Mobile Number")}{" "}
            </label>
            <input
              type="text"
              placeholder={t("e.g. name@email.com or +1 800...")}
              className="w-full px-4 py-2.5 rounded-xl bg-[#FAF6EF] border border-[#E7E1D7] text-sm text-[#19221B] focus:outline-none focus:border-[#183A20]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#19221B] uppercase tracking-wider mb-1">
              {" "}
              {t("Password")}{" "}
            </label>
            <input
              type="password"
              placeholder={t("Create secure password")}
              className="w-full px-4 py-2.5 rounded-xl bg-[#FAF6EF] border border-[#E7E1D7] text-sm text-[#19221B] focus:outline-none focus:border-[#183A20]"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-[#183A20] hover:bg-[#102C1B] text-[#FFFDF8] font-bold text-sm shadow-md transition-colors mt-2"
          >
            {" "}
            {t("Create Customer Account")}{" "}
          </button>
        </form>
        {notice && <p role="status" className="mt-3 rounded-lg bg-[#B88A35]/10 p-3 text-xs text-[#686C64]">{notice}</p>}

        <div className="mt-6 pt-6 border-t border-[#E7E1D7] text-center space-y-2">
          <div className="text-xs text-[#686C64]">
            {" "}
            {t("Purchasing for a restaurant or business?")}{" "}
          </div>
          <Link
            href="/register/business"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#B88A35] hover:underline"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{t("Register as a Business Buyer (B2B) →")}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
