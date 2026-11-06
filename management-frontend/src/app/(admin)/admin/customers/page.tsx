"use client";

import { useState, type FormEvent } from "react";
import { useSelector } from "react-redux";
import { Plus, Eye, Pencil, Trash2, X, Wallet, MapPin, ShoppingBag } from "lucide-react";
import {
  apiErrorMessage,
  useGetAdminCustomersQuery,
  useGetAdminCustomerDetailsQuery,
  useCreateAdminCustomerMutation,
  useUpdateAdminCustomerMutation,
  useDeleteAdminCustomerMutation,
  type ApiRecord,
  type RootState,
} from "@/lib/store";

const obj = (val: unknown): ApiRecord => (typeof val === "object" && val !== null ? (val as ApiRecord) : {});
const txt = (val: unknown, fallback = "—") => (val === null || val === undefined || val === "" ? fallback : String(val));

export default function AdminCustomersPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);
  const can = (action: string) => Boolean(user?.roles?.includes("root") || user?.permissions?.includes(action));

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modals & Drawers
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editCustomer, setEditCustomer] = useState<ApiRecord | null>(null);
  const [viewCustomerId, setViewCustomerId] = useState<number | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // Queries & Mutations
  const { data, error: queryError, isLoading, refetch } = useGetAdminCustomersQuery(undefined, {
    skip: !token,
  });
  const { data: detailData, isLoading: detailLoading } = useGetAdminCustomerDetailsQuery(viewCustomerId!, {
    skip: !viewCustomerId,
  });

  const [createCustomer, { isLoading: creating }] = useCreateAdminCustomerMutation();
  const [updateCustomer, { isLoading: updating }] = useUpdateAdminCustomerMutation();
  const [deleteCustomer, { isLoading: deleting }] = useDeleteAdminCustomerMutation();

  const rows: ApiRecord[] = data?.items ?? [];

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await createCustomer({ name, email, phone, password }).unwrap();
      setSuccess("Customer account created successfully.");
      setShowCreateModal(false);
      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
      refetch();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not create customer."));
    }
  }

  async function handleUpdate(e: FormEvent) {
    e.preventDefault();
    if (!editCustomer) return;
    setError("");
    setSuccess("");
    try {
      const body: Record<string, unknown> = { name, email, phone };
      if (password) body.password = password;
      await updateCustomer({ id: Number(editCustomer.id), body }).unwrap();
      setSuccess("Customer profile updated.");
      setEditCustomer(null);
      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
      refetch();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not update customer."));
    }
  }

  async function handleDelete(id: number, customerName: string) {
    if (!window.confirm(`Are you sure you want to delete customer account "${customerName}"?`)) return;
    setError("");
    setSuccess("");
    try {
      await deleteCustomer(id).unwrap();
      setSuccess("Customer account deleted.");
      refetch();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not delete customer."));
    }
  }

  function startEdit(customerRow: ApiRecord) {
    const u = obj(customerRow.user ?? customerRow);
    setEditCustomer(customerRow);
    setName(txt(u.name, ""));
    setEmail(txt(u.email, ""));
    setPhone(txt(u.phone, ""));
    setPassword("");
    setError("");
    setSuccess("");
  }

  const selectedCustomer = detailData?.customer ? obj(detailData.customer) : null;
  const customerUser = selectedCustomer ? obj(selectedCustomer.user ?? selectedCustomer) : null;
  const customerProfile = selectedCustomer ? obj(selectedCustomer.customer) : null;
  const addresses: ApiRecord[] = Array.isArray(customerProfile?.addresses) ? (customerProfile.addresses as ApiRecord[]) : [];
  const orders: ApiRecord[] = Array.isArray(customerProfile?.orders) ? (customerProfile.orders as ApiRecord[]) : [];
  const wallet = selectedCustomer ? obj(selectedCustomer.wallet) : null;

  return (
    <main className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Administration</p>
          <h1>Customers</h1>
          <p>Review customer accounts, purchase history, and delivery addresses.</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span className="date-chip">{data?.total ?? rows.length} customers</span>
          {can("admin.customer.create") && (
            <button
              className="primary-button"
              onClick={() => {
                setError("");
                setSuccess("");
                setName("");
                setEmail("");
                setPhone("");
                setPassword("");
                setShowCreateModal(true);
              }}
            >
              <Plus size={14} /> Add new customer
            </button>
          )}
        </div>
      </div>

      {error && <div className="error-box" role="alert">{error}</div>}
      {success && <div className="success-box">{success}</div>}
      {queryError && (
        <div className="error-box" role="alert">
          {apiErrorMessage(queryError, "Could not load customers.")}
        </div>
      )}

      <section className="panel">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Account</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((raw, i) => {
                const row = obj(raw);
                const u = obj(row.user ?? row);
                const active = Boolean(u.is_active ?? row.is_active);
                return (
                  <tr key={txt(row.id, String(i))}>
                    <td>
                      <strong>{txt(u.name)}</strong>
                      <small className="cell-subtitle">ID #{txt(row.id)}</small>
                    </td>
                    <td>{txt(u.email)}</td>
                    <td>{txt(u.phone)}</td>
                    <td>
                      <span className={`status-pill ${active ? "good" : "warning"}`}>
                        {active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="table-action"
                        title="View profile and history"
                        onClick={() => setViewCustomerId(Number(row.id))}
                      >
                        <Eye size={13} /> View
                      </button>
                      {can("admin.customer.edit") && (
                        <button
                          className="table-action"
                          title="Edit profile"
                          onClick={() => startEdit(row)}
                        >
                          <Pencil size={13} /> Edit
                        </button>
                      )}
                      {can("admin.customer.destroy") && (
                        <button
                          className="table-action danger"
                          title="Delete customer"
                          disabled={deleting}
                          onClick={() => handleDelete(Number(row.id), txt(u.name))}
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
                  <td className="table-empty" colSpan={5}>
                    {isLoading ? "Loading customers…" : "No customers found."}
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
              <h3>Register New Customer</h3>
              <button
                className="table-action"
                onClick={() => setShowCreateModal(false)}
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="field">
                <label>Full Name *</label>
                <input
                  required
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="form-two">
                <div className="field">
                  <label>Email *</label>
                  <input
                    required
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Phone *</label>
                  <input
                    required
                    placeholder="+1 555 123 456"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
              <div className="field">
                <label>Password *</label>
                <input
                  required
                  type="password"
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  {creating ? "Creating…" : "Create Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editCustomer && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-heading">
              <h3>Edit Customer #{txt(editCustomer.id)}</h3>
              <button
                className="table-action"
                onClick={() => setEditCustomer(null)}
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="field">
                <label>Full Name *</label>
                <input
                  required
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="form-two">
                <div className="field">
                  <label>Email *</label>
                  <input
                    required
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Phone *</label>
                  <input
                    required
                    placeholder="Phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
              <div className="field">
                <label>New Password (leave blank to keep existing)</label>
                <input
                  type="password"
                  placeholder="Optional new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setEditCustomer(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={updating}
                >
                  {updating ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DETAILS DRAWER */}
      {viewCustomerId !== null && (
        <div className="drawer-backdrop" onClick={() => setViewCustomerId(null)}>
          <div className="drawer-card" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-heading">
              <h2>Customer #{viewCustomerId}</h2>
              <button
                className="table-action"
                onClick={() => setViewCustomerId(null)}
              >
                <X size={18} />
              </button>
            </div>
            {detailLoading ? (
              <div className="loading">Loading customer details…</div>
            ) : selectedCustomer ? (
              <div>
                <div style={{ marginBottom: 18 }}>
                  <h3 style={{ margin: 0, fontSize: 16 }}>{txt(customerUser?.name)}</h3>
                  <span className="sub-cell">{txt(customerUser?.email)} • {txt(customerUser?.phone)}</span>
                </div>

                <div className="detail-list">
                  <div className="detail-item">
                    <span><Wallet size={13} style={{ verticalAlign: "middle", marginRight: 4 }} /> Wallet Balance</span>
                    <strong>${Number(wallet?.balance ?? 0).toFixed(2)}</strong>
                  </div>
                  <div className="detail-item">
                    <span><ShoppingBag size={13} style={{ verticalAlign: "middle", marginRight: 4 }} /> Total Orders</span>
                    <strong>{orders.length} orders</strong>
                  </div>
                  <div className="detail-item">
                    <span><MapPin size={13} style={{ verticalAlign: "middle", marginRight: 4 }} /> Saved Addresses</span>
                    <strong>{addresses.length} addresses</strong>
                  </div>
                </div>

                <h4 style={{ margin: "20px 0 10px", fontSize: 13, color: "var(--forest-deep)" }}>Saved Addresses</h4>
                {addresses.length > 0 ? (
                  <div style={{ display: "grid", gap: 8 }}>
                    {addresses.map((addr, idx) => (
                      <div key={idx} style={{ padding: 10, background: "#f8faf8", border: "1px solid var(--line)", borderRadius: 8, fontSize: 11 }}>
                        <strong>{txt(addr.address_type, "Address")}</strong>
                        <p style={{ margin: "4px 0 0", color: "var(--muted)" }}>{txt(addr.address || addr.area)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "var(--muted)", fontSize: 11 }}>No saved addresses.</p>
                )}

                <h4 style={{ margin: "20px 0 10px", fontSize: 13, color: "var(--forest-deep)" }}>Recent Orders</h4>
                {orders.length > 0 ? (
                  <div style={{ display: "grid", gap: 8 }}>
                    {orders.slice(0, 5).map((ord, idx) => (
                      <div key={idx} style={{ padding: 10, background: "#f8faf8", border: "1px solid var(--line)", borderRadius: 8, fontSize: 11, display: "flex", justifyContent: "space-between" }}>
                        <div>
                          <strong>Order #{txt(ord.order_code || ord.id)}</strong>
                          <span className="sub-cell">{txt(ord.order_status)}</span>
                        </div>
                        <strong>${Number(ord.total_amount ?? 0).toFixed(2)}</strong>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "var(--muted)", fontSize: 11 }}>No order history.</p>
                )}
              </div>
            ) : (
              <div className="error-box">Could not load customer details.</div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
