"use client";

import { Info } from "lucide-react";
import { useLocale } from "@/lib/i18n";

export function ShowcaseNotice() {
  const { t } = useLocale();
  return (
    <div className="flex items-center justify-center gap-2 bg-[#B88A35] px-4 py-2 text-center text-xs font-semibold text-[#19221B] sm:text-sm">
      <Info className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{t("Showcase demo: product photos and catalog data are illustrative. No real orders or requests are sent.")}</span>
    </div>
  );
}
