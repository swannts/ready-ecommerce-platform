"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, ShieldCheck, Store, Users } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { apiErrorMessage, managementApi, sessionEstablished, useAdminSignInMutation, type AppDispatch, type RootState } from "@/lib/store";

export default function AdminLoginPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { ready, token, user } = useSelector((state: RootState) => state.auth);
  const [signIn, { isLoading }] = useAdminSignInMutation();
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (ready && token && user?.roles?.some((role) => role === "root" || role === "admin")) router.replace("/admin/dashboard");
  }, [ready, token, user, router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    await authenticate(contact, password);
  }

  async function authenticate(loginContact: string, loginPassword: string) {
    try {
      const result = await signIn({ contact: loginContact, password: loginPassword }).unwrap();
      const session = { token: result.token, user: result.user };
      sessionStorage.setItem("ricemart-management-session", JSON.stringify(session));
      dispatch(managementApi.util.resetApiState()); dispatch(sessionEstablished(session)); router.replace("/admin/dashboard");
    } catch (cause) { setError(apiErrorMessage(cause, "Unable to sign in.")); }
  }

  const demoLoginEnabled = process.env.NEXT_PUBLIC_ADMIN_QUICK_LOGIN === "true"
    && Boolean(process.env.NEXT_PUBLIC_ADMIN_LOGIN_EMAIL && process.env.NEXT_PUBLIC_ADMIN_LOGIN_PASSWORD);
  function quickLogin() {
    const demoEmail = process.env.NEXT_PUBLIC_ADMIN_LOGIN_EMAIL || "";
    const demoPassword = process.env.NEXT_PUBLIC_ADMIN_LOGIN_PASSWORD || "";
    setContact(demoEmail); setPassword(demoPassword); setError("");
    void authenticate(demoEmail, demoPassword);
  }

  return <main className="login-screen"><section className="login-aside"><div className="brand"><div className="brand-mark">R</div><div className="brand-name">RiceMart<span>Administration</span></div></div><div className="login-copy"><p className="eyebrow">Marketplace operations</p><h1>One place to run the whole marketplace.</h1><p>Review shop activity, product submissions, orders, customers, and marketplace categories.</p><div className="login-benefits"><div className="login-benefit"><Store size={17} /> Manage marketplace shops</div><div className="login-benefit"><CheckCircle2 size={17} /> Review products and orders</div><div className="login-benefit"><Users size={17} /> Support marketplace customers</div></div></div><div className="login-footer">RiceMart Administration · Root and admin access</div></section><section className="login-panel"><form className="login-form" onSubmit={submit}><div className="metric-icon" style={{ marginBottom: 19 }}><ShieldCheck size={19} /></div><h2>Administrator sign in</h2><p>Use your existing root or admin account.</p><div className="field"><label htmlFor="admin-contact">Email or phone number</label><input id="admin-contact" autoComplete="username" value={contact} onChange={(event) => setContact(event.target.value)} required /></div><div className="field"><label htmlFor="admin-password">Password</label><input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></div>{error && <div className="error-box" role="alert">{error}</div>}{demoLoginEnabled && <button className="secondary-button quick-login" type="button" onClick={quickLogin} disabled={isLoading}>{isLoading ? "Signing in…" : "Quick login with demo admin"}</button>}<button className="login-submit" type="submit" disabled={isLoading}>{isLoading ? "Signing in…" : "Open administration"} <ArrowRight size={15} style={{ verticalAlign: "middle", marginLeft: 5 }} /></button><div className="login-note">Access is checked against your Laravel role. Shop and customer accounts are not admitted.</div></form></section></main>;
}
