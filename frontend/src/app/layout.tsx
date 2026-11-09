import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import StoreProvider from "@/store/StoreProvider";
import { ShowcaseNotice } from "@/components/layout/ShowcaseNotice";
import { Locale, LocaleProvider } from "@/lib/i18n";
import { getCategories, getProducts } from "@/lib/api";
import "./globals.css";

export const metadata: Metadata = {
  title: "RiceMart — The Complete Multi-Vendor Rice Marketplace",
  description:
    "Buy premium rice for home (B2C) or bulk wholesale for business (B2B) directly from verified farmers, mills, and suppliers.",
  keywords: [
    "RiceMart",
    "Rice Marketplace",
    "Basmati Rice",
    "Miniket Rice",
    "Wholesale Rice",
    "B2B Rice",
    "Rice Mills",
    "Grain Suppliers",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const storedLocale = cookieStore.get("ricemart_locale_v1")?.value;
  const locale: Locale = storedLocale === "bn" ? "bn" : "en";
  const [items, categories] = await Promise.all([
    getProducts({ sortBy: "featured" }, locale).catch(() => []),
    getCategories(locale).catch(() => []),
  ]);

  return (
    <html lang={locale}>
      <body className="antialiased min-h-screen flex flex-col bg-[#FAF6EF] text-[#19221B]">
        <StoreProvider initialCatalog={{ items, categories }}>
          <LocaleProvider initialLocale={locale}>
            <ShowcaseNotice />
            {children}
          </LocaleProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
