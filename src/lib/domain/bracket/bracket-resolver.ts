import type {
  BracketSlotSpec,
  GroupStanding,
  OpenFootballMatch,
  ResolvedBracketMatch,
  ResolvedMatchSide,
  SimulationScenario,
} from "@/lib/types";
import type { TournamentContext } from "@/lib/domain/tournament/tournament-context";
import { getBracketTemplateMatches } from "@/lib/data/bracket-template";
import { getMatchWinner, isMatchPlayed } from "@/lib/domain/match/match-result";
import { computeGroupStandings } from "@/lib/domain/group/group-standings";
import { getGroupNames } from "@/lib/domain/path/path-builder";
import { buildStandingsByGroupFromFinishes } from "@/lib/domain/group/group-finishes";
import { isThirdPlaceMatch } from "@/lib/domain/match/match-stages";

export function formatSlotLabel(spec: BracketSlotSpec): string {
  if (spec.kind === "groupPosition" && spec.group && spec.position) {
    return `${spec.position}${spec.group}`;
  }
  if (spec.kind === "thirdAssigned" && spec.group) {
    return `3${spec.group}`;
  }
  if (spec.kind === "winner" && spec.matchNum) {
    return `W${spec.matchNum}`;
  }
  if (spec.kind === "loser" && spec.matchNum) {
    return `L${spec.matchNum}`;
  }
  return "?";
}

function getStandingsByGroup(
  ctx: TournamentContext,
  scenario: SimulationScenario = {},
): Map<string, GroupStanding[]> {
  if (
    scenario.groupFinishes &&
    Object.keys(scenario.groupFinishes).length > 0
  ) {
    return buildStandingsByGroupFromFinishes(ctx, scenario.groupFinishes);
  }

  const groupMatches = ctx.matches.filter((match) => match.group);
  const map = new Map<string, GroupStanding[]>();

  for (const groupName of getGroupNames()) {
    const letter = groupName.replace("Group ", "");
    map.set(
      letter,
      computeGroupStandings(
        ctx,
        groupMatches.filter((match) => match.group === groupName),
      ),
    );
  }

  return map;
}

function toResolvedSide(
  spec: BracketSlotSpec,
  teamId: string | null,
): ResolvedMatchSide {
  return {
    slotLabel: formatSlotLabel(spec),
    slotKind: spec.kind,
    group: spec.group,
    position: spec.position,
    sourceMatchNum: spec.matchNum,
    eligibleGroups: spec.eligibleGroups,
    teamId,
  };
}

function resolveSlotTeamId(
  spec: BracketSlotSpec,
  standingsByGroup: Map<string, GroupStanding[]>,
  winners: Map<number, string>,
  losers: Map<number, string>,
  slotOverrides: Record<string, string>,
): string | null {
  const label = formatSlotLabel(spec);
  if (slotOverrides[label]) {
    return slotOverrides[label].toUpperCase();
  }

  if (spec.kind === "groupPosition" && spec.group && spec.position) {
    const standings = standingsByGroup.get(spec.group) ?? [];
    return standings[spec.position - 1]?.teamId ?? null;
  }

  if (spec.kind === "thirdAssigned" && spec.group) {
    const standings = standingsByGroup.get(spec.group) ?? [];
    return standings[2]?.teamId ?? null;
  }

  if (spec.kind === "winner" && spec.matchNum) {
    return winners.get(spec.matchNum) ?? null;
  }

  if (spec.kind === "loser" && spec.matchNum) {
    return losers.get(spec.matchNum) ?? null;
  }

  return null;
}

function formatMatchScoreLabel(match: OpenFootballMatch): string | null {
  if (!match.score?.ft) return null;
  const [homeGoals, awayGoals] = match.score.et ?? match.score.ft;
  let label = `${homeGoals}-${awayGoals}`;
  if (match.score.p) label += ` (pens ${match.score.p[0]}-${match.score.p[1]})`;
  else if (match.score.et) label += " (aet)";
  return label;
}

function getMatchRecord(
  ctx: TournamentContext,
  num: number,
): OpenFootballMatch | undefined {
  return ctx.matches.find((match) => match.num === num);
}

function resolveWinnerTeamId(
  ctx: TournamentContext,
  matchNum: number,
  homeId: string | null,
  awayId: string | null,
  scenario: SimulationScenario,
  suppressPlayedResultsMatchNums?: Set<number>,
): string | null {
  if (scenario.knockoutWinners?.[matchNum]) {
    return scenario.knockoutWinners[matchNum].toUpperCase();
  }

  if (suppressPlayedResultsMatchNums?.has(matchNum)) {
    return null;
  }

  const record = getMatchRecord(ctx, matchNum);
  if (!record || !isMatchPlayed(record)) return null;

  const winnerName = getMatchWinner(record);
  if (!winnerName) return null;
  return ctx.resolveTeam(winnerName)?.id ?? null;
}

export function resolveBracket(
  ctx: TournamentContext,
  scenario: SimulationScenario = {},
  options: ResolveBracketOptions = {},
): ResolvedBracketMatch[] {
  const standingsByGroup = getStandingsByGroup(ctx, scenario);
  const slotOverrides = scenario.slotOverrides ?? {};
  const suppressPlayedResultsMatchNums =
    options.suppressPlayedResultsMatchNums;
  const winners = new Map<number, string>();
  const losers = new Map<number, string>();
  const resolved: ResolvedBracketMatch[] = [];

  for (const template of getBracketTemplateMatches()) {
    const homeId = resolveSlotTeamId(
      template.home,
      standingsByGroup,
      winners,
      losers,
      slotOverrides,
    );
    const awayId = resolveSlotTeamId(
      template.away,
      standingsByGroup,
      winners,
      losers,
      slotOverrides,
    );

    const record = getMatchRecord(ctx, template.num);
    const winnerTeamId = resolveWinnerTeamId(
      ctx,
      template.num,
      homeId,
      awayId,
      scenario,
      suppressPlayedResultsMatchNums,
    );

    if (winnerTeamId) {
      winners.set(template.num, winnerTeamId);
      const loserId =
        homeId && awayId
          ? winnerTeamId === homeId
            ? awayId
            : homeId
          : null;
      if (loserId) losers.set(template.num, loserId);
    }

    resolved.push({
      num: template.num,
      round: template.round,
      date: record?.date ?? "",
      ground: record?.ground,
      home: toResolvedSide(template.home, homeId),
      away: toResolvedSide(template.away, awayId),
      winnerTeamId,
      isPlayed: record ? isMatchPlayed(record) : false,
      scoreLabel: record ? formatMatchScoreLabel(record) : null,
    });
  }

  return resolved;
}

function teamIdsEqual(
  left: string | null | undefined,
  right: string | null | undefined,
): boolean {
  if (!left || !right) return false;
  return left.toUpperCase() === right.toUpperCase();
}

/**
 * True when a scenario pick should count as a simulated override.
 * - No selection → not an override
 * - Played result suppressed (sides changed upstream) → any pick is an override,
 *   even if the team id matches the historical winner (that result no longer applies)
 * - Otherwise → override only when the pick differs from the actual winner
 * - No actual winner yet → any pick is an override
 */
export function isKnockoutWinnerOverride(
  actualWinnerId: string | null | undefined,
  selectedWinnerId: string | null | undefined,
  options?: { playedResultSuppressed?: boolean },
): boolean {
  if (!selectedWinnerId) return false;
  if (options?.playedResultSuppressed) return true;
  if (!actualWinnerId) return true;
  return !teamIdsEqual(actualWinnerId, selectedWinnerId);
}

function effectiveMatchWinner(
  match: ResolvedBracketMatch,
  scenarioWinners?: Record<number, string | undefined>,
): string | null {
  return scenarioWinners?.[match.num] ?? match.winnerTeamId ?? null;
}

function matchFedByOutcome(
  next: ResolvedBracketMatch,
  matchNum: number,
  expectedKind: "winner" | "loser",
): boolean {
  const fedByMatch =
    next.home.sourceMatchNum === matchNum ||
    next.away.sourceMatchNum === matchNum;
  if (!fedByMatch) return false;

  // Third place is the only loser destination; every other edge is winner→winner.
  if (isThirdPlaceMatch(next.round)) {
    return expectedKind === "loser";
  }
  return expectedKind === "winner";
}

/**
 * Knockout matches on the focus team's path.
 * Occupancy-based, then extended along winner→winner (or loser→third-place)
 * edges when the focus team has an effective result so the next round appears
 * immediately after a pick — even before the bracket snapshot places them in
 * the downstream slot.
 */
export function getFocusTeamMatchNums(
  bracket: ResolvedBracketMatch[],
  teamId: string,
  scenarioWinners?: Record<number, string | undefined>,
): number[] {
  const path = new Set(
    bracket
      .filter(
        (match) =>
          teamIdsEqual(match.home.teamId, teamId) ||
          teamIdsEqual(match.away.teamId, teamId),
      )
      .map((match) => match.num),
  );

  let grew = true;
  while (grew) {
    grew = false;
    for (const match of bracket) {
      if (!path.has(match.num)) continue;
      const winnerId = effectiveMatchWinner(match, scenarioWinners);
      if (!winnerId) continue;

      const focusWon = teamIdsEqual(winnerId, teamId);
      const focusLost =
        !focusWon &&
        (teamIdsEqual(match.home.teamId, teamId) ||
          teamIdsEqual(match.away.teamId, teamId));
      if (!focusWon && !focusLost) continue;

      const expectedKind = focusWon ? "winner" : "loser";
      for (const next of bracket) {
        if (path.has(next.num)) continue;
        if (matchFedByOutcome(next, match.num, expectedKind)) {
          path.add(next.num);
          grew = true;
        }
      }
    }
  }

  return [...path].sort((a, b) => a - b);
}

/**
 * Matches that determine the next opponent for the focus team.
 * Walks upstream from the non-focus side of each path match via sourceMatchNum.
 */
export function getFocusPathFeederMatchNums(
  bracket: ResolvedBracketMatch[],
  teamId: string,
  scenarioWinners?: Record<number, string | undefined>,
): number[] {
  const pathNums = new Set(
    getFocusTeamMatchNums(bracket, teamId, scenarioWinners),
  );
  const byNum = new Map(bracket.map((match) => [match.num, match]));
  const feeders = new Set<number>();

  function collectUpstream(matchNum: number | undefined): void {
    if (
      matchNum === undefined ||
      pathNums.has(matchNum) ||
      feeders.has(matchNum)
    ) {
      return;
    }
    const match = byNum.get(matchNum);
    if (!match) return;
    feeders.add(matchNum);
    collectUpstream(match.home.sourceMatchNum);
    collectUpstream(match.away.sourceMatchNum);
  }

  for (const match of bracket) {
    if (!pathNums.has(match.num)) continue;

    const focusOnHome = teamIdsEqual(match.home.teamId, teamId);
    const focusOnAway = teamIdsEqual(match.away.teamId, teamId);

    if (focusOnHome && !focusOnAway) {
      collectUpstream(match.away.sourceMatchNum);
    } else if (focusOnAway && !focusOnHome) {
      collectUpstream(match.home.sourceMatchNum);
    } else {
      // Focus not yet resolved onto a side — collect both upstream sources
      // except the previous path match that advances the focus team.
      for (const side of [match.home, match.away]) {
        if (
          side.sourceMatchNum !== undefined &&
          !pathNums.has(side.sourceMatchNum)
        ) {
          collectUpstream(side.sourceMatchNum);
        }
      }
    }
  }

  return [...feeders].sort((a, b) => a - b);
}

export function getCuratedBracketMatchNums(
  bracket: ResolvedBracketMatch[],
  teamId: string,
  scenarioWinners?: Record<number, string | undefined>,
): { path: number[]; feeders: number[]; curated: number[] } {
  const path = getFocusTeamMatchNums(bracket, teamId, scenarioWinners);
  const feeders = getFocusPathFeederMatchNums(
    bracket,
    teamId,
    scenarioWinners,
  );
  const curated = [...new Set([...path, ...feeders])].sort((a, b) => a - b);
  return { path, feeders, curated };
}

export function getDefaultScenario(): SimulationScenario {
  return { knockoutWinners: {}, slotOverrides: {}, groupFinishes: undefined };
}

export function getActualScenario(): SimulationScenario {
  return getDefaultScenario();
}

export function findChangedMatchNums(
  actual: ResolvedBracketMatch[],
  simulated: ResolvedBracketMatch[],
): number[] {
  const changed: number[] = [];
  for (let i = 0; i < actual.length; i++) {
    const a = actual[i];
    const s = simulated[i];
    if (
      a.home.teamId !== s.home.teamId ||
      a.away.teamId !== s.away.teamId
    ) {
      changed.push(a.num);
    }
  }
  return changed;
}

export interface ResolveBracketOptions {
  suppressPlayedResultsMatchNums?: Set<number>;
}

export function getDownstreamMatchNums(seedMatchNums: number[]): Set<number> {
  const templates = getBracketTemplateMatches();
  const downstream = new Set(seedMatchNums);

  let expanded = true;
  while (expanded) {
    expanded = false;
    for (const template of templates) {
      if (downstream.has(template.num)) continue;

      const dependsOn = [template.home, template.away]
        .filter(
          (side) =>
            (side.kind === "winner" || side.kind === "loser") &&
            side.matchNum !== undefined,
        )
        .map((side) => side.matchNum!);

      if (dependsOn.some((matchNum) => downstream.has(matchNum))) {
        downstream.add(template.num);
        expanded = true;
      }
    }
  }

  return downstream;
}

export function sanitizeKnockoutWinners(
  winners: Record<number, string> | undefined,
  staleMatchNums: Set<number>,
): Record<number, string> {
  if (!winners || staleMatchNums.size === 0) return winners ?? {};

  const sanitized: Record<number, string> = {};
  for (const [matchNum, teamId] of Object.entries(winners)) {
    const num = Number(matchNum);
    if (!staleMatchNums.has(num)) {
      sanitized[num] = teamId;
    }
  }
  return sanitized;
}

export function computePendingWinnerMatchNums(
  bracket: ResolvedBracketMatch[],
  suppressMatchNums: Set<number>,
  knockoutWinners: Record<number, string> | undefined,
): number[] {
  if (suppressMatchNums.size === 0) return [];

  return bracket
    .filter(
      (match) =>
        !isThirdPlaceMatch(match.round) &&
        suppressMatchNums.has(match.num) &&
        match.isPlayed &&
        Boolean(match.home.teamId) &&
        Boolean(match.away.teamId) &&
        !knockoutWinners?.[match.num],
    )
    .map((match) => match.num)
    .sort((a, b) => a - b);
}

/** Keep pending picks that matter for the focus team's visible path (and feeders). */
export function filterPendingToCuratedMatches(
  pendingWinnerMatchNums: number[],
  curatedMatchNums: number[],
): number[] {
  if (pendingWinnerMatchNums.length === 0 || curatedMatchNums.length === 0) {
    return [];
  }
  const curated = new Set(curatedMatchNums);
  return pendingWinnerMatchNums.filter((num) => curated.has(num));
}
