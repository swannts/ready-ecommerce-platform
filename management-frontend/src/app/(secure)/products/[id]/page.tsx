"use client";

import { useParams } from "next/navigation";
import { ProductEditor } from "@/components/ProductEditor";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  return Number.isInteger(id) && id > 0 ? <ProductEditor productId={id} /> : <main className="page-content"><div className="error-box">Invalid product ID.</div></main>;
}
