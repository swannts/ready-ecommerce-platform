"use client";

import { FormEvent, useState } from "react";
import { useLocale } from "@/lib/i18n";
import { submitSupportRequest } from "@/lib/api";

export function SupportRequestForm({
  mode = "support",
}: {
  mode?: "support" | "rfq";
}) {
  const { t } = useLocale();
  const isRfq = mode === "rfq";
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setStatus("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const name = String(form.get("name") || "");
    const phone = String(form.get("phone") || "");
    const email = String(form.get("email") || "");
    const subject = isRfq
      ? `Wholesale quote request: ${form.get("variety")}`
      : String(form.get("subject") || "RiceMart support request");
    const fields = isRfq
      ? [
          `Company: ${form.get("company")}`,
          `Rice variety: ${form.get("variety")}`,
          `Quantity: ${form.get("quantity_kg")} kg`,
          `Destination: ${form.get("destination")}`,
          `Packaging: ${form.get("packaging")}`,
          `Target price/kg: ${form.get("target_price") || "Not specified"}`,
          `Delivery timeframe: ${form.get("timeframe")}`,
          `Email: ${email}`,
          `Phone: ${phone}`,
          `Notes: ${form.get("notes") || "None"}`,
        ]
      : [
          `Email: ${email}`,
          `Phone: ${phone}`,
          String(form.get("message") || ""),
        ];
    try {
      const message = await submitSupportRequest({
        name,
        phone,
        subject,
        message: fields.join("\n"),
      });
      setStatus(message);
      formElement.reset();
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Could not submit your request.",
      );
    } finally {
      setBusy(false);
    }
  }
  const inputClass =
    "w-full rounded-xl border border-[#E7E1D7] bg-[#FAF6EF] px-4 py-3 text-sm outline-none focus:border-[#183A20]";
  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-[#E7E1D7] bg-[#FFFDF8] p-6 sm:p-8"
    >
      {isRfq && (
        <>
          <Field
            label="Business / organization"
            name="company"
            required
            className={inputClass}
          />
          <div className="grid sm:grid-cols-2 gap-4">
            <Field
              label="Rice variety"
              name="variety"
              required
              className={inputClass}
            />
            <Field
              label="Quantity (kg)"
              name="quantity_kg"
              type="number"
              min="10"
              required
              className={inputClass}
            />
          </div>
        </>
      )}
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Your name" name="name" required className={inputClass} />
        <Field
          label="Phone"
          name="phone"
          type="tel"
          className={inputClass}
          required
        />
      </div>
      <Field
        label="Email"
        name="email"
        type="email"
        className={inputClass}
        required
      />
      {isRfq ? (
        <>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field
              label="Delivery destination"
              name="destination"
              required
              className={inputClass}
            />
            <Field
              label="Delivery timeframe"
              name="timeframe"
              placeholder={t("e.g. Within 2 weeks")}
              required
              className={inputClass}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block text-sm font-semibold">
              {" "}
              {t("Packaging")}{" "}
              <select name="packaging" className={`${inputClass} mt-1`}>
                <option>{t("25 kg sacks")}</option>
                <option>{t("50 kg sacks")}</option>
                <option>{t("1 ton bulk bags")}</option>
                <option>{t("Custom")}</option>
              </select>
            </label>
            <Field
              label="Target price per kg (optional)"
              name="target_price"
              type="number"
              min="0"
              step="0.01"
              className={inputClass}
            />
          </div>
          <label className="block text-sm font-semibold">
            {" "}
            {t("Requirements")}{" "}
            <textarea
              name="notes"
              rows={4}
              className={`${inputClass} mt-1`}
              placeholder={t(
                "Quality specifications, certifications, or other requirements",
              )}
            />
          </label>
        </>
      ) : (
        <>
          <Field
            label="Subject"
            name="subject"
            required
            className={inputClass}
          />
          <label className="block text-sm font-semibold">
            {" "}
            {t("Message")}{" "}
            <textarea
              name="message"
              rows={6}
              required
              className={`${inputClass} mt-1`}
            />
          </label>
        </>
      )}
      {status && (
        <p role="status" className="text-sm text-[#183A20]">
          {status}
        </p>
      )}
      <button
        disabled={busy}
        className="rounded-xl bg-[#183A20] px-6 py-3 font-semibold text-white disabled:opacity-60"
      >
        {busy ? "Sending…" : isRfq ? "Send quote request" : "Send message"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  className,
  ...props
}: {
  label: string;
  name: string;
  className: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <input name={name} className={`${className} mt-1`} {...props} />
    </label>
  );
}
