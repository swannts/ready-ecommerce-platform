"use client";

import { useState, type FormEvent } from "react";
import { useSelector } from "react-redux";
import { Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { apiErrorMessage, useCreateAdminPageMutation, useDeleteAdminPageMutation, useGetAdminPagesQuery, useToggleAdminPageMutation, useUpdateAdminPageMutation, type ApiRecord, type RootState } from "@/lib/store";

const str = (value: unknown, fallback = "") => value === null || value === undefined ? fallback : String(value);

export function AdminPages() {
  const user = useSelector((state: RootState) => state.auth.user);
  const { data, error: queryError, isLoading } = useGetAdminPagesQuery(undefined);
  const [createPage] = useCreateAdminPageMutation(); const [updatePage] = useUpdateAdminPageMutation(); const [togglePage] = useToggleAdminPageMutation(); const [deletePage] = useDeleteAdminPageMutation();
  const [editing, setEditing] = useState<ApiRecord | null>(null); const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState(""); const [titleAr, setTitleAr] = useState(""); const [content, setContent] = useState(""); const [contentAr, setContentAr] = useState(""); const [icon, setIcon] = useState("");
  const [error, setError] = useState(""); const [success, setSuccess] = useState("");
  const can = (permission: string) => Boolean(user?.roles?.includes("root") || user?.permissions?.includes(permission));
  function startCreate() { setEditing(null); setTitle(""); setTitleAr(""); setContent(""); setContentAr(""); setIcon(""); setFormOpen(true); }
  function startEdit(page: ApiRecord) { setEditing(page); setTitle(str(page.title)); setTitleAr(str(page.title_ar)); setContent(str(page.description)); setContentAr(str(page.description_ar)); setIcon(str(page.icon)); setFormOpen(true); }
  async function run(action: () => Promise<unknown>, message: string) { setError(""); setSuccess(""); try { await action(); setSuccess(message); } catch (cause) { setError(apiErrorMessage(cause, "Could not save the page.")); } }
  async function submit(event: FormEvent) { event.preventDefault(); const body = { title, title_ar: titleAr || null, content, content_ar: contentAr || null, icon: icon || null }; await run(async () => { if (editing) await updatePage({ id: Number(editing.id), body }).unwrap(); else await createPage(body).unwrap(); setFormOpen(false); setEditing(null); }, editing ? "Page updated." : "Page created."); }
  const items = data?.items ?? [];
  return <main className="page-content"><div className="page-heading"><div><p className="eyebrow">Content management</p><h1>Pages</h1><p>Manage public information pages. Default pages are protected from deletion.</p></div>{can("admin.page.create") && <button className="primary-button" onClick={startCreate}><Plus size={14} /> Add page</button>}</div>
    {error && <div className="error-box" role="alert">{error}</div>}{success && <div className="success-box" role="status">{success}</div>}{queryError && <div className="error-box">{apiErrorMessage(queryError, "Could not load pages.")}</div>}
    {formOpen && <form className="panel cms-form" onSubmit={submit}><div className="panel-heading"><div><h2>{editing ? "Edit page" : "New page"}</h2><p>Content fields store the current English and secondary-language values.</p></div><button type="button" className="secondary-button" onClick={() => setFormOpen(false)}>Cancel</button></div><div className="form-two"><Field label="English title" value={title} onChange={setTitle} required /><Field label="Secondary language title" value={titleAr} onChange={setTitleAr} /><Field label="Icon" value={icon} onChange={setIcon} /></div><label className="field"><span>English content (HTML supported)</span><textarea value={content} onChange={(event) => setContent(event.target.value)} required className="cms-editor" /></label><label className="field"><span>Secondary language content</span><textarea value={contentAr} onChange={(event) => setContentAr(event.target.value)} className="cms-editor" /></label><button className="primary-button">Save page</button></form>}
    <section className="panel"><div className="table-wrap"><table className="data-table"><thead><tr><th>Title</th><th>URL</th><th>Type</th><th>Status</th><th>Actions</th></tr></thead><tbody>{items.map((page) => <tr key={str(page.id)}><td><strong>{str(page.title)}</strong><small className="cell-subtitle">{str(page.title_ar, "")}</small></td><td>{str(page.url, `/${str(page.slug)}`)}</td><td>{page.is_default ? "Default" : "Custom"}{!page.is_editable && " · Locked"}</td><td>{page.is_active ? "Published" : "Hidden"}</td><td className="action-cell">{Boolean(page.is_editable) && can("admin.page.edit") && <><button className="table-action" onClick={() => startEdit(page)}>Edit</button><button className="table-action" onClick={() => void run(() => togglePage(Number(page.id)).unwrap(), "Page visibility changed.")}>{page.is_active ? <><EyeOff size={13} /> Hide</> : <><Eye size={13} /> Publish</>}</button></>}{!page.is_default && can("admin.page.destroy") && <button className="table-action danger" onClick={() => { if (window.confirm(`Delete the page “${str(page.title)}”?`)) void run(() => deletePage(Number(page.id)).unwrap(), "Page deleted."); }}><Trash2 size={13} /> Delete</button>}</td></tr>)}{!items.length && <tr><td colSpan={5} className="table-empty">{isLoading ? "Loading pages…" : "No pages found."}</td></tr>}</tbody></table></div></section>
  </main>;
}

function Field({ label, value, onChange, required = false }: { label: string; value: string; onChange: (value: string) => void; required?: boolean }) { return <label className="field"><span>{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} required={required} /></label>; }
