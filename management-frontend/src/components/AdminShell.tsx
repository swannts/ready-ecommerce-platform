"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Boxes, ClipboardList, LayoutDashboard, LogOut, Store, Users, Tags, ShieldCheck, BadgePercent, BadgeCheck, Truck, MessageSquareWarning, Image, Megaphone, Ticket, Percent } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { managementApi, sessionCleared, type AppDispatch, type RootState, useAdminSignOutMutation } from "@/lib/store";

const links = [
  { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/shops", label: "Shops", icon: Store, permission: "admin.shop.index" },
  { href: "/admin/products", label: "Product review", icon: Boxes, permission: "admin.product.index" },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList, permission: "admin.order.index" },
  { href: "/admin/customers", label: "Customers", icon: Users, permission: "admin.customer.index" },
  { href: "/admin/categories", label: "Categories", icon: Tags, permission: "admin.category.index" },
  { href: "/admin/banners", label: "Banners", icon: Image, permission: "admin.banner.index" },
  { href: "/admin/ads", label: "Advertisements", icon: Megaphone, permission: "admin.ad.index" },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket, permission: "admin.coupon.index" },
  { href: "/admin/taxes", label: "VAT & Taxes", icon: Percent, permission: "admin.vatTax.index" },
  { href: "/admin/returns", label: "Returns & refunds", icon: BadgeCheck, permission: "admin.returnOrder.index" },
  { href: "/admin/withdrawals", label: "Withdrawals", icon: BadgePercent, permission: "admin.withdraw.index" },
  { href: "/admin/reviews", label: "Reviews", icon: MessageSquareWarning, permission: "admin.review.index" },
  { href: "/admin/riders", label: "Delivery riders", icon: Truck, permission: "admin.rider.index" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { ready, token, user } = useSelector((state: RootState) => state.auth);
  const [signOut] = useAdminSignOutMutation();
  const isAdmin = user?.roles?.some((role) => role === "root" || role === "admin");
  const visibleLinks = links.filter((link) => user?.roles?.includes("root") || !link.permission || user?.permissions?.includes(link.permission));

  useEffect(() => {
    if (ready && (!token || !isAdmin)) router.replace("/admin");
  }, [ready, token, isAdmin, router]);

  if (!ready || !token || !isAdmin) return <div className="loading">Opening the administration workspace…</div>;

  function logout() {
    void signOut().unwrap().catch(() => undefined);
    sessionStorage.removeItem("ricemart-management-session");
    dispatch(managementApi.util.resetApiState());
    dispatch(sessionCleared());
    router.replace("/admin");
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <Link href="/admin/dashboard" className="brand"><div className="brand-mark">R</div><div className="brand-name">RiceMart<span>Administration</span></div></Link>
      <div className="workspace-label">Control center</div>
      <nav className="nav-list" aria-label="Administration navigation">
        {visibleLinks.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={`nav-link ${path === href ? "active" : ""}`}><Icon className="nav-icon" />{label}</Link>)}
      </nav>
      <div className="sidebar-bottom"><div className="profile"><div className="avatar">{(user!.name || "Admin").slice(0, 1).toUpperCase()}</div><div className="profile-copy"><strong>{user!.name}</strong><span>{user!.roles?.join(", ")}</span></div><button className="logout-button" onClick={logout} aria-label="Sign out"><LogOut size={16} /></button></div></div>
    </aside>
    <div className="main-area"><header className="topbar"><div className="crumb"><ShieldCheck size={14} style={{ verticalAlign: "middle", marginRight: 7 }} /> Administration <b style={{ marginLeft: 8 }}>{links.find((item) => item.href === path)?.label || "Overview"}</b></div><div className="top-actions"><span className="shop-status">{user!.roles?.includes("root") ? "Root administrator" : "Administrator"}</span>{user!.roles?.includes("shop") && <Link href="/dashboard" className="icon-button" aria-label="Open seller workspace"><Store size={16} /></Link>}</div></header>{children}</div>
  </div>;
}
