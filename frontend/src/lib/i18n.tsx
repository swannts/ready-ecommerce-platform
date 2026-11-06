"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Locale = "en" | "bn";
const STORAGE_KEY = "ricemart_locale_v1";
const translations: Record<string, string> = {
  Shop: "কেনাকাটা",
  "Rice Varieties": "চালের ধরন",
  "Browse All Products →": "সব পণ্য দেখুন →",
  Suppliers: "সরবরাহকারী",
  "Wholesale (B2B)": "পাইকারি (B2B)",
  About: "আমাদের সম্পর্কে",
  Resources: "তথ্য ও সহায়তা",
  "Sign In": "সাইন ইন",
  "Search rice products": "চালের পণ্য খুঁজুন",
  "Search rice (e.g. Basmati, Miniket...)":
    "চাল খুঁজুন (যেমন বাসমতি, মিনিকেট...)৷",
  "Shop All Rice": "সব চাল দেখুন",
  "View Catalog →": "ক্যাটালগ দেখুন →",
  "Wholesale (B2B) Orders": "পাইকারি অর্ডার (B2B)",
  "Bulk Tiers": "বাল্ক মূল্যস্তর",
  "Verified Suppliers & Mills": "যাচাইকৃত সরবরাহকারী ও মিল",
  "About RiceMart": "রাইসমার্ট সম্পর্কে",
  "Create Customer Account": "ক্রেতা অ্যাকাউন্ট তৈরি করুন",
  "Register as Business Buyer (B2B) →": "ব্যবসায়িক ক্রেতা হিসেবে নিবন্ধন →",
  "Nationwide Distribution": "সারাদেশে সরবরাহ",
  "Reliable logistics from single sacks to multi-ton consignments.":
    "এক বস্তা থেকে বহু টন পর্যন্ত নির্ভরযোগ্য পরিবহন।",
  "Verified Producers & Mills": "যাচাইকৃত উৎপাদক ও মিল",
  "Direct farm gate & certified industrial mill partner network.":
    "খামার থেকে সরাসরি ও প্রত্যয়িত শিল্প মিলের অংশীদার নেটওয়ার্ক।",
  "100% Quality Assurance": "১০০% গুণগত নিশ্চয়তা",
  "Moisture-controlled, lab-tested, and authentic grain varieties.":
    "আর্দ্রতা নিয়ন্ত্রিত, পরীক্ষাগারে যাচাইকৃত ও আসল চালের জাত।",
  "B2B Wholesale": "B2B পাইকারি",
  "RiceMart is the premier agricultural commerce marketplace connecting verified rice mills, farmers, and distributors directly with retail households and institutional B2B buyers.":
    "রাইসমার্ট একটি কৃষিপণ্য বাজার, যা যাচাইকৃত চালকল, কৃষক ও পরিবেশকদের সঙ্গে খুচরা ক্রেতা এবং প্রাতিষ্ঠানিক B2B ক্রেতাদের সরাসরি যুক্ত করে।",
  "Subscribe for Grain Market Price Index & Harvest Reports":
    "শস্য বাজারের মূল্যসূচক ও ফসল প্রতিবেদন পেতে সাবস্ক্রাইব করুন",
  "Enter business or personal email": "ব্যবসায়িক বা ব্যক্তিগত ইমেইল লিখুন",
  Join: "যোগ দিন",
  "Joining…": "যোগ দিচ্ছে…",
  "View Full Catalog →": "সম্পূর্ণ ক্যাটালগ দেখুন →",
  "Wholesale Portal": "পাইকারি পোর্টাল",
  "Become a Supplier": "সরবরাহকারী হোন",
  "Direct Mill-to-Door Delivery Across 64 Districts":
    "৬৪ জেলায় মিল থেকে সরাসরি ডেলিভারি",
  "Search rice (e.g. Basmati, Miniket, Nazirshail, Chinigura...)":
    "চাল খুঁজুন (যেমন বাসমতি, মিনিকেট, নাজিরশাইল, চিনিগুঁড়া...)",
  "From Farm to Your Business": "খামার থেকে আপনার ব্যবসায়",
  "The Complete": "সম্পূর্ণ",
  "Rice Marketplace": "চালের বাজার",
  "Buy rice for your home or business — directly from verified farmers, mills, and suppliers.":
    "আপনার বাড়ি বা ব্যবসার জন্য চাল কিনুন—যাচাইকৃত কৃষক, মিল ও সরবরাহকারীদের কাছ থেকে সরাসরি।",
  "Buy for Home (B2C)": "বাড়ির জন্য কিনুন (B2C)",
  "Buy in Bulk (B2B)": "পাইকারি কিনুন (B2B)",
  "Search rice (e.g. Basmati, Miniket, Nazirshail...)":
    "চাল খুঁজুন (যেমন বাসমতি, মিনিকেট, নাজিরশাইল...)৷",
  Search: "খুঁজুন",
  "Matching Varieties": "মিলে যাওয়া চালের ধরন",
  "Nationwide Delivery": "সারাদেশে ডেলিভারি",
  "Verified Suppliers": "যাচাইকৃত সরবরাহকারী",
  "Quality Assured": "গুণগত মান নিশ্চিত",
  "Curated Grains": "বাছাইকৃত চাল",
  "Shop by Rice Variety": "চালের ধরন অনুযায়ী কিনুন",
  "From regal aged Basmati to aromatic Chinigura and everyday Miniket staples.":
    "যত্নে সংরক্ষিত বাসমতি, সুগন্ধি চিনিগুঁড়া থেকে প্রতিদিনের মিনিকেট—সবই এখানে।",
  "View All Varieties": "সব ধরন দেখুন",
  Varieties: "ধরন",
  "Direct Producer Network": "উৎপাদকদের সরাসরি নেটওয়ার্ক",
  "50,000+ Metric Tons Monthly Capacity": "মাসে ৫০,০০০+ মেট্রিক টন সক্ষমতা",
  "Institutional & Commercial Sourcing": "প্রাতিষ্ঠানিক ও বাণিজ্যিক সংগ্রহ",
  "Are You a Business Buyer?": "আপনি কি ব্যবসায়িক ক্রেতা?",
  "Get wholesale pricing, custom quotes, and dedicated support for restaurants, hotels, supermarkets, and catering enterprises.":
    "রেস্তোরাঁ, হোটেল, সুপারমার্কেট ও ক্যাটারিং ব্যবসার জন্য পাইকারি মূল্য, বিশেষ দর এবং নিবেদিত সহায়তা নিন।",
  "Sacks to Container Loads": "বস্তা থেকে কনটেইনার লোড",
  "Formal Invoicing & GST/VAT": "আনুষ্ঠানিক চালান ও GST/VAT",
  "Batch Quality Certificates": "ব্যাচের গুণমান সনদ",
  "Create a Business Account": "ব্যবসায়িক অ্যাকাউন্ট তৈরি করুন",
  "Request Custom Quote": "বিশেষ দর অনুরোধ করুন",
  "Back to Marketplace": "মার্কেটপ্লেসে ফিরুন",
  "Back to marketplace": "মার্কেটপ্লেসে ফিরুন",
  "Back to Homepage": "হোমপেজে ফিরুন",
  "Continue Shopping": "কেনাকাটা চালিয়ে যান",
  "Explore Rice Catalog": "চালের ক্যাটালগ দেখুন",
  "Add to Cart": "কার্টে যোগ করুন",
  "Added to Cart!": "কার্টে যোগ হয়েছে!",
  "Contact Support": "সহায়তায় যোগাযোগ করুন",
  "Contact support": "সহায়তায় যোগাযোগ করুন",
  "Sign in": "সাইন ইন",
  "Delivery Destination:": "ডেলিভারির ঠিকানা:",
  "Payment Method:": "পেমেন্ট পদ্ধতি:",
  "Total Items:": "মোট পণ্য:",
  "Total Paid:": "মোট পরিশোধ:",
  Subtotal: "উপমোট",
  "Direct Mill Freight": "মিল থেকে সরাসরি পরিবহন",
  "Grand Total": "সর্বমোট",
  "Proceed to Checkout": "চেকআউটে যান",
  "Mill Direct Checkout": "মিল থেকে সরাসরি চেকআউট",
  "Cash on Delivery": "ক্যাশ অন ডেলিভারি",
  "Card / Online": "কার্ড / অনলাইন",
  "Household Customer (B2C)": "গৃহস্থালি ক্রেতা (B2C)",
  "Customer (B2C)": "ক্রেতা (B2C)",
  "Business (B2B)": "ব্যবসা (B2B)",
  "B2B Institutional Procurement": "প্রাতিষ্ঠানিক B2B সংগ্রহ",
  "All Grain Types": "সব ধরনের চাল",
  "Extra Long": "অতি লম্বা",
  "Long Grain": "লম্বা দানার চাল",
  "Medium Grain": "মাঝারি দানার চাল",
  "Short Grain": "ছোট দানার চাল",
  "Featured First": "বাছাইকৃত আগে",
  "Price: Low to High": "দাম: কম থেকে বেশি",
  "Price: High to Low": "দাম: বেশি থেকে কম",
  "Top Rated": "সর্বোচ্চ রেটিং",
  "Explore All 120+ Rice Products": "১২০টির বেশি চালের পণ্য দেখুন",
  "Monthly Capacity:": "মাসিক সক্ষমতা:",
  "Established:": "প্রতিষ্ঠিত:",
  "Rating:": "রেটিং:",
  "RiceMart help desk": "রাইসমার্ট সহায়তা কেন্দ্র",
  "Our Heritage & Mission": "আমাদের ঐতিহ্য ও লক্ষ্য",
  "For Households (B2C)": "পরিবারের জন্য (B2C)",
  "For Enterprise & B2B": "প্রতিষ্ঠান ও B2B-এর জন্য",
  "Track Your Delivery": "আপনার ডেলিভারি ট্র্যাক করুন",
  "Delivery updates": "ডেলিভারির আপডেট",
  "Request a Custom Quote": "বিশেষ দর অনুরোধ করুন",
  "Bulk procurement": "বাল্ক সংগ্রহ",
  "Submit Wholesale RFQ": "পাইকারি RFQ জমা দিন",
  "Search variety, brand...": "চালের ধরন বা ব্র্যান্ড খুঁজুন...",
  "Filter by grain type": "চালের ধরন অনুযায়ী ফিল্টার",
  "Sort products": "পণ্য সাজান",
  "Reset Filters": "ফিল্টার রিসেট করুন",
  Wishlist: "ইচ্ছেতালিকা",
  "Remove from wishlist": "ইচ্ছেতালিকা থেকে সরান",
  "Decrease quantity": "পরিমাণ কমান",
  "Increase quantity": "পরিমাণ বাড়ান",
  "Remove item": "পণ্য সরান",
  "Close checkout": "চেকআউট বন্ধ করুন",
  "RiceMart Home": "রাইসমার্ট হোম",
  "Main Navigation": "প্রধান নেভিগেশন",
  "My Account": "আমার অ্যাকাউন্ট",
  "Toggle mobile navigation": "মোবাইল নেভিগেশন টগল করুন",
  "Search rice varieties, categories, or suppliers":
    "চালের ধরন, ক্যাটাগরি বা সরবরাহকারী খুঁজুন",
  "Loading page": "পৃষ্ঠা লোড হচ্ছে",
  "Loading page content…": "পৃষ্ঠার বিষয়বস্তু লোড হচ্ছে…",
  "Loading products": "পণ্য লোড হচ্ছে",
  "Loading products…": "পণ্য লোড হচ্ছে…",
  "Loading rice categories": "চালের ক্যাটাগরি লোড হচ্ছে",
  "Loading rice categories…": "চালের ক্যাটাগরি লোড হচ্ছে…",
  "Loading verified suppliers…": "যাচাইকৃত সরবরাহকারী লোড হচ্ছে…",
  "Loading product details…": "পণ্যের বিবরণ লোড হচ্ছে…",
  "Loading policy": "নীতিমালা লোড হচ্ছে",
  "Loading volume tiers": "পরিমাণভিত্তিক মূল্যস্তর লোড হচ্ছে",
  "Common uses:": "সাধারণ ব্যবহার:",
  "BDT (৳)": "BDT (৳)",
  "25 kg sacks": "২৫ কেজির বস্তা",
  "50 kg sacks": "৫০ কেজির বস্তা",
  "1 ton bulk bags": "১ টনের বাল্ক ব্যাগ",
  Custom: "কাস্টম",
  "100% Direct From Source": "১০০% সরাসরি উৎস থেকে",
  "Bangladesh • BDT (৳)": "বাংলাদেশ • টাকা (৳)",
  "Rice Grain Quality Guide": "চালের গুণমান নির্দেশিকা",
  "B2B Procurement Manual": "B2B সংগ্রহ নির্দেশিকা",
  "Customer Support & FAQs": "গ্রাহক সহায়তা ও FAQ",
  "Add package": "প্যাকেজ যোগ করুন",
  "All Products": "সব পণ্য",
  "All Rice Varieties & Packaging": "সব চালের ধরন ও প্যাকেজিং",
  "All Varieties": "সব ধরন",
  "Available packages": "উপলভ্য প্যাকেজ",
  "B2B Commercial Account": "B2B ব্যবসায়িক অ্যাকাউন্ট",
  "B2B Purchasing Volume Tiers": "B2B ক্রয় পরিমাণের স্তর",
  "Back to catalog": "ক্যাটালগে ফিরুন",
  "Browse Catalog": "ক্যাটালগ দেখুন",
  "Business Phone": "ব্যবসার ফোন",
  "Business Type": "ব্যবসার ধরন",
  "Business email": "ব্যবসার ইমেইল",
  "Buyer resource": "ক্রেতার তথ্য",
  "City / District": "শহর / জেলা",
  "Clear All Filters": "সব ফিল্টার মুছুন",
  "Clear All Saved Items": "সব সংরক্ষিত পণ্য মুছুন",
  "Clear Cart": "কার্ট খালি করুন",
  "Company / Restaurant / Trading Name": "কোম্পানি / রেস্তোরাঁ / ব্যবসার নাম",
  "Company Name": "কোম্পানির নাম",
  "Contact Person": "যোগাযোগের ব্যক্তি",
  "Contact Phone Number": "যোগাযোগের ফোন নম্বর",
  "Contact person": "যোগাযোগের ব্যক্তি",
  "Corporate Email": "প্রাতিষ্ঠানিক ইমেইল",
  "Create Your Account": "আপনার অ্যাকাউন্ট তৈরি করুন",
  "Create secure password": "নিরাপদ পাসওয়ার্ড তৈরি করুন",
  "Custom Brand Packaging": "নিজস্ব ব্র্যান্ডের প্যাকেজিং",
  "Delivery & Payment Details": "ডেলিভারি ও পেমেন্টের বিবরণ",
  Details: "বিস্তারিত",
  "Direct Phone / WhatsApp": "সরাসরি ফোন / WhatsApp",
  "District, Country": "জেলা, দেশ",
  "Don&apos;t have an account yet?": "এখনও অ্যাকাউন্ট নেই?",
  "Email Address": "ইমেইল ঠিকানা",
  "Email Address or Phone": "ইমেইল ঠিকানা বা ফোন",
  "Email or Mobile Number": "ইমেইল বা মোবাইল নম্বর",
  "Estimated Monthly Grain Requirement (kg)":
    "আনুমানিক মাসিক চালের চাহিদা (কেজি)",
  "Facility Location (Division / District)": "কারখানার অবস্থান (বিভাগ / জেলা)",
  "Forgot?": "পাসওয়ার্ড ভুলে গেছেন?",
  "Full Name": "পুরো নাম",
  Home: "হোম",
  "Hotels & Restaurants": "হোটেল ও রেস্তোরাঁ",
  "Industrial & Export": "শিল্প ও রপ্তানি",
  "Live Marketplace Catalog": "লাইভ মার্কেটপ্লেস ক্যাটালগ",
  Message: "বার্তা",
  "Mill or Farm Cooperative Name": "মিল বা কৃষক সমবায়ের নাম",
  "Monthly Milling Capacity (Tons)": "মাসিক চালকলের সক্ষমতা (টন)",
  "Most Popular": "সর্বাধিক জনপ্রিয়",
  "No Matching Products Found": "মিলছে এমন পণ্য পাওয়া যায়নি",
  "No Saved Items Yet": "এখনও কোনো পণ্য সংরক্ষণ করা হয়নি",
  "Order Confirmed": "অর্ডার নিশ্চিত হয়েছে",
  "Order Summary": "অর্ডারের সারাংশ",
  Packaging: "প্যাকেজিং",
  "Packaging Size": "প্যাকেজের আকার",
  Password: "পাসওয়ার্ড",
  Phone: "ফোন",
  "Place Another Order": "আরেকটি অর্ডার করুন",
  "Postal Code": "পোস্টাল কোড",
  "Primary Rice Varieties Produced": "উৎপাদিত প্রধান চালের ধরন",
  "Promotional Voucher": "প্রোমোশনাল ভাউচার",
  "Procurement Officer / Contact": "ক্রয় কর্মকর্তা / যোগাযোগ",
  "Purchasing for a restaurant or business?":
    "রেস্তোরাঁ বা ব্যবসার জন্য কিনছেন?",
  "RFQ Submitted Successfully!": "RFQ সফলভাবে জমা হয়েছে!",
  "Recipient Full Name": "প্রাপকের পুরো নাম",
  Requirements: "চাহিদা",
  "Retailers & Cafes": "খুচরা বিক্রেতা ও ক্যাফে",
  "Rice Variety": "চালের ধরন",
  "Saved Collections": "সংরক্ষিত তালিকা",
  "Sell Rice on RiceMart": "রাইসমার্টে চাল বিক্রি করুন",
  "Sign In here": "এখানে সাইন ইন করুন",
  "Sign In to RiceMart": "রাইসমার্টে সাইন ইন করুন",
  "Street Delivery Address": "সড়কের ডেলিভারি ঠিকানা",
  "Submit Another Inquiry": "আরেকটি অনুরোধ জমা দিন",
  "Target Volume (kg)": "লক্ষ্য পরিমাণ (কেজি)",
  "Tax ID / Trade License #": "ট্যাক্স আইডি / ট্রেড লাইসেন্স নম্বর",
  "Tax or Registration ID": "ট্যাক্স বা নিবন্ধন আইডি",
  "Thank You for Your Order!": "আপনার অর্ডারের জন্য ধন্যবাদ!",
  "Tier 1": "স্তর ১",
  "Tier 2": "স্তর ২",
  "Tier 3": "স্তর ৩",
  "Try adjusting your filter criteria or search keyword.":
    "ফিল্টার বা অনুসন্ধানের শব্দ পরিবর্তন করে দেখুন।",
  "Variety:": "চালের ধরন:",
  Verified: "যাচাইকৃত",
  "Verified Mill Selections": "যাচাইকৃত মিলের পণ্য",
  "Verified Rice Mills & Cooperatives": "যাচাইকৃত চালকল ও সমবায়",
  "Verified supplier": "যাচাইকৃত সরবরাহকারী",
  "View Mill Catalog →": "মিলের ক্যাটালগ দেখুন →",
  "View product →": "পণ্য দেখুন →",
  "Volume Tier Guide": "পরিমাণভিত্তিক মূল্য নির্দেশিকা",
  "Wholesale & Bulk Rice Sourcing": "পাইকারি ও বাল্ক চাল সংগ্রহ",
  "Wholesale Tier": "পাইকারি মূল্যস্তর",
  "Wholesale pricing": "পাইকারি মূল্য",
  "Your Cart is Empty": "আপনার কার্ট খালি",
  "Your Name": "আপনার নাম",
  "Your Saved Rice Varieties": "আপনার সংরক্ষিত চালের ধরন",
  "Your Shopping Cart": "আপনার শপিং কার্ট",
  "e.g. 1500": "যেমন ১৫০০",
  "e.g. Dinajpur Auto Rice Mills Ltd.": "যেমন দিনাজপুর অটো রাইস মিলস লিমিটেড",
  "e.g. RICEMART10": "যেমন RICEMART10",
  "e.g. Royal Bengal Hospitality Ltd.":
    "যেমন রয়্যাল বেঙ্গল হসপিটালিটি লিমিটেড",
  "e.g. Within 2 weeks": "যেমন ২ সপ্তাহের মধ্যে",
  "e.g. buyer@restaurant.com or +1 800...":
    "যেমন buyer@restaurant.com বা +1 800...",
  "e.g. name@email.com or +1 800...": "যেমন name@email.com বা +1 800...",
  "← Back to marketplace": "← মার্কেটপ্লেসে ফিরুন",
  "← Browse the rice catalog": "← চালের ক্যাটালগ দেখুন",
  "← Wholesale overview": "← পাইকারি বিবরণ",
  "Basmati (Super Kernel)": "বাসমতি (সুপার কার্নেল)",
  "Chinigura (Aromatic)": "চিনিগুঁড়া (সুগন্ধি)",
  Kataribhog: "কাতারিভোগ",
  "Miniket (Silky White)": "মিনিকেট (সিল্কি হোয়াইট)",
  "Nazirshail (Old Crop)": "নাজিরশাইল (পুরোনো ফসল)",
  "Parboiled Coarse / Fine": "সিদ্ধ চাল মোটা / চিকন",
  "Restaurant / Food Service": "রেস্তোরাঁ / খাদ্য পরিষেবা",
  "Retail Supermarket / Grocer": "খুচরা সুপারমার্কেট / মুদি দোকান",
  "Wholesale Trader": "পাইকারি ব্যবসায়ী",
  "Hotel / Resort": "হোটেল / রিসোর্ট",
  "Institutional Catering": "প্রাতিষ্ঠানিক ক্যাটারিং",
  "25kg Sacks": "২৫ কেজির বস্তা",
  "50kg Sacks (Jute / Poly)": "৫০ কেজির বস্তা (পাট / পলিব্যাগ)",
  "1 Ton Jumbo Bags": "১ টনের জাম্বো ব্যাগ",
  "10 – 49 kg": "১০–৪৯ কেজি",
  "50 – 499 kg": "৫০–৪৯৯ কেজি",
  "100 – 499 kg (Sacks)": "১০০–৪৯৯ কেজি (বস্তা)",
  "500 – 1,999 kg (Pallets)": "৫০০–১,৯৯৯ কেজি (প্যালেট)",
  "2,000 – 9,999 kg (Truckload)": "২,০০০–৯,৯৯৯ কেজি (ট্রাকলোড)",
  "10,000+ kg (Commercial Mill Contracts)":
    "১০,০০০+ কেজি (বাণিজ্যিক মিল চুক্তি)",
  "500+ kg (Metric Tons)": "৫০০+ কেজি (মেট্রিক টন)",
  "Grade A+": "গ্রেড A+",
  "1 kg to 25 kg bags": "১ থেকে ২৫ কেজির ব্যাগ",
  "Direct From Paddy Fields to Homes and Commercial Kitchens":
    "ধানক্ষেত থেকে সরাসরি ঘর ও বাণিজ্যিক রান্নাঘরে",
  "Featured Rice Products": "বাছাইকৃত চালের পণ্য",
  "Household (B2C)": "গৃহস্থালি (B2C)",
  Organic: "জৈব",
  Popular: "জনপ্রিয়",
  "Retail Price": "খুচরা মূল্য",
  "Shop this variety →": "এই চাল কিনুন →",
  "Register as a Business Buyer (B2B) →":
    "ব্যবসায়িক ক্রেতা হিসেবে নিবন্ধন করুন (B2B) →",
  "• • • • • • • •": "• • • • • • • •",
  "GRADE A+": "গ্রেড A+",
  "+1 800...": "+1 800...",
  "/ kg": "/ কেজি",
  "Delivery Destination": "ডেলিভারির ঠিকানা",
  "Looking to buy in 500+ kg bulk? Get B2B Quote":
    "৫০০ কেজির বেশি কিনবেন? B2B দর নিন",
  "Payment Method": "পেমেন্ট পদ্ধতি",
  "Processing Order via Redux Thunk...": "অর্ডার প্রক্রিয়াকরণ হচ্ছে…",
  "Producer & Mill Onboarding": "উৎপাদক ও মিল নিবন্ধন",
  RICEMART10: "RICEMART10",
  "Redux Thunk RFQ Pipeline": "RFQ জমা হচ্ছে…",
  "Register as a Business Buyer": "ব্যবসায়িক ক্রেতা হিসেবে নিবন্ধন করুন",
  Remove: "সরান",
  "Request a Custom Mill Contract Quote": "মিলের সঙ্গে কাস্টম চুক্তির দর নিন",
  "Submitting RFQ via Redux Thunk...": "RFQ জমা হচ্ছে…",
  "••••••••": "••••••••",
  "RiceMart was founded with a unified mission: to modernize the age-old rice trade by eliminating multiple layers of middlemen, empowering farmers and accredited mills, and delivering pure, authentic grain varieties directly to families and businesses.":
    "রাইসমার্টের লক্ষ্য হলো মধ্যস্বত্বভোগীর স্তর কমিয়ে, কৃষক ও স্বীকৃত মিলকে ক্ষমতায়ন করে এবং বিশুদ্ধ চাল সরাসরি পরিবার ও ব্যবসায় পৌঁছে দিয়ে ঐতিহ্যবাহী চালের বাণিজ্যকে আধুনিক করা।",
  "Traditional grain distribution is plagued by adulteration, artificial polishing, and opaque pricing. RiceMart provides a transparent, tech-enabled digital marketplace where every sack is traceable to its certified mill and harvest region.":
    "প্রচলিত শস্য বিতরণে ভেজাল, কৃত্রিম পালিশ ও অস্বচ্ছ মূল্য একটি বড় সমস্যা। রাইসমার্ট স্বচ্ছ ডিজিটাল বাজারের মাধ্যমে প্রতিটি বস্তার প্রত্যয়িত মিল ও উৎপাদন অঞ্চল শনাক্ত করার সুযোগ দেয়।",
  "Access aromatic, organic, and daily rice varieties in convenient 1 kg to 25 kg bags with doorstep delivery.":
    "১ থেকে ২৫ কেজির সুবিধাজনক প্যাকেটে সুগন্ধি, জৈব ও দৈনন্দিন চালের ধরন ঘরে বসে পান।",
  "Transparent volume pricing, custom quotations, laboratory moisture reports, and steady scheduled shipments for hotels, restaurants, and retailers.":
    "হোটেল, রেস্তোরাঁ ও খুচরা বিক্রেতাদের জন্য স্বচ্ছ পরিমাণভিত্তিক মূল্য, কাস্টম কোটেশন, পরীক্ষাগারের আর্দ্রতা প্রতিবেদন এবং নিয়মিত চালান।",
  "Send our team a question about products, suppliers, orders, or business purchasing. Your message is submitted to the RiceMart support system.":
    "পণ্য, সরবরাহকারী, অর্ডার বা ব্যবসায়িক কেনাকাটা নিয়ে আমাদের দলকে প্রশ্ন পাঠান। আপনার বার্তাটি রাইসমার্ট সহায়তা ব্যবস্থায় জমা হবে।",
  "Order tracking is available for signed-in customers through their order history. Sign in to view backend order and delivery status, or contact support with your order reference for help.":
    "সাইন ইন করা ক্রেতারা অর্ডার ইতিহাসে ডেলিভারি ট্র্যাক করতে পারবেন। অর্ডার ও ডেলিভারির অবস্থা দেখতে সাইন ইন করুন, অথবা অর্ডার নম্বরসহ সহায়তায় যোগাযোগ করুন।",
  "Share your volume, destination, and packaging needs. Your request will be recorded by the backend support system for RiceMart follow-up.":
    "আপনার চাহিদার পরিমাণ, গন্তব্য ও প্যাকেজিংয়ের তথ্য দিন। রাইসমার্টের দল যোগাযোগের জন্য আপনার অনুরোধটি নথিভুক্ত করবে。",
  "Suppliers & Help": "সরবরাহকারী ও সহায়তা",
  "Track Delivery": "ডেলিভারি ট্র্যাক করুন",
  "Privacy Policy": "গোপনীয়তা নীতি",
  "Terms of Service": "সেবার শর্তাবলি",
  "Return & Refund Policy": "ফেরত ও রিফান্ড নীতি",
  "View in English": "ইংরেজিতে দেখুন",
  "Loading suppliers": "সরবরাহকারী লোড হচ্ছে",
  "Loading product details": "পণ্যের বিবরণ লোড হচ্ছে",
  "RiceMart Policy": "রাইসমার্ট নীতিমালা",
  "RiceMart Marketplace Inc. All rights reserved.":
    "রাইসমার্ট মার্কেটপ্লেস ইনকরপোরেটেড। সর্বস্বত্ব সংরক্ষিত।",
};

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (text: string) => string;
};
const LocaleContext = createContext<LocaleContextValue>({
  locale: "en",
  setLocale: () => undefined,
  t: (text) => text,
});

export function LocaleProvider({
  children,
  initialLocale = "en",
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const next: Locale =
      stored === "bn" || stored === "en" ? stored : initialLocale;
    setLocaleState(next);
    document.documentElement.lang = next;
  }, [initialLocale]);
  const setLocale = (next: Locale) => {
    window.localStorage.setItem(STORAGE_KEY, next);
    document.cookie = `${STORAGE_KEY}=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
    document.documentElement.lang = next;
    setLocaleState(next);
    window.dispatchEvent(new Event("ricemart-locale-change"));
    window.location.reload();
  };
  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t: (text: string) =>
        locale === "bn" ? translations[text] || text : text,
    }),
    [locale],
  );
  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
export function getApiLocale(): Locale {
  if (typeof window === "undefined") return "en";
  return window.localStorage.getItem(STORAGE_KEY) === "bn" ? "bn" : "en";
}
