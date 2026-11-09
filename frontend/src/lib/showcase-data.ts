import { RiceCategory, RiceProduct } from "@/types/product";
import { Supplier } from "@/types/supplier";

export const showcaseCategories: RiceCategory[] = [
  { id: "cat-basmati", name: "Basmati Rice", slug: "basmati-rice", tagline: "Long, fragrant grains", description: "Aged premium rice for celebration meals and biryani.", image: "/images/categories/basmati.svg", grainDetail: "Extra long grain", colorBg: "from-[#F7F3EA] to-[#EFE7D8]", popularUses: "Biryani, pilaf", productCount: 2 },
  { id: "cat-miniket", name: "Miniket Rice", slug: "miniket-rice", tagline: "A smooth everyday favorite", description: "Polished slender grains for fluffy everyday meals.", image: "/images/categories/miniket.svg", grainDetail: "Slim long grain", colorBg: "from-[#F5F1E5] to-[#E9E4D7]", popularUses: "Everyday meals", productCount: 2 },
  { id: "cat-nazirshail", name: "Nazirshail Rice", slug: "nazirshail-rice", tagline: "A Bangladeshi staple", description: "Distinctive local rice with a soft texture and gentle aroma.", image: "/images/categories/nazirshail.svg", grainDetail: "Traditional grain", colorBg: "from-[#F4F0E5] to-[#E8E2D3]", popularUses: "Family meals", productCount: 1 },
  { id: "cat-aromatic", name: "Aromatic Rice", slug: "aromatic-rice", tagline: "Fragrant local harvests", description: "Small-grain aromatic rice grown in Bangladesh.", image: "/images/categories/aromatic.svg", grainDetail: "Fragrant grain", colorBg: "from-[#F8F1E6] to-[#EEE3D2]", popularUses: "Special dishes", productCount: 1 },
  { id: "cat-parboiled", name: "Parboiled Rice", slug: "parboiled-rice", tagline: "Hearty and dependable", description: "Carefully parboiled rice selected for consistent cooking.", image: "/images/categories/parboiled.svg", grainDetail: "Parboiled", colorBg: "from-[#F6F0E3] to-[#EAE1D0]", popularUses: "Daily cooking", productCount: 1 },
  { id: "cat-sticky", name: "Sticky Rice", slug: "sticky-rice", tagline: "Soft, sweet and comforting", description: "Short grain rice for desserts and traditional recipes.", image: "/images/categories/sticky.svg", grainDetail: "Short grain", colorBg: "from-[#F8F2E8] to-[#EFE4D4]", popularUses: "Pitha, desserts", productCount: 1 },
];

const mills = [
  { id: "mill-1", slug: "golden-harvest-rice-mills", name: "Golden Harvest Rice Mills", verified: true },
  { id: "mill-2", slug: "heritage-grain-cooperative", name: "Heritage Grain Cooperative", verified: true },
  { id: "mill-3", slug: "delta-aromatic-estate", name: "Delta Aromatic Estate", verified: true },
  { id: "mill-4", slug: "riverbend-foods", name: "Riverbend Foods & Milling", verified: true },
];

const productRows: Array<Omit<RiceProduct, "packagingOptions" | "wholesaleTiers"> & { packagePrices: number[] }> = [
  { id: "rice-101", slug: "royal-2-year-aged-basmati", name: "Royal 2-Year Aged Super Kernel Basmati Rice", variety: "Super Kernel Basmati", categorySlug: "basmati-rice", brand: "Golden Harvest", supplierId: "mill-1", supplierSlug: mills[0].slug, supplierName: mills[0].name, supplierVerified: true, origin: "Punjab, India", description: "Naturally matured for two years to develop a delicate aroma, long grain and beautifully separate texture. Carefully milled and packed for premium kitchens.", grainType: "Extra Long", processingType: "Aromatic / Aged", images: ["/images/products/basmati-rice.jpg"], retailPricePerKg: 285, minOrderQuantityKg: 1, availableStockKg: 12800, rating: 4.9, reviewCount: 218, isPopular: true, packagePrices: [285, 1375, 6600] },
  { id: "rice-102", slug: "indus-golden-sella-basmati", name: "Royal Indus Golden Sella Basmati Rice", variety: "Golden Sella Basmati", categorySlug: "basmati-rice", brand: "Indus Gold", supplierId: "mill-2", supplierSlug: mills[1].slug, supplierName: mills[1].name, supplierVerified: true, origin: "Punjab, India", description: "Golden sella basmati with a resilient grain and gentle fragrance, made for biryani kitchens, catering teams and family feasts.", grainType: "Extra Long", processingType: "Parboiled", images: ["/images/products/golden-sella-rice.jpg"], retailPricePerKg: 245, minOrderQuantityKg: 1, availableStockKg: 9400, rating: 4.8, reviewCount: 154, isPopular: true, packagePrices: [245, 1180, 5650] },
  { id: "rice-201", slug: "premium-silky-white-miniket", name: "Premium Silky White Miniket Rice", variety: "Miniket Grade A+", categorySlug: "miniket-rice", brand: "Delta Select", supplierId: "mill-1", supplierSlug: mills[0].slug, supplierName: mills[0].name, supplierVerified: true, origin: "Dinajpur, Bangladesh", description: "Polished to a clean, silky finish with a soft bite and light aroma. A dependable choice for everyday household meals.", grainType: "Long Grain", processingType: "Raw / White", images: ["/images/products/miniket-rice.jpg"], retailPricePerKg: 82, minOrderQuantityKg: 1, availableStockKg: 26100, rating: 4.7, reviewCount: 302, packagePrices: [82, 395, 1880] },
  { id: "rice-202", slug: "classic-miniket-rice", name: "Classic Miniket Family Rice", variety: "Miniket Premium", categorySlug: "miniket-rice", brand: "Riverbend", supplierId: "mill-4", supplierSlug: mills[3].slug, supplierName: mills[3].name, supplierVerified: true, origin: "Rangpur, Bangladesh", description: "A carefully sorted local favorite with slender grains and reliable results in everyday cooking.", grainType: "Long Grain", processingType: "Raw / White", images: ["/images/products/classic-miniket-rice.jpg"], retailPricePerKg: 76, minOrderQuantityKg: 1, availableStockKg: 18900, rating: 4.6, reviewCount: 187, packagePrices: [76, 365, 1740] },
  { id: "rice-301", slug: "heritage-nazirshail", name: "Heritage Nazirshail Rice", variety: "Premium Nazirshail", categorySlug: "nazirshail-rice", brand: "Heritage Fields", supplierId: "mill-2", supplierSlug: mills[1].slug, supplierName: mills[1].name, supplierVerified: true, origin: "Jashore, Bangladesh", description: "Traditional Bangladeshi rice with a tender texture, subtle aroma and familiar home-cooked flavor.", grainType: "Medium Grain", processingType: "Raw / White", images: ["/images/products/nazirshail-rice.jpg"], retailPricePerKg: 98, minOrderQuantityKg: 1, availableStockKg: 11700, rating: 4.8, reviewCount: 243, packagePrices: [98, 470, 2240] },
  { id: "rice-401", slug: "sun-dried-chinigura-aromatic", name: "Sun-Dried Chinigura Aromatic Rice", variety: "Chinigura / Kalijira", categorySlug: "aromatic-rice", brand: "Delta Aromatic", supplierId: "mill-3", supplierSlug: mills[2].slug, supplierName: mills[2].name, supplierVerified: true, origin: "Dinajpur, Bangladesh", description: "Tiny, pearly grains renowned for a sweet floral fragrance. Sun-dried in small batches for fragrant pulao and special meals.", grainType: "Short Grain", processingType: "Aromatic / Aged", images: ["/images/products/chinigura-rice.jpg"], retailPricePerKg: 210, minOrderQuantityKg: 1, availableStockKg: 6800, rating: 4.95, reviewCount: 216, isOrganic: true, packagePrices: [210, 1010, 4800] },
  { id: "rice-501", slug: "parboiled-rice-dinajpur", name: "Dinajpur Golden Parboiled Rice", variety: "Parboiled Select", categorySlug: "parboiled-rice", brand: "Golden Harvest", supplierId: "mill-1", supplierSlug: mills[0].slug, supplierName: mills[0].name, supplierVerified: true, origin: "Dinajpur, Bangladesh", description: "Nutrient-conscious parboiled grains with a firm texture that stays separate after cooking.", grainType: "Long Grain", processingType: "Parboiled", images: ["/images/products/parboiled-rice.jpg"], retailPricePerKg: 68, minOrderQuantityKg: 1, availableStockKg: 22500, rating: 4.6, reviewCount: 135, packagePrices: [68, 325, 1550] },
  { id: "rice-601", slug: "sticky-rice-for-pitha", name: "Traditional Sticky Rice for Pitha", variety: "Premium Sticky Rice", categorySlug: "sticky-rice", brand: "Delta Select", supplierId: "mill-3", supplierSlug: mills[2].slug, supplierName: mills[2].name, supplierVerified: true, origin: "Sylhet, Bangladesh", description: "Short, soft grains that turn gently sticky. A lovely base for pitha, desserts and seasonal recipes.", grainType: "Short Grain", processingType: "Brown / Wholegrain", images: ["/images/products/sticky-rice.jpg"], retailPricePerKg: 115, minOrderQuantityKg: 1, availableStockKg: 4700, rating: 4.7, reviewCount: 89, packagePrices: [115, 550, 2630] },
];

export const showcaseProducts: RiceProduct[] = productRows.map(({ packagePrices, ...product }) => ({
  ...product,
  packagingOptions: [
    { size: "1 kg Pack", weightKg: 1, price: packagePrices[0], inStock: true },
    { size: "5 kg Sack", weightKg: 5, price: packagePrices[1], inStock: true },
    { size: "25 kg Sack", weightKg: 25, price: packagePrices[2], inStock: true },
  ],
  wholesaleTiers: [
    { minQuantityKg: 25, maxQuantityKg: 99, unitPricePerKg: Math.round(product.retailPricePerKg * 0.92), label: "25–99 kg" },
    { minQuantityKg: 100, maxQuantityKg: 499, unitPricePerKg: Math.round(product.retailPricePerKg * 0.86), label: "100–499 kg" },
    { minQuantityKg: 500, unitPricePerKg: Math.round(product.retailPricePerKg * 0.8), label: "500+ kg" },
  ],
}));

export const showcaseSuppliers: Supplier[] = [
  { id: "mill-1", slug: mills[0].slug, name: mills[0].name, type: "Mill", location: "Dinajpur", country: "Bangladesh", verified: true, rating: 4.9, establishedYear: 1998, capacityMetricTonsMonthly: 6200, certifications: ["BSTI Certified", "HACCP"], bannerImage: "/images/wholesale/mill-facility.svg", avatarImage: "/images/categories/basmati.svg" },
  { id: "mill-2", slug: mills[1].slug, name: mills[1].name, type: "Farmer Cooperative", location: "Jashore", country: "Bangladesh", verified: true, rating: 4.8, establishedYear: 2007, capacityMetricTonsMonthly: 3100, certifications: ["BSTI Certified", "Origin Verified"], bannerImage: "/images/wholesale/mill-facility.svg", avatarImage: "/images/categories/nazirshail.svg" },
  { id: "mill-3", slug: mills[2].slug, name: mills[2].name, type: "Organic Farm", location: "Dinajpur", country: "Bangladesh", verified: true, rating: 4.95, establishedYear: 2011, capacityMetricTonsMonthly: 840, certifications: ["Organic Practices", "Batch Tested"], bannerImage: "/images/wholesale/mill-facility.svg", avatarImage: "/images/categories/aromatic.svg" },
  { id: "mill-4", slug: mills[3].slug, name: mills[3].name, type: "Distributor", location: "Rangpur", country: "Bangladesh", verified: true, rating: 4.7, establishedYear: 2003, capacityMetricTonsMonthly: 1800, certifications: ["BSTI Certified", "Cold Storage"], bannerImage: "/images/wholesale/mill-facility.svg", avatarImage: "/images/categories/miniket.svg" },
];

const legalPages: Record<string, { title: string; description: string }> = {
  privacy: { title: "Privacy Policy", description: "RiceMart Showcase Privacy Notice\n\nThis frontend is an interactive showcase. Information entered into showcase forms is not sent to a server and is not used to create an account, order, or support case. Cart and wishlist selections may be stored in this browser for demonstration.\n\nA production service would publish its full data processing, retention, and contact details here." },
  terms: { title: "Terms of Service", description: "RiceMart Showcase Terms\n\nThis site demonstrates a rice marketplace interface using sample product, supplier, pricing, and availability data. No purchase, quote, or supplier contact is created by using this showcase. Prices and stock are illustrative only.\n\nProduction terms, fulfillment conditions, and payment rules would be published before launch." },
  refund: { title: "Return & Refund Policy", description: "Showcase Return Information\n\nThis demonstration does not accept payment or create real orders, so no actual return or refund can be requested through it. For a live marketplace, the seller, order, and payment details would determine the applicable return process." },
};

export function getShowcaseLegalPage(slug: string) {
  return legalPages[slug] ?? null;
}
