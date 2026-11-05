import { cookies } from "next/headers";
import LegalPageClient from "./LegalPageClient";
import { getLegalPage } from "@/lib/api";
import { Locale } from "@/lib/i18n";

export default async function LegalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const storedLocale = (await cookies()).get("ricemart_locale_v1")?.value;
  const locale: Locale = storedLocale === "bn" ? "bn" : "en";
  let content: { title: string | null; description: string | null } | null =
    null;
  let error: string | null = null;

  try {
    content = (await getLegalPage(slug, locale)).content;
  } catch (reason) {
    error =
      reason instanceof Error
        ? reason.message
        : "Policy content is unavailable.";
  }

  return <LegalPageClient slug={slug} content={content} error={error} />;
}
