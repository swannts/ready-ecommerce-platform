import React from "react";

const pulse = "animate-pulse motion-reduce:animate-none rounded bg-[#E7E1D7]";

export function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`${pulse} ${className}`} />;
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div role="status" aria-label="Loading products" aria-busy="true" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="overflow-hidden rounded-2xl border border-[#E7E1D7] bg-[#FFFDF8]">
          <SkeletonBlock className="aspect-4/3 w-full rounded-none" />
          <div className="space-y-3 p-5">
            <SkeletonBlock className="h-3 w-2/5" />
            <SkeletonBlock className="h-5 w-full" />
            <SkeletonBlock className="h-5 w-4/5" />
            <SkeletonBlock className="h-3 w-3/5" />
            <div className="flex gap-2 pt-2"><SkeletonBlock className="h-6 w-16" /><SkeletonBlock className="h-6 w-16" /></div>
            <SkeletonBlock className="mt-4 h-10 w-full" />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading products…</span>
    </div>
  );
}

export function CategoryGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div role="status" aria-label="Loading rice categories" aria-busy="true" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
      {Array.from({ length: count }, (_, index) => <div key={index} className="rounded-2xl border border-[#E7E1D7] bg-[#FFFDF8] p-3 sm:p-4"><SkeletonBlock className="aspect-square w-full rounded-xl" /><SkeletonBlock className="mt-4 h-3 w-2/3" /><SkeletonBlock className="mt-2 h-5 w-4/5" /><SkeletonBlock className="mt-5 h-4 w-1/2" /></div>)}
      <span className="sr-only">Loading rice categories…</span>
    </div>
  );
}

export function SupplierGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div role="status" aria-label="Loading suppliers" aria-busy="true" className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: count }, (_, index) => <div key={index} className="rounded-2xl border border-[#E7E1D7] bg-[#FFFDF8] p-6"><SkeletonBlock className="h-3 w-1/3" /><SkeletonBlock className="mt-4 h-6 w-4/5" /><SkeletonBlock className="mt-3 h-3 w-3/5" /><div className="mt-6 space-y-3 border-t border-[#E7E1D7] pt-4"><SkeletonBlock className="h-4 w-full" /><SkeletonBlock className="h-4 w-4/5" /><SkeletonBlock className="h-4 w-3/4" /></div><SkeletonBlock className="mt-6 h-10 w-full" /></div>)}
      <span className="sr-only">Loading verified suppliers…</span>
    </div>
  );
}

export function ProductDetailsSkeleton() {
  return (
    <div role="status" aria-label="Loading product details" aria-busy="true" className="grid lg:grid-cols-2 gap-10 mt-8">
      <SkeletonBlock className="min-h-80 rounded-3xl" />
      <div className="space-y-4"><SkeletonBlock className="h-3 w-1/4" /><SkeletonBlock className="h-10 w-5/6" /><SkeletonBlock className="h-4 w-full" /><SkeletonBlock className="h-4 w-11/12" /><SkeletonBlock className="h-4 w-3/4" /><SkeletonBlock className="mt-7 h-7 w-1/3" /><div className="grid sm:grid-cols-2 gap-3 pt-2"><SkeletonBlock className="h-24" /><SkeletonBlock className="h-24" /><SkeletonBlock className="h-24" /><SkeletonBlock className="h-24" /></div></div>
      <span className="sr-only">Loading product details…</span>
    </div>
  );
}
