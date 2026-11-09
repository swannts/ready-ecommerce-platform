"use client";

import { useState, type FormEvent } from "react";
import { useSelector } from "react-redux";
import { Check, Eye, EyeOff, Pin, Send, Trash2 } from "lucide-react";
import {
  apiErrorMessage,
  useCreateAdminTicketIssueTypeMutation,
  useDeleteAdminNotificationMutation,
  useDeleteAdminTicketIssueTypeMutation,
  useGetAdminNotificationRecipientsQuery,
  useGetAdminNotificationsQuery,
  useGetAdminSupportItemsQuery,
  useGetAdminSupportTicketQuery,
  useGetAdminSupportTicketsQuery,
  useGetAdminTicketIssueTypesQuery,
  useReadAdminNotificationMutation,
  useReadAllAdminNotificationsMutation,
  useSendAdminCustomerNotificationMutation,
  useSendAdminSupportMessageMutation,
  useScheduleAdminSupportTicketMutation,
  useToggleAdminSupportMessagePinMutation,
  useToggleAdminTicketIssueTypeMutation,
  useUpdateAdminSupportItemMutation,
  useUpdateAdminSupportTicketMutation,
  useUpdateAdminTicketIssueTypeMutation,
  type ApiRecord,
  type RootState,
} from "@/lib/store";

const obj = (value: unknown): ApiRecord => typeof value === "object" && value !== null ? value as ApiRecord : {};
const rows = (value: unknown): ApiRecord[] => Array.isArray(value) ? value as ApiRecord[] : [];
const str = (value: unknown, fallback = "—") => value === null || value === undefined || value === "" ? fallback : String(value);

type Kind = "tickets" | "issue-types" | "notifications" | "customer-push" | "support-content";

export function AdminSupportWorkspace({ kind }: { kind: Kind }) {
  const user = useSelector((state: RootState) => state.auth.user);
  const [ticketId, setTicketId] = useState<number | null>(null);
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");
  const [issueName, setIssueName] = useState("");
  const [pushTitle, setPushTitle] = useState("");
  const [pushMessage, setPushMessage] = useState("");
  const [schedule, setSchedule] = useState({ start_date: "", start_time: "", end_date: "", end_time: "" });
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const tickets = useGetAdminSupportTicketsQuery(status ? { status } : undefined, { skip: kind !== "tickets" });
  const ticket = useGetAdminSupportTicketQuery(ticketId || 0, { skip: !ticketId });
  const issueTypes = useGetAdminTicketIssueTypesQuery(undefined, { skip: kind !== "issue-types" });
  const notifications = useGetAdminNotificationsQuery(undefined, { skip: kind !== "notifications" });
  const recipients = useGetAdminNotificationRecipientsQuery(undefined, { skip: kind !== "customer-push" });
  const supportItems = useGetAdminSupportItemsQuery(undefined, { skip: kind !== "support-content" });
  const [sendMessage, sendMessageState] = useSendAdminSupportMessageMutation();
  const [scheduleTicket, scheduleTicketState] = useScheduleAdminSupportTicketMutation();
  const [updateTicket, updateTicketState] = useUpdateAdminSupportTicketMutation();
  const [togglePin] = useToggleAdminSupportMessagePinMutation();
  const [createIssue] = useCreateAdminTicketIssueTypeMutation();
  const [updateIssue] = useUpdateAdminTicketIssueTypeMutation();
  const [toggleIssue] = useToggleAdminTicketIssueTypeMutation();
  const [deleteIssue] = useDeleteAdminTicketIssueTypeMutation();
  const [readNotification] = useReadAdminNotificationMutation();
  const [readAll] = useReadAllAdminNotificationsMutation();
  const [deleteNotification] = useDeleteAdminNotificationMutation();
  const [sendPush, sendPushState] = useSendAdminCustomerNotificationMutation();
  const [updateSupportItem] = useUpdateAdminSupportItemMutation();
  const can = (permission: string) => Boolean(user?.roles?.includes("root") || user?.permissions?.includes(permission));
  const title = { tickets: "Customer support tickets", "issue-types": "Ticket issue types", notifications: "Admin notifications", "customer-push": "Customer notifications", "support-content": "Support content" }[kind];

  async function run(action: () => Promise<unknown>, messageText: string) {
    setError(""); setSuccess("");
    try { await action(); setSuccess(messageText); }
    catch (cause) { setError(apiErrorMessage(cause, "The action could not be completed.")); }
  }

  async function submitMessage(event: FormEvent) {
    event.preventDefault();
    if (!ticketId || !message.trim()) return;
    await run(async () => { await sendMessage({ id: ticketId, message: message.trim() }).unwrap(); setMessage(""); }, "Reply sent.");
  }

  async function submitIssue(event: FormEvent) {
    event.preventDefault(); if (!issueName.trim()) return;
    await run(async () => { await createIssue({ name: issueName.trim() }).unwrap(); setIssueName(""); }, "Issue type created.");
  }

  async function submitPush(event: FormEvent) {
    event.preventDefault(); if (!selectedUsers.length) { setError("Select at least one recipient."); return; }
    await run(() => sendPush({ title: pushTitle, message: pushMessage, user_ids: selectedUsers }).unwrap(), "Push notification delivered.");
  }

  if (kind === "tickets") {
    const ticketRows = tickets.data?.items ?? [];
    const selectedTicket = ticket.data?.ticket;
    const messages = ticket.data?.messages ?? [];
    return <main className="page-content"><Heading title={title} description="Review and reply to customer conversations." />{error && <div className="error-box" role="alert">{error}</div>}{success && <div className="success-box" role="status">{success}</div>}{tickets.error && <div className="error-box">{apiErrorMessage(tickets.error, "Could not load tickets.")}</div>}<div className="content-grid" style={{ gridTemplateColumns: "minmax(250px, .8fr) minmax(0, 1.4fr)" }}><section className="panel"><div className="panel-heading"><div><h2>Ticket queue</h2><p>{tickets.data?.total ?? ticketRows.length} conversations</p></div><select aria-label="Filter ticket status" value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All statuses</option>{["pending", "confirm", "completed", "cancel"].map((value) => <option key={value}>{value}</option>)}</select></div><div className="support-ticket-list">{ticketRows.map((row) => <button key={str(row.id)} className={`support-ticket-item ${ticketId === Number(row.id) ? "active" : ""}`} onClick={() => setTicketId(Number(row.id))}><strong>{str(row.ticket_number, `Ticket #${row.id}`)}</strong><span>{str(obj(row.user).name)}</span><small>{str(row.subject || row.title, "Support request")} · {str(row.status)}</small></button>)}{!ticketRows.length && <p className="table-empty">{tickets.isLoading ? "Loading tickets…" : "No tickets found."}</p>}</div></section><section className="panel support-thread"><div className="panel-heading"><div><h2>{str(selectedTicket?.ticket_number, "Select a ticket")}</h2><p>{str(obj(selectedTicket?.user).name)} · {str(obj(selectedTicket?.user).email)}</p></div>{!!selectedTicket && <div className="action-cell"><select aria-label="Update ticket status" value={str(selectedTicket.status, "pending")} onChange={(event) => void run(() => updateTicket({ id: Number(selectedTicket.id), status: event.target.value }).unwrap(), "Ticket status updated.")}>{["pending", "confirm", "completed", "cancel"].map((value) => <option key={value}>{value}</option>)}</select><button className="secondary-button" onClick={() => void run(() => updateTicket({ id: Number(selectedTicket.id), status: str(selectedTicket.status), user_chat: !selectedTicket.user_chat }).unwrap(), selectedTicket.user_chat ? "Customer chat disabled." : "Customer chat enabled.")}>{selectedTicket.user_chat ? <><EyeOff size={13} /> Disable chat</> : <><Eye size={13} /> Enable chat</>}</button></div>}</div>{ticket.isLoading ? <p>Loading conversation…</p> : !selectedTicket ? <p className="table-empty">Choose a support ticket to view the conversation.</p> : <><form className="support-schedule" onSubmit={(event) => { event.preventDefault(); void run(() => scheduleTicket({ id: Number(selectedTicket.id), ...schedule }).unwrap(), "Support schedule saved."); }}><div className="form-two"><label className="field"><span>Start date</span><input type="date" required value={schedule.start_date} onChange={(event) => setSchedule({ ...schedule, start_date: event.target.value })} /></label><label className="field"><span>Start time</span><input type="time" required value={schedule.start_time} onChange={(event) => setSchedule({ ...schedule, start_time: event.target.value })} /></label><label className="field"><span>End date</span><input type="date" required value={schedule.end_date} onChange={(event) => setSchedule({ ...schedule, end_date: event.target.value })} /></label><label className="field"><span>End time</span><input type="time" required value={schedule.end_time} onChange={(event) => setSchedule({ ...schedule, end_time: event.target.value })} /></label></div><button className="secondary-button" disabled={scheduleTicketState.isLoading}>Schedule support</button></form><div className="support-messages">{messages.map((row) => <article className="support-message" key={str(row.id)}><header><strong>{str(obj(row.sender).name, "Customer")}</strong><time>{str(row.created_at)}</time></header><p>{str(row.message, "")}</p>{Boolean(row.is_highlighted) && <span className="status-pill good">Pinned</span>}<button className="table-action" aria-label="Toggle pinned message" onClick={() => void run(() => togglePin(Number(row.id)).unwrap(), row.is_highlighted ? "Message unpinned." : "Message pinned.")}><Pin size={13} /> {row.is_highlighted ? "Unpin" : "Pin"}</button></article>)}{!messages.length && <p>No messages yet.</p>}</div><form onSubmit={submitMessage} className="support-reply"><label className="field"><span>Reply to customer</span><textarea value={message} onChange={(event) => setMessage(event.target.value)} required maxLength={10000} /></label><button className="primary-button" disabled={sendMessageState.isLoading}><Send size={14} /> Send reply</button></form></>}</section></div></main>;
  }

  if (kind === "issue-types") return <main className="page-content"><Heading title={title} description="Maintain the categories customers can select when opening a ticket." />{error && <div className="error-box">{error}</div>}{success && <div className="success-box">{success}</div>}<section className="panel"><div className="panel-heading"><div><h2>Issue categories</h2><p>{issueTypes.data?.items.length ?? 0} types</p></div>{can("admin.ticketIssueType.create") && <form className="search-bar" onSubmit={submitIssue}><input value={issueName} onChange={(event) => setIssueName(event.target.value)} placeholder="New issue type" required maxLength={50} /><button className="primary-button">Add</button></form>}</div><DataTable headers={["Name", "Status", "Actions"]} data={issueTypes.data?.items ?? []} loading={issueTypes.isLoading} render={(row) => <><td>{str(row.name)}</td><td>{row.is_active ? "Active" : "Inactive"}</td><td className="action-cell">{can("admin.ticketIssueType.edit") && <button className="table-action" onClick={async () => { const name = window.prompt("Issue type name", str(row.name)); if (name && name !== row.name) await run(() => updateIssue({ id: Number(row.id), name }).unwrap(), "Issue type updated."); }}>Edit</button>}{can("admin.ticketIssueType.toggle") && <button className="table-action" onClick={() => void run(() => toggleIssue(Number(row.id)).unwrap(), "Issue type status changed.")}>{row.is_active ? "Disable" : "Enable"}</button>}{can("admin.ticketIssueType.delete") && <button className="table-action danger" onClick={() => { if (window.confirm(`Delete ${str(row.name)}?`)) void run(() => deleteIssue(Number(row.id)).unwrap(), "Issue type deleted."); }}><Trash2 size={13} /> Delete</button>}</td></>} /></section></main>;

  if (kind === "notifications") return <main className="page-content"><Heading title={title} description="Read system notices and clear resolved alerts." />{error && <div className="error-box">{error}</div>}{success && <div className="success-box">{success}</div>}<section className="panel"><div className="panel-heading"><div><h2>System inbox</h2><p>{notifications.data?.unread ?? 0} unread · {notifications.data?.total ?? 0} total</p></div><button className="secondary-button" onClick={() => void run(() => readAll().unwrap(), "All notifications marked as read.")}><Check size={14} /> Mark all read</button></div><DataTable headers={["Notification", "Date", "Status", "Actions"]} data={notifications.data?.items ?? []} loading={notifications.isLoading} render={(row) => <><td><strong>{str(row.title, str(row.type, "System notification"))}</strong><small className="cell-subtitle">{str(row.message, str(row.description, ""))}</small></td><td>{str(row.created_at)}</td><td>{row.is_read ? "Read" : "Unread"}</td><td className="action-cell">{!row.is_read && <button className="table-action" onClick={() => void run(() => readNotification(Number(row.id)).unwrap(), "Notification marked as read.")}>Mark read</button>}<button className="table-action danger" onClick={() => { if (window.confirm("Delete this notification?")) void run(() => deleteNotification(Number(row.id)).unwrap(), "Notification deleted."); }}><Trash2 size={13} /> Delete</button></td></>} /></section></main>;

  if (kind === "customer-push") return <main className="page-content"><Heading title={title} description="Send a push message to customers with registered devices." />{error && <div className="error-box">{error}</div>}{success && <div className="success-box">{success}</div>}<div className="content-grid"><form className="panel" onSubmit={submitPush}><div className="panel-heading"><div><h2>Compose push notification</h2><p>Firebase delivery uses the current server configuration.</p></div></div><Field label="Title" value={pushTitle} onChange={setPushTitle} required /><label className="field"><span>Message</span><textarea value={pushMessage} onChange={(event) => setPushMessage(event.target.value)} required maxLength={4000} /></label><button className="primary-button" disabled={sendPushState.isLoading || selectedUsers.length === 0}><Send size={14} /> Send to {selectedUsers.length} customer(s)</button></form><section className="panel"><div className="panel-heading"><div><h2>Recipients</h2><p>{recipients.data?.items.length ?? 0} customers with devices</p></div><button className="secondary-button" onClick={() => setSelectedUsers((recipients.data?.items ?? []).map((row) => Number(row.id)))}>Select all</button></div>{recipients.error && <div className="error-box">{apiErrorMessage(recipients.error, "Could not load recipients.")}</div>}<div className="recipient-list">{(recipients.data?.items ?? []).map((row) => <label className="permission-item" key={str(row.id)}><input type="checkbox" checked={selectedUsers.includes(Number(row.id))} onChange={() => setSelectedUsers((current) => current.includes(Number(row.id)) ? current.filter((id) => id !== Number(row.id)) : [...current, Number(row.id)])} /><span><strong>{str(row.name)}</strong><small className="cell-subtitle">{str(row.email, str(row.phone))}</small></span></label>)}{!recipients.data?.items.length && <p className="table-empty">{recipients.isLoading ? "Loading customer devices…" : "No customer devices are registered."}</p>}</div></section></div></main>;

  return <main className="page-content"><Heading title={title} description="Edit the support cards displayed to marketplace visitors." />{error && <div className="error-box">{error}</div>}{success && <div className="success-box">{success}</div>}<section className="panel"><DataTable headers={["Title", "Description", "Order", "Status", "Action"]} data={supportItems.data?.items ?? []} loading={supportItems.isLoading} render={(row) => <SupportItemRow row={row} onSave={(body) => run(() => updateSupportItem({ id: Number(row.id), body }).unwrap(), "Support content saved.")} />} /></section></main>;
}

function Heading({ title, description }: { title: string; description: string }) { return <div className="page-heading"><div><p className="eyebrow">Administration support</p><h1>{title}</h1><p>{description}</p></div></div>; }
function Field({ label, value, onChange, required }: { label: string; value: string; onChange: (value: string) => void; required?: boolean }) { return <label className="field"><span>{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} required={required} /></label>; }
function DataTable({ headers, data, loading, render }: { headers: string[]; data: ApiRecord[]; loading: boolean; render: (row: ApiRecord) => React.ReactNode }) { return <div className="table-wrap"><table className="data-table"><thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{data.map((row) => <tr key={str(row.id)}>{render(row)}</tr>)}{!data.length && <tr><td colSpan={headers.length} className="table-empty">{loading ? "Loading live records…" : "No records found."}</td></tr>}</tbody></table></div>; }
function SupportItemRow({ row, onSave }: { row: ApiRecord; onSave: (body: Record<string, unknown>) => Promise<void> }) {
  const [title, setTitle] = useState(str(row.title, "")); const [description, setDescription] = useState(str(row.description, "")); const [order, setOrder] = useState(str(row.order, "0"));
  return <><td><input aria-label="Support card title" value={title} onChange={(event) => setTitle(event.target.value)} /></td><td><input aria-label="Support card description" value={description} onChange={(event) => setDescription(event.target.value)} /></td><td><input aria-label="Display order" type="number" min="0" value={order} onChange={(event) => setOrder(event.target.value)} /></td><td>{row.is_active ? "Active" : "Inactive"}</td><td><button className="table-action" onClick={() => void onSave({ title, ar_title: row.ar_title, description, ar_description: row.ar_description, order: Number(order), is_active: Boolean(row.is_active) })}><Check size={13} /> Save</button></td></>;
}
