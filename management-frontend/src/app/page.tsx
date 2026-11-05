"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Boxes, CheckCircle2, ShieldCheck, Truck } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { apiErrorMessage, managementApi, sessionEstablished, useSignInMutation, type AppDispatch, type RootState } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const { ready, token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const [signIn, { isLoading: submitting }] = useSignInMutation();
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (ready && token) router.replace("/dashboard");
  }, [ready, token, router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      const result = await signIn({ contact, password }).unwrap();
      const session = { token: result.access.token, user: result.user };
      sessionStorage.setItem("ricemart-management-session", JSON.stringify(session));
      dispatch(managementApi.util.resetApiState());
      dispatch(sessionEstablished(session));
      router.replace("/dashboard");
    } catch (cause) {
      setError(apiErrorMessage(cause, "Unable to sign in."));
    }
  }

  return (
    <main className="login-screen">
      <section className="login-aside">
        <div className="brand"><div className="brand-mark">R</div><div className="brand-name">RiceMart<span>Seller management</span></div></div>
        <div className="login-copy">
          <p className="eyebrow">Your store, in control</p>
          <h1>Good business starts with a clear view.</h1>
          <p>Manage orders, products, and store performance from one simple workspace built for RiceMart sellers.</p>
          <div className="login-benefits">
            <div className="login-benefit"><CheckCircle2 size={17} /> Track new orders and fulfilment</div>
            <div className="login-benefit"><Boxes size={17} /> Keep your product catalog current</div>
            <div className="login-benefit"><Truck size={17} /> Monitor your shop’s performance</div>
          </div>
        </div>
        <div className="login-footer">RiceMart Management · Secure seller access</div>
      </section>
      <section className="login-panel">
        <form className="login-form" onSubmit={submit}>
          <div className="metric-icon" style={{ marginBottom: 19 }}><ShieldCheck size={19} /></div>
          <h2>Welcome back</h2>
          <p>Sign in with the phone number or email linked to your seller account.</p>
          <div className="field">
            <label htmlFor="contact">Email or phone number</label>
            <input id="contact" autoComplete="username" value={contact} onChange={(event) => setContact(event.target.value)} required placeholder="you@yourstore.com" />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required placeholder="Enter your password" />
          </div>
          {error && <div className="error-box" role="alert">{error}</div>}
          <button className="login-submit" type="submit" disabled={submitting}>{submitting ? "Signing in…" : "Sign in to your store"} <ArrowRight size={15} style={{ verticalAlign: "middle", marginLeft: 5 }} /></button>
          <div className="login-note">Seller sign-in uses your existing RiceMart shop account. New shops need an approved seller account before they can access management tools.</div>
        </form>
      </section>
    </main>
  );
}
