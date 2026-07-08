import { Suspense } from "react";
import { ComparePageClient } from "@/components/compare-page-client";
import { CompareLoadingSkeleton } from "@/components/loading-skeletons";

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8">
          <CompareLoadingSkeleton />
        </div>
      }
    >
      <ComparePageClient />
    </Suspense>
  );
}
