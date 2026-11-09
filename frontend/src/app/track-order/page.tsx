"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useLocale } from "@/lib/i18n";
import { useAppSelector } from "@/store/hooks";
import { ArrowLeft, CheckCircle2, PackageCheck, Truck } from "lucide-react";

const showcaseTracking: Record<string, { status: string; location: string; delivered: boolean }> = {
  "RM-DEMO-2048": { status: "Out for delivery", location: "Dhanmondi delivery hub", delivered: false },
  "RM-DEMO-1196": { status: "Delivered", location: "Uttara, Dhaka", delivered: true },
};

export default function TrackOrderPage() {
  const { t } = useLocale();
  const lastOrder = useAppSelector((state) => state.cart.lastOrder);
  const [reference, setReference] = useState("");
  const [result, setResult] = useState<{ status: string; location: string; delivered: boolean } | null>(null);
  const [searched, setSearched] = useState(false);
  function lookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearched(true);
    const code = reference.trim().toUpperCase();
    if (lastOrder?.orderId.toUpperCase() === code) {
      setResult({ status: "Order confirmed", location: "RiceMart showcase", delivered: false });
      return;
    }
    setResult(showcaseTracking[code] ?? null);
  }
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6EF]">
      <Header />
      <main className="grow max-w-3xl mx-auto w-full px-4 sm:px-6 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#183A20]"><ArrowLeft size={16} />{t("← Back to marketplace")}</Link>
        <p className="mt-8 text-xs font-bold uppercase tracking-widest text-[#B88A35]">{t("Delivery updates")}</p>
        <h1 className="font-serif text-4xl font-bold mt-2">{t("Track Your Delivery")}</h1>
        <div className="mt-6 rounded-2xl border border-[#E7E1D7] bg-[#FFFDF8] p-6 sm:p-8">
          <p className="text-[#686C64] leading-relaxed">{t("Enter a sample reference or the order reference from your showcase checkout. Tracking results are demonstration data only.")}</p>
          <form onSubmit={lookup} className="mt-5 flex flex-col sm:flex-row gap-3">
            <input aria-label={t("Order reference")} value={reference} onChange={(event) => setReference(event.target.value)} placeholder="RM-DEMO-2048" className="min-w-0 grow rounded-xl border border-[#E7E1D7] bg-[#FAF6EF] px-4 py-3 text-sm outline-none focus:border-[#183A20]" required />
            <button className="rounded-xl bg-[#183A20] px-5 py-3 text-sm font-semibold text-white">{t("Check sample tracking")}</button>
          </form>
          {result && <div className="mt-6 rounded-xl border border-[#E7E1D7] bg-[#FAF6EF] p-5"><div className="flex items-center gap-3"><div className="rounded-full bg-[#183A20] p-2 text-white">{result.delivered ? <CheckCircle2 size={20}/> : <Truck size={20}/>}</div><div><strong>{t(result.status)}</strong><p className="text-sm text-[#686C64]">{t("Current location")}: {t(result.location)}</p></div></div><div className="mt-5 flex items-center gap-2 text-xs text-[#183A20]"><PackageCheck size={16}/>{t("Sample tracking status")}</div></div>}
          {searched && !result && <p role="status" className="mt-5 text-sm text-[#686C64]">{t("No demo order found for that reference. Try RM-DEMO-2048 or RM-DEMO-1196.")}</p>}
          <p className="mt-5 rounded-lg bg-[#B88A35]/10 px-3 py-2 text-xs text-[#686C64]">{t("Showcase demo: these tracking details are illustrative and do not reflect a real shipment.")}</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
