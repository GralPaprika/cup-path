import { Suspense } from "react";
import { FactsPageClient } from "@/components/pages/facts-page-client";
import { FactsPageSkeleton } from "@/components/loading-skeletons";

export default function OverviewPage() {
  return (
    <Suspense fallback={<FactsPageSkeleton />}>
      <FactsPageClient />
    </Suspense>
  );
}
