import type { RankingEntry, RankingsSnapshot } from "@/lib/types";
import { getAllTeams, resolveTeam } from "@/lib/data/team-registry";
import {
  getFifaFlagUrl,
  parseApiSourceDate,
  parseFifaCode,
  parseFlagUrl,
} from "@/lib/data/flag-utils";

const API_HOST =
  process.env.RAPIDAPI_HOST ?? "world-football-ranking.p.rapidapi.com";
const API_KEY = process.env.RAPIDAPI_KEY;

interface RawRankingRow extends Record<string, unknown> {
  rank?: number;
  ranking?: number;
  position?: number;
  points?: number;
  totalPoints?: number;
  total_points?: number;
  previous_rank?: number;
  country?: string;
  countryName?: string;
  team?: string;
  teamName?: string;
  name?: string;
  flag?: string;
}

function parseRank(row: RawRankingRow): number {
  return row.rank ?? row.ranking ?? row.position ?? 0;
}

function parsePoints(row: RawRankingRow): number {
  return row.points ?? row.totalPoints ?? row.total_points ?? 0;
}

function parseName(row: RawRankingRow): string {
  return (
    (row.country as string) ??
    row.countryName ??
    row.team ??
    row.teamName ??
    row.name ??
    ""
  );
}

function extractRows(payload: unknown): RawRankingRow[] {
  if (!payload || typeof payload !== "object") return [];

  const data = payload as Record<string, unknown>;

  // World Football Ranking API shape: { type, date, ranking: [...] }
  if (Array.isArray(data.ranking)) return data.ranking as RawRankingRow[];

  if (Array.isArray(data)) return data as RawRankingRow[];
  if (Array.isArray(data.rankings)) return data.rankings as RawRankingRow[];
  if (Array.isArray(data.data)) return data.data as RawRankingRow[];
  if (Array.isArray(data.results)) return data.results as RawRankingRow[];
  if (Array.isArray(data.teams)) return data.teams as RawRankingRow[];

  return [];
}

export function normalizeApiResponse(
  payload: unknown,
  sourceDate: string,
): RankingsSnapshot {
  const rows = extractRows(payload);
  const entries: RankingEntry[] = [];
  const resolvedDate = parseApiSourceDate(payload, sourceDate);

  for (const row of rows) {
    const name = parseName(row);
    const flagUrl = parseFlagUrl(row);
    const fifaCode = parseFifaCode(row);
    const team =
      (fifaCode ? resolveTeam(fifaCode) : undefined) ??
      resolveTeam(name) ??
      getAllTeams().find((item) =>
        item.aliases.some(
          (alias) => alias.toLowerCase() === name.toLowerCase(),
        ),
      );

    if (!team) continue;

    entries.push({
      teamId: team.id,
      rank: parseRank(row),
      points: parsePoints(row),
      flagUrl: flagUrl ?? getFifaFlagUrl(team.id),
      previousRank:
        typeof row.previous_rank === "number" ? row.previous_rank : undefined,
    });
  }

  return {
    mode: "live",
    fetchedAt: new Date().toISOString(),
    sourceDate: resolvedDate,
    entries,
  };
}

async function rapidApiFetch(path: string): Promise<unknown> {
  if (!API_KEY) {
    throw new Error("RAPIDAPI_KEY is not configured");
  }

  const response = await fetch(`https://${API_HOST}${path}`, {
    headers: {
      "x-rapidapi-key": API_KEY,
      "x-rapidapi-host": API_HOST,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`RapidAPI ${path} failed (${response.status}): ${body}`);
  }

  return response.json();
}

export async function fetchLiveRankings(): Promise<RankingsSnapshot> {
  const candidates = ["/rankings", "/rankings/current", "/"];

  for (const path of candidates) {
    try {
      const payload = await rapidApiFetch(path);
      const snapshot = normalizeApiResponse(
        payload,
        new Date().toISOString().slice(0, 10),
      );
      if (snapshot.entries.length > 0) return snapshot;
    } catch {
      continue;
    }
  }

  throw new Error("Unable to fetch live rankings from RapidAPI");
}

export async function fetchRankingsByDate(
  targetDate: string,
): Promise<RankingsSnapshot> {
  const candidates = [
    `/rankings?date=${targetDate}`,
    `/rankings/historical?date=${targetDate}`,
    `/rankings/by-date?date=${targetDate}`,
    `/rankings/${targetDate}`,
    `/rankings?date=${targetDate.slice(0, 10)}`,
  ];

  for (const path of candidates) {
    try {
      const payload = await rapidApiFetch(path);
      const snapshot = normalizeApiResponse(payload, targetDate);
      if (snapshot.entries.length > 0) return snapshot;
    } catch {
      continue;
    }
  }

  throw new Error(`Unable to fetch rankings for ${targetDate}`);
}

export async function fetchNearestRankingOnOrBefore(
  targetDate: string,
): Promise<RankingsSnapshot> {
  try {
    return await fetchRankingsByDate(targetDate);
  } catch {
    return fetchLiveRankings();
  }
}

export const SNAPSHOT_DATES = {
  yearStart: "2026-01-01",
  tournamentStart: "2026-06-11",
} as const;
