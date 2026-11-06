"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { Check, Eye, EyeOff, RefreshCw, ShieldAlert, X } from "lucide-react";
import {
  apiErrorMessage,
  useGetAdminBannersQuery,
  useGetAdminReturnsQuery,
  useGetAdminReviewsQuery,
  useGetAdminRidersQuery,
  useGetAdminWithdrawalsQuery,
  useRefundAdminReturnMutation,
  useToggleAdminBannerMutation,
  useToggleAdminReviewMutation,
  useToggleAdminRiderMutation,
  useUpdateAdminReturnMutation,
  useUpdateAdminWithdrawalMutation,
  type ApiRecord,
  type RootState,
} from "@/lib/store";

type Kind = "returns" | "withdrawals" | "reviews" | "riders" | "banners";
const object = (value: unknown): ApiRecord => typeof value === "object" && value !== null ? value as ApiRecord : {};
const value = (input: unknown, fallback = "—") => input === null || input === undefined || input === "" ? fallback : String(input);

export function AdminOperations({ kind }: { kind: Kind }) {
  const user = useSelector((state: RootState) => state.auth.user);
  const [error, setError] = useState("");
  const returns = useGetAdminReturnsQuery(undefined, { skip: kind !== "returns" });
  const withdrawals = useGetAdminWithdrawalsQuery(undefined, { skip: kind !== "withdrawals" });
  const reviews = useGetAdminReviewsQuery(undefined, { skip: kind !== "reviews" });
  const riders = useGetAdminRidersQuery(undefined, { skip: kind !== "riders" });
  const banners = useGetAdminBannersQuery(undefined, { skip: kind !== "banners" });
  const [updateReturn, returnMutation] = useUpdateAdminReturnMutation();
  const [refundReturn, refundMutation] = useRefundAdminReturnMutation();
  const [updateWithdrawal, withdrawalMutation] = useUpdateAdminWithdrawalMutation();
  const [toggleReview, reviewMutation] = useToggleAdminReviewMutation();
  const [toggleRider, riderMutation] = useToggleAdminRiderMutation();
  const [toggleBanner, bannerMutation] = useToggleAdminBannerMutation();

  const query = { returns, withdrawals, reviews, riders, banners }[kind];
  const rows: ApiRecord[] = query.data?.items ?? [];
  const title = { returns: "Returns and refunds", withdrawals: "Shop withdrawals", reviews: "Product reviews", riders: "Delivery riders", banners: "Marketplace banners" }[kind];
  const permission = { returns: "admin.returnOrder.index", withdrawals: "admin.withdraw.index", reviews: "admin.review.index", riders: "admin.rider.index", banners: "admin.banner.index" }[kind];
  const can = (name: string) => Boolean(user?.roles?.includes("root") || user?.permissions?.includes(name));
  const busy = returnMutation.isLoading || refundMutation.isLoading || withdrawalMutation.isLoading || reviewMutation.isLoading || riderMutation.isLoading || bannerMutation.isLoading;
  const run = async (action: () => Promise<unknown>) => {
    setError("");
    try { await action(); } catch (cause) { setError(apiErrorMessage(cause, "The action could not be completed.")); }
  };

  function cells(row: ApiRecord) {
    const shop = object(row.shop);
    const customer = object(object(row.customer).user);
    const product = object(row.product);
    const driver = object(row.driver);
    const order = object(row.order);
    if (kind === "returns") return <><td>#{value(order.order_code || row.order_id || row.id)}</td><td>{value(shop.name)}</td><td>{value(customer.name)}</td><td>{value(row.amount)}</td><td>{value(row.status)}</td><td>{row.payment_status ? "Refunded" : "Unpaid"}</td></>;
    if (kind === "withdrawals") return <><td>{value(shop.name || object(row.user).name)}</td><td>{value(row.name || object(row.user).name)}</td><td>{value(row.amount)}</td><td>{value(row.status)}</td><td>{value(row.reason)}</td></>;
    if (kind === "reviews") return <><td>{value(product.name)}</td><td>{value(customer.name)}</td><td>{value(row.rating)}</td><td>{value(row.description)}</td><td>{row.is_active ? "Visible" : "Hidden"}</td></>;
    if (kind === "riders") return <><td>{value(row.name)}</td><td>{value(row.email)}</td><td>{value(row.phone)}</td><td>{object(driver.driver_location).latitude ? `${value(object(driver.driver_location).latitude)}, ${value(object(driver.driver_location).longitude)}` : "Location unavailable"}</td><td>{row.is_active ? "Active" : "Inactive"}</td></>;
    return <><td>{value(row.title)}</td><td>{value(row.banner || object(row.media).src)}</td><td>{row.status ? "Active" : "Inactive"}</td></>;
  }

  function action(row: ApiRecord) {
    const id = Number(row.id);
    if (kind === "returns") return <>
      {row.status === "Pending" && can("admin.returnOrder.reject") && <><button className="table-action" disabled={busy} onClick={() => void run(() => updateReturn({ id, status: "Approved" }).unwrap())}><Check size={13} /> Approve</button><button className="table-action danger" disabled={busy} onClick={() => void run(() => updateReturn({ id, status: "Cancelled" }).unwrap())}><X size={13} /> Reject</button></>}
      {row.status === "Approved" && !row.payment_status && can("admin.returnOrder.payment.status") && <button className="table-action" disabled={busy} onClick={() => { if (window.confirm("Issue this refund to the customer? The shop wallet will be debited.")) void run(() => refundReturn(id).unwrap()); }}>Issue refund</button>}
    </>;
    if (kind === "withdrawals") return row.status === "pending" && can("admin.withdraw.update") ? <><button className="table-action" disabled={busy} onClick={() => { if (window.confirm("Approve this withdrawal? The shop wallet will be debited.")) void run(() => updateWithdrawal({ id, status: "approved" }).unwrap()); }}><Check size={13} /> Approve</button><button className="table-action danger" disabled={busy} onClick={() => void run(() => updateWithdrawal({ id, status: "denied" }).unwrap())}><X size={13} /> Deny</button></> : null;
    if (kind === "reviews" && can("admin.review.toggle")) return <button className="table-action" disabled={busy} onClick={() => void run(() => toggleReview(id).unwrap())}>{row.is_active ? <><EyeOff size={13} /> Hide</> : <><Eye size={13} /> Show</>}</button>;
    if (kind === "riders" && can("admin.rider.toggle")) return <button className="table-action" disabled={busy} onClick={() => void run(() => toggleRider(id).unwrap())}>{row.is_active ? "Deactivate" : "Activate"}</button>;
    if (kind === "banners" && can("admin.banner.toggle")) return <button className="table-action" disabled={busy} onClick={() => void run(() => toggleBanner(id).unwrap())}>{row.status ? "Disable" : "Enable"}</button>;
    return null;
  }

  const columns = {
    returns: ["Order", "Shop", "Customer", "Amount", "Return status", "Payment", "Actions"],
    withdrawals: ["Shop", "Recipient", "Amount", "Status", "Reason", "Actions"],
    reviews: ["Product", "Customer", "Rating", "Review", "Visibility", "Actions"],
    riders: ["Rider", "Email", "Phone", "Latest location", "Account", "Actions"],
    banners: ["Banner", "Image", "Status", "Actions"],
  }[kind];

  return <main className="page-content">
    <div className="page-heading"><div><p className="eyebrow">Marketplace operations</p><h1>{title}</h1><p>Live records and actions from your Laravel admin.</p></div><button className="date-chip" onClick={() => void query.refetch()}><RefreshCw size={14} /> Refresh · {query.data?.total ?? rows.length}</button></div>
    {!can(permission) && <div className="error-box">Your account does not have permission to view this section.</div>}
    {error && <div className="error-box" role="alert">{error}</div>}
    {query.error && <div className="error-box" role="alert">{apiErrorMessage(query.error, `Could not load ${title.toLowerCase()}.`)}</div>}
    <section className="panel"><div className="table-wrap"><table className="data-table"><thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>
      {rows.map((row, index) => <tr key={value(row.id, String(index))}>{cells(row)}<td>{action(row)}</td></tr>)}
      {!rows.length && <tr><td className="table-empty" colSpan={columns.length}>{query.isLoading ? "Loading live records…" : "No records found."}</td></tr>}
    </tbody></table></div></section>
    {kind === "withdrawals" || kind === "returns" ? <p className="login-note" style={{ marginTop: 14 }}><ShieldAlert size={14} style={{ verticalAlign: "middle", marginRight: 4 }} /> Financial actions immediately update the related wallet and transaction records.</p> : null}
  </main>;
}
