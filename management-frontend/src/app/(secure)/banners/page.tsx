"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import { useSelector } from "react-redux";
import { ImagePlus, Trash2 } from "lucide-react";
import { apiErrorMessage, useCreateBannerMutation, useDeleteBannerMutation, useGetBannersQuery, useUploadShopImageMutation, type ApiRecord, type RootState } from "@/lib/store";

const get = (item: ApiRecord, key: string) => item[key] == null ? "" : String(item[key]);

export default function BannersPage() {
  const { token } = useSelector((state: RootState) => state.auth);
  const query = useGetBannersQuery(undefined, { skip: !token });
  const [upload, uploadState] = useUploadShopImageMutation();
  const [create, createState] = useCreateBannerMutation();
  const [remove, removeState] = useDeleteBannerMutation();
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setNotice("");
    if (!file) { setError("Choose a banner image first."); return; }
    try {
      const uploadBody = new FormData(); uploadBody.set("file", file);
      const uploaded = await upload(uploadBody).unwrap();
      const body = new FormData(); body.set("title", title); body.set("banner", uploaded.path); body.set("url", url);
      await create(body).unwrap();
      setTitle(""); setUrl(""); setFile(null); setNotice("Banner added to your shop.");
      (event.currentTarget as HTMLFormElement).reset();
    } catch (cause) { setError(apiErrorMessage(cause, "Could not save the banner.")); }
  }
  async function deleteItem(item: ApiRecord) {
    setError(""); setNotice("");
    try { await remove(Number(item.id)).unwrap(); setNotice("Banner removed."); }
    catch (cause) { setError(apiErrorMessage(cause, "Could not remove this banner.")); }
  }

  const banners = query.data?.banners ?? [];
  return <main className="page-content">
    <div className="page-heading"><div><p className="eyebrow">Storefront presentation</p><h1>Store banners</h1><p>Manage the promotional banners displayed on your shop page.</p></div><span className="date-chip"><ImagePlus size={14} />{banners.length} banners</span></div>
    {error && <div className="error-box" role="alert">{error}</div>}{notice && <div className="success-box" role="status">{notice}</div>}
    <section className="panel"><div className="panel-heading"><div><h2>Add a banner</h2><p>Image files up to 2 MB; JPG, PNG, GIF, or SVG.</p></div></div>
      <form className="banner-form" onSubmit={submit}><label className="field"><span>Banner image</span><input type="file" accept="image/jpeg,image/png,image/gif,image/svg+xml,image/webp" required onChange={event => setFile(event.target.files?.[0] ?? null)} /></label><label className="field"><span>Title</span><input value={title} onChange={event => setTitle(event.target.value)} /></label><label className="field"><span>Destination URL</span><input type="url" placeholder="https://…" value={url} onChange={event => setUrl(event.target.value)} /></label><button className="primary-button" disabled={uploadState.isLoading || createState.isLoading}>{uploadState.isLoading || createState.isLoading ? "Uploading…" : "Add banner"}</button></form>
    </section>
    <section className="banner-grid">{query.isLoading ? <p className="loading">Loading banners…</p> : banners.length ? banners.map((item, index) => <article className="panel banner-card" key={get(item, "id") || index}><div className="banner-image">{get(item, "thumbnail") && <Image src={get(item, "thumbnail")} alt={get(item, "title")} fill unoptimized sizes="(max-width: 800px) 100vw, 40vw" />}</div><div className="banner-card-copy"><div><strong>{get(item, "title") || "Untitled banner"}</strong><span>{get(item, "url") || "No destination"}</span></div><button className="icon-button danger" aria-label="Delete banner" title="Delete banner" disabled={removeState.isLoading} onClick={() => void deleteItem(item)}><Trash2 size={16} /></button></div></article>) : <div className="panel table-empty">No store banners yet.</div>}</section>
  </main>;
}
