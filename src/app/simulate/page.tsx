import { cookies } from "next/headers";
import { getAllTeamsEnriched } from "@/lib/data/team-registry";
import { SimulationPageClient } from "@/components/pages/simulation-page-client";
import { RANKING_MODE_COOKIE } from "@/lib/client/ranking-mode-preference";
import { parseRankingMode } from "@/lib/data/ranking-modes";

export default async function SimulatePage() {
  const cookieStore = await cookies();
  const mode = parseRankingMode(
    cookieStore.get(RANKING_MODE_COOKIE)?.value ?? null,
  );
  const teams = await getAllTeamsEnriched(mode);

  return <SimulationPageClient teams={teams} />;
}
