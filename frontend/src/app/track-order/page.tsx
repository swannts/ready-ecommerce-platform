import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function TrackOrderPage() {
  return <div className="min-h-screen flex flex-col bg-[#FAF6EF]"><Header /><main className="grow max-w-3xl mx-auto w-full px-4 sm:px-6 py-16"><Link href="/" className="text-sm font-semibold text-[#183A20]">← Back to marketplace</Link><p className="mt-8 text-xs font-bold uppercase tracking-widest text-[#B88A35]">Delivery updates</p><h1 className="font-serif text-4xl font-bold mt-2">Track Your Delivery</h1><div className="mt-6 rounded-2xl border border-[#E7E1D7] bg-[#FFFDF8] p-6 sm:p-8"><p className="text-[#686C64] leading-relaxed">Order tracking is available for signed-in customers through their order history. Sign in to view backend order and delivery status, or contact support with your order reference for help.</p><div className="mt-6 flex flex-wrap gap-3"><Link href="/login" className="rounded-xl bg-[#183A20] px-5 py-3 text-sm font-semibold text-white">Sign in</Link><Link href="/contact" className="rounded-xl border border-[#183A20] px-5 py-3 text-sm font-semibold text-[#183A20]">Contact support</Link></div></div></main><Footer /></div>;
}
