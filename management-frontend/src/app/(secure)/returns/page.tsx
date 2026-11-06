"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { RotateCcw } from "lucide-react";
import { apiErrorMessage, useGetReturnsQuery, useUpdateReturnStatusMutation, type ApiRecord, type RootState } from "@/lib/store";

const get = (row: ApiRecord, key: string) => row[key] == null ? "—" : String(row[key]);

export default function ReturnsPage() {
  const { token } = useSelector((state: RootState) => state.auth);
  const returnsQuery = useGetReturnsQuery({ page: 1, per_page: 50 }, { skip: !token });
  const [updateStatus, mutation] = useUpdateReturnStatusMutation();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function update(row: ApiRecord, status: string) {
    setError(""); setNotice("");
    try {
      await updateStatus({ id: Number(row.id), status }).unwrap();
      setNotice(`Return for order ${get(row, "order_id")} updated to ${status}.`);
    } catch (cause) { setError(apiErrorMessage(cause, "Could not update this return.")); }
  }

  const rows = returnsQuery.data?.returnOrders ?? [];
  return <main className="page-content">
    <div className="page-heading"><div><p className="eyebrow">Customer service</p><h1>Returns & refunds</h1><p>Review return requests and record the inspection outcome.</p></div><span className="date-chip"><RotateCcw size={14} /> {returnsQuery.data?.total ?? 0} requests</span></div>
    {error && <div className="error-box" role="alert">{error}</div>}{notice && <div className="success-box" role="status">{notice}</div>}
    <section className="panel"><div className="table-wrap"><table className="data-table"><thead><tr><th>Order</th><th>Reason</th><th>Quantity</th><th>Amount</th><th>Requested</th><th>Status</th><th>Payment</th><th>Inspection</th></tr></thead><tbody>
      {returnsQuery.isLoading ? <Empty text="Loading return requests…" /> : rows.length ? rows.map((row, index) => <tr key={get(row, "id") !== "—" ? get(row, "id") : index}><td><strong>{get(row, "order_id")}</strong></td><td>{get(row, "reason")}</td><td>{get(row, "quantity")}</td><td>৳{get(row, "amount")}</td><td>{get(row, "return_date")}</td><td>{get(row, "status")}</td><td>{get(row, "payment_status")}</td><td><select className="select" aria-label={`Set return status for ${get(row, "order_id")}`} disabled={mutation.isLoading || get(row, "payment_status") === "Paid"} value={get(row, "status")} onChange={event => void update(row, event.target.value)}><option value="Pending">Pending</option><option value="Approved">Approved</option><option value="Damaged">Damaged</option><option value="Mismatch">Mismatch</option></select></td></tr>) : <Empty text="There are no return requests." />}
    </tbody></table></div></section>
    <p className="section-note">Paid return requests are locked by Laravel. The backend currently supports Pending, Approved, Damaged, and Mismatch outcomes.</p>
  </main>;
}

function Empty({ text }: { text: string }) { return <tr><td colSpan={8} className="table-empty">{text}</td></tr>; }
