import { Suspense } from "react";
import { ComparePageClient } from "@/components/compare-page-client";

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <ComparePageClient />
    </Suspense>
  );
}
