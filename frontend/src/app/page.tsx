import React from "react";
import { Header } from "@/components/layout/Header";
import { HeroSection } from "@/components/home/HeroSection";
import { QuickAccessNavigation } from "@/components/home/QuickAccessNavigation";
import { RiceVarietySection } from "@/components/home/RiceVarietySection";
import { WholesaleBanner } from "@/components/home/WholesaleBanner";
import { FeaturedProductsSection } from "@/components/home/FeaturedProductsSection";
import { Footer } from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6EF]">
      {/* 4.1 Header / Navigation */}
      <Header />

      <main className="grow">
        {/* 5. Hero Section with split layout, search & trust indicators */}
        <HeroSection />

        {/* 6. Quick Access Navigation strip */}
        <QuickAccessNavigation />

        {/* 7. Shop by Rice Variety with 6 category cards */}
        <RiceVarietySection />

        {/* 8. Wholesale Business Banner */}
        <WholesaleBanner />

        {/* Featured Rice Products Showcase */}
        <FeaturedProductsSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
