"use client";

import { useLocale } from "@/lib/i18n";

import React, { useState } from "react";
import Link from "next/link";
import { RiceLogo } from "@/components/ui/RiceLogo";
import { LocaleToggle } from "@/components/layout/LocaleToggle";
import { ArrowLeft, Store } from "lucide-react";
import { submitSupportRequest } from "@/lib/api";

export default function SupplierRegisterPage() {
  const { t } = useLocale();
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const submitApplication = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setStatus("");
    const formElement = event.currentTarget;
    const data = new FormData(formElement);
    const mill = String(data.get("mill") || "");
    const contact = String(data.get("contact") || "");
    const phone = String(data.get("phone") || "");
    try {
      setStatus(
        await submitSupportRequest({
          name: contact,
          phone,
          subject: `Supplier onboarding request: ${mill}`,
          message: [
            `Mill or cooperative: ${mill}`,
            `Location: ${data.get("location")}`,
            `Monthly capacity (tons): ${data.get("capacity")}`,
            `Rice varieties: ${data.get("varieties")}`,
            `Email: ${data.get("email")}`,
            `Phone: ${phone}`,
          ].join("\n"),
        }),
      );
      formElement.reset();
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Unable to send supplier request.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF6EF] p-4 sm:p-6 py-12">
      <div className="w-full max-w-lg bg-[#FFFDF8] rounded-3xl border border-[#E7E1D7] p-8 sm:p-10 shadow-xl">
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

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B88A35]/15 text-[#B88A35] text-xs font-bold uppercase tracking-wider mb-2">
          <Store className="w-3.5 h-3.5" />
          <span>{t("Producer & Mill Onboarding")}</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#19221B]">
          {" "}
          {t("Sell Rice on RiceMart")}{" "}
        </h1>
        <p className="text-xs sm:text-sm text-[#686C64] mt-1 mb-6">
          {" "}
          {t(
            "Join the national network of verified grain producers, automatic inventory syncing, and guaranteed timely settlements.",
          )}{" "}
        </p>

        <form onSubmit={submitApplication} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#19221B] uppercase tracking-wider mb-1">
              {" "}
              {t("Mill or Farm Cooperative Name")}{" "}
            </label>
            <input
              type="text"
              name="mill"
              placeholder={t("e.g. Dinajpur Auto Rice Mills Ltd.")}
              className="w-full px-4 py-2.5 rounded-xl bg-[#FAF6EF] border border-[#E7E1D7] text-sm text-[#19221B] focus:outline-none focus:border-[#183A20]"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#19221B] uppercase tracking-wider mb-1">
                {" "}
                {t("Facility Location (Division / District)")}{" "}
              </label>
              <input
                type="text"
                name="location"
                placeholder={t("District, Country")}
                className="w-full px-4 py-2.5 rounded-xl bg-[#FAF6EF] border border-[#E7E1D7] text-sm text-[#19221B] focus:outline-none focus:border-[#183A20]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#19221B] uppercase tracking-wider mb-1">
                {" "}
                {t("Monthly Milling Capacity (Tons)")}{" "}
              </label>
              <input
                type="number"
                name="capacity"
                placeholder={t("e.g. 1500")}
                className="w-full px-4 py-2.5 rounded-xl bg-[#FAF6EF] border border-[#E7E1D7] text-sm text-[#19221B] focus:outline-none focus:border-[#183A20]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#19221B] uppercase tracking-wider mb-1">
              {" "}
              {t("Primary Rice Varieties Produced")}{" "}
            </label>
            <input
              type="text"
              name="varieties"
              placeholder={t(
                "e.g. Miniket, Chinigura Aromatic, Parboiled, Basmati",
              )}
              className="w-full px-4 py-2.5 rounded-xl bg-[#FAF6EF] border border-[#E7E1D7] text-sm text-[#19221B] focus:outline-none focus:border-[#183A20]"
              required
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <input
              name="contact"
              required
              placeholder={t("Contact person")}
              className="w-full px-4 py-2.5 rounded-xl bg-[#FAF6EF] border border-[#E7E1D7] text-sm"
            />
            <input
              name="phone"
              required
              type="tel"
              placeholder={t("Phone")}
              className="w-full px-4 py-2.5 rounded-xl bg-[#FAF6EF] border border-[#E7E1D7] text-sm"
            />
          </div>
          <input
            name="email"
            required
            type="email"
            placeholder={t("Business email")}
            className="w-full px-4 py-2.5 rounded-xl bg-[#FAF6EF] border border-[#E7E1D7] text-sm"
          />
          {status && (
            <p role="status" className="text-sm text-[#183A20]">
              {status}
            </p>
          )}
          <button
            disabled={busy}
            type="submit"
            className="w-full py-3.5 rounded-xl bg-[#183A20] hover:bg-[#102C1B] text-[#FFFDF8] font-bold text-sm shadow-md transition-colors mt-2"
          >
            {busy ? "Submitting…" : "Apply to Become a Supplier"}
          </button>
        </form>
      </div>
    </div>
  );
}
