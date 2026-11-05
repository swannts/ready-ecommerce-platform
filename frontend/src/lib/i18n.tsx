"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Locale = "en" | "bn";
const STORAGE_KEY = "ricemart_locale_v1";
const translations: Record<string, string> = {
  "Shop": "কেনাকাটা", "Rice Varieties": "চালের ধরন", "Browse All Products →": "সব পণ্য দেখুন →",
  "Suppliers": "সরবরাহকারী", "Wholesale (B2B)": "পাইকারি (B2B)", "About": "আমাদের সম্পর্কে",
  "Resources": "তথ্য ও সহায়তা", "Sign In": "সাইন ইন", "Search rice products": "চালের পণ্য খুঁজুন",
  "Search rice (e.g. Basmati, Miniket...)": "চাল খুঁজুন (যেমন বাসমতি, মিনিকেট...)৷",
  "Shop All Rice": "সব চাল দেখুন", "View Catalog →": "ক্যাটালগ দেখুন →", "Wholesale (B2B) Orders": "পাইকারি অর্ডার (B2B)",
  "Bulk Tiers": "বাল্ক মূল্যস্তর", "Verified Suppliers & Mills": "যাচাইকৃত সরবরাহকারী ও মিল",
  "About RiceMart": "রাইসমার্ট সম্পর্কে", "Create Customer Account": "ক্রেতা অ্যাকাউন্ট তৈরি করুন",
  "Register as Business Buyer (B2B) →": "ব্যবসায়িক ক্রেতা হিসেবে নিবন্ধন →",
  "Nationwide Distribution": "সারাদেশে সরবরাহ", "Reliable logistics from single sacks to multi-ton consignments.": "এক বস্তা থেকে বহু টন পর্যন্ত নির্ভরযোগ্য পরিবহন।",
  "Verified Producers & Mills": "যাচাইকৃত উৎপাদক ও মিল", "Direct farm gate & certified industrial mill partner network.": "খামার থেকে সরাসরি ও প্রত্যয়িত শিল্প মিলের অংশীদার নেটওয়ার্ক।",
  "100% Quality Assurance": "১০০% গুণগত নিশ্চয়তা", "Moisture-controlled, lab-tested, and authentic grain varieties.": "আর্দ্রতা নিয়ন্ত্রিত, পরীক্ষাগারে যাচাইকৃত ও আসল চালের জাত।",
  "B2B Wholesale": "B2B পাইকারি", "RiceMart is the premier agricultural commerce marketplace connecting verified rice mills, farmers, and distributors directly with retail households and institutional B2B buyers.": "রাইসমার্ট একটি কৃষিপণ্য বাজার, যা যাচাইকৃত চালকল, কৃষক ও পরিবেশকদের সঙ্গে খুচরা ক্রেতা এবং প্রাতিষ্ঠানিক B2B ক্রেতাদের সরাসরি যুক্ত করে।",
  "Subscribe for Grain Market Price Index & Harvest Reports": "শস্য বাজারের মূল্যসূচক ও ফসল প্রতিবেদন পেতে সাবস্ক্রাইব করুন",
  "Enter business or personal email": "ব্যবসায়িক বা ব্যক্তিগত ইমেইল লিখুন", "Join": "যোগ দিন", "Joining…": "যোগ দিচ্ছে…", "View Full Catalog →": "সম্পূর্ণ ক্যাটালগ দেখুন →",
  "Wholesale Portal": "পাইকারি পোর্টাল", "Become a Supplier": "সরবরাহকারী হোন", "Direct Mill-to-Door Delivery Across 64 Districts": "৬৪ জেলায় মিল থেকে সরাসরি ডেলিভারি",
  "Search rice (e.g. Basmati, Miniket, Nazirshail, Chinigura...)": "চাল খুঁজুন (যেমন বাসমতি, মিনিকেট, নাজিরশাইল, চিনিগুঁড়া...)",
  "From Farm to Your Business": "খামার থেকে আপনার ব্যবসায়", "The Complete": "সম্পূর্ণ", "Rice Marketplace": "চালের বাজার",
  "Buy rice for your home or business — directly from verified farmers, mills, and suppliers.": "আপনার বাড়ি বা ব্যবসার জন্য চাল কিনুন—যাচাইকৃত কৃষক, মিল ও সরবরাহকারীদের কাছ থেকে সরাসরি।",
  "Buy for Home (B2C)": "বাড়ির জন্য কিনুন (B2C)", "Buy in Bulk (B2B)": "পাইকারি কিনুন (B2B)",
  "Search rice (e.g. Basmati, Miniket, Nazirshail...)": "চাল খুঁজুন (যেমন বাসমতি, মিনিকেট, নাজিরশাইল...)৷", "Search": "খুঁজুন",
  "Matching Varieties": "মিলে যাওয়া চালের ধরন", "Nationwide Delivery": "সারাদেশে ডেলিভারি", "Verified Suppliers": "যাচাইকৃত সরবরাহকারী", "Quality Assured": "গুণগত মান নিশ্চিত",
  "Curated Grains": "বাছাইকৃত চাল", "Shop by Rice Variety": "চালের ধরন অনুযায়ী কিনুন",
  "From regal aged Basmati to aromatic Chinigura and everyday Miniket staples.": "যত্নে সংরক্ষিত বাসমতি, সুগন্ধি চিনিগুঁড়া থেকে প্রতিদিনের মিনিকেট—সবই এখানে।",
  "View All Varieties": "সব ধরন দেখুন", "Varieties": "ধরন", "Direct Producer Network": "উৎপাদকদের সরাসরি নেটওয়ার্ক",
  "50,000+ Metric Tons Monthly Capacity": "মাসে ৫০,০০০+ মেট্রিক টন সক্ষমতা", "Institutional & Commercial Sourcing": "প্রাতিষ্ঠানিক ও বাণিজ্যিক সংগ্রহ",
  "Are You a Business Buyer?": "আপনি কি ব্যবসায়িক ক্রেতা?",
  "Get wholesale pricing, custom quotes, and dedicated support for restaurants, hotels, supermarkets, and catering enterprises.": "রেস্তোরাঁ, হোটেল, সুপারমার্কেট ও ক্যাটারিং ব্যবসার জন্য পাইকারি মূল্য, বিশেষ দর এবং নিবেদিত সহায়তা নিন।",
  "Sacks to Container Loads": "বস্তা থেকে কনটেইনার লোড", "Formal Invoicing & GST/VAT": "আনুষ্ঠানিক চালান ও GST/VAT", "Batch Quality Certificates": "ব্যাচের গুণমান সনদ",
  "Create a Business Account": "ব্যবসায়িক অ্যাকাউন্ট তৈরি করুন", "Request Custom Quote": "বিশেষ দর অনুরোধ করুন",
};

type LocaleContextValue = { locale: Locale; setLocale: (locale: Locale) => void; t: (text: string) => string };
const LocaleContext = createContext<LocaleContextValue>({ locale: "en", setLocale: () => undefined, t: (text) => text });

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const browser = navigator.language.toLowerCase().startsWith("bn") ? "bn" : "en";
    const next: Locale = stored === "bn" || stored === "en" ? stored : browser;
    setLocaleState(next);
    document.documentElement.lang = next;
  }, []);
  const setLocale = (next: Locale) => {
    window.localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.lang = next;
    setLocaleState(next);
    window.dispatchEvent(new Event("ricemart-locale-change"));
    window.location.reload();
  };
  const value = useMemo(() => ({ locale, setLocale, t: (text: string) => locale === "bn" ? translations[text] || text : text }), [locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() { return useContext(LocaleContext); }
export function getApiLocale(): Locale {
  if (typeof window === "undefined") return "en";
  return window.localStorage.getItem(STORAGE_KEY) === "bn" ? "bn" : "en";
}
