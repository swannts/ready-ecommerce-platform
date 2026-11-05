"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getLegalPage } from "@/lib/api";
import { SkeletonBlock } from "@/components/ui/Skeleton";

const fallbackTitles: Record<string, string> = { privacy: "Privacy Policy", terms: "Terms of Service", refund: "Return & Refund Policy" };
export default function LegalPage() {
  const { slug } = useParams<{ slug: string }>();
  const [content, setContent] = useState<{ title: string | null; description: string | null } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => { setLoading(true); setError(""); getLegalPage(slug).then((result) => { setContent(result.content); if (!result.content?.description) setError("This policy has not been published in the backend yet. Please contact support for the current version."); }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Policy content is unavailable.")).finally(() => setLoading(false)); }, [slug]);
  const title = content?.title || fallbackTitles[slug] || "RiceMart Policy";
  return <div className="min-h-screen flex flex-col bg-[#FAF6EF]"><Header /><main className="grow max-w-4xl mx-auto w-full px-4 sm:px-6 py-12"><Link href="/" className="text-sm font-semibold text-[#183A20]">← Back to marketplace</Link><h1 className="font-serif text-4xl font-bold mt-8">{title}</h1>{loading ? <div role="status" aria-label="Loading policy" aria-busy="true" className="mt-6 rounded-2xl bg-[#FFFDF8] border border-[#E7E1D7] p-6 sm:p-8 space-y-4"><SkeletonBlock className="h-5 w-2/3" /><SkeletonBlock className="h-4 w-full" /><SkeletonBlock className="h-4 w-full" /><SkeletonBlock className="h-4 w-4/5" /><SkeletonBlock className="h-4 w-5/6" /></div> : content?.description ? <article className="mt-6 rounded-2xl bg-[#FFFDF8] border border-[#E7E1D7] p-6 sm:p-8 leading-relaxed whitespace-pre-wrap">{content.description}</article> : <p role="alert" className="mt-6 rounded-2xl bg-[#FFFDF8] border border-[#E7E1D7] p-6 sm:p-8 text-[#686C64]">{error}</p>}</main><Footer /></div>;
}
