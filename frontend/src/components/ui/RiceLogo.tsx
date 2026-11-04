import React from "react";
import Link from "next/link";

interface RiceLogoProps {
  variant?: "dark" | "light";
  className?: string;
  showSubtitle?: boolean;
}

export const RiceLogo: React.FC<RiceLogoProps> = ({
  variant = "dark",
  className = "",
  showSubtitle = true,
}) => {
  const isLight = variant === "light";

  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-3 transition-transform duration-200 hover:scale-[1.01] ${className}`}
      aria-label="RiceMart Home"
    >
      {/* Handcrafted Wheat / Rice Ear Emblem */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors shadow-xs ${
          isLight
            ? "bg-[#FAF6EF]/15 text-[#B88A35] border border-[#B88A35]/30 group-hover:bg-[#FAF6EF]/25"
            : "bg-[#183A20] text-[#B88A35] group-hover:bg-[#102C1B]"
        }`}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Central Stem */}
          <path
            d="M5 21C7.5 16.5 12 11 19 4"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Grain 1 Left */}
          <path
            d="M9.5 14C8.2 13.5 7.2 11.5 8.2 10.2C9.5 9 11.5 10 12 11.5"
            fill="currentColor"
            opacity="0.9"
          />
          {/* Grain 2 Right */}
          <path
            d="M13 10.5C14.5 11 15.5 9 14.5 7.7C13.2 6.5 11.2 7.5 10.7 9"
            fill="currentColor"
            opacity="0.9"
          />
          {/* Grain 3 Left */}
          <path
            d="M13.5 8C12.2 7.5 11.2 5.5 12.2 4.2C13.5 3 15.5 4 16 5.5"
            fill="currentColor"
            opacity="0.9"
          />
          {/* Grain 4 Right Tip */}
          <path
            d="M17 5.5C18.2 6 19.2 4.2 18.2 3.2C17 2.2 15.2 3.2 15 4.5"
            fill="currentColor"
            opacity="0.95"
          />
        </svg>
      </div>

      <div className="flex flex-col">
        <span
          className={`font-serif text-2xl font-bold tracking-tight leading-none ${
            isLight ? "text-[#FFFDF8]" : "text-[#183A20]"
          }`}
        >
          Rice<span className="text-[#B88A35]">Mart</span>
        </span>
        {showSubtitle && (
          <span
            className={`text-[10px] tracking-wider uppercase font-semibold mt-0.5 ${
              isLight ? "text-[#E7E1D7]/80" : "text-[#686C64]"
            }`}
          >
            Rice Marketplace
          </span>
        )}
      </div>
    </Link>
  );
};

