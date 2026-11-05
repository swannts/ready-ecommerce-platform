"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";
import { ArrowRight, Boxes, ChartNoAxesCombined, ClipboardList, PackageCheck, RefreshCw, ShoppingBag, Wallet } from "lucide-react";
import { useSelector } from "react-redux";
import { StatusPill } from "@/components/StatusPill";
import { apiErrorMessage, useGetDashboardQuery, useGetOrdersQuery, useGetProductsQuery, type RootState } from "@/lib/store";

export default function DashboardPage() {
  const { token, user } = useSelector((state: RootState) => state.auth);
  const dashboard = useGetDashboardQuery(undefined, { skip: !token });
  const orders = useGetOrdersQuery({ per_page: 5 }, { skip: !token });
  const products = useGetProductsQuery({ per_page: 5 }, { skip: !token });
  const summary = dashboard.data;
  const loading = dashboard.isLoading || orders.isLoading || products.isLoading;
  const dataError = dashboard.error || orders.error || products.error;
  const data = summary ? { summary, orders: orders.data?.orders ?? [], products: products.data?.products ?? [] } : null;
  const error = dataError ? apiErrorMessage(dataError, "Could not load your store overview. Please refresh and try again.") : "";
  const maxSales = useMemo(() => Math.max(...(summary?.sales_chart_values || [0]), 1), [summary]);
  const month = new Intl.DateTimeFormat("en", { month: "long" }).format(new Date());

  return (
    <main className="page-content">
      <div className="page-heading">
        <div><p className="eyebrow">Store overview</p><h1>Good morning, {user?.first_name || "there"}</h1><p>Here’s what’s happening with {user?.shop?.name || "your store"} today.</p></div>
        <button className="date-chip" onClick={() => { void dashboard.refetch(); void orders.refetch(); void products.refetch(); }} disabled={loading}><RefreshCw size={14} className={loading ? "spin" : ""} /> Refresh overview</button>
      </div>

      {error && <div className="error-box" role="alert">{error}</div>}
      <section className="metric-grid" aria-label="Store metrics">
        <MetricCard icon={<ShoppingBag size={17} />} label="Orders today" value={loading ? "—" : data?.summary.today_order ?? 0} note="Orders placed today" />
        <MetricCard icon={<ClipboardList size={17} />} iconTone="gold" label="Needs confirmation" value={loading ? "—" : data?.summary.pending_order ?? 0} note="Pending customer orders" />
        <MetricCard icon={<ChartNoAxesCombined size={17} />} iconTone="blue" label={`Sales in ${month}`} value={loading ? "—" : data?.summary.this_manth_sales ?? "0.00"} note="Completed orders · store currency" />
        <MetricCard icon={<Wallet size={17} />} iconTone="purple" label="Available balance" value={loading ? "—" : data?.summary.wallet_balance ?? "0.00"} note="After pending withdrawals" />
      </section>

      <section className="content-grid">
        <div className="panel">
          <div className="panel-heading"><div><h2>Sales performance</h2><p>Monthly delivered sales for this year</p></div><span className="metric-icon"><ChartNoAxesCombined size={17} /></span></div>
          <div className="chart" aria-label="Monthly sales chart">
            {data?.summary.sales_chart_values.some((value) => value > 0) ? data.summary.sales_chart_months.map((label, index) => {
              const value = data.summary.sales_chart_values[index] || 0;
              return <div className="chart-column" key={`${label}-${index}`} title={`${label}: ${value}`}><div className={`chart-bar ${index === new Date().getMonth() ? "current" : ""}`} style={{ height: `${Math.max(5, (value / maxSales) * 100)}%` }} /><span>{label}</span></div>;
            }) : <div className="chart-empty">{loading ? "Loading sales data…" : "Your sales chart will appear here as orders are delivered."}</div>}
          </div>
        </div>
        <div className="panel">
          <div className="panel-heading"><div><h2>Order flow</h2><p>Keep fulfillment moving</p></div><PackageCheck size={18} color="#397451" /></div>
          <div className="quick-list">
            <QuickLink href="/orders?status=pending" icon={<ClipboardList size={17} />} title="Confirm new orders" subtitle="Review and confirm customer orders" count={data?.summary.pending_order} />
            <QuickLink href="/orders?status=to_pickup" icon={<Boxes size={17} />} title="Prepare for pickup" subtitle="Orders ready for the delivery handoff" count={data?.summary.to_pickup_order} />
            <QuickLink href="/orders?status=to_delivery" icon={<ShoppingBag size={17} />} title="Out for delivery" subtitle="Orders currently on the way" count={data?.summary.to_delivery_order} />
          </div>
        </div>
      </section>

      <section className="content-grid dashboard-tables">
        <div className="panel">
          <div className="panel-heading"><div><h2>Recent orders</h2><p>Your latest customer activity</p></div><Link className="text-link" href="/orders">All orders <ArrowRight size={13} /></Link></div>
          <div className="table-wrap"><table className="data-table"><thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead><tbody>
            {loading && !data ? <TableMessage text="Loading recent orders…" /> : data?.orders.length ? data.orders.map((order) => <tr key={order.id}><td><strong>{order.order_code}</strong></td><td>{order.user?.name || "Customer"}</td><td>{order.order_placed}</td><td>{Number(order.amount).toFixed(2)}</td><td><StatusPill value={order.order_status} /></td></tr>) : <TableMessage text="No orders to show yet." />}
          </tbody></table></div>
        </div>
        <div className="panel">
          <div className="panel-heading"><div><h2>Catalog snapshot</h2><p>Your recently updated products</p></div><Link className="text-link" href="/products">Catalog <ArrowRight size={13} /></Link></div>
          <div className="quick-list">
            {loading && !data ? <div className="loading">Loading products…</div> : data?.products.length ? data.products.slice(0, 4).map((product) => <div className="catalog-row" key={product.id}>{product.thumbnail ? <Image src={product.thumbnail} alt="" width={38} height={38} unoptimized className="product-thumb" /> : <span className="product-thumb-placeholder"><Boxes size={16} /></span>}<div className="quick-copy"><strong>{product.name}</strong><span>{Number(product.price).toFixed(2)} · {product.quantity} in stock</span></div><span className={`pill ${product.is_active ? "" : "inactive"}`}>{product.is_active ? "Active" : "Paused"}</span></div>) : <div className="loading">No products found.</div>}
          </div>
        </div>
      </section>
    </main>
  );
}

function MetricCard({ icon, iconTone = "", label, value, note }: { icon: React.ReactNode; iconTone?: string; label: string; value: string | number; note: string }) {
  return <article className="metric-card"><div className="metric-top"><span>{label}</span><span className={`metric-icon ${iconTone}`}>{icon}</span></div><div className="metric-value">{value}</div><div className="metric-foot">{note}</div></article>;
}

function QuickLink({ href, icon, title, subtitle, count }: { href: string; icon: React.ReactNode; title: string; subtitle: string; count?: number }) {
  return <Link href={href} className="quick-link"><span className="quick-link-icon">{icon}</span><span className="quick-copy"><strong>{title}</strong><span>{subtitle}</span></span><span className="quick-count">{count ?? "—"}</span></Link>;
}

function TableMessage({ text }: { text: string }) {
  return <tr><td colSpan={5} className="table-empty">{text}</td></tr>;
}
