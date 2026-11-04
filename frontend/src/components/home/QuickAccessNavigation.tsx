import React from "react";
import Link from "next/link";
import { Sprout, Boxes, Store, Handshake, ChevronRight } from "lucide-react";

interface QuickNavItem {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  icon: React.ElementType;
}

const quickNavItems: QuickNavItem[] = [
  {
    id: "explore-varieties",
    title: "Explore Rice Varieties",
    subtitle: "Basmati, Miniket, Aromatic & more",
    href: "#rice-varieties",
    icon: Sprout,
  },
  {
    id: "bulk-orders",
    title: "Bulk Orders (B2B)",
    subtitle: "Tiered pricing in sacks & tons",
    href: "/wholesale",
    icon: Boxes,
  },
  {
    id: "become-supplier",
    title: "Become a Supplier",
    subtitle: "Sell directly to retail & businesses",
    href: "/register/supplier",
    icon: Store,
  },
  {
    id: "for-businesses",
    title: "For Businesses",
    subtitle: "Restaurants, hotels & distributors",
    href: "/business/info",
    icon: Handshake,
  },
];

export const QuickAccessNavigation: React.FC = () => {
  return (
    <section className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 sm:-mt-6 mb-12 lg:mb-16">
      {/* Floating Card Container */}
      <div className="bg-[#FFFDF8] rounded-2xl sm:rounded-3xl shadow-xl border border-[#E7E1D7] overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E7E1D7]">
          {quickNavItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={item.id}
                href={item.href}
                className="group flex items-center justify-between p-5 sm:p-6 transition-all duration-200 hover:bg-[#FAF6EF] active:bg-[#EFE7D8]"
              >
                <div className="flex items-center gap-4">
                  {/* Icon with soft warm circle */}
                  <div className="w-12 h-12 rounded-2xl bg-[#183A20]/8 text-[#183A20] group-hover:bg-[#183A20] group-hover:text-[#B88A35] flex items-center justify-center shrink-0 transition-colors duration-200 shadow-2xs">
                    <IconComponent className="w-6 h-6 transition-transform duration-200 group-hover:scale-110" />
                  </div>

                  <div>
                    <h3 className="font-semibold text-sm sm:text-base text-[#19221B] group-hover:text-[#183A20] transition-colors leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#686C64] mt-0.5 line-clamp-1">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                {/* Right Arrow */}
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#686C64] group-hover:text-[#183A20] group-hover:bg-[#E7E1D7]/50 group-hover:translate-x-1 transition-all duration-200 shrink-0 ml-2">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

