"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { KeyRound, Save, Store, UserRound } from "lucide-react";
import { apiErrorMessage, sessionEstablished, useChangeSellerPasswordMutation, useGetSellerDetailsQuery, useUpdateSellerProfileMutation, useUpdateShopInfoMutation, useUpdateShopSettingsMutation, type AppDispatch, type RootState } from "@/lib/store";

type FormState = Record<string, string>;
const empty: FormState = {};

export default function SettingsPage() {
  const auth = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const details = useGetSellerDetailsQuery(undefined, { skip: !auth.token });
  const [updateProfile, profileMutation] = useUpdateSellerProfileMutation();
  const [updateShop, shopMutation] = useUpdateShopInfoMutation();
  const [updateSettings, settingsMutation] = useUpdateShopSettingsMutation();
  const [changePassword, passwordMutation] = useChangeSellerPasswordMutation();
  const [profile, setProfile] = useState<FormState>(empty);
  const [shop, setShop] = useState<FormState>(empty);
  const [settings, setSettings] = useState<FormState>(empty);
  const [password, setPassword] = useState<FormState>(empty);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const user = details.data?.user;
    if (!user?.shop) return;
    setProfile({ first_name: user.first_name ?? "", last_name: user.last_name ?? "", email: user.email ?? "", phone: user.phone ?? "", gender: user.gender ?? "", date_of_birth: user.date_of_birth ?? "" });
    setShop({ name: user.shop.name ?? "", address: user.shop.address ?? "", short_description: user.shop.description ?? "", description: user.shop.description ?? "", latitude: user.shop.latitude ?? "", longitude: user.shop.longitude ?? "" });
    setSettings({ min_order_amount: String(user.shop.min_order_amount ?? ""), estimated_delivery_time: String(user.shop.estimated_delivery_time ?? ""), prefix: user.shop.prefix ?? "", opening_time: user.shop.open_time ?? "09:00", closing_time: user.shop.close_time ?? "18:00", off_day: Array.isArray(user.shop.off_day) ? user.shop.off_day.join(",") : "" });
  }, [details.data]);

  function showError(cause: unknown) { setError(apiErrorMessage(cause, "Could not save your changes.")); setMessage(""); }
  function showSuccess(text: string) { setMessage(text); setError(""); }
  function setValue(setter: (value: FormState) => void, current: FormState, key: string, value: string) { setter({ ...current, [key]: value }); }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    const body = new FormData(); Object.entries(profile).forEach(([key, value]) => body.set(key, value));
    try { const result = await updateProfile(body).unwrap(); persistUser(result.user); showSuccess("Personal profile saved."); } catch (cause) { showError(cause); }
  }
  async function saveShop(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); const body = new FormData(); Object.entries(shop).forEach(([key, value]) => body.set(key, value));
    try { const result = await updateShop(body).unwrap(); persistUser(result.user); showSuccess("Shop information saved."); } catch (cause) { showError(cause); }
  }
  async function saveShopSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    try { const result = await updateSettings({ ...settings, off_day: settings.off_day ? settings.off_day.split(",").map(day => day.trim().toLowerCase()).filter(Boolean) : [] }).unwrap(); persistUser(result.user); showSuccess("Store hours and checkout settings saved."); } catch (cause) { showError(cause); }
  }
  async function savePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    try { await changePassword({ current_password: password.current_password ?? "", password: password.password ?? "", password_confirmation: password.password_confirmation ?? "" }).unwrap(); setPassword(empty); showSuccess("Password changed."); } catch (cause) { showError(cause); }
  }
  function persistUser(user: NonNullable<typeof auth.user>) {
    if (!auth.token) return;
    const session = { token: auth.token, user };
    sessionStorage.setItem("ricemart-management-session", JSON.stringify(session));
    dispatch(sessionEstablished(session));
  }

  const busy = profileMutation.isLoading || shopMutation.isLoading || settingsMutation.isLoading || passwordMutation.isLoading;
  return <main className="page-content">
    <div className="page-heading"><div><p className="eyebrow">Account & storefront</p><h1>Shop settings</h1><p>Manage your seller profile, public shop details, operating hours, and password.</p></div><span className="date-chip"><Store size={14} />{details.data?.user.shop?.name || auth.user?.shop?.name || "Your shop"}</span></div>
    {details.isLoading && <p className="loading">Loading seller details…</p>}{error && <div className="error-box" role="alert">{error}</div>}{message && <div className="success-box" role="status">{message}</div>}
    <section className="content-grid settings-grid">
      <form className="panel" onSubmit={saveProfile}><Heading icon={<UserRound size={17} />} title="Personal profile" /><Input label="First name" name="first_name" value={profile} set={setProfile} required /><Input label="Last name" name="last_name" value={profile} set={setProfile} /><Input label="Email" name="email" type="email" value={profile} set={setProfile} required /><Input label="Phone" name="phone" value={profile} set={setProfile} required /><Input label="Date of birth" name="date_of_birth" type="date" value={profile} set={setProfile} /><button className="primary-button" disabled={busy}><Save size={14} />Save profile</button></form>
      <form className="panel" onSubmit={saveShop}><Heading icon={<Store size={17} />} title="Public shop information" /><Input label="Shop name" name="name" value={shop} set={setShop} required /><Input label="Address" name="address" value={shop} set={setShop} /><Input label="Short description" name="short_description" value={shop} set={setShop} /><label className="field"><span>Description</span><textarea value={shop.description ?? ""} onChange={e => setValue(setShop, shop, "description", e.target.value)} /></label><div className="form-two"><Input label="Latitude" name="latitude" type="number" value={shop} set={setShop} required /><Input label="Longitude" name="longitude" type="number" value={shop} set={setShop} required /></div><button className="primary-button" disabled={busy}><Save size={14} />Save shop information</button></form>
      <form className="panel" onSubmit={saveShopSettings}><Heading icon={<Store size={17} />} title="Store availability & checkout" /><div className="form-two"><Input label="Opening time" name="opening_time" type="time" value={settings} set={setSettings} required /><Input label="Closing time" name="closing_time" type="time" value={settings} set={setSettings} required /></div><div className="form-two"><Input label="Minimum order amount" name="min_order_amount" type="number" value={settings} set={setSettings} /><Input label="Delivery estimate (days)" name="estimated_delivery_time" type="number" value={settings} set={setSettings} required /></div><Input label="Order code prefix (2 characters)" name="prefix" value={settings} set={setSettings} /><Input label="Closed days (comma separated, e.g. fri)" name="off_day" value={settings} set={setSettings} /><button className="primary-button" disabled={busy}><Save size={14} />Save store settings</button></form>
      <form className="panel" onSubmit={savePassword}><Heading icon={<KeyRound size={17} />} title="Change password" /><Input label="Current password" name="current_password" type="password" value={password} set={setPassword} required /><Input label="New password" name="password" type="password" value={password} set={setPassword} required /><Input label="Confirm new password" name="password_confirmation" type="password" value={password} set={setPassword} required /><button className="primary-button" disabled={busy}><KeyRound size={14} />Change password</button></form>
    </section>
  </main>;
}

function Heading({ icon, title }: { icon: React.ReactNode; title: string }) { return <div className="panel-heading"><div><h2>{title}</h2></div><span className="metric-icon">{icon}</span></div>; }
function Input({ label, name, type = "text", value, set, required = false }: { label: string; name: string; type?: string; value: FormState; set: (value: FormState) => void; required?: boolean }) { return <label className="field"><span>{label}</span><input name={name} type={type} value={value[name] ?? ""} onChange={event => set({ ...value, [name]: event.target.value })} required={required} /></label>; }
