"use client";

import { useLocale } from "@/lib/i18n";

export function LocaleToggle() {
  const { locale, setLocale, t } = useLocale();

  return (
    <button
      type="button"
      onClick={() => setLocale(locale === "en" ? "bn" : "en")}
      className="rounded-lg border border-[#E7E1D7] px-2.5 py-2 text-xs font-bold text-[#183A20] hover:bg-[#FAF6EF]"
      aria-label={locale === "en" ? "বাংলায় দেখুন" : t("View in English")}
    >
      {locale === "en" ? "বাংলা" : "EN"}
    </button>
  );
}
