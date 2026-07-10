import type { AvgPointsContext, PointsAnchor, RankingEntry } from "@/lib/types";
import { enrichTeam, getTeamById } from "@/lib/data/team-registry";

export function computePointsPercentile(
  targetPoints: number | null,
  rankings: Iterable<RankingEntry>,
): { percentile: number; poolSize: number } | null {
  if (targetPoints === null) return null;

  const pointsList: number[] = [];
  for (const entry of rankings) {
    pointsList.push(entry.points);
  }

  if (pointsList.length === 0) return null;

  const below = pointsList.filter((points) => points < targetPoints).length;
  return {
    percentile: Math.round((below / pointsList.length) * 100),
    poolSize: pointsList.length,
  };
}

export function buildAvgPointsContext(
  targetPoints: number | null,
  rankings: Iterable<RankingEntry>,
  options?: { excludeTeamId?: string },
): AvgPointsContext | null {
  if (targetPoints === null) return null;

  const entries = [...rankings];
  const percentileResult = computePointsPercentile(targetPoints, entries);
  const anchor = findClosestPointsAnchor(targetPoints, entries, options);

  if (!percentileResult) return null;

  return {
    percentile: percentileResult.percentile,
    poolSize: percentileResult.poolSize,
    anchor,
  };
}

export function findClosestPointsAnchor(
  targetPoints: number | null,
  rankings: Iterable<RankingEntry>,
  options?: { excludeTeamId?: string },
): PointsAnchor | null {
  if (targetPoints === null) return null;

  let best: PointsAnchor | null = null;

  for (const entry of rankings) {
    if (
      options?.excludeTeamId &&
      entry.teamId.toUpperCase() === options.excludeTeamId.toUpperCase()
    ) {
      continue;
    }

    const team = getTeamById(entry.teamId);
    if (!team) continue;

    const gap = Math.abs(entry.points - targetPoints);
    if (
      !best ||
      gap < best.gap ||
      (gap === best.gap && entry.rank < best.rank)
    ) {
      best = {
        team: enrichTeam(team, entry.flagUrl),
        points: entry.points,
        rank: entry.rank,
        gap,
      };
    }
  }

  return best;
}
