"use client";

import { useMemo, useState } from "react";
import {
  useGetAdminStoreSettingsQuery, useUpdateAdminStoreSettingsMutation,
  useGetAdminLogisticsSettingsQuery, useCreateAdminDeliveryChargeMutation,
  useDeleteAdminDeliveryChargeMutation, useCreateAdminWeightChargeMutation,
  useDeleteAdminWeightChargeMutation, useGetAdminPaymentGatewaysQuery, useGetAdminIntegrationSettingsQuery, useUpdateAdminIntegrationSettingsMutation, useGetAdminSmsGatewaysQuery, useUpdateAdminSmsGatewayMutation, useGetAdminFirebaseQuery, useUploadAdminFirebaseMutation, useGetAdminRecaptchaQuery, useUpdateAdminRecaptchaMutation, useGetAdminSocialAuthQuery, useUpdateAdminSocialAuthMutation, useToggleAdminSocialAuthMutation, useCreateAdminAreaMutation, useToggleAdminAreaMutation, useDeleteAdminAreaMutation, useCreateAdminCountryMutation, useDeleteAdminCountryMutation, useCreateAdminCurrencyMutation, useToggleAdminCurrencyMutation, useDeleteAdminCurrencyMutation,
  useUpdateAdminPaymentGatewayMutation, useToggleAdminPaymentGatewayMutation,
  apiErrorMessage, type ApiRecord,
} from "@/lib/store";

const storeFields: Array<[string, string, "text" | "number" | "checkbox"]> = [
  ["name", "Store name", "text"], ["title", "Store title", "text"], ["email", "Contact email", "text"],
  ["mobile", "Contact phone", "text"], ["address", "Address", "text"], ["footer_text", "Footer text", "text"],
  ["commission", "Commission", "number"], ["commission_charge", "Commission charge", "number"],
  ["min_withdraw", "Minimum withdrawal", "number"], ["max_withdraw", "Maximum withdrawal", "number"],
  ["default_delivery_charge", "Default delivery charge", "number"], ["low_stock_alert_quantity", "Low stock threshold", "number"],
  ["shop_pos", "Point of sale enabled", "checkbox"], ["shop_register", "Shop registration enabled", "checkbox"],
  ["new_product_approval", "Require approval for new products", "checkbox"], ["update_product_approval", "Require approval for product edits", "checkbox"],
  ["withdraw_request", "Allow withdrawal requests", "checkbox"], ["is_weight_charge", "Use weight based shipping", "checkbox"],
  ["is_distance_charge", "Use distance based shipping", "checkbox"], ["is_delivery_free", "Free delivery", "checkbox"],
  ["show_product_stock", "Show product stock", "checkbox"], ["show_sku", "Show SKU", "checkbox"],
  ["show_download_app", "Show app download links", "checkbox"], ["cash_on_delivery", "Cash on delivery", "checkbox"],
  ["online_payment", "Online payment", "checkbox"], ["low_stock_alert", "Low stock alerts", "checkbox"],
];

function value(row: ApiRecord, key: string) { return row[key] == null ? "" : String(row[key]); }

export function AdminSettings() {
  const storeQuery = useGetAdminStoreSettingsQuery();
  const logisticsQuery = useGetAdminLogisticsSettingsQuery();
  const gatewaysQuery = useGetAdminPaymentGatewaysQuery();
  const [saveStore, storeMutation] = useUpdateAdminStoreSettingsMutation();
  const [addDelivery] = useCreateAdminDeliveryChargeMutation();
  const [removeDelivery] = useDeleteAdminDeliveryChargeMutation();
  const [addWeight] = useCreateAdminWeightChargeMutation();
  const [removeWeight] = useDeleteAdminWeightChargeMutation();
  const [saveGateway] = useUpdateAdminPaymentGatewayMutation();
  const [addArea] = useCreateAdminAreaMutation(); const [toggleArea] = useToggleAdminAreaMutation(); const [removeArea] = useDeleteAdminAreaMutation();
  const [addCountry] = useCreateAdminCountryMutation(); const [removeCountry] = useDeleteAdminCountryMutation();
  const [addCurrency] = useCreateAdminCurrencyMutation(); const [toggleCurrency] = useToggleAdminCurrencyMutation(); const [removeCurrency] = useDeleteAdminCurrencyMutation();
  const [toggleGateway] = useToggleAdminPaymentGatewayMutation();
  const settings = storeQuery.data?.settings ?? {};
  const [draft, setDraft] = useState<ApiRecord>({});
  const form = useMemo(() => ({ ...settings, ...draft }), [settings, draft]);
  const [delivery, setDelivery] = useState({ name: "", min_qty: "0", max_qty: "", charge: "0" });
  const [weight, setWeight] = useState({ min_weight: "0", max_weight: "", delivery_charge: "0" });
  const [notice, setNotice] = useState("");
  const [areaName, setAreaName] = useState(""); const [areaFee, setAreaFee] = useState("0");
  const [countryName, setCountryName] = useState(""); const [phoneCode, setPhoneCode] = useState("");
  const [currencyName, setCurrencyName] = useState(""); const [currencyCode, setCurrencyCode] = useState(""); const [currencySymbol, setCurrencySymbol] = useState("৳");

  async function submitStore(event: React.FormEvent) {
    event.preventDefault(); setNotice("");
    try { await saveStore(form).unwrap(); setDraft({}); setNotice("Store settings saved."); }
    catch (error) { setNotice(apiErrorMessage(error, "Could not save store settings.")); }
  }
  async function submitCharge(event: React.FormEvent) {
    event.preventDefault();
    try { await addDelivery({ ...delivery, min_qty: Number(delivery.min_qty), max_qty: Number(delivery.max_qty), charge: Number(delivery.charge) }).unwrap(); setDelivery({ name: "", min_qty: "0", max_qty: "", charge: "0" }); }
    catch (error) { setNotice(apiErrorMessage(error, "Could not save delivery charge.")); }
  }
  async function submitWeight(event: React.FormEvent) {
    event.preventDefault();
    try { await addWeight({ min_weight: Number(weight.min_weight), max_weight: Number(weight.max_weight), delivery_charge: Number(weight.delivery_charge) }).unwrap(); setWeight({ min_weight: "0", max_weight: "", delivery_charge: "0" }); }
    catch (error) { setNotice(apiErrorMessage(error, "Could not save weight charge.")); }
  }
  async function patchGateway(row: ApiRecord, key: string, next: string) {
    const config = typeof row.config === "object" && row.config !== null ? row.config as ApiRecord : {};
    try { await saveGateway({ id: Number(row.id), body: { config: { ...config, [key]: next } } }).unwrap(); setNotice("Gateway saved. Leave masked secrets as shown or enter a new value to rotate them."); }
    catch (error) { setNotice(apiErrorMessage(error, "Could not save gateway.")); }
  }

  if (storeQuery.isLoading || logisticsQuery.isLoading || gatewaysQuery.isLoading) return <main className="page-content"><div className="loading">Loading configuration…</div></main>;
  if (storeQuery.isError || logisticsQuery.isError || gatewaysQuery.isError) return <main className="page-content"><h1>Settings</h1><div className="notice error">Unable to load settings. Check your permissions and API connection.</div></main>;
  const logistics = logisticsQuery.data!;
  return <main className="page-content">
    <div className="page-heading"><div><span className="eyebrow">Control center</span><h1>Store & system settings</h1><p>Configure store behavior, delivery pricing, and payment gateways.</p></div></div>
    {notice && <div className="notice">{notice}</div>}
    <section className="panel"><div className="panel-heading"><h2>Store and business</h2><span>Currency options: {storeQuery.data?.currencies.map((c) => String(c.name)).join(", ") || "not configured"}</span></div>
      <form className="settings-grid" onSubmit={submitStore}>{storeFields.map(([key, label, kind]) => <label key={key} className={kind === "checkbox" ? "settings-toggle" : "form-field"}>{kind === "checkbox" ? <><input type="checkbox" checked={Boolean(form[key])} onChange={(e) => setDraft({ ...draft, [key]: e.target.checked })} />{label}</> : <>{label}<input type={kind} value={value(form, key)} onChange={(e) => setDraft({ ...draft, [key]: kind === "number" ? (e.target.value === "" ? null : Number(e.target.value)) : e.target.value })} /></>}</label>)}
        <label className="form-field">Default currency<select value={value(form, "currency_id")} onChange={(e) => setDraft({ ...draft, currency_id: e.target.value ? Number(e.target.value) : null })}><option value="">Use current default</option>{storeQuery.data?.currencies.map((c) => <option key={String(c.id)} value={String(c.id)}>{String(c.name)} ({String(c.code ?? "")})</option>)}</select></label>
        <button className="primary-button" disabled={storeMutation.isLoading}>Save store settings</button>
      </form>
    </section>
    <section className="panel"><div className="panel-heading"><h2>Quantity based delivery charges</h2><span>{logistics.delivery_charges.length} rules</span></div>
      <div className="record-list">{logistics.delivery_charges.map((row) => <div className="record-row" key={String(row.id)}><span><b>{String(row.name)}</b><small>{value(row,"min_qty")}–{value(row,"max_qty")} units · ৳{value(row,"charge")}</small></span><button className="danger-button" onClick={() => void removeDelivery(Number(row.id))}>Delete</button></div>)}</div>
      <form className="inline-form" onSubmit={submitCharge}><input aria-label="Rule name" placeholder="Rule name" value={delivery.name} onChange={(e) => setDelivery({ ...delivery, name: e.target.value })} required /><input aria-label="Minimum quantity" type="number" min="0" placeholder="Min qty" value={delivery.min_qty} onChange={(e) => setDelivery({ ...delivery, min_qty: e.target.value })} required /><input aria-label="Maximum quantity" type="number" min="0" placeholder="Max qty" value={delivery.max_qty} onChange={(e) => setDelivery({ ...delivery, max_qty: e.target.value })} required /><input aria-label="Delivery charge" type="number" min="0" step="0.01" placeholder="Charge ৳" value={delivery.charge} onChange={(e) => setDelivery({ ...delivery, charge: e.target.value })} required /><button className="primary-button">Add rule</button></form>
    </section>
    <section className="panel"><div className="panel-heading"><h2>Weight based delivery charges</h2><span>{logistics.weight_charges.length} rules</span></div>
      <div className="record-list">{logistics.weight_charges.map((row) => <div className="record-row" key={String(row.id)}><span><b>{value(row,"min_weight")}–{value(row,"max_weight")} kg</b><small>Delivery charge ৳{value(row,"delivery_charge")}</small></span><button className="danger-button" onClick={() => void removeWeight(Number(row.id))}>Delete</button></div>)}</div>
      <form className="inline-form" onSubmit={submitWeight}><input aria-label="Minimum weight" type="number" min="0" step="0.01" value={weight.min_weight} onChange={(e) => setWeight({ ...weight, min_weight: e.target.value })} required /><input aria-label="Maximum weight" type="number" min="0" step="0.01" placeholder="Max kg" value={weight.max_weight} onChange={(e) => setWeight({ ...weight, max_weight: e.target.value })} required /><input aria-label="Weight delivery charge" type="number" min="0" step="0.01" placeholder="Charge ৳" value={weight.delivery_charge} onChange={(e) => setWeight({ ...weight, delivery_charge: e.target.value })} required /><button className="primary-button">Add rule</button></form>
    </section>
    <section className="panel"><div className="panel-heading"><h2>Delivery areas</h2><span>{logistics.areas.length} areas</span></div><div className="record-list">{logistics.areas.map((row) => <div className="record-row" key={String(row.id)}><span><b>{String(row.name)}</b><small>Delivery fee ৳{value(row,"delivery_amount")} · {row.is_active ? "Active" : "Inactive"}</small></span><div><button className="secondary-button" onClick={() => void toggleArea(Number(row.id))}>{row.is_active ? "Disable" : "Enable"}</button> <button className="danger-button" onClick={() => void removeArea(Number(row.id))}>Delete</button></div></div>)}</div><form className="inline-form" onSubmit={async (e) => { e.preventDefault(); try { await addArea({ name: areaName, delivery_amount: Number(areaFee) }).unwrap(); setAreaName(""); } catch (err) { setNotice(apiErrorMessage(err,"Could not save area.")); } }}><input aria-label="Area name" placeholder="Area name" value={areaName} onChange={(e) => setAreaName(e.target.value)} required/><input aria-label="Area delivery fee" type="number" min="0" step="0.01" placeholder="Delivery fee ৳" value={areaFee} onChange={(e) => setAreaFee(e.target.value)} required/><button className="primary-button">Add area</button></form></section>
    <section className="panel"><div className="panel-heading"><h2>Countries</h2><span>{logistics.countries.length} configured</span></div><div className="record-list">{logistics.countries.map((row) => <div className="record-row" key={String(row.id)}><span><b>{String(row.name)}</b><small>+{String(row.phone_code ?? "")} · {row.is_active ? "Active" : "Inactive"}</small></span><button className="danger-button" onClick={() => void removeCountry(Number(row.id))}>Delete</button></div>)}</div><form className="inline-form" onSubmit={async (e) => { e.preventDefault(); try { await addCountry({ name: countryName, phone_code: phoneCode }).unwrap(); setCountryName(""); setPhoneCode(""); } catch (err) { setNotice(apiErrorMessage(err,"Could not save country.")); } }}><input aria-label="Country name" placeholder="Country name" value={countryName} onChange={(e) => setCountryName(e.target.value)} required/><input aria-label="Phone code" placeholder="Phone code" value={phoneCode} onChange={(e) => setPhoneCode(e.target.value)} required/><button className="primary-button">Add country</button></form></section>
    <section className="panel"><div className="panel-heading"><h2>Currencies</h2><span>{storeQuery.data?.currencies.length ?? 0} configured</span></div><div className="record-list">{storeQuery.data?.currencies.map((row) => <div className="record-row" key={String(row.id)}><span><b>{String(row.name)} ({String(row.code ?? "")})</b><small>{String(row.symbol)} · rate {String(row.rate)} · {row.is_default ? "Default" : row.is_active ? "Active" : "Inactive"}</small></span><div><button className="secondary-button" disabled={Boolean(row.is_default)} onClick={() => void toggleCurrency(Number(row.id))}>{row.is_active ? "Disable" : "Enable"}</button> {!row.is_default && <button className="danger-button" onClick={() => void removeCurrency(Number(row.id))}>Delete</button>}</div></div>)}</div><form className="inline-form" onSubmit={async (e) => { e.preventDefault(); try { await addCurrency({ name: currencyName, code: currencyCode, symbol: currencySymbol, rate: 1, is_active: true }).unwrap(); setCurrencyName(""); setCurrencyCode(""); } catch (err) { setNotice(apiErrorMessage(err,"Could not save currency.")); } }}><input aria-label="Currency name" placeholder="Name" value={currencyName} onChange={(e) => setCurrencyName(e.target.value)} required/><input aria-label="Currency code" placeholder="Code" value={currencyCode} onChange={(e) => setCurrencyCode(e.target.value)} required/><input aria-label="Currency symbol" placeholder="Symbol" value={currencySymbol} onChange={(e) => setCurrencySymbol(e.target.value)} required/><button className="primary-button">Add currency</button></form></section>
    <section className="panel"><div className="panel-heading"><h2>Payment gateways</h2><span>Secret fields are masked in API responses.</span></div>
      <div className="gateway-list">{(gatewaysQuery.data?.items ?? []).map((gateway) => { const config = typeof gateway.config === "object" && gateway.config !== null ? gateway.config as ApiRecord : {}; return <article className="gateway-card" key={String(gateway.id)}><header><div><h3>{String(gateway.title ?? gateway.name)}</h3><small>{String(gateway.mode ?? "")}</small></div><button className="secondary-button" onClick={() => void toggleGateway(Number(gateway.id))}>{gateway.is_active ? "Disable" : "Enable"}</button></header><div className="settings-grid">{Object.entries(config).map(([key, current]) => <label key={key} className="form-field">{key}<input type="text" defaultValue={String(current ?? "")} onBlur={(event) => { if (event.target.value !== String(current ?? "")) void patchGateway(gateway, key, event.target.value); }} autoComplete="off" /></label>)}</div></article>; })}</div>
    </section>
    <section className="panel"><div className="panel-heading"><h2>External service connections</h2><span>Credentials are stored in the Laravel environment and masked when read.</span></div><div className="integration-grid"><IntegrationEditor service="mail" title="Mail delivery" fields={[["mailer","Mailer"],["host","SMTP host"],["port","SMTP port"],["username","Username"],["password","Password",true],["encryption","Encryption"],["from_address","From email"]]} /><IntegrationEditor service="courier" title="SteadFast courier" fields={[["api_key","API key",true],["secret_key","Secret key",true],["base_url","API base URL"],["default_delivery_type","Delivery type"],["is_active","Enabled"]]} /><IntegrationEditor service="google-maps" title="Google Maps" fields={[["api_key","API key",true]]} /><IntegrationEditor service="pusher" title="Pusher" fields={[["app_id","App ID"],["app_key","App key"],["app_secret","App secret",true],["app_cluster","Cluster"]]} /><IntegrationEditor service="meta" title="Meta Pixel and Conversions API" fields={[["pixel_id","Pixel ID"],["capi_access_token","Conversions API token",true],["test_event_code","Test event code"]]} /></div></section>
  </main>;
}

function IntegrationEditor({ service, title, fields }: { service: string; title: string; fields: Array<[string, string, boolean?]> }) {
  const query = useGetAdminIntegrationSettingsQuery(service);
  const [update] = useUpdateAdminIntegrationSettingsMutation();
  const [message, setMessage] = useState("");
  if (query.isLoading) return <div className="loading">Loading {title}…</div>;
  if (!query.data) return <p className="muted">Could not load {title} settings.</p>;
  async function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); const body: Record<string, unknown> = {}; for (const [key] of fields) body[key] = String(form.get(key) ?? ""); try { await update({ service, body }).unwrap(); setMessage("Saved."); } catch (error) { setMessage(apiErrorMessage(error, "Could not save connection.")); } }
  return <form className="integration-card" onSubmit={submit}><h3>{title}</h3>{query.isError ? <p className="muted">Unavailable for this role.</p> : <>{fields.map(([key,label,secret]) => <label className="form-field" key={key}>{label}<input type={secret ? "password" : "text"} name={key} defaultValue={value(query.data?.values ?? {}, key)} autoComplete="off" placeholder={secret ? "Leave blank to keep current value" : ""} /></label>)}<button className="secondary-button" disabled={query.isLoading}>Save connection</button>{message && <small role="status">{message}</small>}</>}</form>;
}


function RecaptchaEditor() {
  const query = useGetAdminRecaptchaQuery(); const [save] = useUpdateAdminRecaptchaMutation(); const [message, setMessage] = useState("");
  const row = query.data?.settings ?? {};
  if (query.isLoading) return <div className="loading">Loading reCAPTCHA…</div>;
  return <form className="integration-grid" onSubmit={async (event) => { event.preventDefault(); const data = new FormData(event.currentTarget); try { await save({ site_key: String(data.get("site_key") ?? ""), secret_key: String(data.get("secret_key") ?? ""), is_active: data.get("is_active") === "on" }).unwrap(); setMessage("Saved."); } catch (error) { setMessage(apiErrorMessage(error,"Could not save reCAPTCHA.")); } }}><label className="form-field">Site key<input name="site_key" defaultValue={value(row,"site_key")} required/></label><label className="form-field">Secret key<input name="secret_key" type="password" placeholder="Leave blank to keep current" autoComplete="new-password"/></label><label className="settings-toggle"><input type="checkbox" name="is_active" defaultChecked={Boolean(row.is_active)}/> Enable reCAPTCHA</label><button className="secondary-button">Save reCAPTCHA</button>{message && <small role="status">{message}</small>}</form>;
}

function SocialAuthList() {
  const query = useGetAdminSocialAuthQuery(); const [save] = useUpdateAdminSocialAuthMutation(); const [toggle] = useToggleAdminSocialAuthMutation(); const [message,setMessage]=useState("");
  if(query.isLoading) return <div className="loading">Loading social login providers…</div>;
  return <div className="record-list">{(query.data?.items ?? []).map((row) => <form className="integration-card" key={String(row.id)} onSubmit={async (event) => { event.preventDefault(); const data = new FormData(event.currentTarget); try { await save({ id:Number(row.id), body:{ client_id:String(data.get("client_id")??""), client_secret:String(data.get("client_secret")??""), redirect:String(data.get("redirect")??"") } }).unwrap(); setMessage("Provider saved."); } catch (error) { setMessage(apiErrorMessage(error,"Could not save provider.")); } }}><header className="panel-heading"><h3>{String(row.name ?? row.provider ?? "Login provider")}</h3><button type="button" className="secondary-button" onClick={() => void toggle(Number(row.id))}>{row.is_active ? "Disable" : "Enable"}</button></header><label className="form-field">Client ID<input name="client_id" defaultValue={value(row,"client_id")}/></label><label className="form-field">Client secret<input name="client_secret" type="password" placeholder="Leave blank to keep current" autoComplete="new-password"/></label><label className="form-field">Redirect URL<input name="redirect" defaultValue={value(row,"redirect")}/></label><button className="secondary-button">Save provider</button>{message && <small role="status">{message}</small>}</form>)}</div>;
}


function FirebaseUploader() {
  const query = useGetAdminFirebaseQuery(); const [upload] = useUploadAdminFirebaseMutation(); const [message,setMessage]=useState("");
  return <form className="inline-form" onSubmit={async (event) => { event.preventDefault(); const form = new FormData(event.currentTarget); const file = form.get("file"); if (!(file instanceof File) || !file.size) return setMessage("Choose a Firebase service account JSON file."); try { await upload(file).unwrap(); setMessage("Firebase credentials uploaded."); } catch (error) { setMessage(apiErrorMessage(error,"Could not upload Firebase credentials.")); } }}><span>{query.data?.configured ? `Configured project: ${query.data.project_id ?? "unknown"}` : "No Firebase service account uploaded."}</span><input type="file" name="file" accept="application/json,.json" required/><button className="secondary-button">Upload service account</button>{message && <small role="status">{message}</small>}</form>;
}


function SmsGatewayEditor() {
  const query=useGetAdminSmsGatewaysQuery(); const [save]=useUpdateAdminSmsGatewayMutation(); const [message,setMessage]=useState("");
  if(query.isLoading) return <div className="loading">Loading SMS settings…</div>;
  const providers:Array<[string,string[]]>=[["twilio",["twilio_sid","twilio_token","twilio_from"]],["telesign",["customer_id","api_key"]],["nexmo",["nexmo_key","nexmo_secret","nexmo_from"]],["message_bird",["api_key","from"]]];
  return <div className="integration-grid">{providers.map(([provider,fields])=>{const row=query.data?.items.find((item)=>item.provider===provider);const data=typeof row?.data==="object"&&row.data!==null?row.data as ApiRecord:{};return <form className="integration-card" key={provider} onSubmit={async(event)=>{event.preventDefault();const form=new FormData(event.currentTarget);const payload:Record<string,string>={};for(const field of fields)payload[field]=String(form.get(field)??"");try{await save({provider,status:form.get("status")==="on",data:payload}).unwrap();setMessage(`${provider} saved.`)}catch(error){setMessage(apiErrorMessage(error,"Could not save SMS settings."))}}}><h3>{provider}</h3>{fields.map((field)=><label className="form-field" key={field}>{field.replaceAll("_"," ")}<input name={field} type={/token|secret|password|api_key/i.test(field)?"password":"text"} defaultValue={value(data,field)} placeholder="Leave secret blank to keep current" autoComplete="off" /></label>)}<label className="settings-toggle"><input type="checkbox" name="status" defaultChecked={Boolean(row?.status)}/> Active</label><button className="secondary-button">Save gateway</button>{message&&<small role="status">{message}</small>}</form>})}</div>;
}
