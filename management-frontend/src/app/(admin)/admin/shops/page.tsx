"use client";

import { useState, type FormEvent } from "react";
import { useSelector } from "react-redux";
import { Search, Plus, KeyRound, Eye, X } from "lucide-react";
import {
  apiErrorMessage,
  useGetAdminShopsQuery,
  useGetAdminShopDetailsQuery,
  useCreateAdminShopMutation,
  useResetAdminShopPasswordMutation,
  useToggleAdminShopMutation,
  type ApiRecord,
  type RootState,
} from "@/lib/store";

const obj = (val: unknown): ApiRecord => (typeof val === "object" && val !== null ? (val as ApiRecord) : {});
const txt = (val: unknown, fallback = "—") => (val === null || val === undefined || val === "" ? fallback : String(val));

export default function AdminShopsPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);
  const can = (action: string) => Boolean(user?.roles?.includes("root") || user?.permissions?.includes(action));

  const [search, setSearch] = useState("");
  const [querySearch, setQuerySearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modals & Drawers
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [resetShopId, setResetShopId] = useState<number | null>(null);
  const [viewShopId, setViewShopId] = useState<number | null>(null);

  // Create form state
  const [name, setName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");

  // Reset form state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Queries & Mutations
  const { data, error: queryError, isLoading, refetch } = useGetAdminShopsQuery(
    querySearch ? { search: querySearch } : undefined,
    { skip: !token }
  );
  const { data: detailData, isLoading: detailLoading } = useGetAdminShopDetailsQuery(viewShopId!, {
    skip: !viewShopId,
  });

  const [createShop, { isLoading: creating }] = useCreateAdminShopMutation();
  const [resetPassword, { isLoading: resetting }] = useResetAdminShopPasswordMutation();
  const [toggleShop, { isLoading: toggling }] = useToggleAdminShopMutation();

  const rows: ApiRecord[] = data?.items ?? [];

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await createShop({
        name,
        first_name: firstName,
        last_name: lastName || undefined,
        email,
        phone,
        password,
        address: address || undefined,
      }).unwrap();
      setSuccess("Shop registered successfully.");
      setShowCreateModal(false);
      setName("");
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setAddress("");
      refetch();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not create shop."));
    }
  }

  async function handleResetPassword(e: FormEvent) {
    e.preventDefault();
    if (!resetShopId) return;
    setError("");
    setSuccess("");
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      await resetPassword({
        id: resetShopId,
        password: newPassword,
        password_confirmation: confirmPassword,
      }).unwrap();
      setSuccess("Shop password has been successfully reset.");
      setResetShopId(null);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(apiErrorMessage(err, "Could not reset shop password."));
    }
  }

  async function handleToggle(id: number) {
    setError("");
    setSuccess("");
    try {
      await toggleShop(id).unwrap();
      setSuccess("Shop status updated.");
      refetch();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not update shop status."));
    }
  }

  const selectedShop = detailData?.shop ? obj(detailData.shop) : null;
  const selectedUser = selectedShop ? obj(selectedShop.user) : null;

  return (
    <main className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Administration</p>
          <h1>Marketplace Shops</h1>
          <p>Manage merchant accounts, access permissions, and store statuses.</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span className="date-chip">{data?.total ?? rows.length} shops</span>
          {can("admin.shop.create") && (
            <button
              className="primary-button"
              onClick={() => {
                setError("");
                setSuccess("");
                setShowCreateModal(true);
              }}
            >
              <Plus size={14} /> Add new shop
            </button>
          )}
        </div>
      </div>

      {error && <div className="error-box" role="alert">{error}</div>}
      {success && <div className="success-box">{success}</div>}
      {queryError && (
        <div className="error-box" role="alert">
          {apiErrorMessage(queryError, "Could not load shops.")}
        </div>
      )}

      <form
        className="search-bar"
        onSubmit={(e) => {
          e.preventDefault();
          setQuerySearch(search);
        }}
      >
        <Search size={16} />
        <input
          aria-label="Search shops"
          placeholder="Search by shop name, owner, or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="primary-button">Search</button>
      </form>

      <section className="panel">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Shop</th>
                <th>Owner</th>
                <th>Products</th>
                <th>Orders</th>
                <th>Account</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((raw, i) => {
                const row = obj(raw);
                const owner = obj(row.user);
                const active = Boolean(owner.is_active ?? row.is_active);
                return (
                  <tr key={txt(row.id, String(i))}>
                    <td>
                      <strong>{txt(row.name)}</strong>
                      <small className="cell-subtitle">ID #{txt(row.id)}</small>
                    </td>
                    <td>
                      {txt(owner.name)}
                      <small className="cell-subtitle">{txt(owner.email)} • {txt(owner.phone)}</small>
                    </td>
                    <td>{txt(row.products_count, "0")}</td>
                    <td>{txt(row.orders_count, "0")}</td>
                    <td>
                      <span className={`status-pill ${active ? "good" : "warning"}`}>
                        {active ? "Active" : "Suspended"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="table-action"
                        title="View details"
                        onClick={() => setViewShopId(Number(row.id))}
                      >
                        <Eye size={13} /> View
                      </button>
                      {can("admin.shop.edit") && (
                        <button
                          className="table-action"
                          title="Reset password"
                          onClick={() => {
                            setResetShopId(Number(row.id));
                            setError("");
                            setSuccess("");
                          }}
                        >
                          <KeyRound size={13} /> Password
                        </button>
                      )}
                      {can("admin.shop.status.toggle") && (
                        <button
                          className="table-action"
                          disabled={toggling}
                          onClick={() => handleToggle(Number(row.id))}
                        >
                          {active ? "Suspend" : "Activate"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {!rows.length && (
                <tr>
                  <td className="table-empty" colSpan={6}>
                    {isLoading ? "Loading shops…" : "No shops found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* CREATE SHOP MODAL */}
      {showCreateModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-heading">
              <h3>Register New Shop</h3>
              <button
                className="table-action"
                onClick={() => setShowCreateModal(false)}
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="field">
                <label>Shop Name *</label>
                <input
                  required
                  placeholder="e.g. Royal Jasmine Rice Mills"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="form-two">
                <div className="field">
                  <label>Owner First Name *</label>
                  <input
                    required
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Owner Last Name</label>
                  <input
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-two">
                <div className="field">
                  <label>Email Address *</label>
                  <input
                    required
                    type="email"
                    placeholder="owner@mill.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Phone Number *</label>
                  <input
                    required
                    placeholder="+1 234 567 890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
              <div className="field">
                <label>Initial Password *</label>
                <input
                  required
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="field">
                <label>Shop Address</label>
                <input
                  placeholder="Physical street address / city"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
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
                  {creating ? "Creating shop…" : "Create Shop"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {resetShopId !== null && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-heading">
              <h3>Reset Shop Password</h3>
              <button
                className="table-action"
                onClick={() => setResetShopId(null)}
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleResetPassword}>
              <p className="section-note" style={{ marginBottom: 14 }}>
                This will immediately update the owner login credentials for Shop #{resetShopId}.
              </p>
              <div className="field">
                <label>New Password *</label>
                <input
                  required
                  type="password"
                  placeholder="Enter new password (min 6 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="field">
                <label>Confirm Password *</label>
                <input
                  required
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setResetShopId(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={resetting}
                >
                  {resetting ? "Resetting…" : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SHOP DETAILS DRAWER */}
      {viewShopId !== null && (
        <div className="drawer-backdrop" onClick={() => setViewShopId(null)}>
          <div className="drawer-card" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-heading">
              <h2>Shop Details #{viewShopId}</h2>
              <button
                className="table-action"
                onClick={() => setViewShopId(null)}
              >
                <X size={18} />
              </button>
            </div>
            {detailLoading ? (
              <div className="loading">Loading shop details…</div>
            ) : selectedShop ? (
              <div>
                <div style={{ marginBottom: 18 }}>
                  <h3 style={{ margin: 0, fontSize: 16 }}>{txt(selectedShop.name)}</h3>
                  <span className="sub-cell">{txt(selectedShop.address, "No address provided")}</span>
                </div>
                <div className="detail-list">
                  <div className="detail-item">
                    <span>Owner Name</span>
                    <strong>{txt(selectedUser?.name)}</strong>
                  </div>
                  <div className="detail-item">
                    <span>Email</span>
                    <strong>{txt(selectedUser?.email)}</strong>
                  </div>
                  <div className="detail-item">
                    <span>Phone</span>
                    <strong>{txt(selectedUser?.phone)}</strong>
                  </div>
                  <div className="detail-item">
                    <span>Account Status</span>
                    <strong>{selectedUser?.is_active ? "Active" : "Suspended"}</strong>
                  </div>
                  <div className="detail-item">
                    <span>Products Listed</span>
                    <strong>{txt(selectedShop.products_count, "0")}</strong>
                  </div>
                  <div className="detail-item">
                    <span>Total Orders</span>
                    <strong>{txt(selectedShop.orders_count, "0")}</strong>
                  </div>
                  <div className="detail-item">
                    <span>Rating</span>
                    <strong>★ {txt(selectedShop.rating, "5.0")}</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="error-box">Could not load details for this shop.</div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
