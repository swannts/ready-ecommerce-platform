"use client";

import { useState, type FormEvent } from "react";
import { useSelector } from "react-redux";
import { Check, Plus, RefreshCw } from "lucide-react";
import {
  apiErrorMessage,
  useActivateAdminShopSubscriptionMutation,
  useCreateAdminSubscriptionPlanMutation,
  useDeleteAdminSubscriptionPlanMutation,
  useGetAdminShopSubscriptionsQuery,
  useGetAdminSubscriptionPlansQuery,
  useToggleAdminSubscriptionPlanMutation,
  useUpdateAdminSubscriptionPlanMutation,
  type ApiRecord,
  type RootState,
} from "@/lib/store";

const obj = (value: unknown): ApiRecord => typeof value === "object" && value !== null ? value as ApiRecord : {};
const str = (value: unknown, fallback = "—") => value === null || value === undefined || value === "" ? fallback : String(value);

export function AdminSubscriptions() {
  const user = useSelector((state: RootState) => state.auth.user);
  const [shopId, setShopId] = useState("");
  const [status, setStatus] = useState("");
  const [editing, setEditing] = useState<ApiRecord | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({ name: "", short_description: "", description: "", price: "0", duration: "30", sale_limit: "0", is_popular: false });
  const plans = useGetAdminSubscriptionPlansQuery(undefined);
  const subscriptions = useGetAdminShopSubscriptionsQuery({ shop_id: shopId ? Number(shopId) : undefined, status: status || undefined });
  const [createPlan, createState] = useCreateAdminSubscriptionPlanMutation();
  const [updatePlan, updateState] = useUpdateAdminSubscriptionPlanMutation();
  const [togglePlan] = useToggleAdminSubscriptionPlanMutation();
  const [deletePlan] = useDeleteAdminSubscriptionPlanMutation();
  const [activateSubscription] = useActivateAdminShopSubscriptionMutation();
  const can = (permission: string) => Boolean(user?.roles?.includes("root") || user?.permissions?.includes(permission));

  async function run(action: () => Promise<unknown>, message: string) {
    setError(""); setSuccess("");
    try { await action(); setSuccess(message); }
    catch (cause) { setError(apiErrorMessage(cause, "The request could not be completed.")); }
  }

  function startCreate() {
    setEditing(null);
    setFormOpen(true);
    setForm({ name: "", short_description: "", description: "", price: "0", duration: "30", sale_limit: "0", is_popular: false });
  }

  function startEdit(plan: ApiRecord) {
    setEditing(plan);
    setFormOpen(true);
    setForm({ name: str(plan.name, ""), short_description: str(plan.short_description, ""), description: str(plan.description, ""), price: str(plan.price, "0"), duration: str(plan.duration, ""), sale_limit: str(plan.sale_limit, ""), is_popular: Boolean(plan.is_popular) });
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const body = { ...form, price: Number(form.price), duration: form.duration ? Number(form.duration) : null, sale_limit: form.sale_limit ? Number(form.sale_limit) : null };
    await run(async () => {
      if (editing) await updatePlan({ id: Number(editing.id), body }).unwrap();
      else await createPlan(body).unwrap();
      setEditing(null); setFormOpen(false);
      setForm({ name: "", short_description: "", description: "", price: "0", duration: "30", sale_limit: "0", is_popular: false });
    }, editing ? "Plan updated." : "Plan created.");
  }

  return <main className="page-content"><div className="page-heading"><div><p className="eyebrow">Marketplace operations</p><h1>Subscriptions</h1><p>Configure shop plans and manage plan activation for marketplace merchants.</p></div><button className="date-chip" onClick={() => { void plans.refetch(); void subscriptions.refetch(); }}><RefreshCw size={14} /> Refresh</button></div>
    {error && <div className="error-box" role="alert">{error}</div>}{success && <div className="success-box" role="status">{success}</div>}
    {plans.error && <div className="error-box">{apiErrorMessage(plans.error, "Could not load subscription plans.")}</div>}
    <section className="panel"><div className="panel-heading"><div><h2>Subscription plans</h2><p>{plans.data?.items.length ?? 0} available plans</p></div>{can("admin.subscription-plan.create") && !editing && <button className="primary-button" onClick={startCreate}><Plus size={14} /> Create plan</button>}</div>
      {formOpen ? <form className="subscription-form" onSubmit={submit}><div className="form-two"><Field label="Plan name" value={form.name} onChange={(name) => setForm({ ...form, name })} required /><Field label="Price (৳)" value={form.price} onChange={(price) => setForm({ ...form, price })} type="number" required /><Field label="Short description" value={form.short_description} onChange={(short_description) => setForm({ ...form, short_description })} /><Field label="Duration (days)" value={form.duration} onChange={(duration) => setForm({ ...form, duration })} type="number" /><Field label="Sales limit" value={form.sale_limit} onChange={(sale_limit) => setForm({ ...form, sale_limit })} type="number" /><label className="permission-item"><input type="checkbox" checked={form.is_popular} onChange={(event) => setForm({ ...form, is_popular: event.target.checked })} /> Mark as popular</label></div><label className="field"><span>Plan description</span><textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label><div className="action-cell"><button type="button" className="secondary-button" onClick={() => { setEditing(null); setFormOpen(false); setForm({ name: "", short_description: "", description: "", price: "0", duration: "30", sale_limit: "0", is_popular: false }); }}>Cancel</button><button className="primary-button" disabled={createState.isLoading || updateState.isLoading}><Check size={14} /> Save plan</button></div></form> : null}
      <div className="table-wrap"><table className="data-table"><thead><tr><th>Plan</th><th>Price</th><th>Duration</th><th>Sale limit</th><th>Subscriptions</th><th>Status</th><th>Actions</th></tr></thead><tbody>{(plans.data?.items ?? []).map((plan) => <tr key={str(plan.id)}><td><strong>{str(plan.name)}</strong><small className="cell-subtitle">{str(plan.short_description, "")}</small></td><td>৳{str(plan.price)}</td><td>{str(plan.duration, "Unlimited")}</td><td>{str(plan.sale_limit, "Unlimited")}</td><td>{str(plan.subscriptions_count, "0")}</td><td>{plan.is_active ? "Active" : "Disabled"}</td><td className="action-cell">{can("admin.subscription-plan.edit") && <button className="table-action" onClick={() => startEdit(plan)}>Edit</button>}{can("admin.subscription-plan.toggle") && <button className="table-action" onClick={() => void run(() => togglePlan(Number(plan.id)).unwrap(), "Plan status changed.")}>{plan.is_active ? "Disable" : "Enable"}</button>}{can("admin.subscription-plan.destroy") && <button className="table-action danger" onClick={() => { if (window.confirm(`Delete plan ${str(plan.name)}?`)) void run(() => deletePlan(Number(plan.id)).unwrap(), "Plan deleted."); }}>Delete</button>}</td></tr>)}{!plans.data?.items.length && <tr><td colSpan={7} className="table-empty">{plans.isLoading ? "Loading plans…" : "No subscription plans exist."}</td></tr>}</tbody></table></div>
    </section>
    <section className="panel" style={{ marginTop: 18 }}><div className="panel-heading"><div><h2>Shop subscriptions</h2><p>{subscriptions.data?.total ?? 0} subscription records</p></div><div className="action-cell"><select aria-label="Filter by shop" value={shopId} onChange={(event) => setShopId(event.target.value)}><option value="">All shops</option>{(subscriptions.data?.shops ?? []).map((shop) => <option key={str(shop.id)} value={str(shop.id)}>{str(shop.name)}</option>)}</select><select aria-label="Filter subscription status" value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All statuses</option>{["pending", "active", "cancelled", "expired"].map((value) => <option key={value}>{value}</option>)}</select></div></div>{subscriptions.error && <div className="error-box">{apiErrorMessage(subscriptions.error, "Could not load shop subscriptions.")}</div>}<div className="table-wrap"><table className="data-table"><thead><tr><th>Shop</th><th>Plan</th><th>Price</th><th>Period</th><th>Sales remaining</th><th>Status</th><th>Action</th></tr></thead><tbody>{(subscriptions.data?.items ?? []).map((row) => <tr key={str(row.id)}><td>{str(obj(row.shop).name)}</td><td>{str(obj(row.plan).name, "Legacy plan")}</td><td>৳{str(row.price)}</td><td>{str(row.starts_at, "Not started")} – {str(row.ends_at, "No expiry")}</td><td>{str(row.remaining_sales, "Unlimited")}</td><td>{str(row.status)}</td><td>{row.status !== "active" && row.status !== "cancelled" && can("admin.subscription-plan.subscription.status") && <button className="table-action" onClick={() => { if (window.confirm(`Activate this plan for ${str(obj(row.shop).name)}? Any current active shop plan will be cancelled.`)) void run(() => activateSubscription(Number(row.id)).unwrap(), "Shop plan activated."); }}><Check size={13} /> Activate</button>}</td></tr>)}{!subscriptions.data?.items.length && <tr><td colSpan={7} className="table-empty">{subscriptions.isLoading ? "Loading shop subscriptions…" : "No shop subscription records."}</td></tr>}</tbody></table></div></section>
  </main>;
}

function Field({ label, value, onChange, type = "text", required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) { return <label className="field"><span>{label}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} min={type === "number" ? "0" : undefined} step={type === "number" ? "any" : undefined} /></label>; }
