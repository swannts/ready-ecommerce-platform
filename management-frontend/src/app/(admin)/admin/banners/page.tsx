"use client";

import { useState, type FormEvent } from "react";
import { useSelector } from "react-redux";
import { Plus, Trash2, X, ExternalLink, Image as ImageIcon } from "lucide-react";
import {
  apiErrorMessage,
  useGetAdminBannersQuery,
  useCreateAdminBannerMutation,
  useToggleAdminBannerMutation,
  useDeleteAdminBannerMutation,
  type ApiRecord,
  type RootState,
} from "@/lib/store";

const obj = (val: unknown): ApiRecord => (typeof val === "object" && val !== null ? (val as ApiRecord) : {});
const txt = (val: unknown, fallback = "—") => (val === null || val === undefined || val === "" ? fallback : String(val));

export default function AdminBannersPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);
  const can = (action: string) => Boolean(user?.roles?.includes("root") || user?.permissions?.includes(action));

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modals & Form
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  const { data, error: queryError, isLoading, refetch } = useGetAdminBannersQuery(undefined, {
    skip: !token,
  });

  const [createBanner, { isLoading: creating }] = useCreateAdminBannerMutation();
  const [toggleBanner, { isLoading: toggling }] = useToggleAdminBannerMutation();
  const [deleteBanner, { isLoading: deleting }] = useDeleteAdminBannerMutation();

  const rows: ApiRecord[] = data?.items ?? [];

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!bannerFile) {
      setError("Please select a banner image file.");
      return;
    }
    setError("");
    setSuccess("");
    const formData = new FormData();
    formData.append("title", title);
    if (url) formData.append("url", url);
    formData.append("banner", bannerFile);

    try {
      await createBanner(formData).unwrap();
      setSuccess("Marketplace banner uploaded successfully.");
      setShowCreateModal(false);
      setTitle("");
      setUrl("");
      setBannerFile(null);
      refetch();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not upload banner."));
    }
  }

  async function handleToggle(id: number) {
    setError("");
    setSuccess("");
    try {
      await toggleBanner(id).unwrap();
      setSuccess("Banner status updated.");
      refetch();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not update banner status."));
    }
  }

  async function handleDelete(id: number, bannerTitle: string) {
    if (!window.confirm(`Delete banner "${bannerTitle || `#${id}`}"?`)) return;
    setError("");
    setSuccess("");
    try {
      await deleteBanner(id).unwrap();
      setSuccess("Banner deleted.");
      refetch();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not delete banner."));
    }
  }

  return (
    <main className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Merchandising</p>
          <h1>Marketplace Banners</h1>
          <p>Manage promotional sliders, hero banners, and category advertisements.</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span className="date-chip">{data?.total ?? rows.length} banners</span>
          {can("admin.banner.create") && (
            <button
              className="primary-button"
              onClick={() => {
                setError("");
                setSuccess("");
                setTitle("");
                setUrl("");
                setBannerFile(null);
                setShowCreateModal(true);
              }}
            >
              <Plus size={14} /> Add new banner
            </button>
          )}
        </div>
      </div>

      {error && <div className="error-box" role="alert">{error}</div>}
      {success && <div className="success-box">{success}</div>}
      {queryError && (
        <div className="error-box" role="alert">
          {apiErrorMessage(queryError, "Could not load banners.")}
        </div>
      )}

      <div className="banner-grid">
        {rows.map((raw, idx) => {
          const row = obj(raw);
          const active = Boolean(row.status);
          const media = obj(row.media);
          const imageSrc = txt(row.thumbnail ?? media.src ?? row.banner, "");
          return (
            <div key={txt(row.id, String(idx))} className="panel banner-card">
              <div className="banner-image">
                {imageSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageSrc.startsWith("http") ? imageSrc : `http://localhost:8000/storage/${imageSrc}`}
                    alt={txt(row.title, "Banner")}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <div style={{ display: "grid", placeItems: "center", height: "100%", color: "var(--muted)" }}>
                    <ImageIcon size={32} />
                  </div>
                )}
              </div>
              <div className="banner-card-copy">
                <div>
                  <strong>{txt(row.title, "Promotional banner")}</strong>
                  <span>
                    {row.url ? (
                      <a href={String(row.url)} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--forest)" }}>
                        {txt(row.url)} <ExternalLink size={10} />
                      </a>
                    ) : (
                      "No target link assigned"
                    )}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className={`status-pill ${active ? "good" : "warning"}`}>
                    {active ? "Active" : "Hidden"}
                  </span>
                  {can("admin.banner.toggle") && (
                    <button
                      className="table-action"
                      disabled={toggling}
                      onClick={() => handleToggle(Number(row.id))}
                    >
                      {active ? "Hide" : "Show"}
                    </button>
                  )}
                  {can("admin.banner.destroy") && (
                    <button
                      className="table-action danger"
                      title="Delete banner"
                      disabled={deleting}
                      onClick={() => handleDelete(Number(row.id), txt(row.title))}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!rows.length && !isLoading && (
        <div className="panel" style={{ textAlign: "center", padding: 40, marginTop: 16 }}>
          <ImageIcon size={36} style={{ color: "var(--muted)", margin: "0 auto 12px" }} />
          <h3>No banners found</h3>
          <p style={{ color: "var(--muted)", fontSize: 12 }}>Create a banner to feature on the marketplace homepage.</p>
        </div>
      )}

      {/* CREATE BANNER MODAL */}
      {showCreateModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-heading">
              <h3>Upload Promotional Banner</h3>
              <button
                className="table-action"
                onClick={() => setShowCreateModal(false)}
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="field">
                <label>Banner Title</label>
                <input
                  placeholder="e.g. Harvest Season Super Sale"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="field">
                <label>Destination URL</label>
                <input
                  type="url"
                  placeholder="https://ricemart.com/category/basmati"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <div className="field">
                <label>Banner Image File *</label>
                <input
                  required
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setBannerFile(file);
                  }}
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
                  {creating ? "Uploading…" : "Publish Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
