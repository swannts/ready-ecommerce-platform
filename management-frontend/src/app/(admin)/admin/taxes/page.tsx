"use client";

import { useState, type FormEvent } from "react";
import { useSelector } from "react-redux";
import { Plus, Pencil, Trash2, X, Percent } from "lucide-react";
import {
  apiErrorMessage,
  useGetAdminVatTaxesQuery,
  useCreateAdminVatTaxMutation,
  useUpdateAdminVatTaxMutation,
  useToggleAdminVatTaxMutation,
  useDeleteAdminVatTaxMutation,
  type ApiRecord,
  type RootState,
} from "@/lib/store";

const obj = (val: unknown): ApiRecord => (typeof val === "object" && val !== null ? (val as ApiRecord) : {});
const txt = (val: unknown, fallback = "—") => (val === null || val === undefined || val === "" ? fallback : String(val));

export default function AdminTaxesPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);
  const can = (action: string) => Boolean(user?.roles?.includes("root") || user?.permissions?.includes(action));

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editTax, setEditTax] = useState<ApiRecord | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [percentage, setPercentage] = useState<number | "">("");

  // Queries & Mutations
  const { data, error: queryError, isLoading, refetch } = useGetAdminVatTaxesQuery(undefined, {
    skip: !token,
  });

  const [createTax, { isLoading: creating }] = useCreateAdminVatTaxMutation();
  const [updateTax, { isLoading: updating }] = useUpdateAdminVatTaxMutation();
  const [toggleTax, { isLoading: toggling }] = useToggleAdminVatTaxMutation();
  const [deleteTax, { isLoading: deleting }] = useDeleteAdminVatTaxMutation();

  const rows: ApiRecord[] = data?.items ?? [];

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (percentage === "" || Number(percentage) < 0 || Number(percentage) > 100) {
      setError("Please specify a valid percentage rate between 0 and 100.");
      return;
    }
    setError("");
    setSuccess("");
    try {
      await createTax({ name, percentage: Number(percentage) }).unwrap();
      setSuccess("Tax rate created.");
      setShowCreateModal(false);
      setName("");
      setPercentage("");
      refetch();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not create tax."));
    }
  }

  async function handleUpdate(e: FormEvent) {
    e.preventDefault();
    if (!editTax || percentage === "" || Number(percentage) < 0 || Number(percentage) > 100) {
      setError("Please specify a valid percentage rate between 0 and 100.");
      return;
    }
    setError("");
    setSuccess("");
    try {
      await updateTax({
        id: Number(editTax.id),
        name,
        percentage: Number(percentage),
      }).unwrap();
      setSuccess("Tax rate updated.");
      setEditTax(null);
      setName("");
      setPercentage("");
      refetch();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not update tax."));
    }
  }

  async function handleToggle(id: number) {
    setError("");
    setSuccess("");
    try {
      await toggleTax(id).unwrap();
      setSuccess("Tax status toggled.");
      refetch();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not toggle tax status."));
    }
  }

  async function handleDelete(id: number, taxName: string) {
    if (!window.confirm(`Delete tax "${taxName}"?`)) return;
    setError("");
    setSuccess("");
    try {
      await deleteTax(id).unwrap();
      setSuccess("Tax rate deleted.");
      refetch();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not delete tax."));
    }
  }

  function startEdit(taxRow: ApiRecord) {
    setEditTax(taxRow);
    setName(txt(taxRow.name, ""));
    setPercentage(Number(taxRow.percentage ?? 0));
    setError("");
    setSuccess("");
  }

  return (
    <main className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Finance & Logistics</p>
          <h1>VAT & Tax Rates</h1>
          <p>Configure regional taxes, order-based VAT percentages, and checkout deduction rules.</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span className="date-chip">{data?.total ?? rows.length} taxes</span>
          {can("admin.vatTax.store") && (
            <button
              className="primary-button"
              onClick={() => {
                setError("");
                setSuccess("");
                setName("");
                setPercentage("");
                setShowCreateModal(true);
              }}
            >
              <Plus size={14} /> Add tax rate
            </button>
          )}
        </div>
      </div>

      {error && <div className="error-box" role="alert">{error}</div>}
      {success && <div className="success-box">{success}</div>}
      {queryError && (
        <div className="error-box" role="alert">
          {apiErrorMessage(queryError, "Could not load taxes.")}
        </div>
      )}

      <section className="panel">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tax Name</th>
                <th>Rate (%)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((raw, idx) => {
                const row = obj(raw);
                const active = Boolean(row.is_active);
                return (
                  <tr key={txt(row.id, String(idx))}>
                    <td>
                      <strong>{txt(row.name)}</strong>
                      <small className="cell-subtitle">ID #{txt(row.id)}</small>
                    </td>
                    <td>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 700 }}>
                        <Percent size={12} /> {Number(row.percentage ?? 0).toFixed(2)}%
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill ${active ? "good" : "warning"}`}>
                        {active ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td>
                      {can("admin.vatTax.update") && (
                        <button
                          className="table-action"
                          title="Edit tax"
                          onClick={() => startEdit(row)}
                        >
                          <Pencil size={13} /> Edit
                        </button>
                      )}
                      {can("admin.vatTax.toggle") && (
                        <button
                          className="table-action"
                          disabled={toggling}
                          onClick={() => handleToggle(Number(row.id))}
                        >
                          {active ? "Disable" : "Enable"}
                        </button>
                      )}
                      {can("admin.vatTax.destroy") && (
                        <button
                          className="table-action danger"
                          title="Delete tax"
                          disabled={deleting}
                          onClick={() => handleDelete(Number(row.id), txt(row.name))}
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
                  <td className="table-empty" colSpan={4}>
                    {isLoading ? "Loading tax rates…" : "No VAT or tax rates configured."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* CREATE TAX MODAL */}
      {showCreateModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-heading">
              <h3>Create Tax Rate</h3>
              <button
                className="table-action"
                onClick={() => setShowCreateModal(false)}
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="field">
                <label>Tax Name *</label>
                <input
                  required
                  placeholder="e.g. Standard VAT, Agricultural Tax"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="field">
                <label>Percentage Rate (%) *</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder="e.g. 15.00"
                  value={percentage}
                  onChange={(e) => setPercentage(e.target.value === "" ? "" : Number(e.target.value))}
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
                  {creating ? "Creating…" : "Save Tax Rate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TAX MODAL */}
      {editTax && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-heading">
              <h3>Edit Tax Rate #{txt(editTax.id)}</h3>
              <button
                className="table-action"
                onClick={() => setEditTax(null)}
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="field">
                <label>Tax Name *</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="field">
                <label>Percentage Rate (%) *</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={percentage}
                  onChange={(e) => setPercentage(e.target.value === "" ? "" : Number(e.target.value))}
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setEditTax(null)}
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
    </main>
  );
}
