import { RiceCategory, RiceProduct } from "@/types/product";
import { Supplier } from "@/types/supplier";
import { getApiLocale } from "@/lib/i18n";

const API_URL = (
  typeof window === "undefined"
    ? process.env.API_INTERNAL_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:8000/api"
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
).replace(/\/$/, "");
const PUBLIC_API_ORIGIN = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api").origin;
  } catch {
    return "http://localhost:8000";
  }
})();
type Envelope<T> = { data?: T; message?: string };
type ApiRow = Record<string, unknown>;

function normalizeMediaUrl(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) return "";
  try {
    const url = new URL(value, PUBLIC_API_ORIGIN);
    const isLocalHost = ["localhost", "127.0.0.1", "backend"].includes(url.hostname)
      || url.hostname.endsWith(".localhost");
    if (isLocalHost && (url.pathname.startsWith("/rice-catalog/") || url.pathname.startsWith("/storage/"))) {
      return `${url.pathname}${url.search}${url.hash}`;
    }
    return url.toString();
  } catch {
    return value;
  }
}

async function request<T>(path: string, locale?: "en" | "bn"): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      Accept: "application/json",
      "Accept-Language": locale || getApiLocale(),
    },
    cache: "no-store",
  });
  const body = (await response.json()) as Envelope<T>;
  if (!response.ok)
    throw new Error(body.message || `API request failed (${response.status})`);
  if (!body.data)
    throw new Error(body.message || "The API returned an empty response.");
  return body.data;
}

export async function submitSupportRequest(payload: {
  name?: string;
  phone?: string;
  subject: string;
  message: string;
}) {
  const response = await fetch(`${API_URL}/support`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-Language": getApiLocale(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const body = (await response.json()) as { message?: string };
  if (!response.ok)
    throw new Error(body.message || `Request failed (${response.status})`);
  return body.message || "Your request has been received.";
}

export async function getLegalPage(slug: string, locale?: "en" | "bn") {
  return request<{
    content: { title: string | null; description: string | null };
  }>(`/legal-pages/${encodeURIComponent(slug)}`, locale);
}

export function mapProduct(dto: ApiRow): RiceProduct {
  const images = Array.isArray(dto.images)
    ? dto.images.map(normalizeMediaUrl).filter(Boolean)
    : [];
  const packages = Array.isArray(dto.packaging_options)
    ? (dto.packaging_options as ApiRow[])
    : [];
  const tiers = Array.isArray(dto.wholesale_tiers)
    ? (dto.wholesale_tiers as ApiRow[])
    : [];
  const shop = dto.shop as ApiRow | undefined;
  return {
    id: String(dto.id),
    slug: String(dto.slug || ""),
    name: String(dto.name || ""),
    variety: String(dto.variety || dto.name || ""),
    categorySlug: String(dto.category_slug || ""),
    brand: String(dto.brand || ""),
    supplierId: String(dto.supplier_id || ""),
    supplierSlug: String(dto.supplier_slug || shop?.slug || ""),
    supplierName: String(dto.supplier_name || shop?.name || ""),
    supplierVerified: Boolean(dto.supplier_verified),
    origin: String(dto.origin || ""),
    description: String(dto.description || dto.short_description || ""),
    grainType: String(
      dto.grain_type || "Long Grain",
    ) as RiceProduct["grainType"],
    processingType: String(
      dto.processing_type || "Raw / White",
    ) as RiceProduct["processingType"],
    images: images.length
      ? images
      : dto.thumbnail
        ? [normalizeMediaUrl(dto.thumbnail)]
        : [],
    retailPricePerKg: Number(dto.retail_price_per_kg ?? dto.price ?? 0),
    packagingOptions: packages.map((p) => ({
      size: String(p.size || ""),
      weightKg: Number(p.weightKg ?? p.weight_kg ?? 1),
      price: Number(p.price),
      inStock: Boolean(p.inStock ?? p.in_stock ?? true),
    })),
    wholesaleTiers: tiers.map((t) => ({
      minQuantityKg: Number(t.minQuantityKg ?? t.min_quantity_kg),
      maxQuantityKg:
        (t.maxQuantityKg ?? t.max_quantity_kg)
          ? Number(t.maxQuantityKg ?? t.max_quantity_kg)
          : undefined,
      unitPricePerKg: Number(t.unitPricePerKg ?? t.unit_price_per_kg),
      label: String(t.label || "Wholesale"),
    })),
    minOrderQuantityKg: Number(dto.min_order_quantity_kg || 1),
    availableStockKg: Number(dto.available_stock_kg ?? dto.quantity ?? 0),
    rating: Number(dto.rating || 0),
    reviewCount: Number.parseInt(String(dto.total_reviews || "0"), 10) || 0,
    isPopular: Boolean(dto.is_popular),
    isOrganic: Boolean(dto.is_organic),
  };
}

function mapCategory(dto: ApiRow): RiceCategory {
  return {
    id: String(dto.id),
    slug: String(dto.slug || ""),
    name: String(dto.name || ""),
    tagline: String(dto.tagline || ""),
    description: String(dto.description || ""),
    image: normalizeMediaUrl(dto.image || dto.thumbnail),
    grainDetail: String(dto.grain_detail || ""),
    colorBg: String(dto.color_bg || "from-[#F7F3EA] to-[#EFE7D8]"),
    popularUses: String(dto.popular_uses || ""),
    productCount: Number(dto.product_count || 0),
  };
}

function mapSupplier(dto: ApiRow): Supplier {
  return {
    id: String(dto.supplier_id || dto.id),
    slug: String(dto.slug || ""),
    name: String(dto.name || ""),
    type: String(dto.type || "Mill") as Supplier["type"],
    location: String(dto.location || ""),
    country: String(dto.country || ""),
    verified: Boolean(dto.verified),
    rating: Number(dto.rating || 0),
    establishedYear: Number(dto.established_year || 0),
    capacityMetricTonsMonthly: Number(dto.capacity_metric_tons_monthly || 0),
    certifications: Array.isArray(dto.certifications)
      ? dto.certifications.map(String)
      : [],
    bannerImage: normalizeMediaUrl(dto.banner_image || dto.banner),
    avatarImage: normalizeMediaUrl(dto.avatar_image || dto.logo),
  };
}

export async function getProducts(
  criteria: {
    categorySlug?: string;
    grainType?: string;
    searchQuery?: string;
    sortBy?: string;
    supplierSlug?: string;
  } = {},
  locale?: "en" | "bn",
): Promise<RiceProduct[]> {
  const params = new URLSearchParams({ page: "1", per_page: "100" });
  if (criteria.categorySlug) params.set("category_slug", criteria.categorySlug);
  if (criteria.grainType) params.set("grain_type", criteria.grainType);
  if (criteria.searchQuery?.trim())
    params.set("search", criteria.searchQuery.trim());
  if (criteria.sortBy) params.set("sort_by", criteria.sortBy);
  if (criteria.supplierSlug) params.set("supplier_slug", criteria.supplierSlug);
  const data = await request<{ products: ApiRow[] }>(
    `/products?${params}`,
    locale,
  );
  return data.products.map(mapProduct);
}

export async function getCategories(
  locale?: "en" | "bn",
): Promise<RiceCategory[]> {
  const data = await request<{ categories: ApiRow[] }>(
    "/categories?per_page=100&page=1",
    locale,
  );
  return data.categories.map(mapCategory);
}

export async function getSuppliers(locale?: "en" | "bn"): Promise<Supplier[]> {
  const data = await request<{ shops: ApiRow[] }>(
    "/shops?per_page=100&page=1",
    locale,
  );
  return data.shops.map(mapSupplier);
}
