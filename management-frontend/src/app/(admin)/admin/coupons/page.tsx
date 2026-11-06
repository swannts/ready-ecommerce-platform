"use client";

import { useState, type FormEvent } from "react";
import { useSelector } from "react-redux";
import { Plus, Trash2, X, Ticket, Calendar } from "lucide-react";
import {
  apiErrorMessage,
  useGetAdminCouponsQuery,
  useCreateAdminCouponMutation,
  useToggleAdminCouponMutation,
  useDeleteAdminCouponMutation,
  type ApiRecord,
  type RootState,
} from "@/lib/store";

const obj = (val: unknown): ApiRecord => (typeof val === "object" && val !== null ? (val as ApiRecord) : {});
const txt = (val: unknown, fallback = "—") => (val === null || val === undefined || val === "" ? fallback : String(val));

export default function AdminCouponsPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);
  const can = (action: string) => Boolean(user?.roles?.includes("root") || user?.permissions?.includes(action));

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState<number | "">("");
  const [discountType, setDiscountType] = useState<"Amount" | "Percentage">("Percentage");
  const [startDate, setStartDate] = useState("");
  const [expiredDate, setExpiredDate] = useState("");
  const startTime = "00:00";
  const expiredTime = "23:59";
  const [minOrderAmount, setMinOrderAmount] = useState<number | "">(0);
  const [limitForUser, setLimitForUser] = useState<number | "">(1);

  // Queries & Mutations
  const { data, error: queryError, isLoading, refetch } = useGetAdminCouponsQuery(undefined, {
    skip: !token,
  });

  const [createCoupon, { isLoading: creating }] = useCreateAdminCouponMutation();
  const [toggleCoupon, { isLoading: toggling }] = useToggleAdminCouponMutation();
  const [deleteCoupon, { isLoading: deleting }] = useDeleteAdminCouponMutation();

  const rows: ApiRecord[] = data?.items ?? [];

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (discount === "" || Number(discount) <= 0) {
      setError("Please provide a valid discount value.");
      return;
    }
    setError("");
    setSuccess("");
    try {
      await createCoupon({
        code,
        discount: Number(discount),
        discount_type: discountType,
        start_date: startDate,
        start_time: startTime,
        expired_date: expiredDate,
        expired_time: expiredTime,
        min_order_amount: Number(minOrderAmount || 0),
        limit_for_user: limitForUser ? Number(limitForUser) : null,
      }).unwrap();
      setSuccess("Coupon created successfully.");
      setShowCreateModal(false);
      setCode("");
      setDiscount("");
      setStartDate("");
      setExpiredDate("");
      refetch();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not create coupon."));
    }
  }

  async function handleToggle(id: number) {
    setError("");
    setSuccess("");
    try {
      await toggleCoupon(id).unwrap();
      setSuccess("Coupon status toggled.");
      refetch();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not toggle coupon status."));
    }
  }

  async function handleDelete(id: number, couponCode: string) {
    if (!window.confirm(`Delete coupon "${couponCode}"?`)) return;
    setError("");
    setSuccess("");
    try {
      await deleteCoupon(id).unwrap();
      setSuccess("Coupon removed.");
      refetch();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not delete coupon."));
    }
  }

  return (
    <main className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Merchandising</p>
          <h1>Discount Coupons</h1>
          <p>Issue promotional coupon vouchers, percentage discounts, and order thresholds.</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span className="date-chip">{data?.total ?? rows.length} coupons</span>
          {can("admin.coupon.create") && (
            <button
              className="primary-button"
              onClick={() => {
                setError("");
                setSuccess("");
                setCode("");
                setDiscount("");
                setStartDate(new Date().toISOString().slice(0, 10));
                setExpiredDate(new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10));
                setShowCreateModal(true);
              }}
            >
              <Plus size={14} /> Create coupon
            </button>
          )}
        </div>
      </div>

      {error && <div className="error-box" role="alert">{error}</div>}
      {success && <div className="success-box">{success}</div>}
      {queryError && (
        <div className="error-box" role="alert">
          {apiErrorMessage(queryError, "Could not load coupons.")}
        </div>
      )}

      <section className="panel">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Min. Order</th>
                <th>Validity Window</th>
                <th>User Limit</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((raw, idx) => {
                const row = obj(raw);
                const active = Boolean(row.is_active);
                const isPercent = row.type === "Percentage";
                return (
                  <tr key={txt(row.id, String(idx))}>
                    <td>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <Ticket size={13} style={{ color: "var(--forest)" }} />
                        <strong style={{ letterSpacing: 0.5 }}>{txt(row.code)}</strong>
                      </span>
                    </td>
                    <td>
                      <strong>
                        {isPercent ? `${txt(row.discount)}%` : `$${Number(row.discount ?? 0).toFixed(2)}`}
                      </strong>
                    </td>
                    <td>${Number(row.min_amount ?? 0).toFixed(2)}</td>
                    <td>
                      <span className="cell-subtitle" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Calendar size={11} /> {txt(row.started_at).slice(0, 10)} to {txt(row.expired_at).slice(0, 10)}
                      </span>
                    </td>
                    <td>{txt(row.limit_for_user, "Unlimited")}</td>
                    <td>
                      <span className={`status-pill ${active ? "good" : "warning"}`}>
                        {active ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td>
                      {can("admin.coupon.edit") && (
                        <button
                          className="table-action"
                          disabled={toggling}
                          onClick={() => handleToggle(Number(row.id))}
                        >
                          {active ? "Disable" : "Enable"}
                        </button>
                      )}
                      {can("admin.coupon.destroy") && (
                        <button
                          className="table-action danger"
                          title="Delete coupon"
                          disabled={deleting}
                          onClick={() => handleDelete(Number(row.id), txt(row.code))}
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {!rows.length && (
                <tr>
                  <td className="table-empty" colSpan={7}>
                    {isLoading ? "Loading coupons…" : "No coupons found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-heading">
              <h3>Create Promotional Coupon</h3>
              <button
                className="table-action"
                onClick={() => setShowCreateModal(false)}
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="field">
                <label>Coupon Code *</label>
                <input
                  required
                  style={{ textTransform: "uppercase" }}
                  placeholder="e.g. HARVEST20"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                />
              </div>
              <div className="form-two">
                <div className="field">
                  <label>Discount Value *</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 10"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value === "" ? "" : Number(e.target.value))}
                  />
                </div>
                <div className="field">
                  <label>Discount Type *</label>
                  <select
                    className="admin-select"
                    style={{ width: "100%", maxWidth: "100%" }}
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as "Amount" | "Percentage")}
                  >
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Amount">Fixed Amount ($)</option>
                  </select>
                </div>
              </div>
              <div className="form-two">
                <div className="field">
                  <label>Start Date *</label>
                  <input
                    required
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Expiry Date *</label>
                  <input
                    required
                    type="date"
                    value={expiredDate}
                    onChange={(e) => setExpiredDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-two">
                <div className="field">
                  <label>Min. Order Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(e.target.value === "" ? "" : Number(e.target.value))}
                  />
                </div>
                <div className="field">
                  <label>Usage Limit Per Customer</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="1"
                    value={limitForUser}
                    onChange={(e) => setLimitForUser(e.target.value === "" ? "" : Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={creating}
                >
                  {creating ? "Creating…" : "Publish Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}