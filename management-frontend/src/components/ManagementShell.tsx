"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Bell, Boxes, ChevronRight, ClipboardList, LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { managementApi, sessionCleared, type AppDispatch, type RootState, useSignOutMutation } from "@/lib/store";

const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/products", label: "Products", icon: Boxes },
  { href: "/orders", label: "Orders", icon: ClipboardList },
];

export function ManagementShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { ready, token, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const [signOut] = useSignOutMutation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (ready && !token) router.replace("/");
  }, [ready, token, router]);

  if (!ready || !token || !user) return <div className="loading">Opening your management workspace…</div>;

  const displayName = `${user.first_name || "Store"} ${user.last_name || ""}`.trim();
  const initials = displayName.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

  function logout() {
    if (token) void signOut().unwrap().catch(() => undefined);
    sessionStorage.removeItem("ricemart-management-session");
    dispatch(managementApi.util.resetApiState());
    dispatch(sessionCleared());
    router.replace("/");
  }

  return (
    <div className="app-shell">
      {menuOpen && <button aria-label="Close navigation" className="mobile-scrim" onClick={() => setMenuOpen(false)} />}
      <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
        <Link href="/dashboard" className="brand" onClick={() => setMenuOpen(false)}><div className="brand-mark">R</div><div className="brand-name">RiceMart<span>Seller workspace</span></div></Link>
        <div className="workspace-label">Workspace</div>
        <nav className="nav-list" aria-label="Management navigation">
          {links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={() => setMenuOpen(false)} className={`nav-link ${pathname === href ? "active" : ""}`}><Icon className="nav-icon" />{label}</Link>)}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card"><strong>Need a hand?</strong><p>Contact RiceMart support if you need help with your store or orders.</p><a href="mailto:support@ricemart.marketplace" className="help-link">Contact support <ChevronRight size={13} /></a></div>
          <div className="profile"><div className="avatar">{initials || "RM"}</div><div className="profile-copy"><strong>{displayName}</strong><span>{user.shop?.name || "Seller account"}</span></div><button className="logout-button" onClick={logout} aria-label="Sign out" title="Sign out"><LogOut size={16} /></button></div>
        </div>
      </aside>
      <div className="main-area">
        <header className="topbar">
          <button className="mobile-menu" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <X size={18} /> : <Menu size={18} />}</button>
          <div className="crumb">Workspace <ChevronRight size={13} style={{ margin: "0 4px", verticalAlign: "middle" }} /> <b>{links.find((link) => link.href === pathname)?.label || "Overview"}</b></div>
          <div className="top-actions"><span className="shop-status"><i className="status-dot" />{user.shop?.name ? "Shop account" : "Seller account"}</span><Link href="/orders" className="icon-button" aria-label="View orders"><Bell size={16} /></Link></div>
        </header>
        {children}
      </div>
    </div>
  );
}
