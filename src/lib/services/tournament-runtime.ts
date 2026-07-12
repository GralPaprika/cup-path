import "server-only";

import type { RankingMode } from "@/lib/types";
import type { TournamentContext } from "@/lib/domain/tournament/tournament-context";
import { buildRankingsMap, getRankingsSnapshot } from "@/lib/data/rankings-store";
import { getTournamentContext } from "@/lib/data/tournament-context";
import { ensureWorldCupData } from "@/lib/data/worldcup-store";

export interface TournamentRuntime {
  ctx: TournamentContext;
  rankings: Map<
    string,
    import("@/lib/types").RankingEntry
  >;
}

export async function loadTournamentRuntime(
  mode: RankingMode,
): Promise<TournamentRuntime> {
  await ensureWorldCupData();
  const ctx = getTournamentContext();
  const snapshot = await getRankingsSnapshot(mode);
  const rankings = buildRankingsMap(snapshot);
  return { ctx, rankings };
}
