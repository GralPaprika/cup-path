import { Suspense } from "react";
import { getAllTeamsEnriched } from "@/lib/data/team-registry";
import { SimulationPageClient } from "@/components/simulation-page-client";
import { PageShellSkeleton } from "@/components/loading-skeletons";

export default async function SimulatePage() {
  const teams = await getAllTeamsEnriched("live");

  return (
    <Suspense fallback={<PageShellSkeleton />}>
      <SimulationPageClient teams={teams} />
    </Suspense>
  );
}
