import { Suspense } from "react";
import { cookies } from "next/headers";
import { getAllTeamsEnriched } from "@/lib/data/team-registry";
import { TeamAnalysisPageClient } from "@/components/pages/team-analysis-page-client";
import { PageShellSkeleton } from "@/components/loading-skeletons";
import { RANKING_MODE_COOKIE } from "@/lib/client/ranking-mode-preference";
import { parseRankingMode } from "@/lib/data/ranking-modes";

export default async function TeamAnalysisPage() {
  const cookieStore = await cookies();
  const mode = parseRankingMode(
    cookieStore.get(RANKING_MODE_COOKIE)?.value ?? null,
  );
  const teams = await getAllTeamsEnriched(mode);

  return (
    <Suspense fallback={<PageShellSkeleton />}>
      <TeamAnalysisPageClient teams={teams} />
    </Suspense>
  );
}
