"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { Search, SlidersHorizontal, RefreshCw, Boxes } from "lucide-react";
import { useSelector } from "react-redux";
import { apiErrorMessage, useGetProductsQuery, useToggleProductStatusMutation, type ManagedProduct, type RootState } from "@/lib/store";

export default function ProductsPage() {
  const { token } = useSelector((state: RootState) => state.auth);
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const productsQuery = useGetProductsQuery({ per_page: 50, search: submittedQuery || undefined }, { skip: !token });
  const [toggleProductStatus] = useToggleProductStatusMutation();
  const result = productsQuery.data ?? { products: [], total: 0 };
  const loading = productsQuery.isLoading;
  const queryError = productsQuery.error ? apiErrorMessage(productsQuery.error, "Could not load your products. Please try again.") : "";

  async function toggleProduct(product: ManagedProduct) {
    if (!token) return;
    setBusyId(product.id);
    setError("");
    setNotice("");
    try {
      const response = await toggleProductStatus(product.id).unwrap();
      setNotice(`${product.name} is now ${response.product.is_active ? "active" : "paused"}.`);
    } catch (cause) {
      setError(apiErrorMessage(cause, "Could not change product status."));
    } finally {
      setBusyId(null);
    }
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedQuery(query);
    setError("");
  }

  return (
    <main className="page-content">
      <div className="page-heading"><div><p className="eyebrow">Store catalog</p><h1>Products</h1><p>Review stock, pricing, and visibility for your shop listings.</p></div><span className="date-chip"><Boxes size={14} /> {result.total} products</span></div>
      {(error || queryError) && <div className="error-box" role="alert">{error || queryError}</div>}
      {notice && <div className="success-box" role="status">{notice}</div>}
      <section className="panel">
        <form className="toolbar" onSubmit={submitSearch}>
          <label className="search-box"><Search size={16} /><input aria-label="Search products" placeholder="Search your products…" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
          <div className="toolbar-actions"><button className="secondary-button" type="submit"><SlidersHorizontal size={14} /> Search</button><button className="secondary-button" type="button" onClick={() => { setQuery(""); setSubmittedQuery(""); setError(""); }} disabled={loading}><RefreshCw size={14} /> Reset</button></div>
        </form>
        {submittedQuery && <p className="result-caption">Showing results for “{submittedQuery}”</p>}
        <div className="table-wrap"><table className="data-table"><thead><tr><th>Product</th><th>Brand</th><th>Price</th><th>Stock</th><th>Status</th><th>Visibility</th></tr></thead><tbody>
          {loading ? <TableMessage text="Loading products…" /> : result.products.length ? result.products.map((product) => <tr key={product.id}><td><div className="product-cell">{product.thumbnail ? <Image className="product-thumb" src={product.thumbnail} alt="" width={38} height={38} unoptimized /> : <span className="product-thumb-placeholder"><Boxes size={16} /></span>}<span>{product.name}</span></div></td><td>{product.brand || "—"}</td><td>{Number(product.price).toFixed(2)}</td><td>{product.quantity}</td><td><span className={`pill ${product.is_active ? "" : "inactive"}`}>{product.is_active ? "Active" : "Paused"}</span></td><td><button className="table-action" onClick={() => void toggleProduct(product)} disabled={busyId === product.id}>{busyId === product.id ? "Saving…" : product.is_active ? "Pause listing" : "Activate listing"}</button></td></tr>) : <TableMessage text="No products match this search." />}
        </tbody></table></div>
      </section>
      <p className="section-note">Product creation and editing are not exposed by the current seller API. Use the existing Laravel shop panel for those workflows.</p>
    </main>
  );
}

function TableMessage({ text }: { text: string }) {
  return <tr><td colSpan={6} className="table-empty">{text}</td></tr>;
}
