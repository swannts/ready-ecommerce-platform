"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useSelector } from "react-redux";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { apiErrorMessage, useCreateAdminCatalogRecordMutation, useDeleteAdminCatalogRecordMutation, useGetAdminCatalogQuery, useGetAdminCategoriesQuery, useToggleAdminCatalogRecordMutation, useUpdateAdminCatalogRecordMutation, type ApiRecord, type RootState } from "@/lib/store";

const resources = [
  { key: "categories", title: "Categories", permission: "category", status: "status" },
  { key: "subcategories", title: "Subcategories", permission: "subcategory", status: "is_active" },
  { key: "brands", title: "Brands", permission: "brand", status: "is_active" },
  { key: "colors", title: "Colors", permission: "color", status: "is_active" },
  { key: "sizes", title: "Sizes", permission: "size", status: "is_active" },
  { key: "units", title: "Units", permission: "unit", status: "is_active" },
] as const;
const text = (value: unknown, fallback = "—") => value === null || value === undefined || value === "" ? fallback : String(value);

export function AdminCatalog() {
  const user = useSelector((state: RootState) => state.auth.user);
  const [resourceKey, setResourceKey] = useState<(typeof resources)[number]["key"]>("categories");
  const selected = resources.find((item) => item.key === resourceKey)!;
  const visibleResources = resources.filter((item) => user?.roles?.includes("root") || user?.permissions?.includes(`admin.${item.permission}.index`));
  const [search, setSearch] = useState("");
  const [querySearch, setQuerySearch] = useState("");
  const [editing, setEditing] = useState<ApiRecord | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("bi-tags");
  const [colorCode, setColorCode] = useState("#b9892e");
  const [categoryIds, setCategoryIds] = useState<number[]>([]);
  const [error, setError] = useState("");
  const can = (action: string) => Boolean(user?.roles?.includes("root") || user?.permissions?.includes(`admin.${selected.permission}.${action}`));
  const query = useGetAdminCatalogQuery({ resource: resourceKey, search: querySearch });
  const categoryOptions = useGetAdminCategoriesQuery(undefined, { skip: resourceKey !== "subcategories" });
  const [createRecord, createState] = useCreateAdminCatalogRecordMutation();
  const [updateRecord, updateState] = useUpdateAdminCatalogRecordMutation();
  const [toggleRecord, toggleState] = useToggleAdminCatalogRecordMutation();
  const [deleteRecord, deleteState] = useDeleteAdminCatalogRecordMutation();
  const busy = createState.isLoading || updateState.isLoading || toggleState.isLoading || deleteState.isLoading;
  const rows: ApiRecord[] = query.data?.items ?? [];
  const runAction = async (action: () => Promise<unknown>) => {
    setError("");
    try { await action(); } catch (cause) { setError(apiErrorMessage(cause, "The catalog action could not be completed.")); }
  };

  useEffect(() => {
    setEditing(null); setName(""); setDescription(""); setIcon("bi-tags"); setColorCode("#b9892e"); setCategoryIds([]); setError(""); setSearch(""); setQuerySearch("");
  }, [resourceKey]);

  function startEdit(row: ApiRecord) {
    setEditing(row); setName(String(row.name ?? "")); setDescription(String(row.description ?? row.short_description ?? "")); setIcon(String(row.icon ?? "bi-tags")); setColorCode(String(row.color_code ?? "#b9892e"));
    setCategoryIds(Array.isArray(row.categories) ? row.categories.map((category) => Number((category as ApiRecord).id)) : []);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    const body: ApiRecord = { name };
    if (resourceKey === "categories") Object.assign(body, { description, icon });
    if (resourceKey === "subcategories") Object.assign(body, { short_description: description, category_ids: categoryIds });
    if (resourceKey === "colors") body.color_code = colorCode;
    try {
      if (editing) await updateRecord({ resource: resourceKey, id: Number(editing.id), body }).unwrap();
      else await createRecord({ resource: resourceKey, body }).unwrap();
      setEditing(null); setName(""); setDescription(""); setCategoryIds([]);
    } catch (cause) { setError(apiErrorMessage(cause, "Could not save this catalog record.")); }
  }

  const categoryRows: ApiRecord[] = categoryOptions.data?.items ?? [];
  const statusColumn = resourceKey === "categories" ? "status" : "is_active";

  return <main className="page-content">
    <div className="page-heading"><div><p className="eyebrow">Marketplace setup</p><h1>Product catalog</h1><p>Manage the categories, brands, and product attributes used by the marketplace.</p></div><span className="date-chip">{query.data?.total ?? 0} records</span></div>
    <div className="panel-heading" style={{ marginBottom: 16, flexWrap: "wrap" }}>{visibleResources.map((item) => <button key={item.key} className={`table-action ${resourceKey === item.key ? "active" : ""}`} onClick={() => setResourceKey(item.key)}>{item.title}</button>)}</div>
    {error && <div className="error-box" role="alert">{error}</div>}
    {query.error && <div className="error-box" role="alert">{apiErrorMessage(query.error, "Could not load catalog records.")}</div>}
    {(can("create") || (editing && can("edit"))) && <form className="panel" onSubmit={submit} style={{ padding: 18, marginBottom: 18 }}>
      <div className="panel-heading"><div><h2>{editing ? `Edit ${selected.title.toLowerCase()}` : `Add ${selected.title.toLowerCase()}`}</h2><p>Changes are saved directly to the Laravel catalog.</p></div>{editing && <button type="button" className="table-action" onClick={() => { setEditing(null); setName(""); }}>Cancel edit</button>}</div>
      <div className="search-bar" style={{ flexWrap: "wrap" }}><input required aria-label="Name" placeholder="Name" value={name} onChange={(event) => setName(event.target.value)} />
        {(resourceKey === "categories" || resourceKey === "subcategories") && <input aria-label="Description" placeholder="Description (optional)" value={description} onChange={(event) => setDescription(event.target.value)} />}
        {resourceKey === "categories" && <input aria-label="Icon class" placeholder="Icon class" value={icon} onChange={(event) => setIcon(event.target.value)} />}
        {resourceKey === "colors" && <input aria-label="Color code" type="color" value={colorCode} onChange={(event) => setColorCode(event.target.value)} />}
        {resourceKey === "subcategories" && <select aria-label="Parent categories" className="admin-select" multiple value={categoryIds.map(String)} onChange={(event) => setCategoryIds(Array.from(event.target.selectedOptions, (option) => Number(option.value)))}>{categoryRows.map((category: ApiRecord) => <option key={String(category.id)} value={String(category.id)}>{String(category.name)}</option>)}</select>}
        <button type="submit" className="primary-button" disabled={busy}>{editing ? "Save changes" : <><Plus size={14} /> Add record</>}</button>
      </div>
    </form>}
    <section className="panel"><div className="panel-heading"><div><h2>{selected.title}</h2><p>Catalog records used by real product listings.</p></div><form className="search-bar" onSubmit={(event) => { event.preventDefault(); setQuerySearch(search); }}><Search size={15} /><input aria-label={`Search ${selected.title}`} placeholder="Search by name" value={search} onChange={(event) => setSearch(event.target.value)} /><button className="primary-button" type="submit">Search</button></form></div>
      <div className="table-wrap"><table className="data-table"><thead><tr><th>Name</th>{resourceKey === "categories" && <><th>Description</th><th>Products</th></>}{resourceKey === "subcategories" && <th>Parent categories</th>}{resourceKey === "colors" && <th>Color</th>}<th>Status</th><th>Actions</th></tr></thead><tbody>
        {rows.map((row, index) => <tr key={text(row.id, String(index))}><td><strong>{text(row.name)}</strong><small className="cell-subtitle">ID {text(row.id)}</small></td>{resourceKey === "categories" && <><td>{text(row.description)}</td><td>{text(row.products_count, "0")}</td></>}{resourceKey === "subcategories" && <td>{Array.isArray(row.categories) ? row.categories.map((category) => String((category as ApiRecord).name)).join(", ") : "—"}</td>}{resourceKey === "colors" && <td><span style={{ display: "inline-block", width: 18, height: 18, borderRadius: 99, background: String(row.color_code || "#ddd"), verticalAlign: "middle", marginRight: 8 }} />{text(row.color_code)}</td>}<td><span className={`status-pill ${row[statusColumn] ? "good" : "warning"}`}>{row[statusColumn] ? "Active" : "Inactive"}</span></td><td>{can("edit") && <button className="table-action" onClick={() => startEdit(row)}><Pencil size={13} /> Edit</button>}{can("toggle") && <button className="table-action" disabled={busy} onClick={() => void runAction(() => toggleRecord({ resource: resourceKey, id: Number(row.id) }).unwrap())}>{row[statusColumn] ? "Disable" : "Enable"}</button>}{can("destroy") && <button className="table-action danger" disabled={busy} onClick={() => { if (window.confirm(`Delete “${String(row.name)}”?`)) void runAction(() => deleteRecord({ resource: resourceKey, id: Number(row.id) }).unwrap()); }}><Trash2 size={13} /> Delete</button>}</td></tr>)}
        {!rows.length && <tr><td className="table-empty" colSpan={resourceKey === "categories" || resourceKey === "subcategories" ? 5 : 4}>{query.isLoading ? "Loading catalog records…" : "No catalog records found."}</td></tr>}
      </tbody></table></div>
    </section>
  </main>;
}
