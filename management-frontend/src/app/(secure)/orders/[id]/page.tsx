"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { ArrowLeft, PackageCheck } from "lucide-react";
import { apiErrorMessage, useGetSellerOrderQuery, type ApiRecord, type RootState } from "@/lib/store";

const get = (row: ApiRecord, key: string) => row[key] == null ? "—" : String(row[key]);
const nested = (row: ApiRecord, key: string) => row[key] && typeof row[key] === "object" ? row[key] as ApiRecord : {};

export default function OrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { token } = useSelector((state: RootState) => state.auth);
  const query = useGetSellerOrderQuery(id, { skip: !token || !Number.isInteger(id) || id < 1 });
  const order = query.data?.order;
  const customer = order ? nested(order, "user") : {};
  const products = order && Array.isArray(order.products) ? order.products as ApiRecord[] : [];
  return <main className="page-content">
    <div className="page-heading"><div><p className="eyebrow">Order management</p><h1>{order ? get(order, "order_code") : "Order details"}</h1><p>Customer, payment, and line item information from your shop order.</p></div><Link className="secondary-button" href="/orders"><ArrowLeft size={14} />Back to orders</Link></div>
    {query.isLoading && <div className="panel loading">Loading order…</div>}{query.error && <div className="error-box" role="alert">{apiErrorMessage(query.error, "Could not load this order.")}</div>}
    {order && <><section className="metric-grid"><Metric label="Order status" value={get(order, "order_status")} /><Metric label="Payment status" value={get(order, "payment_status")} /><Metric label="Total paid" value={`৳${get(order, "amount")}`} /><Metric label="Placed" value={get(order, "order_placed")} /></section>
      <section className="content-grid"><div className="panel"><div className="panel-heading"><div><h2>Customer</h2></div></div><p><strong>{get(customer, "name")}</strong></p><p>{get(customer, "phone")}</p><p>{get(nested(customer, "address"), "address")}</p></div><div className="panel"><div className="panel-heading"><div><h2>Delivery & payment</h2></div><PackageCheck size={18} color="#397451" /></div><p>Payment method: {get(order, "payment_method")}</p><p>Delivery fee: ৳{get(order, "delivery_charge")}</p><p>Estimated delivery: {get(order, "estimated_delivery_date")}</p><p>Pickup date: {get(order, "pickup_date")}</p><p>Delivery date: {get(order, "delivery_date")}</p></div></section>
      <section className="panel" style={{ marginTop: 16 }}><div className="panel-heading"><div><h2>Products</h2><p>{products.length} line items</p></div></div><div className="table-wrap"><table className="data-table"><thead><tr><th>Product</th><th>Price</th><th>Quantity</th><th>Status</th></tr></thead><tbody>{products.length ? products.map((product, index) => <tr key={get(product, "id") !== "—" ? get(product, "id") : index}><td>{get(product, "name")}</td><td>৳{get(product, "price")}</td><td>{get(product, "quantity")}</td><td>{product.is_active === false ? "Inactive" : "Active"}</td></tr>) : <tr><td className="table-empty" colSpan={4}>No order lines found.</td></tr>}</tbody></table></div></section>
    </>}
  </main>;
}

function Metric({ label, value }: { label: string; value: string }) { return <article className="metric-card"><div className="metric-top">{label}</div><div className="metric-value" style={{ fontSize: 18 }}>{value}</div></article>; }
