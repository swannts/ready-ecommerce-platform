import { RiceCategory, RiceProduct } from "@/types/product";
import { Supplier } from "@/types/supplier";
import { showcaseCategories, showcaseProducts, showcaseSuppliers, getShowcaseLegalPage } from "@/lib/showcase-data";

/** Local, deterministic data used by the frontend-only showcase. */
export async function getProducts(
  criteria: { categorySlug?: string; grainType?: string; searchQuery?: string; sortBy?: string; supplierSlug?: string } = {},
  _locale?: "en" | "bn",
): Promise<RiceProduct[]> {
  void _locale;
  const query = criteria.searchQuery?.trim().toLocaleLowerCase();
  const products = showcaseProducts.filter((product) =>
    (!criteria.categorySlug || product.categorySlug === criteria.categorySlug)
    && (!criteria.grainType || product.grainType === criteria.grainType)
    && (!criteria.supplierSlug || product.supplierSlug === criteria.supplierSlug)
    && (!query || `${product.name} ${product.variety} ${product.brand} ${product.supplierName}`.toLocaleLowerCase().includes(query)),
  );
  if (criteria.sortBy === "price-asc") products.sort((a, b) => a.retailPricePerKg - b.retailPricePerKg);
  if (criteria.sortBy === "price-desc") products.sort((a, b) => b.retailPricePerKg - a.retailPricePerKg);
  if (criteria.sortBy === "rating") products.sort((a, b) => b.rating - a.rating);
  return products.map((product) => ({ ...product, packagingOptions: product.packagingOptions.map((item) => ({ ...item })) }));
}

export async function getCategories(_locale?: "en" | "bn"): Promise<RiceCategory[]> {
  void _locale;
  return showcaseCategories.map((category) => ({ ...category }));
}

export async function getSuppliers(_locale?: "en" | "bn"): Promise<Supplier[]> {
  void _locale;
  return showcaseSuppliers.map((supplier) => ({ ...supplier, certifications: [...supplier.certifications] }));
}

export async function getLegalPage(slug: string, _locale?: "en" | "bn") {
  void _locale;
  const content = getShowcaseLegalPage(slug);
  if (!content) throw new Error("This showcase policy page is not available.");
  return { content: { title: content.title, description: content.description } };
}

export async function submitSupportRequest(_payload: {
  name?: string;
  phone?: string;
  subject: string;
  message: string;
}) {
  void _payload;
  await new Promise((resolve) => setTimeout(resolve, 250));
  return "Showcase only: no request was sent or stored.";
}
