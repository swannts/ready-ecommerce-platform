"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useSelector } from "react-redux";
import { MessageSquare, Send } from "lucide-react";
import { apiErrorMessage, useGetChatMessagesQuery, useGetChatUsersQuery, useSendChatMessageMutation, type ApiRecord, type RootState } from "@/lib/store";

const get = (item: ApiRecord | undefined, key: string) => item?.[key] == null ? "" : String(item[key]);
const nested = (item: ApiRecord, key: string) => (item[key] && typeof item[key] === "object" ? item[key] as ApiRecord : {});

export default function MessagesPage() {
  const { token } = useSelector((state: RootState) => state.auth);
  const usersQuery = useGetChatUsersQuery(undefined, { skip: !token, pollingInterval: 30000 });
  const users = useMemo(() => usersQuery.data?.data ?? [], [usersQuery.data]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = useMemo(() => users.find(row => Number(nested(row, "user").id) === selectedId) ?? users[0], [users, selectedId]);
  const customerId = Number(nested(selected ?? {}, "user").id) || null;
  const messagesQuery = useGetChatMessagesQuery({ user_id: customerId ?? 0 }, { skip: !token || !customerId, pollingInterval: 10000 });
  const [sendMessage, sending] = useSendChatMessageMutation();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const messages = messagesQuery.data?.data ?? [];

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!customerId || !message.trim()) return;
    setError("");
    try { await sendMessage({ user_id: customerId, message: message.trim(), type: "shop" }).unwrap(); setMessage(""); }
    catch (cause) { setError(apiErrorMessage(cause, "Could not send this message.")); }
  }

  return <main className="page-content"><div className="page-heading"><div><p className="eyebrow">Customer service</p><h1>Customer messages</h1><p>Reply to customers who have contacted your shop.</p></div><span className="date-chip"><MessageSquare size={14} />{users.length} conversations</span></div>
    {error && <div className="error-box" role="alert">{error}</div>}
    <section className="panel chat-layout"><aside className="chat-contacts"><div className="panel-heading"><div><h2>Conversations</h2></div></div>{usersQuery.isLoading ? <p className="loading">Loading conversations…</p> : users.map((row, index) => { const customer = nested(row, "user"); const id = Number(customer.id); return <button key={get(row, "id") || index} className={`chat-contact ${customerId === id ? "active" : ""}`} onClick={() => setSelectedId(id)}><strong>{get(customer, "name") || get(customer, "first_name") || "Customer"}</strong><span>{get(row, "last_message") || "No messages yet"}</span><small>{get(row, "last_message_time")}</small></button>; })}</aside>
      <div className="chat-thread">{selected ? <><div className="chat-thread-heading"><strong>{get(nested(selected, "user"), "name") || "Customer"}</strong><span>{get(nested(selected, "user"), "phone")}</span></div><div className="chat-messages">{messagesQuery.isLoading ? <p className="loading">Loading messages…</p> : messages.length ? messages.map((row, index) => <div className={`chat-bubble ${get(row, "type") === "shop" ? "sent" : "received"}`} key={get(row, "id") || index}><p>{get(row, "message")}</p><small>{get(row, "created_at")}</small></div>) : <p className="table-empty">Start the conversation by sending a message.</p>}</div><form className="chat-compose" onSubmit={submit}><input aria-label="Message" value={message} onChange={event => setMessage(event.target.value)} placeholder="Write a message…" required /><button className="primary-button" disabled={sending.isLoading}><Send size={15} />Send</button></form></> : <div className="chat-empty">{users.length ? "Choose a conversation" : "No customer conversations yet."}</div>}</div>
    </section>
  </main>;
}
