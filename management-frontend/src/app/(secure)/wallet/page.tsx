"use client";

import { useState, type FormEvent } from "react";
import { useSelector } from "react-redux";
import { ArrowDownToLine, Wallet } from "lucide-react";
import { apiErrorMessage, useGetWalletHistoryQuery, useGetWalletQuery, useRequestWithdrawalMutation, type ApiRecord, type RootState } from "@/lib/store";

const field = (item: ApiRecord, key: string) => item[key] == null ? "—" : String(item[key]);

export default function WalletPage() {
  const { token } = useSelector((state: RootState) => state.auth);
  const wallet = useGetWalletQuery(undefined, { skip: !token });
  const history = useGetWalletHistoryQuery({ page: 1, per_page: 30 }, { skip: !token });
  const [requestWithdrawal, withdrawal] = useRequestWithdrawalMutation();
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(""); setError("");
    try {
      await requestWithdrawal({ amount: Number(amount), name, contact_number: contact, message }).unwrap();
      setNotice("Your withdrawal request was submitted."); setAmount(""); setMessage("");
    } catch (cause) { setError(apiErrorMessage(cause, "Could not request a withdrawal.")); }
  }

  const summary = wallet.data ?? {};
  const historyRows = history.data?.withdraws ?? [];
  return <main className="page-content">
    <div className="page-heading"><div><p className="eyebrow">Store finances</p><h1>Wallet & withdrawals</h1><p>Review earnings and request a payout to your registered payment account.</p></div><span className="date-chip"><Wallet size={14} /> Balance ৳{field(summary, "withdrawable_amount")}</span></div>
    {error && <div className="error-box" role="alert">{error}</div>}{notice && <div className="success-box" role="status">{notice}</div>}
    <section className="metric-grid">
      <Metric label="Withdrawable" value={field(summary, "withdrawable_amount")} />
      <Metric label="Lifetime sales" value={field(summary, "lifetime_sales")} />
      <Metric label="Current period sales" value={field(summary, "total_sales")} />
      <Metric label="Commission" value={field(summary, "commission")} />
    </section>
    <section className="content-grid" style={{ marginTop: 16 }}>
      <div className="panel"><div className="panel-heading"><div><h2>Request a withdrawal</h2><p>Minimum amount: ৳{field(summary, "min_withdraw_amount")}</p></div><ArrowDownToLine size={18} color="#397451" /></div>
        <form onSubmit={submit}>
          <div className="field"><label htmlFor="withdraw-amount">Amount</label><input id="withdraw-amount" type="number" min={summary.min_withdraw_amount == null ? 0 : Number(summary.min_withdraw_amount)} step="0.01" required value={amount} onChange={e => setAmount(e.target.value)} /></div>
          <div className="field"><label htmlFor="withdraw-name">Account holder</label><input id="withdraw-name" required value={name} onChange={e => setName(e.target.value)} /></div>
          <div className="field"><label htmlFor="withdraw-contact">Payment contact</label><input id="withdraw-contact" required value={contact} onChange={e => setContact(e.target.value)} /></div>
          <div className="field"><label htmlFor="withdraw-note">Note (optional)</label><textarea id="withdraw-note" value={message} onChange={e => setMessage(e.target.value)} /></div>
          <button className="primary-button" disabled={withdrawal.isLoading || summary.is_withdrawable === false}>{withdrawal.isLoading ? "Submitting…" : "Request withdrawal"}</button>
          {summary.is_withdrawable === false && <p className="section-note">A withdrawal request is not available yet. Please check again later.</p>}
        </form>
      </div>
      <div className="panel"><div className="panel-heading"><div><h2>Withdrawal history</h2><p>{history.data?.total ?? 0} requests</p></div></div>
        <div className="table-wrap"><table className="data-table"><thead><tr><th>Date</th><th>Amount</th><th>Status</th></tr></thead><tbody>
          {history.isLoading ? <Row text="Loading withdrawal history…" /> : historyRows.length ? historyRows.map((item, index) => <tr key={field(item, "id") !== "—" ? field(item, "id") : index}><td>{field(item, "created_at")}</td><td>৳{field(item, "amount")}</td><td>{field(item, "status")}</td></tr>) : <Row text="No withdrawal requests yet." />}
        </tbody></table></div>
      </div>
    </section>
  </main>;
}

function Metric({ label, value }: { label: string; value: string }) { return <article className="metric-card"><div className="metric-top"><span>{label}</span><span className="metric-icon"><Wallet size={16} /></span></div><div className="metric-value">{value}</div><div className="metric-foot">Store currency · BDT</div></article>; }
function Row({ text }: { text: string }) { return <tr><td colSpan={3} className="table-empty">{text}</td></tr>; }
