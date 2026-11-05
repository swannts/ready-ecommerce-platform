import { SkeletonBlock } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <main role="status" aria-label="Loading page" aria-busy="true" className="min-h-screen bg-[#FAF6EF] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <SkeletonBlock className="h-12 w-48" />
        <SkeletonBlock className="mt-12 h-10 w-2/5" />
        <SkeletonBlock className="mt-4 h-4 w-3/5" />
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => <div key={index} className="rounded-2xl border border-[#E7E1D7] bg-[#FFFDF8] p-4"><SkeletonBlock className="aspect-4/3" /><SkeletonBlock className="mt-4 h-4 w-2/3" /><SkeletonBlock className="mt-3 h-5 w-full" /><SkeletonBlock className="mt-6 h-10 w-full" /></div>)}
        </div>
        <span className="sr-only">Loading page content…</span>
      </div>
    </main>
  );
}
