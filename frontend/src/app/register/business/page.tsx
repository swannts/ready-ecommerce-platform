"use client";

import React, { useState } from "react";
import Link from "next/link";
import { RiceLogo } from "@/components/ui/RiceLogo";
import { ArrowLeft, Building2 } from "lucide-react";
import { submitSupportRequest } from "@/lib/api";

export default function BusinessRegisterPage() {
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const submitApplication = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true); setStatus("");
    const formElement = event.currentTarget;
    const data = new FormData(formElement);
    const company = String(data.get("company") || "");
    const contact = String(data.get("contact") || "");
    const phone = String(data.get("phone") || "");
    try {
      setStatus(await submitSupportRequest({ name: contact, phone, subject: `Business buyer account request: ${company}`, message: [`Company: ${company}`, `Business type: ${data.get("business_type")}`, `Trade license: ${data.get("tax_id")}`, `Monthly requirement: ${data.get("monthly_requirement")}`, `Phone: ${phone}`].join("\n") }));
      formElement.reset();
    } catch (error) { setStatus(error instanceof Error ? error.message : "Unable to send account request."); }
    finally { setBusy(false); }
  };
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF6EF] p-4 sm:p-6 py-12">
      <div className="w-full max-w-lg bg-[#FFFDF8] rounded-3xl border border-[#E7E1D7] p-8 sm:p-10 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <RiceLogo />
          <Link
            href="/"
            className="text-xs font-semibold text-[#686C64] hover:text-[#183A20] flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Home
          </Link>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#183A20]/10 text-[#183A20] text-xs font-bold uppercase tracking-wider mb-2">
          <Building2 className="w-3.5 h-3.5 text-[#B88A35]" />
          <span>B2B Commercial Account</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#19221B]">
          Register as a Business Buyer
        </h1>
        <p className="text-xs sm:text-sm text-[#686C64] mt-1 mb-6">
          Unlock wholesale tiered pricing, credit terms, and palletized commercial delivery.
        </p>

        <form onSubmit={submitApplication} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#19221B] uppercase tracking-wider mb-1">
              Company / Restaurant / Trading Name
            </label>
            <input
              type="text"
              name="company"
              placeholder="e.g. Royal Bengal Hospitality Ltd."
              className="w-full px-4 py-2.5 rounded-xl bg-[#FAF6EF] border border-[#E7E1D7] text-sm text-[#19221B] focus:outline-none focus:border-[#183A20]"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#19221B] uppercase tracking-wider mb-1">
                Business Type
              </label>
              <select name="business_type" className="w-full px-4 py-2.5 rounded-xl bg-[#FAF6EF] border border-[#E7E1D7] text-sm text-[#19221B] focus:outline-none focus:border-[#183A20]">
                <option>Restaurant / Food Service</option>
                <option>Retail Supermarket / Grocer</option>
                <option>Wholesale Trader</option>
                <option>Hotel / Resort</option>
                <option>Institutional Catering</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#19221B] uppercase tracking-wider mb-1">
                Tax ID / Trade License #
              </label>
              <input
                type="text"
              name="tax_id"
                placeholder="Tax or Registration ID"
                className="w-full px-4 py-2.5 rounded-xl bg-[#FAF6EF] border border-[#E7E1D7] text-sm text-[#19221B] focus:outline-none focus:border-[#183A20]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#19221B] uppercase tracking-wider mb-1">
                Contact Person
              </label>
              <input
                type="text"
              name="contact"
                placeholder="Full Name"
                className="w-full px-4 py-2.5 rounded-xl bg-[#FAF6EF] border border-[#E7E1D7] text-sm text-[#19221B] focus:outline-none focus:border-[#183A20]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#19221B] uppercase tracking-wider mb-1">
                Business Phone
              </label>
              <input
                type="tel"
              name="phone"
                placeholder="+1 800..."
                className="w-full px-4 py-2.5 rounded-xl bg-[#FAF6EF] border border-[#E7E1D7] text-sm text-[#19221B] focus:outline-none focus:border-[#183A20]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#19221B] uppercase tracking-wider mb-1">
              Estimated Monthly Grain Requirement (kg)
            </label>
            <select name="monthly_requirement" className="w-full px-4 py-2.5 rounded-xl bg-[#FAF6EF] border border-[#E7E1D7] text-sm text-[#19221B] focus:outline-none focus:border-[#183A20]">
              <option>100 – 499 kg (Sacks)</option>
              <option>500 – 1,999 kg (Pallets)</option>
              <option>2,000 – 9,999 kg (Truckload)</option>
              <option>10,000+ kg (Commercial Mill Contracts)</option>
            </select>
          </div>

          {status && <p role="status" className="text-sm text-[#183A20]">{status}</p>}
          <button disabled={busy}
            type="submit"
            className="w-full py-3.5 rounded-xl bg-[#183A20] hover:bg-[#102C1B] text-[#FFFDF8] font-bold text-sm shadow-md transition-colors mt-2"
          >
            {busy ? "Submitting…" : "Submit for B2B Verification"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-[#686C64]">
          Already registered?{" "}
          <Link href="/login" className="text-[#183A20] font-bold hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
