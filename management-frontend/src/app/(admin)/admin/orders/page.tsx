"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { Bike, X } from "lucide-react";
import {
  apiErrorMessage,
  useGetAdminOrdersQuery,
  useUpdateAdminOrderStatusMutation,
  useGetAdminRidersQuery,
  useAssignAdminOrderRiderMutation,
  type ApiRecord,
  type RootState,
} from "@/lib/store";

const obj = (value: unknown): ApiRecord => (typeof value === "object" && value !== null ? (value as ApiRecord) : {});
const val = (value: unknown) => (value === null || value === undefined || value === "" ? "—" : String(value));

export default function AdminOrdersPage() {
  const token = useSelector((state: RootState) => state.auth.token);
  const canUpdate = useSelector((state: RootState) =>
    Boolean(state.auth.user?.roles?.includes("root") || state.auth.user?.permissions?.includes("admin.order.status.change"))
  );
  const canAssign = useSelector((state: RootState) =>
    Boolean(state.auth.user?.roles?.includes("root") || state.auth.user?.permissions?.includes("admin.order.assign.rider"))
  );

  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Rider assignment modal
  const [assignOrderId, setAssignOrderId] = useState<number | null>(null);
  const [selectedRiderId, setSelectedRiderId] = useState<number | "">("");

  const { data, error: queryError, isLoading, refetch } = useGetAdminOrdersQuery(
    status ? { status } : undefined,
    { skip: !token }
  );
  const { data: ridersData } = useGetAdminRidersQuery(undefined, { skip: !canAssign });

  const [updateStatus, mutation] = useUpdateAdminOrderStatusMutation();
  const [assignRider, { isLoading: assigning }] = useAssignAdminOrderRiderMutation();

  const rows = data?.items || [];
  const riders: ApiRecord[] = ridersData?.items || [];

  async function handleAssignRider() {
    if (!assignOrderId || !selectedRiderId) return;
    setError("");
    setSuccess("");
    try {
      await assignRider({ id: assignOrderId, rider_id: Number(selectedRiderId) }).unwrap();
      setSuccess(`Order #${assignOrderId} successfully assigned to delivery rider.`);
      setAssignOrderId(null);
      setSelectedRiderId("");
      refetch();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not assign rider to this order."));
    }
  }

  return (
    <main className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Marketplace operations</p>
          <h1>Orders</h1>
          <p>Review and update order fulfillment status and dispatch delivery riders.</p>
        </div>
        <span className="date-chip">{data?.total ?? 0} orders</span>
      </div>

      {error && <div className="error-box" role="alert">{error}</div>}
      {success && <div className="success-box">{success}</div>}
      {queryError && (
        <div className="error-box" role="alert">
          {apiErrorMessage(queryError, "Could not load orders.")}
        </div>
      )}

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>All orders</h2>
            <p>Status changes and rider dispatches are synchronized to Laravel.</p>
          </div>
          <select
            aria-label="Filter orders by status"
            className="admin-select"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="">All statuses</option>
            {(data?.statuses || []).map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Shop</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Fulfillment</th>
                <th>Rider</th>
                {canUpdate && <th>Update</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((raw) => {
                const row = obj(raw);
                const customer = obj(obj(row.customer).user);
                const shop = obj(row.shop);
                const rider = row.rider ? obj(obj(row.rider).user ?? row.rider) : null;
                return (
                  <tr key={val(row.id)}>
                    <td>#{val(row.order_code || row.id)}</td>
                    <td>{val(customer.name)}</td>
                    <td>{val(shop.name)}</td>
                    <td>${Number(row.total_amount || row.amount || 0).toFixed(2)}</td>
                    <td>{val(row.payment_status)}</td>
                    <td>
                      <span className="status-pill good">{val(row.order_status)}</span>
                    </td>
                    <td>
                      {rider ? (
                        <span>
                          <Bike size={12} style={{ verticalAlign: "middle", marginRight: 3 }} />
                          {val(rider.name)}
                        </span>
                      ) : canAssign ? (
                        <button
                          className="table-action"
                          onClick={() => {
                            setAssignOrderId(Number(row.id));
                            setSelectedRiderId("");
                            setError("");
                            setSuccess("");
                          }}
                        >
                          <Bike size={13} /> Assign rider
                        </button>
                      ) : (
                        <span className="muted-cell">Unassigned</span>
                      )}
                    </td>
                    {canUpdate && (
                      <td>
                        <select
                          aria-label={`Change order ${val(row.order_code || row.id)} status`}
                          className="admin-select"
                          defaultValue={val(row.order_status)}
                          disabled={mutation.isLoading}
                          onChange={(event) => {
                            if (event.target.value && event.target.value !== row.order_status) {
                              void updateStatus({ id: Number(row.id), status: event.target.value });
                            }
                          }}
                        >
                          <option value="">Choose status</option>
                          {(data?.statuses || []).map((item) => (
                            <option key={item} value={item}>{item}</option>
                          ))}
                        </select>
                      </td>
                    )}
                  </tr>
                );
              })}
              {!rows.length && (
                <tr>
                  <td className="table-empty" colSpan={canUpdate ? 8 : 7}>
                    {isLoading ? "Loading orders…" : "No orders found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ASSIGN RIDER MODAL */}
      {assignOrderId !== null && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-heading">
              <h3>Dispatch Delivery Rider</h3>
              <button
                className="table-action"
                onClick={() => setAssignOrderId(null)}
              >
                <X size={16} />
              </button>
            </div>
            <div>
              <p className="section-note" style={{ marginBottom: 16 }}>
                Assigning an order to a delivery rider notifies them and updates delivery tracking.
              </p>
              <div className="field">
                <label>Select Rider for Order #{assignOrderId}</label>
                <select
                  className="admin-select"
                  style={{ width: "100%", maxWidth: "100%" }}
                  value={selectedRiderId}
                  onChange={(e) => setSelectedRiderId(Number(e.target.value))}
                >
                  <option value="">Choose an available rider…</option>
                  {riders.map((r) => {
                    const riderUser = obj(r.user ?? r);
                    return (
                      <option key={val(r.id)} value={val(r.id)}>
                        {val(riderUser.name)} ({val(riderUser.phone)})
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setAssignOrderId(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="primary-button"
                  disabled={assigning || !selectedRiderId}
                  onClick={handleAssignRider}
                >
                  {assigning ? "Assigning…" : "Confirm Assignment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
