import { Suspense } from "react";
import { ComparePageClient } from "@/components/pages/compare-page-client";
import { CompareLoadingSkeleton } from "@/components/loading-skeletons";

export default function ComparePage() {
  return (
    <Suspense fallback={<CompareLoadingSkeleton />}>
      <ComparePageClient />
    </Suspense>
  );
}
