"use client";

import Link from "next/link";
import { useSelector } from "react-redux";
import { ArrowRight, Boxes, ClipboardList, RefreshCw, Store, Users } from "lucide-react";
import { apiErrorMessage, useGetAdminDashboardQuery, type ApiRecord, type RootState } from "@/lib/store";

type Summary = Record<string, number>;
const read = (value: unknown, key: string): unknown => typeof value === "object" && value !== null ? (value as ApiRecord)[key] : undefined;

export default function AdminDashboardPage() {
  const token = useSelector((state: RootState) => state.auth.token);
  const { data, error, isLoading, refetch } = useGetAdminDashboardQuery(undefined, { skip: !token });
  const summary = (data?.summary || {}) as Summary;
  const name = useSelector((state: RootState) => state.auth.user?.name || "Administrator");
  const metrics = [{ label: "Marketplace shops", value: summary.shops, icon: Store }, { label: "Orders", value: summary.orders, icon: ClipboardList }, { label: "Customers", value: summary.customers, icon: Users }, { label: "Products awaiting review", value: summary.pending_products, icon: Boxes }];
  const orders = Array.isArray(data?.recent_orders) ? data.recent_orders as ApiRecord[] : [];
  const products = Array.isArray(data?.pending_products) ? data.pending_products as ApiRecord[] : [];
  return <main className="page-content"><div className="page-heading"><div><p className="eyebrow">Marketplace control center</p><h1>Welcome, {name}</h1><p>Live operations data from your Laravel marketplace.</p></div><button className="date-chip" onClick={() => void refetch()}><RefreshCw size={14} /> Refresh overview</button></div>{error && <div className="error-box">{apiErrorMessage(error, "Could not load admin dashboard.")}</div>}<section className="metric-grid">{metrics.map(({ label, value, icon: Icon }) => <div className="metric-card" key={label}><span className="metric-icon"><Icon size={17} /></span><div className="metric-label">{label}</div><div className="metric-value">{isLoading ? "—" : value ?? 0}</div></div>)}</section><section className="content-grid dashboard-tables"><div className="panel"><div className="panel-heading"><div><h2>Recent orders</h2><p>Latest marketplace transactions</p></div><Link className="text-link" href="/admin/orders">View orders <ArrowRight size={13} /></Link></div><div className="table-wrap"><table className="data-table"><thead><tr><th>Order</th><th>Customer</th><th>Shop</th><th>Total</th><th>Status</th></tr></thead><tbody>{orders.length ? orders.map((row, i) => <tr key={String(row.id || i)}><td>#{String(row.order_code || row.id || "—")}</td><td>{String(read(read(row, "customer"), "user") ? read(read(read(row, "customer"), "user"), "name") : "Customer")}</td><td>{String(read(row.shop, "name") || "—")}</td><td>{String(row.total_amount || row.amount || "—")}</td><td>{String(row.order_status || "—")}</td></tr>) : <tr><td className="table-empty" colSpan={5}>{isLoading ? "Loading orders…" : "No recent orders found."}</td></tr>}</tbody></table></div></div><div className="panel"><div className="panel-heading"><div><h2>Product approvals</h2><p>New submissions need review</p></div><Link className="text-link" href="/admin/products">Review <ArrowRight size={13} /></Link></div><div className="quick-list">{products.length ? products.slice(0, 6).map((row, i) => <Link className="quick-item" href="/admin/products" key={String(row.id || i)}><span className="metric-icon"><Boxes size={16} /></span><span><strong>{String(row.name || "Untitled product")}</strong><small>{String(read(row.shop, "name") || "Marketplace seller")}</small></span><ArrowRight size={14} /></Link>) : <p className="chart-empty">{isLoading ? "Loading submissions…" : "No products awaiting review."}</p>}</div></div></section></main>;
}
