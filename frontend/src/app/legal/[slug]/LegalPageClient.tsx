"use client";

import { useLocale } from "@/lib/i18n";

import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

type LegalContent = { title: string | null; description: string | null };
type LegalPageClientProps = {
  slug: string;
  content: LegalContent | null;
  error: string | null;
};

const fallbackTitles: Record<string, string> = {
  privacy: "Privacy Policy",
  terms: "Terms of Service",
  refund: "Return & Refund Policy",
};
export default function LegalPageClient({
  slug,
  content,
  error,
}: LegalPageClientProps) {
  const { t } = useLocale();
  const title = content?.title || t(fallbackTitles[slug] || "RiceMart Policy");
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6EF]">
      <Header />
      <main className="grow max-w-4xl mx-auto w-full px-4 sm:px-6 py-12">
        <Link href="/" className="text-sm font-semibold text-[#183A20]">
          {" "}
          {t("← Back to marketplace")}{" "}
        </Link>
        <h1 className="font-serif text-4xl font-bold mt-8">{title}</h1>
        {content?.description ? (
          <article className="mt-6 rounded-2xl bg-[#FFFDF8] border border-[#E7E1D7] p-6 sm:p-8 leading-relaxed whitespace-pre-wrap">
            {content.description}
          </article>
        ) : (
          <p
            role="alert"
            className="mt-6 rounded-2xl bg-[#FFFDF8] border border-[#E7E1D7] p-6 sm:p-8 text-[#686C64]"
          >
            {error ||
              t(
                "This policy has not been published in the backend yet. Please contact support for the current version.",
              )}
          </p>
        )}
      </main>
      <Footer />
    </div>
  );
}
