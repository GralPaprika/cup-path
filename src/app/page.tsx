import { Suspense } from "react";
import { getAllTeamsEnriched } from "@/lib/data/team-registry";
import { AnalysisPageClient } from "@/components/analysis-page-client";

export default async function HomePage() {
  const teams = await getAllTeamsEnriched("live");

  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <AnalysisPageClient teams={teams} />
    </Suspense>
  );
}
