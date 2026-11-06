"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { apiErrorMessage, useCreateSellerProductMutation, useGetProductOptionsQuery, useGetSellerProductQuery, useUpdateSellerProductMutation, useUploadShopImageMutation, type ApiRecord, type RootState } from "@/lib/store";

type Fields = { name: string; short_description: string; description: string; category: string; brand: string; unit: string; code: string; price: string; quantity: string; min_order_quantity: string };
const initial: Fields = { name: "", short_description: "", description: "", category: "", brand: "", unit: "", code: "", price: "", quantity: "", min_order_quantity: "1" };
const labelOf = (item: ApiRecord) => String(item.name ?? item.title ?? "");

export function ProductEditor({ productId }: { productId: number | null }) {
  const router = useRouter();
  const { token } = useSelector((state: RootState) => state.auth);
  const options = useGetProductOptionsQuery(undefined, { skip: !token });
  const productQuery = useGetSellerProductQuery(productId ?? 0, { skip: !token || !productId });
  const [upload, uploadState] = useUploadShopImageMutation();
  const [create, createState] = useCreateSellerProductMutation();
  const [update, updateState] = useUpdateSellerProductMutation();
  const [fields, setFields] = useState<Fields>(initial);
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const product = productQuery.data?.product;
    if (!product) return;
    const category = product.category && typeof product.category === "object" ? product.category as ApiRecord : {};
    const brand = product.brand && typeof product.brand === "object" ? product.brand as ApiRecord : {};
    const unit = product.unit && typeof product.unit === "object" ? product.unit as ApiRecord : {};
    setFields({ name: String(product.name ?? ""), short_description: String(product.short_description ?? ""), description: String(product.description ?? ""), category: String(category.id ?? ""), brand: String(brand.id ?? ""), unit: String(unit.id ?? ""), code: String(product.code ?? ""), price: String(product.price ?? ""), quantity: String(product.quantity ?? ""), min_order_quantity: String(product.min_order_quantity ?? "1") });
  }, [productQuery.data]);

  function set(key: keyof Fields, value: string) { setFields(current => ({ ...current, [key]: value })); }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    try {
      let thumbnail = "";
      if (image) { const body = new FormData(); body.set("file", image); thumbnail = (await upload(body).unwrap()).path; }
      if (!productId && !thumbnail) throw new Error("Upload a product image before saving.");
      const body = new FormData();
      Object.entries(fields).forEach(([key, value]) => { if (value !== "") body.set(key, value); });
      if (thumbnail) body.set("thumbnail", thumbnail);
      if (productId) await update({ id: productId, body }).unwrap();
      else await create(body).unwrap();
      router.push("/products"); router.refresh();
    } catch (cause) { setError(apiErrorMessage(cause, "Could not save this product.")); }
  }

  const saving = uploadState.isLoading || createState.isLoading || updateState.isLoading;
  const createData = options.data;
  return <main className="page-content">
    <div className="page-heading"><div><p className="eyebrow">Store catalog</p><h1>{productId ? "Edit product" : "Add product"}</h1><p>Product updates are submitted to the Laravel shop catalog.</p></div><Link className="secondary-button" href="/products"><ArrowLeft size={14} />Back to products</Link></div>
    {(error || (productQuery.error && !error)) && <div className="error-box" role="alert">{error || apiErrorMessage(productQuery.error, "Unable to load this product.")}</div>}
    {options.isLoading || productQuery.isLoading ? <div className="panel loading">Loading product data…</div> : <form className="panel product-editor" onSubmit={submit}>
      <div className="form-two"><Field label="Product name" required><input value={fields.name} onChange={e => set("name", e.target.value)} required maxLength={191} /></Field><Field label="SKU / product code" required><input value={fields.code} onChange={e => set("code", e.target.value)} required inputMode="numeric" minLength={5} maxLength={25} /></Field></div>
      <div className="form-two"><Field label="Category" required><select value={fields.category} onChange={e => set("category", e.target.value)} required><option value="">Select category</option>{(createData?.categories ?? []).map((item, i) => <option key={String(item.id ?? i)} value={String(item.id ?? "")}>{labelOf(item)}</option>)}</select></Field><Field label="Brand"><select value={fields.brand} onChange={e => set("brand", e.target.value)}><option value="">No brand</option>{(createData?.brands ?? []).map((item, i) => <option key={String(item.id ?? i)} value={String(item.id ?? "")}>{labelOf(item)}</option>)}</select></Field></div>
      <div className="form-two"><Field label="Unit"><select value={fields.unit} onChange={e => set("unit", e.target.value)}><option value="">Default unit</option>{(createData?.units ?? []).map((item, i) => <option key={String(item.id ?? i)} value={String(item.id ?? "")}>{labelOf(item)}</option>)}</select></Field><Field label="Product image" required={!productId}><input type="file" accept="image/png,image/jpeg,image/webp" required={!productId} onChange={e => setImage(e.target.files?.[0] ?? null)} /></Field></div>
      {productId && <p className="section-note">Choose a new image to replace the existing thumbnail. Leave it empty to keep the current image.</p>}
      <div className="form-two"><Field label="Price" required><input type="number" min="0" step="0.01" value={fields.price} onChange={e => set("price", e.target.value)} required /></Field><Field label="Stock quantity" required><input type="number" min="0" step="1" value={fields.quantity} onChange={e => set("quantity", e.target.value)} required /></Field></div>
      <Field label="Minimum order quantity"><input type="number" min="0" step="1" value={fields.min_order_quantity} onChange={e => set("min_order_quantity", e.target.value)} /></Field>
      <Field label="Short description" required><input value={fields.short_description} onChange={e => set("short_description", e.target.value)} maxLength={191} required /></Field>
      <Field label="Description" required><textarea value={fields.description} onChange={e => set("description", e.target.value)} required /></Field>
      <button className="primary-button" disabled={saving}><Save size={14} />{saving ? "Saving…" : productId ? "Save product" : "Create product"}</button>
    </form>}
  </main>;
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) { return <label className="field"><span>{label}{required ? " *" : ""}</span>{children}</label>; }
