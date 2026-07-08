import { Suspense } from "react";
import { getAllTeamsEnriched } from "@/lib/data/team-registry";
import { AnalysisPageClient } from "@/components/analysis-page-client";
import { PageShellSkeleton } from "@/components/loading-skeletons";

export default async function HomePage() {
  const teams = await getAllTeamsEnriched("live");

  return (
    <Suspense fallback={<PageShellSkeleton />}>
      <AnalysisPageClient teams={teams} />
    </Suspense>
  );
}
