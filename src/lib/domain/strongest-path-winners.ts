import type { SimulationScenario } from "@/lib/types";
import type { TournamentContext } from "@/lib/domain/tournament-context";
import { resolveBracket } from "@/lib/domain/bracket-resolver";

export type StrongestWinnerScope = "all" | "simulated";

type TeamRankingSnapshot = { rank: number; points: number };

function pickStrongestTeam(
  homeId: string,
  awayId: string,
  teamRankings: Record<string, TeamRankingSnapshot>,
): string | null {
  const home = teamRankings[homeId];
  const away = teamRankings[awayId];

  if (home && away) {
    if (home.points !== away.points) {
      return home.points > away.points ? homeId : awayId;
    }
    if (home.rank !== away.rank) {
      return home.rank < away.rank ? homeId : awayId;
    }
    return homeId;
  }

  if (home) return homeId;
  if (away) return awayId;
  return null;
}

function winnersEqual(
  a: Record<number, string>,
  b: Record<number, string>,
): boolean {
  const aKeys = Object.keys(a).sort();
  const bKeys = Object.keys(b).sort();
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((key) => a[Number(key)] === b[Number(key)]);
}

function shouldPickStrongest(
  scope: StrongestWinnerScope,
  matchNum: number,
  strongest: string,
  actualWinner: string | null,
  suppressMatchNums: Set<number>,
): boolean {
  if (scope === "simulated") {
    return suppressMatchNums.has(matchNum);
  }

  if (actualWinner === strongest) return false;
  return true;
}

export function buildStrongestKnockoutWinners(
  ctx: TournamentContext,
  scenario: SimulationScenario,
  actualWinnersByMatchNum: Record<number, string | null>,
  teamRankings: Record<string, TeamRankingSnapshot>,
  suppressMatchNums: Set<number>,
  currentWinners: Record<number, string> | undefined,
  scope: StrongestWinnerScope,
): Record<number, string> | null {
  const draft: Record<number, string> = { ...(currentWinners ?? {}) };

  for (let pass = 0; pass < 32; pass += 1) {
    let iterationChanged = false;
    const bracket = resolveBracket(
      ctx,
      { ...scenario, knockoutWinners: draft },
      { suppressPlayedResultsMatchNums: suppressMatchNums },
    );

    for (const match of bracket) {
      if (!match.isPlayed) continue;

      const homeId = match.home.teamId;
      const awayId = match.away.teamId;
      if (!homeId || !awayId) continue;

      const strongest = pickStrongestTeam(homeId, awayId, teamRankings);
      if (!strongest) continue;

      const actualWinner = actualWinnersByMatchNum[match.num] ?? null;
      const needsOverride = shouldPickStrongest(
        scope,
        match.num,
        strongest,
        actualWinner,
        suppressMatchNums,
      );

      if (needsOverride) {
        if (draft[match.num] !== strongest) {
          draft[match.num] = strongest;
          iterationChanged = true;
        }
        continue;
      }

      if (draft[match.num]) {
        delete draft[match.num];
        iterationChanged = true;
      }
    }

    if (!iterationChanged) break;
  }

  const normalized: Record<number, string> = {};
  const finalBracket = resolveBracket(
    ctx,
    { ...scenario, knockoutWinners: draft },
    { suppressPlayedResultsMatchNums: suppressMatchNums },
  );

  for (const match of finalBracket) {
    if (!match.isPlayed) continue;

    const homeId = match.home.teamId;
    const awayId = match.away.teamId;
    if (!homeId || !awayId) continue;

    const strongest = pickStrongestTeam(homeId, awayId, teamRankings);
    if (!strongest) continue;

    const actualWinner = actualWinnersByMatchNum[match.num] ?? null;
    if (
      shouldPickStrongest(
        scope,
        match.num,
        strongest,
        actualWinner,
        suppressMatchNums,
      )
    ) {
      normalized[match.num] = strongest;
    }
  }

  const current = currentWinners ?? {};
  if (winnersEqual(normalized, current)) {
    return null;
  }

  return normalized;
}

export function hasStrongestWinnerTargets(
  ctx: TournamentContext,
  scenario: SimulationScenario,
  actualWinnersByMatchNum: Record<number, string | null>,
  teamRankings: Record<string, TeamRankingSnapshot>,
  suppressMatchNums: Set<number>,
  currentWinners: Record<number, string> | undefined,
  scope: StrongestWinnerScope,
): boolean {
  return (
    buildStrongestKnockoutWinners(
      ctx,
      scenario,
      actualWinnersByMatchNum,
      teamRankings,
      suppressMatchNums,
      currentWinners,
      scope,
    ) !== null
  );
}
