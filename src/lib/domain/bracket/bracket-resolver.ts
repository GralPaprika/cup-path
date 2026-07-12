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
import { getMatchWinner, isMatchPlayed } from "@/lib/data/worldcup-loader";
import { computeGroupStandings } from "@/lib/domain/group/group-standings";
import { getGroupNames } from "@/lib/domain/path/path-builder";
import { buildStandingsByGroupFromFinishes } from "@/lib/domain/group/group-finishes";

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
  const [homeGoals, awayGoals] = match.score.ft;
  let label = `${homeGoals}-${awayGoals}`;
  if (match.score.p) label += " (pens)";
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

export function getFocusTeamMatchNums(
  bracket: ResolvedBracketMatch[],
  teamId: string,
): number[] {
  return bracket
    .filter(
      (match) =>
        match.home.teamId === teamId || match.away.teamId === teamId,
    )
    .map((match) => match.num);
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
        suppressMatchNums.has(match.num) &&
        match.isPlayed &&
        Boolean(match.home.teamId) &&
        Boolean(match.away.teamId) &&
        !knockoutWinners?.[match.num],
    )
    .map((match) => match.num)
    .sort((a, b) => a - b);
}
