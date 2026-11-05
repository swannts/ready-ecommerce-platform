export interface PackagingOption {
  size: string; // e.g., "1 kg", "5 kg", "25 kg", "50 kg"
  weightKg: number;
  price: number;
  inStock: boolean;
}

export interface WholesaleTier {
  minQuantityKg: number;
  maxQuantityKg?: number;
  unitPricePerKg: number;
  label: string; // e.g. "10–49 kg", "50–499 kg", "500+ kg (Quote)"
}

export interface RiceProduct {
  id: string;
  slug: string;
  name: string;
  variety: string;
  categorySlug: string;
  brand: string;
  supplierId: string;
  supplierSlug?: string;
  supplierName: string;
  supplierVerified: boolean;
  origin: string;
  description: string;
  grainType: "Extra Long" | "Long Grain" | "Medium Grain" | "Short Grain";
  processingType:
    "Raw / White" | "Parboiled" | "Brown / Wholegrain" | "Aromatic / Aged";
  images: string[];
  retailPricePerKg: number;
  packagingOptions: PackagingOption[];
  wholesaleTiers: WholesaleTier[];
  minOrderQuantityKg: number;
  availableStockKg: number;
  rating: number;
  reviewCount: number;
  isPopular?: boolean;
  isOrganic?: boolean;
}

export interface RiceCategory {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  image: string;
  grainDetail: string;
  colorBg: string;
  popularUses: string;
  productCount: number;
}
