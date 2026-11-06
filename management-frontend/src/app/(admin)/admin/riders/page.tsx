"use client";

import { useState, type FormEvent } from "react";
import { useSelector } from "react-redux";
import { Plus, Eye, Pencil, Trash2, X, Navigation, Bike, CheckCircle2, DollarSign } from "lucide-react";
import {
  apiErrorMessage,
  useGetAdminRidersQuery,
  useGetAdminRiderDetailsQuery,
  useGetAdminRiderLocationQuery,
  useCreateAdminRiderMutation,
  useUpdateAdminRiderMutation,
  useToggleAdminRiderMutation,
  useDeleteAdminRiderMutation,
  type ApiRecord,
  type RootState,
} from "@/lib/store";

const obj = (val: unknown): ApiRecord => (typeof val === "object" && val !== null ? (val as ApiRecord) : {});
const txt = (val: unknown, fallback = "—") => (val === null || val === undefined || val === "" ? fallback : String(val));

export default function AdminRidersPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);
  const can = (action: string) => Boolean(user?.roles?.includes("root") || user?.permissions?.includes(action));

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modals & Drawers
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editRider, setEditRider] = useState<ApiRecord | null>(null);
  const [viewRiderId, setViewRiderId] = useState<number | null>(null);

  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // Queries & Mutations
  const { data, error: queryError, isLoading, refetch } = useGetAdminRidersQuery(undefined, {
    skip: !token,
  });
  const { data: detailData, isLoading: detailLoading } = useGetAdminRiderDetailsQuery(viewRiderId!, {
    skip: !viewRiderId,
  });
  const { data: locationData } = useGetAdminRiderLocationQuery(viewRiderId!, {
    skip: !viewRiderId,
  });

  const [createRider, { isLoading: creating }] = useCreateAdminRiderMutation();
  const [updateRider, { isLoading: updating }] = useUpdateAdminRiderMutation();
  const [toggleRider, { isLoading: toggling }] = useToggleAdminRiderMutation();
  const [deleteRider, { isLoading: deleting }] = useDeleteAdminRiderMutation();

  const rows: ApiRecord[] = data?.items ?? [];

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await createRider({
        first_name: firstName,
        last_name: lastName || undefined,
        email,
        phone,
        password,
      }).unwrap();
      setSuccess("Delivery rider account registered.");
      setShowCreateModal(false);
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setPassword("");
      refetch();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not register rider."));
    }
  }

  async function handleUpdate(e: FormEvent) {
    e.preventDefault();
    if (!editRider) return;
    setError("");
    setSuccess("");
    try {
      const body: Record<string, unknown> = {
        first_name: firstName,
        last_name: lastName || undefined,
        email,
        phone,
      };
      if (password) body.password = password;
      await updateRider({ id: Number(editRider.id), body }).unwrap();
      setSuccess("Rider details updated.");
      setEditRider(null);
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setPassword("");
      refetch();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not update rider."));
    }
  }

  async function handleToggle(id: number) {
    setError("");
    setSuccess("");
    try {
      await toggleRider(id).unwrap();
      setSuccess("Rider active status updated.");
      refetch();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not toggle rider status."));
    }
  }

  async function handleDelete(id: number, riderName: string) {
    if (!window.confirm(`Are you sure you want to delete rider "${riderName}"?`)) return;
    setError("");
    setSuccess("");
    try {
      await deleteRider(id).unwrap();
      setSuccess("Rider removed.");
      refetch();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not delete rider."));
    }
  }

  function startEdit(riderRow: ApiRecord) {
    const u = obj(riderRow.user ?? riderRow);
    setEditRider(riderRow);
    setFirstName(txt(u.first_name, txt(u.name, "")));
    setLastName(txt(u.last_name, ""));
    setEmail(txt(u.email, ""));
    setPhone(txt(u.phone, ""));
    setPassword("");
    setError("");
    setSuccess("");
  }

  const selectedRider = detailData?.rider ? obj(detailData.rider) : null;
  const riderUser = selectedRider ? obj(selectedRider.user ?? selectedRider) : null;
  const stats = detailData?.stats ? obj(detailData.stats) : null;
  const loc = locationData?.location ? obj(locationData.location) : null;

  return (
    <main className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Administration</p>
          <h1>Delivery Riders</h1>
          <p>Manage order fulfillment riders, track live location, and inspect delivery earnings.</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span className="date-chip">{data?.total ?? rows.length} riders</span>
          {can("admin.rider.create") && (
            <button
              className="primary-button"
              onClick={() => {
                setError("");
                setSuccess("");
                setFirstName("");
                setLastName("");
                setEmail("");
                setPhone("");
                setPassword("");
                setShowCreateModal(true);
              }}
            >
              <Plus size={14} /> Add new rider
            </button>
          )}
        </div>
      </div>

      {error && <div className="error-box" role="alert">{error}</div>}
      {success && <div className="success-box">{success}</div>}
      {queryError && (
        <div className="error-box" role="alert">
          {apiErrorMessage(queryError, "Could not load delivery riders.")}
        </div>
      )}

      <section className="panel">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Rider</th>
                <th>Contact</th>
                <th>Completed Deliveries</th>
                <th>Status</th>
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
                    <td>
                      {txt(u.phone)}
                      <small className="cell-subtitle">{txt(u.email)}</small>
                    </td>
                    <td>{txt(row.completed_orders_count ?? row.orders_count, "0")}</td>
                    <td>
                      <span className={`status-pill ${active ? "good" : "warning"}`}>
                        {active ? "Active" : "Offline"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="table-action"
                        title="View details & location"
                        onClick={() => setViewRiderId(Number(row.id))}
                      >
                        <Eye size={13} /> View
                      </button>
                      {can("admin.rider.edit") && (
                        <button
                          className="table-action"
                          title="Edit rider"
                          onClick={() => startEdit(row)}
                        >
                          <Pencil size={13} /> Edit
                        </button>
                      )}
                      {can("admin.rider.status.toggle") && (
                        <button
                          className="table-action"
                          disabled={toggling}
                          onClick={() => handleToggle(Number(row.id))}
                        >
                          {active ? "Deactivate" : "Activate"}
                        </button>
                      )}
                      {can("admin.rider.destroy") && (
                        <button
                          className="table-action danger"
                          title="Delete rider"
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
                    {isLoading ? "Loading riders…" : "No riders found."}
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
              <h3>Register New Rider</h3>
              <button
                className="table-action"
                onClick={() => setShowCreateModal(false)}
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-two">
                <div className="field">
                  <label>First Name *</label>
                  <input
                    required
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Last Name</label>
                  <input
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-two">
                <div className="field">
                  <label>Email *</label>
                  <input
                    required
                    type="email"
                    placeholder="rider@ricemart.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Phone *</label>
                  <input
                    required
                    placeholder="+1 555 789 123"
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
                  {creating ? "Creating…" : "Register Rider"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editRider && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-heading">
              <h3>Edit Rider #{txt(editRider.id)}</h3>
              <button
                className="table-action"
                onClick={() => setEditRider(null)}
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="form-two">
                <div className="field">
                  <label>First Name *</label>
                  <input
                    required
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Last Name</label>
                  <input
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-two">
                <div className="field">
                  <label>Email *</label>
                  <input
                    required
                    type="email"
                    placeholder="rider@ricemart.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Phone *</label>
                  <input
                    required
                    placeholder="Phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
              <div className="field">
                <label>New Password (leave blank to keep current)</label>
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
                  onClick={() => setEditRider(null)}
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

      {/* RIDER DETAILS & LOCATION DRAWER */}
      {viewRiderId !== null && (
        <div className="drawer-backdrop" onClick={() => setViewRiderId(null)}>
          <div className="drawer-card" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-heading">
              <h2>Rider Details #{viewRiderId}</h2>
              <button
                className="table-action"
                onClick={() => setViewRiderId(null)}
              >
                <X size={18} />
              </button>
            </div>
            {detailLoading ? (
              <div className="loading">Loading rider info…</div>
            ) : selectedRider ? (
              <div>
                <div style={{ marginBottom: 18 }}>
                  <h3 style={{ margin: 0, fontSize: 16 }}>{txt(riderUser?.name)}</h3>
                  <span className="sub-cell">{txt(riderUser?.email)} • {txt(riderUser?.phone)}</span>
                </div>

                <div className="detail-list">
                  <div className="detail-item">
                    <span><CheckCircle2 size={13} style={{ verticalAlign: "middle", marginRight: 4 }} /> Completed Orders</span>
                    <strong>{txt(stats?.completed_orders, "0")}</strong>
                  </div>
                  <div className="detail-item">
                    <span><Bike size={13} style={{ verticalAlign: "middle", marginRight: 4 }} /> Pending Deliveries</span>
                    <strong>{txt(stats?.pending_orders, "0")}</strong>
                  </div>
                  <div className="detail-item">
                    <span><DollarSign size={13} style={{ verticalAlign: "middle", marginRight: 4 }} /> Total Earnings</span>
                    <strong>${Number(stats?.total_earnings ?? 0).toFixed(2)}</strong>
                  </div>
                </div>

                <h4 style={{ margin: "24px 0 10px", fontSize: 13, color: "var(--forest-deep)" }}>
                  <Navigation size={13} style={{ verticalAlign: "middle", marginRight: 4 }} /> GPS Location
                </h4>
                <div style={{ padding: 14, background: "#f8faf8", border: "1px solid var(--line)", borderRadius: 8, fontSize: 11 }}>
                  {loc && loc.latitude && loc.longitude ? (
                    <div>
                      <p style={{ margin: "0 0 6px" }}>
                        <strong>Latitude:</strong> {txt(loc.latitude)} | <strong>Longitude:</strong> {txt(loc.longitude)}
                      </p>
                      <span className="sub-cell">Last updated: {txt(loc.updated_at, "Recently")}</span>
                    </div>
                  ) : (
                    <p style={{ margin: 0, color: "var(--muted)" }}>No live GPS signal reported recently.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="error-box">Could not load rider details.</div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
