import { cookies } from "next/headers";
import SuppliersClient from "./SuppliersClient";
import { getSuppliers } from "@/lib/api";
import { Locale } from "@/lib/i18n";

export default async function SuppliersPage() {
  const storedLocale = (await cookies()).get("ricemart_locale_v1")?.value;
  const locale: Locale = storedLocale === "bn" ? "bn" : "en";
  const suppliers = await getSuppliers(locale).catch(() => []);
  return <SuppliersClient suppliers={suppliers} />;
}
