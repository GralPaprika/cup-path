import type {
  GroupExpectedAnalysis,
  GroupExpectedFinishEntry,
  GroupExpectedMatchEntry,
  GroupExpectedUnderperformer,
  GroupMatchResult,
  OpenFootballMatch,
  RankingEntry,
} from "@/lib/types";
import type { TournamentContext } from "@/lib/domain/tournament-context";
import { isMatchPlayed } from "@/lib/data/worldcup-loader";
import { computeGroupStandings, isTeamEliminatedFromGroup } from "@/lib/domain/group-standings";
import { computeMean, computeNumericStats } from "@/lib/domain/group-stats";
import { getGroupNames } from "@/lib/domain/path-builder";

function resultPoints(result: GroupMatchResult): number {
  if (result === "W") return 3;
  if (result === "D") return 1;
  return 0;
}

function actualResult(
  homeGoals: number,
  awayGoals: number,
  isHome: boolean,
): GroupMatchResult {
  if (homeGoals === awayGoals) return "D";
  const homeWins = homeGoals > awayGoals;
  if (isHome) return homeWins ? "W" : "L";
  return homeWins ? "L" : "W";
}

function expectedResult(
  homePoints: number | null,
  awayPoints: number | null,
  isHome: boolean,
): GroupMatchResult {
  if (homePoints === null || awayPoints === null) return "D";
  if (homePoints === awayPoints) return "D";
  if (homePoints > awayPoints) return isHome ? "W" : "L";
  return isHome ? "L" : "W";
}

function gapForMatch(entry: GroupExpectedMatchEntry): number {
  return entry.gapPoints;
}

function isDrawGapOutlier(
  gapPoints: number,
  mean: number | null,
  stdDev: number | null,
): boolean {
  return (
    gapPoints > 0 &&
    mean !== null &&
    stdDev !== null &&
    stdDev > 0 &&
    gapPoints >= mean + stdDev
  );
}

function annotateDrawFields(
  entry: GroupExpectedMatchEntry,
  drawMean: number | null,
  drawStdDev: number | null,
): GroupExpectedMatchEntry {
  if (!isActualDraw(entry)) {
    return { ...entry, paperDrawNote: null, isDrawGapOutlier: false };
  }

  return {
    ...entry,
    paperDrawNote: entry.isEqualRating ? "equalRating" : "favoriteDrew",
    isDrawGapOutlier: isDrawGapOutlier(entry.gapPoints, drawMean, drawStdDev),
  };
}

function annotateWinLossFields(
  entry: GroupExpectedMatchEntry,
  winLossMean: number | null,
  winLossStdDev: number | null,
): GroupExpectedMatchEntry {
  if (!isWinLoss(entry)) {
    return { ...entry, isWinLossGapOutlier: false };
  }

  return {
    ...entry,
    isWinLossGapOutlier:
      entry.upsetWin &&
      isDrawGapOutlier(entry.gapPoints, winLossMean, winLossStdDev),
  };
}

function annotateMatchFields(
  entry: GroupExpectedMatchEntry,
  drawMean: number | null,
  drawStdDev: number | null,
  winLossMean: number | null,
  winLossStdDev: number | null,
): GroupExpectedMatchEntry {
  return annotateWinLossFields(
    annotateDrawFields(entry, drawMean, drawStdDev),
    winLossMean,
    winLossStdDev,
  );
}

function isActualDraw(entry: GroupExpectedMatchEntry): boolean {
  return entry.team1Actual === "D" && entry.team2Actual === "D";
}

function isWinLoss(entry: GroupExpectedMatchEntry): boolean {
  return !isActualDraw(entry);
}

function findExtremeMatch(
  matches: GroupExpectedMatchEntry[],
  pickMax: boolean,
): GroupExpectedMatchEntry | null {
  if (matches.length === 0) return null;

  return matches.reduce((best, entry) => {
    const gap = gapForMatch(entry);
    const bestGap = gapForMatch(best);
    if (pickMax ? gap > bestGap : gap < bestGap) return entry;
    return best;
  });
}

function findBiggestUnderdogWin(
  matches: GroupExpectedMatchEntry[],
): GroupExpectedMatchEntry | null {
  return findExtremeMatch(
    matches.filter((entry) => entry.upsetWin),
    true,
  );
}

function findBiggestUnderdogDraw(
  matches: GroupExpectedMatchEntry[],
): GroupExpectedMatchEntry | null {
  return findExtremeMatch(
    matches.filter((entry) => entry.paperDrawNote === "favoriteDrew"),
    true,
  );
}

function groupLetterFromName(groupName: string): string {
  return groupName.replace("Group ", "").toUpperCase();
}

function buildMatchEntry(
  ctx: TournamentContext,
  match: OpenFootballMatch,
  rankings: Map<string, RankingEntry>,
): GroupExpectedMatchEntry | null {
  if (!isMatchPlayed(match) || !match.score?.ft) return null;

  const home = ctx.resolveTeam(match.team1);
  const away = ctx.resolveTeam(match.team2);
  if (!home || !away) return null;

  const homePoints = rankings.get(home.id)?.points ?? null;
  const awayPoints = rankings.get(away.id)?.points ?? null;
  const [homeGoals, awayGoals] = match.score.ft;

  const team1Expected = expectedResult(homePoints, awayPoints, true);
  const team2Expected = expectedResult(homePoints, awayPoints, false);
  const team1Actual = actualResult(homeGoals, awayGoals, true);
  const team2Actual = actualResult(homeGoals, awayGoals, false);

  let pointsGap: number | null = null;
  let favoriteTeamId: string | null = null;
  let underdogTeamId: string | null = null;

  if (homePoints !== null && awayPoints !== null) {
    if (homePoints > awayPoints) {
      favoriteTeamId = home.id;
      underdogTeamId = away.id;
      pointsGap = homePoints - awayPoints;
    } else if (awayPoints > homePoints) {
      favoriteTeamId = away.id;
      underdogTeamId = home.id;
      pointsGap = awayPoints - homePoints;
    }
  }

  let expectedWinLanded = false;
  let expectedWinMissed = false;
  let unexpectedDefeat = false;
  let upsetWin = false;

  if (favoriteTeamId) {
    const favoriteActual =
      favoriteTeamId === home.id ? team1Actual : team2Actual;
    if (favoriteActual === "W") {
      expectedWinLanded = true;
    } else {
      expectedWinMissed = true;
      if (favoriteActual === "L") {
        unexpectedDefeat = true;
        upsetWin = true;
      }
    }
  } else if (homePoints !== null && awayPoints !== null && homePoints === awayPoints) {
    if (team1Actual === "D" && team2Actual === "D") {
      expectedWinLanded = true;
    } else {
      expectedWinMissed = true;
    }
  }

  const isEqualRating =
    homePoints !== null &&
    awayPoints !== null &&
    homePoints === awayPoints;
  const gapPoints = isEqualRating ? 0 : (pointsGap ?? 0);

  return {
    team1: home,
    team2: away,
    groupLetter: match.group ? groupLetterFromName(match.group) : "",
    scoreLabel: `${homeGoals}-${awayGoals}`,
    team1FifaPoints: homePoints,
    team2FifaPoints: awayPoints,
    pointsGap,
    gapPoints,
    paperDrawNote: null,
    isDrawGapOutlier: false,
    isWinLossGapOutlier: false,
    isEqualRating,
    favoriteTeamId,
    underdogTeamId,
    team1Expected,
    team2Expected,
    team1Actual,
    team2Actual,
    expectedWinLanded,
    expectedWinMissed,
    unexpectedDefeat,
    upsetWin,
  };
}

function processCompleteGroup(
  ctx: TournamentContext,
  groupName: string,
  matches: OpenFootballMatch[],
  rankings: Map<string, RankingEntry>,
  expectedPointsByTeam: Map<string, number>,
  matchLedger: GroupExpectedMatchEntry[],
): GroupExpectedFinishEntry[] {
  const standings = computeGroupStandings(ctx, matches);
  if (!standings.every((standing) => standing.played === 3)) return [];

  const letter = groupLetterFromName(groupName);

  for (const match of matches) {
    const entry = buildMatchEntry(ctx, match, rankings);
    if (!entry) continue;

    matchLedger.push(entry);
    expectedPointsByTeam.set(
      entry.team1.id,
      (expectedPointsByTeam.get(entry.team1.id) ?? 0) +
        resultPoints(entry.team1Expected),
    );
    expectedPointsByTeam.set(
      entry.team2.id,
      (expectedPointsByTeam.get(entry.team2.id) ?? 0) +
        resultPoints(entry.team2Expected),
    );
  }

  const teamIds = standings.map((standing) => standing.teamId);
  const sortedByExpected = [...teamIds].sort((a, b) => {
    const aExpected = expectedPointsByTeam.get(a) ?? 0;
    const bExpected = expectedPointsByTeam.get(b) ?? 0;
    if (bExpected !== aExpected) return bExpected - aExpected;

    const aFifa = rankings.get(a)?.points ?? Number.NEGATIVE_INFINITY;
    const bFifa = rankings.get(b)?.points ?? Number.NEGATIVE_INFINITY;
    if (bFifa !== aFifa) return bFifa - aFifa;

    return a.localeCompare(b);
  });

  return sortedByExpected.flatMap((teamId, index) => {
    const team = ctx.getTeamById(teamId);
    const actual = standings.find((standing) => standing.teamId === teamId);
    if (!team || !actual) return [];

    const expectedPosition = index + 1;
    return [
      {
        team,
        groupLetter: letter,
        fifaRank: rankings.get(teamId)?.rank ?? null,
        fifaPoints: rankings.get(teamId)?.points ?? null,
        expectedPoints: expectedPointsByTeam.get(teamId) ?? 0,
        expectedPosition,
        actualPosition: actual.position,
        positionDelta: actual.position - expectedPosition,
      },
    ];
  });
}

export function buildGroupExpectedAnalysis(
  ctx: TournamentContext,
  rankings: Map<string, RankingEntry>,
): GroupExpectedAnalysis | null {
  const groupMatches = ctx.matches.filter((match) => match.group);
  const groups = [
    ...new Set(
      groupMatches.map((match) => match.group).filter(Boolean) as string[],
    ),
  ];

  const matchLedger: GroupExpectedMatchEntry[] = [];
  const expectedPointsByTeam = new Map<string, number>();
  const expectedFinishes: GroupExpectedFinishEntry[] = [];

  for (const groupName of groups) {
    const matches = groupMatches.filter((match) => match.group === groupName);
    expectedFinishes.push(
      ...processCompleteGroup(
        ctx,
        groupName,
        matches,
        rankings,
        expectedPointsByTeam,
        matchLedger,
      ),
    );
  }

  if (matchLedger.length === 0) return null;

  const rawDrawMatches = matchLedger.filter(isActualDraw);
  const drawGaps = rawDrawMatches.map(gapForMatch);
  const drawGapStats = computeNumericStats(drawGaps);

  const rawWinLossMatches = matchLedger.filter(isWinLoss);
  const winLossGaps = rawWinLossMatches.map(gapForMatch);
  const winLossGapStats = computeNumericStats(winLossGaps);

  const annotatedLedger = matchLedger.map((entry) =>
    annotateMatchFields(
      entry,
      drawGapStats.mean,
      drawGapStats.stdDev,
      winLossGapStats.mean,
      winLossGapStats.stdDev,
    ),
  );
  const drawMatches = annotatedLedger
    .filter(isActualDraw)
    .sort((a, b) => b.gapPoints - a.gapPoints);
  const winLossMatches = annotatedLedger
    .filter(isWinLoss)
    .sort((a, b) => b.gapPoints - a.gapPoints);

  const absGaps = annotatedLedger
    .map((entry) => entry.pointsGap)
    .filter((value): value is number => value !== null);

  const favoriteMatches = annotatedLedger.filter((entry) => !entry.isEqualRating);
  const equalMatches = annotatedLedger.filter((entry) => entry.isEqualRating);
  const favoriteGaps = favoriteMatches
    .map((entry) => entry.pointsGap)
    .filter((value): value is number => value !== null);

  const groupNames = getGroupNames();

  const eliminatedUnderperformers: GroupExpectedUnderperformer[] =
    expectedFinishes
      .filter(
        (finish) =>
          isTeamEliminatedFromGroup(
            ctx,
            finish.team.id,
            groupMatches,
            groupNames,
          ) && finish.actualPosition > finish.expectedPosition,
      )
      .sort((a, b) => {
        if (b.positionDelta !== a.positionDelta) {
          return b.positionDelta - a.positionDelta;
        }
        return (b.fifaPoints ?? 0) - (a.fifaPoints ?? 0);
      })
      .map((finish) => ({
        team: finish.team,
        groupLetter: finish.groupLetter,
        fifaRank: finish.fifaRank,
        fifaPoints: finish.fifaPoints,
        expectedPosition: finish.expectedPosition,
        actualPosition: finish.actualPosition,
        positionDelta: finish.positionDelta,
      }));

  return {
    meanAbsPointsGap: computeMean(absGaps),
    medianAbsPointsGap: computeNumericStats(absGaps).median,
    meanAbsPointsGapFavorite: computeMean(favoriteGaps),
    medianAbsPointsGapFavorite: computeNumericStats(favoriteGaps).median,
    actualDrawCount: drawMatches.length,
    meanPointsGapOnDraws: drawGapStats.mean,
    stdDevPointsGapOnDraws: drawGapStats.stdDev,
    maxPointsGapOnDraw: drawGapStats.max,
    minPointsGapOnDraw: drawGapStats.min,
    drawMatches,
    highestGapDrawMatch: findExtremeMatch(drawMatches, true),
    lowestGapDrawMatch: findExtremeMatch(drawMatches, false),
    biggestUnderdogDrawMatch: findBiggestUnderdogDraw(drawMatches),
    actualWinLossCount: winLossMatches.length,
    meanPointsGapOnWinLoss: winLossGapStats.mean,
    stdDevPointsGapOnWinLoss: winLossGapStats.stdDev,
    maxPointsGapOnWinLoss: winLossGapStats.max,
    minPointsGapOnWinLoss: winLossGapStats.min,
    winLossMatches,
    highestGapWinLossMatch: findExtremeMatch(winLossMatches, true),
    lowestGapWinLossMatch: findExtremeMatch(winLossMatches, false),
    biggestUnderdogWinMatch: findBiggestUnderdogWin(winLossMatches),
    favoriteMatchCount: favoriteMatches.length,
    equalRatingMatchCount: equalMatches.length,
    expectedDrawLandedCount: equalMatches.filter((entry) => entry.expectedWinLanded)
      .length,
    expectedDrawMissedCount: equalMatches.filter((entry) => entry.expectedWinMissed)
      .length,
    matchCount: matchLedger.length,
    expectedWinLandedCount: annotatedLedger.filter((entry) => entry.expectedWinLanded)
      .length,
    expectedWinMissedCount: annotatedLedger.filter((entry) => entry.expectedWinMissed)
      .length,
    unexpectedDefeatCount: annotatedLedger.filter((entry) => entry.unexpectedDefeat)
      .length,
    upsetWinCount: annotatedLedger.filter((entry) => entry.upsetWin).length,
    matchLedger: annotatedLedger,
    expectedFinishes,
    eliminatedUnderperformers,
  };
}
