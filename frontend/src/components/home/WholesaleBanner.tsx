import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Building2, ArrowRight, ShieldCheck, FileCheck, Scale } from "lucide-react";

export const WholesaleBanner: React.FC = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {/* Container with rounded corners and split layout */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-[#183A20]/20 bg-[#102C1B] text-[#FFFDF8] grid grid-cols-1 lg:grid-cols-12 items-stretch">
        
        {/* Left: Photographic Image of Modern Rice Mill & Storage Silos */}
        <div className="lg:col-span-5 relative min-h-[280px] sm:min-h-[340px] lg:min-h-full overflow-hidden">
          <Image
            src="/images/wholesale/mill-facility.svg"
            alt="Modern automated rice mill and high-capacity storage silos"
            fill
            className="object-cover object-center transition-transform duration-700 hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 42vw"
          />
          {/* Subtle gradient overlay to merge naturally into the dark green right section */}
          <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-transparent via-[#102C1B]/20 to-[#102C1B] pointer-events-none" />

          {/* Floating Mill Capacity Badge */}
          <div className="absolute bottom-4 left-4 bg-[#183A20]/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-[#B88A35]/30 text-xs">
            <span className="text-[#B88A35] font-bold block uppercase tracking-wider text-[10px]">
              Direct Producer Network
            </span>
            <span className="font-semibold text-[#FFFDF8]">
              50,000+ Metric Tons Monthly Capacity
            </span>
          </div>
        </div>

        {/* Right: Dark Forest Green Editorial Content */}
        <div className="lg:col-span-7 p-8 sm:p-10 lg:p-14 flex flex-col justify-center relative z-10 bg-gradient-to-br from-[#183A20] to-[#102C1B]">
          
          {/* Top Label */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF6EF]/10 text-[#B88A35] text-xs font-bold tracking-widest uppercase mb-4 w-fit border border-[#B88A35]/30">
            <Building2 className="w-3.5 h-3.5" />
            <span>Institutional & Commercial Sourcing</span>
          </div>

          {/* Heading */}
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#FFFDF8] leading-tight mb-4">
            Are You a Business Buyer?
          </h2>

          {/* Description */}
          <p className="text-base sm:text-lg text-[#E7E1D7] max-w-xl leading-relaxed mb-6 font-normal">
            Get wholesale pricing, custom quotes, and dedicated support for restaurants, hotels, supermarkets, and catering enterprises.
          </p>

          {/* Business Highlights List */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 text-xs text-[#FAF6EF]/90">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#B88A35] shrink-0" />
              <span>Sacks to Container Loads</span>
            </div>
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-[#B88A35] shrink-0" />
              <span>Formal Invoicing & GST/VAT</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#B88A35] shrink-0" />
              <span>Batch Quality Certificates</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <Link
              href="/register/business"
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-[#FAF6EF] hover:bg-[#FFFDF8] text-[#183A20] font-bold text-base shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.99] group shrink-0"
            >
              <span>Create a Business Account</span>
              <ArrowRight className="w-5 h-5 text-[#B88A35] group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/wholesale/quote"
              className="inline-flex items-center justify-center px-6 py-4 rounded-xl bg-transparent hover:bg-[#FAF6EF]/10 text-[#FFFDF8] font-semibold text-sm border border-[#E7E1D7]/30 transition-colors"
            >
              Request Custom Quote
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

