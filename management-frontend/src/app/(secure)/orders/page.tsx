"use client";

import { useState, type FormEvent } from "react";
import { ClipboardList, RefreshCw, Search } from "lucide-react";
import { useSelector } from "react-redux";
import { apiErrorMessage, useGetOrdersQuery, useUpdateOrderStatusMutation, type ManagedOrder, type RootState } from "@/lib/store";
import { StatusPill } from "@/components/StatusPill";

export default function OrdersPage() {
  const { token } = useSelector((state: RootState) => state.auth);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const ordersQuery = useGetOrdersQuery({ per_page: 50, order_status: filter || undefined, search: search.trim() || undefined }, { skip: !token });
  const [updateOrderStatus] = useUpdateOrderStatusMutation();
  const result = ordersQuery.data ?? { orders: [], total_items: 0 };
  const loading = ordersQuery.isLoading;
  const queryError = ordersQuery.error ? apiErrorMessage(ordersQuery.error, "Could not load your orders. Please try again.") : "";

  async function updateOrder(order: ManagedOrder, orderStatus: "confirm" | "cancel") {
    if (!token) return;
    setBusyId(order.id);
    setError("");
    setNotice("");
    try {
      await updateOrderStatus({ order_id: order.id, order_status: orderStatus }).unwrap();
      setNotice(`${order.order_code} was ${orderStatus === "confirm" ? "confirmed" : "cancelled"}.`);
    } catch (cause) {
      setError(apiErrorMessage(cause, "Could not update this order."));
    } finally {
      setBusyId(null);
    }
  }

  function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
  }

  return (
    <main className="page-content">
      <div className="page-heading"><div><p className="eyebrow">Fulfillment</p><h1>Orders</h1><p>Review customer orders and confirm the ones you’re ready to fulfill.</p></div><span className="date-chip"><ClipboardList size={14} /> {result.total_items} orders</span></div>
      {(error || queryError) && <div className="error-box" role="alert">{error || queryError}</div>}
      {notice && <div className="success-box" role="status">{notice}</div>}
      <section className="panel">
        <form className="toolbar" onSubmit={onSearch}>
          <label className="search-box"><Search size={16} /><input aria-label="Search orders" placeholder="Order number, customer, email…" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
          <div className="toolbar-actions"><select className="select" aria-label="Filter order status" value={filter} onChange={(event) => setFilter(event.target.value)}><option value="">All statuses</option><option value="pending">Pending</option><option value="confirm">Confirmed</option><option value="to_pickup">To pickup</option><option value="to_delivery">To delivery</option><option value="delivered">Delivered</option></select><button className="secondary-button" type="button" onClick={() => void ordersQuery.refetch()} disabled={loading}><RefreshCw size={14} /> Refresh</button></div>
        </form>
        <div className="table-wrap"><table className="data-table"><thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Payment</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead><tbody>
          {loading ? <TableMessage text="Loading orders…" /> : result.orders.length ? result.orders.map((order) => <tr key={order.id}><td><strong>{order.order_code}</strong></td><td>{order.user?.name || "Customer"}<span className="sub-cell">{order.user?.phone}</span></td><td>{order.order_placed}</td><td><span className={`pill ${order.payment_status.toLowerCase() === "unpaid" ? "pending" : ""}`}>{order.payment_method} · {order.payment_status}</span></td><td>{Number(order.amount).toFixed(2)}</td><td><StatusPill value={order.order_status} /></td><td>{order.order_status === "pending" ? <div className="row-actions"><button className="table-action" disabled={busyId === order.id} onClick={() => void updateOrder(order,"confirm")}>{busyId === order.id ? "Saving…" : "Confirm"}</button><button className="table-action danger" disabled={busyId === order.id} onClick={() => void updateOrder(order,"cancel")}>Cancel</button></div> : <span className="muted-cell">—</span>}</td></tr>) : <TableMessage text="No orders match these filters." />}
        </tbody></table></div>
      </section>
      <p className="section-note">Order actions use the seller API. Other fulfillment status changes remain available in the existing shop panel.</p>
    </main>
  );
}

function TableMessage({ text }: { text: string }) {
  return <tr><td colSpan={7} className="table-empty">{text}</td></tr>;
}
