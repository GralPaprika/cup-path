import { Suspense } from "react";
import { getAllTeamsEnriched } from "@/lib/data/team-registry";
import { TeamAnalysisPageClient } from "@/components/pages/team-analysis-page-client";
import { PageShellSkeleton } from "@/components/loading-skeletons";

export default async function TeamAnalysisPage() {
  const teams = await getAllTeamsEnriched("july20");

  return (
    <Suspense fallback={<PageShellSkeleton />}>
      <TeamAnalysisPageClient teams={teams} />
    </Suspense>
  );
}
