"use client";

import React from "react";
import Link from "next/link";
import { RiceLogo } from "@/components/ui/RiceLogo";
import {
  ShieldCheck,
  Truck,
  Award,
  Phone,
  Mail,
  Globe,
} from "lucide-react";
import { riceCategories } from "@/data/riceCategories";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#102C1B] text-[#E7E1D7] pt-16 pb-12 border-t border-[#183A20] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Trust Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 mb-12 border-b border-[#183A20]">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#183A20]/50 border border-[#183A20]">
            <div className="w-12 h-12 rounded-xl bg-[#FAF6EF]/10 flex items-center justify-center text-[#B88A35] shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="font-semibold text-[#FFFDF8] text-sm">Nationwide Distribution</div>
              <div className="text-xs text-[#E7E1D7]/70 mt-0.5">Reliable logistics from single sacks to multi-ton consignments.</div>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#183A20]/50 border border-[#183A20]">
            <div className="w-12 h-12 rounded-xl bg-[#FAF6EF]/10 flex items-center justify-center text-[#B88A35] shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="font-semibold text-[#FFFDF8] text-sm">Verified Producers & Mills</div>
              <div className="text-xs text-[#E7E1D7]/70 mt-0.5">Direct farm gate & certified industrial mill partner network.</div>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#183A20]/50 border border-[#183A20]">
            <div className="w-12 h-12 rounded-xl bg-[#FAF6EF]/10 flex items-center justify-center text-[#B88A35] shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="font-semibold text-[#FFFDF8] text-sm">100% Quality Assurance</div>
              <div className="text-xs text-[#E7E1D7]/70 mt-0.5">Moisture-controlled, lab-tested, and authentic grain varieties.</div>
            </div>
          </div>
        </div>

        {/* Main Footer Links Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#183A20]">
          
          {/* Col 1: Brand Info & Newsletter */}
          <div className="lg:col-span-2 space-y-4">
            <RiceLogo variant="light" />
            <p className="text-sm text-[#E7E1D7]/80 leading-relaxed max-w-sm mt-3">
              RiceMart is the premier agricultural commerce marketplace connecting verified rice mills, farmers, and distributors directly with retail households and institutional B2B buyers.
            </p>

            {/* Newsletter input */}
            <div className="pt-2">
              <span className="block text-xs font-semibold text-[#FFFDF8] uppercase tracking-wider mb-2">
                Subscribe for Grain Market Price Index & Harvest Reports
              </span>
              <form onSubmit={(e) => e.preventDefault()} className="flex items-center max-w-md">
                <input
                  type="email"
                  placeholder="Enter business or personal email"
                  className="bg-[#183A20] border border-[#25522F] text-sm text-[#FFFDF8] px-4 py-2.5 rounded-l-xl w-full focus:outline-none focus:border-[#B88A35] placeholder-[#E7E1D7]/50"
                  required
                />
                <button
                  type="submit"
                  className="bg-[#B88A35] hover:bg-[#D4A74F] text-[#FFFDF8] px-4 py-2.5 rounded-r-xl text-sm font-semibold transition-colors shrink-0"
                >
                  Join
                </button>
              </form>
            </div>
          </div>

          {/* Col 2: Retail Categories */}
          <div>
            <h4 className="font-serif text-base font-bold text-[#FFFDF8] mb-4">Rice Varieties</h4>
            <ul className="space-y-2.5 text-sm">
              {riceCategories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/shop?category=${cat.slug}`}
                    className="hover:text-[#B88A35] transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li className="pt-1">
                <Link href="/shop" className="text-xs font-semibold text-[#B88A35] hover:underline">
                  View Full Catalog →
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: B2B Wholesale */}
          <div>
            <h4 className="font-serif text-base font-bold text-[#FFFDF8] mb-4">B2B Wholesale</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/wholesale" className="hover:text-[#B88A35] transition-colors">
                  Wholesale Overview
                </Link>
              </li>
              <li>
                <Link href="/register/business" className="hover:text-[#B88A35] transition-colors">
                  Business Account Registration
                </Link>
              </li>
              <li>
                <Link href="/wholesale/rfq" className="hover:text-[#B88A35] transition-colors">
                  Request Custom Quote (RFQ)
                </Link>
              </li>
              <li>
                <Link href="/suppliers" className="hover:text-[#B88A35] transition-colors">
                  Verified Mill Directory
                </Link>
              </li>
              <li>
                <Link href="/resources/wholesale-guide" className="hover:text-[#B88A35] transition-colors">
                  Volume Tier Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Producers & Help */}
          <div>
            <h4 className="font-serif text-base font-bold text-[#FFFDF8] mb-4">Suppliers & Help</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/register/supplier" className="hover:text-[#B88A35] transition-colors">
                  Become a Supplier
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#B88A35] transition-colors">
                  About RiceMart
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#B88A35] transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-[#B88A35] transition-colors">
                  Track Delivery
                </Link>
              </li>
              <li className="pt-2 text-xs text-[#E7E1D7]/70 space-y-1">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#B88A35]" />
                  <span>+1 (800) 742-3627</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#B88A35]" />
                  <span>support@ricemart.marketplace</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Currency & Legal */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#E7E1D7]/70">
          <div>
            &copy; {new Date().getFullYear()} RiceMart Marketplace Inc. All rights reserved.
          </div>

          <div className="flex items-center gap-6">
            <Link href="/legal/privacy" className="hover:text-[#FFFDF8] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/legal/terms" className="hover:text-[#FFFDF8] transition-colors">
              Terms of Service
            </Link>
            <Link href="/legal/refund" className="hover:text-[#FFFDF8] transition-colors">
              Return & Refund Policy
            </Link>
            <div className="flex items-center gap-1.5 text-[#B88A35]">
              <Globe className="w-3.5 h-3.5" />
              <span className="font-semibold">English (US) • USD ($)</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
