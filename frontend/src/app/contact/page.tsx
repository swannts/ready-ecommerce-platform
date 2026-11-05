"use client";

import { useLocale } from "@/lib/i18n";

import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SupportRequestForm } from "@/components/layout/SupportRequestForm";

export default function ContactPage() {
  const { t } = useLocale();
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6EF]">
      <Header />
      <main className="grow max-w-5xl mx-auto w-full px-4 sm:px-6 py-12">
        <Link href="/" className="text-sm font-semibold text-[#183A20]">
          {" "}
          {t("← Back to marketplace")}{" "}
        </Link>
        <p className="mt-8 text-xs font-bold uppercase tracking-widest text-[#B88A35]">
          {" "}
          {t("RiceMart help desk")}{" "}
        </p>
        <h1 className="font-serif text-4xl font-bold mt-2">
          {t("Contact Support")}
        </h1>
        <p className="mt-3 mb-8 max-w-2xl text-[#686C64]">
          {" "}
          {t(
            "Send our team a question about products, suppliers, orders, or business purchasing. Your message is submitted to the RiceMart support system.",
          )}{" "}
        </p>
        <SupportRequestForm />
      </main>
      <Footer />
    </div>
  );
}
