"use client";

import { useLocale } from "@/lib/i18n";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WholesaleBanner } from "@/components/home/WholesaleBanner";
import { ArrowLeft, Building2, Send, Loader2, Check } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  submitB2BQuoteThunk,
  resetQuoteSubmission,
  selectB2BQuoteStatus,
  selectLastSubmittedQuote,
} from "@/store/slices/b2bQuoteSlice";
import { B2BQuoteRequest } from "@/types/cart";

export default function WholesalePage() {
  const { t } = useLocale();
  const dispatch = useAppDispatch();
  const quoteStatus = useAppSelector(selectB2BQuoteStatus);
  const lastQuote = useAppSelector(selectLastSubmittedQuote);
  const quoteError = useAppSelector((state) => state.b2bQuote.error);
  const [formData, setFormData] = useState<B2BQuoteRequest>({
    companyName: "Bengal Rice Distributors Ltd.",
    contactPerson: "Rafiqul Islam",
    email: "procurement@bengalrice.com",
    phone: "+880 1711-223344",
    riceVariety: "Basmati",
    quantityKg: 2500,
    targetPricePerKg: 1.85,
    deliveryDestination: "Tejgaon Industrial Area, Dhaka",
    deliveryTimeframe: "Within 10 Days",
    packagingRequirement: "50kg Sacks",
    notes:
      "Requires moisture certificate (< 12%) and SGS grain length inspection.",
  });

  const handleSubmitQuote = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(submitB2BQuoteThunk(formData));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6EF]">
      <Header />
      <main className="grow py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#183A20] hover:text-[#B88A35] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t("Back to Marketplace")}</span>
          </Link>
          <div className="mt-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#183A20]/10 text-[#183A20] text-xs font-bold uppercase tracking-wider mb-2">
              <Building2 className="w-3.5 h-3.5 text-[#B88A35]" />
              <span>{t("B2B Institutional Procurement")}</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#19221B]">
              {" "}
              {t("Wholesale & Bulk Rice Sourcing")}{" "}
            </h1>
            <p className="text-[#686C64] text-base max-w-2xl mt-2">
              {" "}
              {t(
                "Contract directly with accredited rice mills and farmer cooperatives. Multi-tier volume discounts, palletized delivery, and certified batch testing.",
              )}{" "}
            </p>
          </div>
        </div>

        <WholesaleBanner />

        {/* Wholesale Tiers Overview Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h2 className="font-serif text-2xl font-bold text-[#19221B] mb-6">
            {" "}
            {t("B2B Purchasing Volume Tiers")}{" "}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-[#FFFDF8] p-6 rounded-2xl border border-[#E7E1D7] shadow-xs">
              <span className="text-xs font-bold text-[#B88A35] uppercase tracking-wider">
                {" "}
                {t("Tier 1")}{" "}
              </span>
              <h3 className="font-serif text-xl font-bold text-[#183A20] mt-1">
                {" "}
                {t("Retailers & Cafes")}{" "}
              </h3>
              <div className="text-2xl font-bold text-[#19221B] mt-2">
                {" "}
                {t("10 – 49 kg")}{" "}
              </div>
              <p className="text-xs text-[#686C64] mt-2">
                {" "}
                {t(
                  "Save 8–12% off standard retail pricing. Next-day dispatch in commercial protective sacks.",
                )}{" "}
              </p>
            </div>

            <div className="bg-[#FFFDF8] p-6 rounded-2xl border-2 border-[#183A20] shadow-md relative">
              <span className="absolute top-4 right-4 bg-[#183A20] text-[#FFFDF8] text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                {" "}
                {t("Most Popular")}{" "}
              </span>
              <span className="text-xs font-bold text-[#B88A35] uppercase tracking-wider">
                {" "}
                {t("Tier 2")}{" "}
              </span>
              <h3 className="font-serif text-xl font-bold text-[#183A20] mt-1">
                {" "}
                {t("Hotels & Restaurants")}{" "}
              </h3>
              <div className="text-2xl font-bold text-[#19221B] mt-2">
                {" "}
                {t("50 – 499 kg")}{" "}
              </div>
              <p className="text-xs text-[#686C64] mt-2">
                {" "}
                {t(
                  "Save 18–22% off standard prices. Dedicated account manager with palletized delivery.",
                )}{" "}
              </p>
            </div>

            <div className="bg-[#FFFDF8] p-6 rounded-2xl border border-[#E7E1D7] shadow-xs">
              <span className="text-xs font-bold text-[#B88A35] uppercase tracking-wider">
                {" "}
                {t("Tier 3")}{" "}
              </span>
              <h3 className="font-serif text-xl font-bold text-[#183A20] mt-1">
                {" "}
                {t("Industrial & Export")}{" "}
              </h3>
              <div className="text-2xl font-bold text-[#19221B] mt-2">
                {" "}
                {t("500+ kg (Metric Tons)")}{" "}
              </div>
              <p className="text-xs text-[#686C64] mt-2">
                {" "}
                {t(
                  "Save up to 30%. Custom mill contract quotes with tailored packaging & lab reports.",
                )}{" "}
              </p>
            </div>
          </div>

          {/* Interactive B2B Quote Submission via Redux Thunk */}
          <div className="bg-[#FFFDF8] rounded-3xl border border-[#E7E1D7] p-6 sm:p-10 shadow-sm">
            <div className="max-w-3xl">
              <span className="text-xs font-bold text-[#B88A35] uppercase tracking-widest">
                {" "}
                {t("Sample wholesale request")}{" "}
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#19221B] mt-1 mb-2">
                {" "}
                {t("Request a Custom Mill Contract Quote")}{" "}
              </h2>
              <p className="text-xs sm:text-sm text-[#686C64] mb-8">
                {" "}
                {t(
                  "Submit your procurement specs. Our mill network will review your inquiry and respond with a formal quotation within 4 business hours.",
                )}{" "}
              </p>

              {quoteStatus === "succeeded" && lastQuote ? (
                <div className="p-6 rounded-2xl bg-[#183A20] text-[#FFFDF8] shadow-lg animate-in fade-in">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#B88A35] flex items-center justify-center text-[#FFFDF8]">
                      <Check className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-lg">
                        {" "}
                        {t("RFQ Submitted Successfully!")}{" "}
                      </h3>
                      <p className="text-xs text-[#FAF6EF]/80">
                        Reference Number:{" "}
                        <span className="font-mono font-bold text-[#B88A35]">
                          {lastQuote.id}
                        </span>
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-[#FAF6EF]/90 mb-4">
                    {t("Showcase only: this sample request was not sent to any supplier.")} {t("Request details for")} {" "}
                    <span className="font-bold">{lastQuote.contactPerson}</span>
                    {": "}{lastQuote.quantityKg.toLocaleString()} kg {t("of")} {lastQuote.riceVariety} {t("for")} {lastQuote.deliveryDestination}.
                  </p>
                  <button
                    type="button"
                    onClick={() => dispatch(resetQuoteSubmission())}
                    className="px-4 py-2 rounded-xl bg-[#FAF6EF] text-[#183A20] text-xs font-bold hover:bg-[#EFE7D8]"
                  >
                    {" "}
                    {t("Submit Another Inquiry")}{" "}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitQuote} className="space-y-4">
                  {quoteError && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                      {quoteError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#19221B] mb-1">
                        {" "}
                        {t("Company Name")}{" "}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.companyName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            companyName: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-[#FAF6EF] border border-[#E7E1D7] focus:outline-none focus:border-[#183A20]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#19221B] mb-1">
                        {" "}
                        {t("Procurement Officer / Contact")}{" "}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.contactPerson}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contactPerson: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-[#FAF6EF] border border-[#E7E1D7] focus:outline-none focus:border-[#183A20]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#19221B] mb-1">
                        {" "}
                        {t("Corporate Email")}{" "}
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-[#FAF6EF] border border-[#E7E1D7] focus:outline-none focus:border-[#183A20]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#19221B] mb-1">
                        {" "}
                        {t("Direct Phone / WhatsApp")}{" "}
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-[#FAF6EF] border border-[#E7E1D7] focus:outline-none focus:border-[#183A20]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#19221B] mb-1">
                        {" "}
                        {t("Rice Variety")}{" "}
                      </label>
                      <select
                        value={formData.riceVariety}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            riceVariety: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-[#FAF6EF] border border-[#E7E1D7] focus:outline-none focus:border-[#183A20]"
                      >
                        <option value="Basmati">
                          {t("Basmati (Super Kernel)")}
                        </option>
                        <option value="Miniket">
                          {t("Miniket (Silky White)")}
                        </option>
                        <option value="Nazirshail">
                          {" "}
                          {t("Nazirshail (Old Crop)")}{" "}
                        </option>
                        <option value="Chinigura">
                          {t("Chinigura (Aromatic)")}
                        </option>
                        <option value="Kataribhog">{t("Kataribhog")}</option>
                        <option value="Parboiled">
                          {" "}
                          {t("Parboiled Coarse / Fine")}{" "}
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#19221B] mb-1">
                        {" "}
                        {t("Target Volume (kg)")}{" "}
                      </label>
                      <input
                        type="number"
                        min={50}
                        required
                        value={formData.quantityKg}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            quantityKg: Number(e.target.value),
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-[#FAF6EF] border border-[#E7E1D7] focus:outline-none focus:border-[#183A20]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#19221B] mb-1">
                        {" "}
                        {t("Packaging Size")}{" "}
                      </label>
                      <select
                        value={formData.packagingRequirement}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            packagingRequirement: e.target
                              .value as B2BQuoteRequest["packagingRequirement"],
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-[#FAF6EF] border border-[#E7E1D7] focus:outline-none focus:border-[#183A20]"
                      >
                        <option value="50kg Sacks">
                          {" "}
                          {t("50kg Sacks (Jute / Poly)")}{" "}
                        </option>
                        <option value="25kg Sacks">{t("25kg Sacks")}</option>
                        <option value="1 Ton Bulk Bags">
                          {" "}
                          {t("1 Ton Jumbo Bags")}{" "}
                        </option>
                        <option value="Custom">
                          {t("Custom Brand Packaging")}
                        </option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#19221B] mb-1">
                      {" "}
                      {t("Delivery Destination")}{" "}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.deliveryDestination}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          deliveryDestination: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-[#FAF6EF] border border-[#E7E1D7] focus:outline-none focus:border-[#183A20]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={quoteStatus === "submitting"}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#183A20] hover:bg-[#102C1B] text-[#FFFDF8] font-bold text-sm shadow-md transition-all disabled:opacity-75"
                  >
                    {quoteStatus === "submitting" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#B88A35]" />
                        <span>{t("Submitting RFQ via Redux Thunk...")}</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-[#B88A35]" />
                        <span>{t("Submit Wholesale RFQ")}</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
