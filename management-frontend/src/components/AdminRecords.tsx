"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { Check, Search, ShieldAlert, Trash2 } from "lucide-react";
import { apiErrorMessage, useApproveAdminProductMutation, useDeleteAdminProductMutation, useGetAdminCategoriesQuery, useGetAdminCustomersQuery, useGetAdminProductsQuery, useGetAdminShopsQuery, useToggleAdminShopMutation, type ApiRecord, type RootState } from "@/lib/store";

const obj = (value: unknown): ApiRecord => typeof value === "object" && value !== null ? value as ApiRecord : {};
const text = (value: unknown, fallback = "—") => value === null || value === undefined || value === "" ? fallback : String(value);

export function AdminRecords({ kind }: { kind: "shops" | "products" | "customers" | "categories" }) {
  const user = useSelector((state: RootState) => state.auth.user);
  const can = (permission: string) => Boolean(user?.roles?.includes("root") || user?.permissions?.includes(permission));
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const shops = useGetAdminShopsQuery({ search: query }, { skip: kind !== "shops" });
  const products = useGetAdminProductsQuery({ search: query }, { skip: kind !== "products" });
  const customers = useGetAdminCustomersQuery(undefined, { skip: kind !== "customers" });
  const categories = useGetAdminCategoriesQuery(undefined, { skip: kind !== "categories" });
  const [toggleShop] = useToggleAdminShopMutation();
  const [approve] = useApproveAdminProductMutation();
  const [remove] = useDeleteAdminProductMutation();
  const result = kind === "shops" ? shops.data : kind === "products" ? products.data : kind === "customers" ? customers.data : categories.data;
  const isLoading = kind === "shops" ? shops.isLoading : kind === "products" ? products.isLoading : kind === "customers" ? customers.isLoading : categories.isLoading;
  const error = kind === "shops" ? shops.error : kind === "products" ? products.error : kind === "customers" ? customers.error : categories.error;
  const rows: ApiRecord[] = Array.isArray(result?.items) ? (result.items as ApiRecord[]) : [];
  const count = result && "total" in result ? result.total : rows.length;
  const title = { shops: "Marketplace shops", products: "Product review", customers: "Customers", categories: "Categories" }[kind];

  return <main className="page-content"><div className="page-heading"><div><p className="eyebrow">Administration</p><h1>{title}</h1><p>Manage live marketplace records and review status.</p></div><span className="date-chip">{String(count)} records</span></div>{error && <div className="error-box" role="alert">{apiErrorMessage(error, `Could not load ${title.toLowerCase()}.`)}</div>}{(kind === "shops" || kind === "products") && <form className="search-bar" onSubmit={(event) => { event.preventDefault(); setQuery(search); }}><Search size={16} /><input aria-label={`Search ${title}`} placeholder={`Search ${title.toLowerCase()}…`} value={search} onChange={(event) => setSearch(event.target.value)} /><button type="submit" className="primary-button">Search</button></form>}<section className="panel"><div className="table-wrap"><table className="data-table"><thead><tr>{kind === "shops" ? <><th>Shop</th><th>Owner</th><th>Products</th><th>Orders</th><th>Account</th><th>Action</th></> : kind === "products" ? <><th>Product</th><th>Shop</th><th>Price</th><th>Approval</th><th>Action</th></> : kind === "customers" ? <><th>Customer</th><th>Email</th><th>Phone</th><th>Account</th></> : <><th>Category</th><th>Slug</th><th>Products</th><th>Status</th></>}</tr></thead><tbody>{rows.map((raw: ApiRecord, i: number) => { const row = obj(raw); const user = obj(row.user); const approved = Boolean(row.is_approve); const active = Boolean(user.is_active ?? row.is_active); return <tr key={text(row.id, String(i))}>{kind === "shops" ? <><td><strong>{text(row.name)}</strong></td><td>{text(user.name)}<small className="cell-subtitle">{text(user.email)}</small></td><td>{text(row.products_count, "0")}</td><td>{text(row.orders_count, "0")}</td><td><span className={`status-pill ${active ? "good" : "warning"}`}>{active ? "Active" : "Inactive"}</span></td><td>{can("admin.shop.status.toggle") && <button className="table-action" onClick={() => void toggleShop(Number(row.id))}>{active ? "Suspend" : "Activate"}</button>}</td></> : kind === "products" ? <><td><strong>{text(row.name)}</strong><small className="cell-subtitle">ID {text(row.id)}</small></td><td>{text(obj(row.shop).name)}</td><td>{text(row.price)}</td><td><span className={`status-pill ${approved ? "good" : "warning"}`}>{approved ? "Approved" : "Pending"}</span></td><td>{!approved && can("admin.product.approve") && <button className="table-action" onClick={() => void approve(Number(row.id))}><Check size={13} /> Approve</button>}{can("admin.product.destroy") && <button className="table-action danger" onClick={() => { if (window.confirm("Remove this product from the marketplace?")) void remove(Number(row.id)); }}><Trash2 size={13} /> Remove</button>}</td></> : kind === "customers" ? <><td>{text(user.name)}</td><td>{text(user.email)}</td><td>{text(user.phone)}</td><td><span className={`status-pill ${active ? "good" : "warning"}`}>{active ? "Active" : "Inactive"}</span></td></> : <><td>{text(row.name)}</td><td>{text(row.slug)}</td><td>{text(row.products_count, "0")}</td><td>{row.is_active === false ? "Inactive" : "Active"}</td></>}</tr>; })}{!rows.length && <tr><td className="table-empty" colSpan={6}>{isLoading ? "Loading live data…" : error ? "Data could not be loaded." : "No matching records."}</td></tr>}</tbody></table></div></section>{kind === "products" && <p className="login-note" style={{ marginTop: 14 }}><ShieldAlert size={14} style={{ verticalAlign: "middle", marginRight: 4 }} /> Product review actions update the Laravel marketplace records immediately.</p>}</main>;
}
