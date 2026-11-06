"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Heart,
  ShoppingCart,
  User,
  Menu,
  X,
  ChevronDown,
  Building2,
  FileText,
  HelpCircle,
  Truck,
} from "lucide-react";
import { RiceLogo } from "@/components/ui/RiceLogo";
import { useAppSelector } from "@/store/hooks";
import { selectCartTotalQuantity } from "@/store/slices/cartSlice";
import { selectWishlistCount } from "@/store/slices/wishlistSlice";
import { useLocale } from "@/lib/i18n";
import { formatCurrency } from "@/lib/currency";

interface HeaderProps {
  onOpenSearch?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const [resourcesDropdownOpen, setResourcesDropdownOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasHydrated, setHasHydrated] = useState(false);
  const pathname = usePathname();
  const { locale, setLocale, t } = useLocale();

  // Redux store reactive cart and wishlist counts
  const cartCount = useAppSelector(selectCartTotalQuantity);
  const wishlistCount = useAppSelector(selectWishlistCount);
  const visibleCartCount = hasHydrated ? cartCount : 0;
  const visibleWishlistCount = hasHydrated ? wishlistCount : 0;
  const riceCategories = useAppSelector((state) => state.products.categories);
  const catalogProducts = useAppSelector((state) => state.products.items);

  // Sticky shadow effect on scroll
  useEffect(() => {
    setHasHydrated(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Filtered search results for interactive quick search
  const searchResults = searchQuery.trim()
    ? catalogProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.variety.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.supplierName.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : [];

  const triggerSearch = () => {
    if (onOpenSearch) {
      onOpenSearch();
    } else {
      setSearchModalOpen(true);
    }
  };

  return (
    <>
      {/* Top Agricultural Quality Notice Bar */}
      <div className="bg-[#102C1B] text-[#FAF6EF] text-xs py-1.5 px-4 hidden md:block border-b border-[#183A20]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-[#E7E1D7]">
              <Truck className="w-3.5 h-3.5 text-[#B88A35]" />
              {t("Direct Mill-to-Door Delivery Across 64 Districts")}
            </span>
            <span className="text-[#686C64]">|</span>
            <span className="text-[#E7E1D7]">
              B2B Wholesale Quotes:{" "}
              <span className="text-[#B88A35] font-medium">
                +1 (800) 742-3627
              </span>
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <Link
              href="/wholesale"
              className="hover:text-[#B88A35] transition-colors"
            >
              {t("Wholesale Portal")}
            </Link>
            <span className="text-[#686C64]">|</span>
            <Link
              href="/suppliers"
              className="hover:text-[#B88A35] transition-colors"
            >
              {t("Become a Supplier")}
            </Link>
            <span className="text-[#686C64]">|</span>
            <span className="text-[#B88A35] font-semibold">BDT (৳)</span>
          </div>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? "bg-[#FAF6EF]/95 backdrop-blur-md shadow-md py-3 border-b border-[#E7E1D7]"
            : "bg-[#FAF6EF] py-4 border-b border-[#E7E1D7]/70"
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Brand Logo */}
          <div className="shrink-0">
            <RiceLogo />
          </div>

          {/* Center: Desktop Navigation */}
          <nav
            aria-label={t("Main Navigation")}
            className="hidden lg:flex items-center gap-1 xl:gap-2 text-[15px] font-medium text-[#19221B]"
          >
            {/* Shop with Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setShopDropdownOpen(true)}
              onMouseLeave={() => setShopDropdownOpen(false)}
            >
              <button
                type="button"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors hover:text-[#183A20] hover:bg-[#E7E1D7]/40 ${
                  pathname.startsWith("/shop")
                    ? "text-[#183A20] font-semibold"
                    : ""
                }`}
                aria-expanded={shopDropdownOpen}
              >
                <span>{t("Shop")}</span>
                <ChevronDown className="w-4 h-4 text-[#686C64] transition-transform duration-200" />
              </button>

              {shopDropdownOpen && (
                <div className="absolute top-full left-0 w-72 bg-[#FFFDF8] rounded-xl shadow-xl border border-[#E7E1D7] p-3 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#686C64] px-3 py-1">
                    {t("Rice Varieties")}
                  </div>
                  <div className="space-y-1 mt-1">
                    {riceCategories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/shop?category=${cat.slug}`}
                        className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-[#19221B] hover:bg-[#FAF6EF] hover:text-[#183A20] transition-colors"
                        onClick={() => setShopDropdownOpen(false)}
                      >
                        <span className="font-medium">{cat.name}</span>
                        <span className="text-xs text-[#686C64]">
                          {cat.productCount}
                        </span>
                      </Link>
                    ))}
                    <div className="pt-2 border-t border-[#E7E1D7] mt-2">
                      <Link
                        href="/shop"
                        className="block text-center py-1.5 text-xs font-semibold text-[#183A20] hover:text-[#B88A35] transition-colors"
                        onClick={() => setShopDropdownOpen(false)}
                      >
                        {t("Browse All Products →")}
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Suppliers */}
            <Link
              href="/suppliers"
              className={`px-3.5 py-2 rounded-lg transition-colors hover:text-[#183A20] hover:bg-[#E7E1D7]/40 ${
                pathname === "/suppliers" ? "text-[#183A20] font-semibold" : ""
              }`}
            >
              {t("Suppliers")}
            </Link>

            {/* Wholesale (B2B) with highlighted badge */}
            <Link
              href="/wholesale"
              className="relative group flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#183A20]/8 text-[#183A20] font-semibold hover:bg-[#183A20] hover:text-[#FFFDF8] transition-all"
            >
              <Building2 className="w-4 h-4 text-[#B88A35] group-hover:text-[#FAF6EF]" />
              <span>{t("Wholesale (B2B)")}</span>
              <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#B88A35] text-[#FFFDF8] tracking-wider uppercase shadow-2xs">
                Bulk
              </span>
            </Link>

            {/* About */}
            <Link
              href="/about"
              className={`px-3.5 py-2 rounded-lg transition-colors hover:text-[#183A20] hover:bg-[#E7E1D7]/40 ${
                pathname === "/about" ? "text-[#183A20] font-semibold" : ""
              }`}
            >
              {t("About")}
            </Link>

            {/* Resources Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setResourcesDropdownOpen(true)}
              onMouseLeave={() => setResourcesDropdownOpen(false)}
            >
              <button
                type="button"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors hover:text-[#183A20] hover:bg-[#E7E1D7]/40"
                aria-expanded={resourcesDropdownOpen}
              >
                <span>{t("Resources")}</span>
                <ChevronDown className="w-4 h-4 text-[#686C64]" />
              </button>

              {resourcesDropdownOpen && (
                <div className="absolute top-full left-0 w-64 bg-[#FFFDF8] rounded-xl shadow-xl border border-[#E7E1D7] p-2 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                  <Link
                    href="/resources/grain-guide"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#19221B] hover:bg-[#FAF6EF] transition-colors"
                  >
                    <FileText className="w-4 h-4 text-[#B88A35]" />
                    <span>{t("Rice Grain Quality Guide")}</span>
                  </Link>
                  <Link
                    href="/resources/wholesale-guide"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#19221B] hover:bg-[#FAF6EF] transition-colors"
                  >
                    <Building2 className="w-4 h-4 text-[#B88A35]" />
                    <span>{t("B2B Procurement Manual")}</span>
                  </Link>
                  <Link
                    href="/contact"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#19221B] hover:bg-[#FAF6EF] transition-colors"
                  >
                    <HelpCircle className="w-4 h-4 text-[#B88A35]" />
                    <span>{t("Customer Support & FAQs")}</span>
                  </Link>
                </div>
              )}
            </div>
          </nav>

          {/* Right: Actions (Search, Wishlist, Cart, Account, Sign In) */}
          <div className="flex shrink-0 items-center gap-0.5 sm:gap-3">
            <button
              type="button"
              onClick={() => setLocale(locale === "en" ? "bn" : "en")}
              className="max-[380px]:hidden px-1.5 sm:px-2.5 py-2 rounded-lg border border-[#E7E1D7] text-xs font-bold text-[#183A20]"
              aria-label={
                locale === "en" ? "বাংলায় দেখুন" : t("View in English")
              }
            >
              {locale === "en" ? "বাংলা" : "EN"}
            </button>
            {/* Search Trigger */}
            <button
              type="button"
              onClick={triggerSearch}
              className="p-1.5 sm:p-2.5 rounded-full text-[#19221B] hover:text-[#183A20] hover:bg-[#E7E1D7]/50 transition-colors"
              aria-label={t("Search rice products")}
              title={t("Search rice products")}
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Icon */}
            <Link
              href="/wishlist"
              className="p-1.5 sm:p-2.5 rounded-full text-[#19221B] hover:text-[#183A20] hover:bg-[#E7E1D7]/50 transition-colors relative"
              aria-label={`Wishlist (${visibleWishlistCount} items)`}
            >
              <Heart className="w-5 h-5" />
              {visibleWishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#B88A35] text-[#FFFDF8] text-[10px] font-bold flex items-center justify-center animate-in zoom-in-50 duration-150">
                  {visibleWishlistCount}
                </span>
              )}
            </Link>

            {/* Shopping Cart Icon */}
            <Link
              href="/cart"
              className="p-1.5 sm:p-2.5 rounded-full text-[#19221B] hover:text-[#183A20] hover:bg-[#E7E1D7]/50 transition-colors relative"
              aria-label={`Cart with ${visibleCartCount} items`}
            >
              <ShoppingCart className="w-5 h-5" />
              {visibleCartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#183A20] text-[#FFFDF8] text-[10px] font-bold flex items-center justify-center animate-in zoom-in-50 duration-150">
                  {visibleCartCount}
                </span>
              )}
            </Link>

            {/* User Account Icon */}
            <Link
              href="/login"
              className="hidden sm:inline-flex p-2.5 rounded-full text-[#19221B] hover:text-[#183A20] hover:bg-[#E7E1D7]/50 transition-colors"
              aria-label={t("My Account")}
              title={t("My Account")}
            >
              <User className="w-5 h-5" />
            </Link>

            {/* Sign In / Register Button */}
            <Link
              href="/login"
              className="hidden md:inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-[#183A20] bg-transparent border border-[#183A20] rounded-lg hover:bg-[#183A20] hover:text-[#FFFDF8] transition-all"
            >
              {t("Sign In")}
            </Link>

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 sm:p-2.5 rounded-lg text-[#19221B] hover:bg-[#E7E1D7]/50 lg:hidden transition-colors"
              aria-label={t("Toggle mobile navigation")}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-x-0 top-[73px] bg-[#FFFDF8] border-b border-[#E7E1D7] shadow-2xl p-6 animate-in slide-in-from-top-4 duration-200 z-50 max-h-[85vh] overflow-y-auto">
            {/* Mobile Search input */}
            <div className="relative mb-6">
              <input
                type="text"
                placeholder={t("Search rice (e.g. Basmati, Miniket...)")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#FAF6EF] border border-[#E7E1D7] text-sm text-[#19221B] focus:outline-none focus:border-[#183A20]"
              />
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-[#686C64]" />
            </div>

            <button
              type="button"
              onClick={() => setLocale(locale === "en" ? "bn" : "en")}
              className="hidden max-[380px]:inline-flex items-center justify-center mb-5 px-3 py-2 rounded-lg border border-[#E7E1D7] text-xs font-bold text-[#183A20]"
            >
              {locale === "en" ? "বাংলায় দেখুন" : t("View in English")}
            </button>

            <nav className="space-y-4">
              <Link
                href="/shop"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-2 text-base font-semibold text-[#19221B] border-b border-[#E7E1D7]/50"
              >
                <span>{t("Shop All Rice")}</span>
                <span className="text-xs text-[#B88A35] font-normal">
                  {t("View Catalog →")}
                </span>
              </Link>

              <div className="pl-3 space-y-2 border-l-2 border-[#E7E1D7]">
                {riceCategories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/shop?category=${cat.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm text-[#686C64] hover:text-[#183A20] py-1"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>

              <Link
                href="/wholesale"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-3 px-4 rounded-xl bg-[#183A20] text-[#FFFDF8] font-semibold"
              >
                <span className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#B88A35]" />
                  {t("Wholesale (B2B) Orders")}
                </span>
                <span className="text-xs bg-[#B88A35] px-2 py-0.5 rounded text-[#FFFDF8]">
                  {t("Bulk Tiers")}
                </span>
              </Link>

              <Link
                href="/suppliers"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-base font-semibold text-[#19221B] border-b border-[#E7E1D7]/50"
              >
                {t("Verified Suppliers & Mills")}
              </Link>

              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-base font-semibold text-[#19221B] border-b border-[#E7E1D7]/50"
              >
                {t("About RiceMart")}
              </Link>

              <div className="pt-4 flex flex-col gap-3">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 text-center rounded-xl font-semibold border border-[#183A20] text-[#183A20]"
                >
                  {t("Sign In")}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 text-center rounded-xl font-semibold bg-[#183A20] text-[#FFFDF8]"
                >
                  {t("Create Customer Account")}
                </Link>
                <Link
                  href="/register/business"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-xs font-semibold text-[#B88A35] hover:underline"
                >
                  {t("Register as Business Buyer (B2B) →")}
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Global Interactive Search Modal */}
      {searchModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#102C1B]/60 backdrop-blur-sm flex items-start justify-center pt-20 px-4"
          onClick={() => setSearchModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl bg-[#FFFDF8] rounded-2xl shadow-2xl border border-[#E7E1D7] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-[#E7E1D7] flex items-center gap-3">
              <Search className="w-5 h-5 text-[#B88A35]" />
              <input
                type="text"
                autoFocus
                placeholder={t(
                  "Search rice (e.g. Basmati, Miniket, Nazirshail, Chinigura...)",
                )}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-base bg-transparent border-none text-[#19221B] placeholder-[#686C64] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setSearchModalOpen(false)}
                className="p-1.5 rounded-lg text-[#686C64] hover:bg-[#FAF6EF]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 max-h-96 overflow-y-auto">
              {searchQuery.trim() === "" ? (
                <div>
                  <div className="text-xs font-semibold text-[#686C64] uppercase tracking-wider mb-3">
                    Popular Varieties
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {riceCategories.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSearchQuery(c.name)}
                        className="px-3 py-1.5 rounded-full bg-[#FAF6EF] hover:bg-[#E7E1D7] text-xs font-medium text-[#19221B] transition-colors"
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-[#686C64] uppercase tracking-wider">
                    Matching Products ({searchResults.length})
                  </div>
                  {searchResults.map((product) => (
                    <Link
                      key={product.id}
                      href={`/shop/${product.slug}`}
                      onClick={() => setSearchModalOpen(false)}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-[#FAF6EF] transition-colors border border-transparent hover:border-[#E7E1D7]"
                    >
                      <div>
                        <div className="font-medium text-sm text-[#19221B]">
                          {product.name}
                        </div>
                        <div className="text-xs text-[#686C64] mt-0.5">
                          {product.supplierName} • {product.origin}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-[#183A20]">
                          {formatCurrency(product.retailPricePerKg)}/kg
                        </div>
                        <div className="text-[11px] text-[#B88A35] font-semibold">
                          Wholesale from {formatCurrency(product.wholesaleTiers[0].unitPricePerKg)}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-sm text-[#686C64]">
                  No rice varieties found for &quot;{searchQuery}&quot;. Try
                  searching for &quot;Basmati&quot; or &quot;Miniket&quot;.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
