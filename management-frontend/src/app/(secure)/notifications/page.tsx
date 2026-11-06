"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { Bell, Check, Trash2 } from "lucide-react";
import { apiErrorMessage, useDeleteNotificationMutation, useGetNotificationsQuery, useMarkNotificationReadMutation, type ApiRecord, type RootState } from "@/lib/store";

const get = (item: ApiRecord, key: string) => item[key] == null ? "" : String(item[key]);

export default function NotificationsPage() {
  const { token } = useSelector((state: RootState) => state.auth);
  const query = useGetNotificationsQuery({ page: 1, per_page: 50 }, { skip: !token });
  const [markRead, reading] = useMarkNotificationReadMutation();
  const [remove, deleting] = useDeleteNotificationMutation();
  const [error, setError] = useState("");
  const items = query.data?.notification ?? [];

  async function act(action: "read" | "delete", item: ApiRecord) {
    setError("");
    try {
      if (action === "read") await markRead(Number(item.id)).unwrap();
      else await remove(Number(item.id)).unwrap();
    } catch (cause) { setError(apiErrorMessage(cause, "Could not update this notification.")); }
  }

  return <main className="page-content">
    <div className="page-heading"><div><p className="eyebrow">Updates</p><h1>Notifications</h1><p>Store alerts and account activity from RiceMart.</p></div><span className="date-chip"><Bell size={14} /> {items.filter(item => item.is_read !== true).length} unread</span></div>
    {error && <div className="error-box" role="alert">{error}</div>}
    <section className="panel"><div className="notification-list">
      {query.isLoading ? <p className="loading">Loading notifications…</p> : items.length ? items.map((item, index) => <article className={`notification-row ${item.is_read === true ? "read" : "unread"}`} key={get(item, "id") || index}>
        <div className="notification-mark"><Bell size={16} /></div><div className="notification-copy"><strong>{get(item, "title") || "RiceMart update"}</strong><p>{get(item, "message")}</p><span>{get(item, "created_at")}</span></div>
        <button className="icon-button" title="Mark as read" aria-label="Mark as read" disabled={reading.isLoading || item.is_read === true} onClick={() => void act("read", item)}><Check size={15} /></button>
        <button className="icon-button" title="Delete notification" aria-label="Delete notification" disabled={deleting.isLoading} onClick={() => void act("delete", item)}><Trash2 size={15} /></button>
      </article>) : <div className="table-empty">You’re all caught up. No notifications.</div>}
    </div></section>
  </main>;
}
