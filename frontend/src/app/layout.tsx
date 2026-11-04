import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import StoreProvider from "@/store/StoreProvider";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="antialiased min-h-screen flex flex-col bg-[#FAF6EF] text-[#19221B]">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
