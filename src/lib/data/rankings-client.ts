import type { RankingEntry, RankingsSnapshot } from "@/lib/types";
import { getAllTeams, resolveTeam } from "@/lib/data/team-registry";
import {
  SNAPSHOT_DATES,
  type SnapshotMode,
} from "@/lib/data/ranking-modes";
import {
  getFifaFlagUrl,
  parseApiSourceDate,
  parseFifaCode,
  parseFlagUrl,
} from "@/lib/data/flag-utils";

const API_HOST =
  process.env.RAPIDAPI_HOST ?? "world-football-ranking.p.rapidapi.com";

function getApiKey(): string | undefined {
  return process.env.RAPIDAPI_KEY;
}

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

interface HistoricalRankingRelease {
  id: string;
  date: string;
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

  if (Array.isArray(data.ranking)) return data.ranking as RawRankingRow[];
  if (Array.isArray(data)) return data as RawRankingRow[];
  if (Array.isArray(data.rankings)) return data.rankings as RawRankingRow[];
  if (Array.isArray(data.data)) return data.data as RawRankingRow[];
  if (Array.isArray(data.results)) return data.results as RawRankingRow[];
  if (Array.isArray(data.teams)) return data.teams as RawRankingRow[];

  return [];
}

function parseReleaseDateLabel(label: string): string | undefined {
  const parsed = new Date(label.replace(/,/g, "").trim());
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString().slice(0, 10);
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
    mode: "snapshot",
    fetchedAt: new Date().toISOString(),
    sourceDate: resolvedDate,
    entries,
  };
}

async function rapidApiFetch(path: string): Promise<unknown> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("RAPIDAPI_KEY is not configured");
  }

  const response = await fetch(`https://${API_HOST}${path}`, {
    headers: {
      "x-rapidapi-key": apiKey,
      "x-rapidapi-host": API_HOST,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`RapidAPI ${path} failed (${response.status}): ${body}`);
  }

  return response.json();
}

let historicalReleasesCache: HistoricalRankingRelease[] | undefined;

async function fetchHistoricalReleases(): Promise<HistoricalRankingRelease[]> {
  if (historicalReleasesCache) return historicalReleasesCache;

  const payload = await rapidApiFetch("/historical-rankings.php");
  if (!Array.isArray(payload)) {
    throw new Error("Unexpected historical-rankings response shape");
  }

  historicalReleasesCache = payload.filter(
    (item): item is HistoricalRankingRelease =>
      !!item &&
      typeof item === "object" &&
      typeof (item as HistoricalRankingRelease).id === "string" &&
      typeof (item as HistoricalRankingRelease).date === "string",
  );

  return historicalReleasesCache;
}

async function resolveHistoricalRankingId(
  targetDate: string,
): Promise<HistoricalRankingRelease> {
  const releases = await fetchHistoricalReleases();
  const match = releases.find(
    (release) => parseReleaseDateLabel(release.date) === targetDate,
  );

  if (!match) {
    throw new Error(`No historical ranking release found for ${targetDate}`);
  }

  return match;
}

export async function fetchRankingsByDate(
  targetDate: string,
): Promise<RankingsSnapshot> {
  const release = await resolveHistoricalRankingId(targetDate);
  const payload = await rapidApiFetch(
    `/ranking-by-date.php?id=${encodeURIComponent(release.id)}`,
  );
  const snapshot = normalizeApiResponse(payload, targetDate);
  if (snapshot.entries.length === 0) {
    throw new Error(`Unable to fetch rankings for ${targetDate}`);
  }
  return snapshot;
}

export async function fetchSnapshotRankings(
  mode: SnapshotMode,
): Promise<RankingsSnapshot> {
  return fetchRankingsByDate(SNAPSHOT_DATES[mode]);
}

export { SNAPSHOT_DATES };
