"use client";

import { useLocale } from "@/lib/i18n";

import React from "react";
import Link from "next/link";
import { RiceLogo } from "@/components/ui/RiceLogo";
import { LocaleToggle } from "@/components/layout/LocaleToggle";
import { ArrowLeft, Building2, User } from "lucide-react";

export default function LoginPage() {
  const { t } = useLocale();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF6EF] p-4 sm:p-6">
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

        <h1 className="font-serif text-2xl font-bold text-[#19221B]">
          {" "}
          {t("Sign In to RiceMart")}{" "}
        </h1>
        <p className="text-xs text-[#686C64] mt-1 mb-6">
          {" "}
          {t(
            "Access your retail household orders, saved carts, or B2B business pricing.",
          )}{" "}
        </p>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#19221B] uppercase tracking-wider mb-1.5">
              {" "}
              {t("Email Address or Phone")}{" "}
            </label>
            <input
              type="text"
              placeholder={t("e.g. buyer@restaurant.com or +1 800...")}
              className="w-full px-4 py-3 rounded-xl bg-[#FAF6EF] border border-[#E7E1D7] text-sm text-[#19221B] focus:outline-none focus:border-[#183A20]"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold text-[#19221B] uppercase tracking-wider">
                {" "}
                {t("Password")}{" "}
              </label>
              <a
                href="#"
                className="text-xs font-semibold text-[#B88A35] hover:underline"
              >
                {" "}
                {t("Forgot?")}{" "}
              </a>
            </div>
            <input
              type="password"
              placeholder={t("••••••••")}
              className="w-full px-4 py-3 rounded-xl bg-[#FAF6EF] border border-[#E7E1D7] text-sm text-[#19221B] focus:outline-none focus:border-[#183A20]"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-[#183A20] hover:bg-[#102C1B] text-[#FFFDF8] font-bold text-sm shadow-md transition-colors"
          >
            {" "}
            {t("Sign In")}{" "}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-[#E7E1D7] space-y-3 text-center">
          <div className="text-xs text-[#686C64]">
            {" "}
            {t("Don&apos;t have an account yet?")}{" "}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <Link
              href="/register"
              className="p-2.5 rounded-xl border border-[#E7E1D7] hover:border-[#183A20] font-semibold text-[#183A20] bg-[#FAF6EF]/50 flex items-center justify-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              <span>{t("Customer (B2C)")}</span>
            </Link>
            <Link
              href="/register/business"
              className="p-2.5 rounded-xl border border-[#B88A35]/40 hover:border-[#B88A35] font-semibold text-[#B88A35] bg-[#FAF6EF]/50 flex items-center justify-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{t("Business (B2B)")}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
