"use client";

import React, { useState } from "react";
import Link from "next/link";
import { RiceLogo } from "@/components/ui/RiceLogo";
import { ShieldCheck, Truck, Award, Phone, Mail, Globe } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { submitSupportRequest } from "@/lib/api";
import { useLocale } from "@/lib/i18n";

export const Footer: React.FC = () => {
  const riceCategories = useAppSelector((state) => state.products.categories);
  const [newsletterStatus, setNewsletterStatus] = useState("");
  const [newsletterBusy, setNewsletterBusy] = useState(false);
  const { t } = useLocale();
  const joinNewsletter = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const email = String(new FormData(formElement).get("email") || "");
    setNewsletterBusy(true);
    try {
      const message = await submitSupportRequest({
        name: email,
        subject: "RiceMart grain market updates subscription",
        message: `Please add ${email} to the grain market price index and harvest report mailing list.`,
      });
      setNewsletterStatus(message);
      formElement.reset();
    } catch (error) {
      setNewsletterStatus(
        error instanceof Error
          ? error.message
          : "Could not submit subscription.",
      );
    } finally {
      setNewsletterBusy(false);
    }
  };
  return (
    <footer className="bg-[#102C1B] text-[#E7E1D7] pt-16 pb-12 border-t border-[#183A20] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Trust Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 mb-12 border-b border-[#183A20]">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#183A20]/50 border border-[#183A20]">
            <div className="w-12 h-12 rounded-xl bg-[#FAF6EF]/10 flex items-center justify-center text-[#B88A35] shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="font-semibold text-[#FFFDF8] text-sm">
                {t("Nationwide Distribution")}
              </div>
              <div className="text-xs text-[#E7E1D7]/70 mt-0.5">
                {t(
                  "Reliable logistics from single sacks to multi-ton consignments.",
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#183A20]/50 border border-[#183A20]">
            <div className="w-12 h-12 rounded-xl bg-[#FAF6EF]/10 flex items-center justify-center text-[#B88A35] shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="font-semibold text-[#FFFDF8] text-sm">
                {t("Verified Producers & Mills")}
              </div>
              <div className="text-xs text-[#E7E1D7]/70 mt-0.5">
                {t(
                  "Direct farm gate & certified industrial mill partner network.",
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#183A20]/50 border border-[#183A20]">
            <div className="w-12 h-12 rounded-xl bg-[#FAF6EF]/10 flex items-center justify-center text-[#B88A35] shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="font-semibold text-[#FFFDF8] text-sm">
                {t("100% Quality Assurance")}
              </div>
              <div className="text-xs text-[#E7E1D7]/70 mt-0.5">
                {t(
                  "Moisture-controlled, lab-tested, and authentic grain varieties.",
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer Links Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#183A20]">
          {/* Col 1: Brand Info & Newsletter */}
          <div className="lg:col-span-2 space-y-4">
            <RiceLogo variant="light" />
            <p className="text-sm text-[#E7E1D7]/80 leading-relaxed max-w-sm mt-3">
              {t(
                "RiceMart is the premier agricultural commerce marketplace connecting verified rice mills, farmers, and distributors directly with retail households and institutional B2B buyers.",
              )}
            </p>

            {/* Newsletter input */}
            <div className="pt-2">
              <span className="block text-xs font-semibold text-[#FFFDF8] uppercase tracking-wider mb-2">
                {t("Subscribe for Grain Market Price Index & Harvest Reports")}
              </span>
              <form
                onSubmit={joinNewsletter}
                className="flex items-center max-w-md"
              >
                <input
                  type="email"
                  name="email"
                  placeholder={t("Enter business or personal email")}
                  className="bg-[#183A20] border border-[#25522F] text-sm text-[#FFFDF8] px-4 py-2.5 rounded-l-xl w-full focus:outline-none focus:border-[#B88A35] placeholder-[#E7E1D7]/50"
                  required
                />
                <button
                  type="submit"
                  className="bg-[#B88A35] hover:bg-[#D4A74F] text-[#FFFDF8] px-4 py-2.5 rounded-r-xl text-sm font-semibold transition-colors shrink-0"
                >
                  {newsletterBusy ? t("Joining…") : t("Join")}
                </button>
              </form>
              {newsletterStatus && (
                <p role="status" className="mt-2 text-xs text-[#E7E1D7]">
                  {newsletterStatus}
                </p>
              )}
            </div>
          </div>

          {/* Col 2: Retail Categories */}
          <div>
            <h4 className="font-serif text-base font-bold text-[#FFFDF8] mb-4">
              {t("Rice Varieties")}
            </h4>
            <ul className="space-y-2.5 text-sm">
              {riceCategories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/shop?category=${cat.slug}`}
                    className="hover:text-[#B88A35] transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li className="pt-1">
                <Link
                  href="/shop"
                  className="text-xs font-semibold text-[#B88A35] hover:underline"
                >
                  {t("View Full Catalog →")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: B2B Wholesale */}
          <div>
            <h4 className="font-serif text-base font-bold text-[#FFFDF8] mb-4">
              {t("B2B Wholesale")}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/wholesale"
                  className="hover:text-[#B88A35] transition-colors"
                >
                  Wholesale Overview
                </Link>
              </li>
              <li>
                <Link
                  href="/register/business"
                  className="hover:text-[#B88A35] transition-colors"
                >
                  Business Account Registration
                </Link>
              </li>
              <li>
                <Link
                  href="/wholesale/rfq"
                  className="hover:text-[#B88A35] transition-colors"
                >
                  Request Custom Quote (RFQ)
                </Link>
              </li>
              <li>
                <Link
                  href="/suppliers"
                  className="hover:text-[#B88A35] transition-colors"
                >
                  Verified Mill Directory
                </Link>
              </li>
              <li>
                <Link
                  href="/resources/wholesale-guide"
                  className="hover:text-[#B88A35] transition-colors"
                >
                  Volume Tier Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Producers & Help */}
          <div>
            <h4 className="font-serif text-base font-bold text-[#FFFDF8] mb-4">
              {t("Suppliers & Help")}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/register/supplier"
                  className="hover:text-[#B88A35] transition-colors"
                >
                  {t("Become a Supplier")}
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-[#B88A35] transition-colors"
                >
                  {t("About RiceMart")}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-[#B88A35] transition-colors"
                >
                  {t("Contact Support")}
                </Link>
              </li>
              <li>
                <Link
                  href="/track-order"
                  className="hover:text-[#B88A35] transition-colors"
                >
                  {t("Track Delivery")}
                </Link>
              </li>
              <li className="pt-2 text-xs text-[#E7E1D7]/70 space-y-1">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#B88A35]" />
                  <span>+1 (800) 742-3627</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#B88A35]" />
                  <span>support@ricemart.marketplace</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Currency & Legal */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#E7E1D7]/70">
          <div>
            &copy; {new Date().getFullYear()}{" "}
            {t("RiceMart Marketplace Inc. All rights reserved.")}
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/legal/privacy"
              className="hover:text-[#FFFDF8] transition-colors"
            >
              {t("Privacy Policy")}
            </Link>
            <Link
              href="/legal/terms"
              className="hover:text-[#FFFDF8] transition-colors"
            >
              {t("Terms of Service")}
            </Link>
            <Link
              href="/legal/refund"
              className="hover:text-[#FFFDF8] transition-colors"
            >
              {t("Return & Refund Policy")}
            </Link>
            <div className="flex items-center gap-1.5 text-[#B88A35]">
              <Globe className="w-3.5 h-3.5" />
              <span className="font-semibold">
                {t("English (US) • USD ($)")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
