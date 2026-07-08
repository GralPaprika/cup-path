import type {
  RankingEntry,
  RankingMode,
  RankingsMeta,
  RankingsSnapshot,
} from "@/lib/types";
import { getAllTeams, resolveTeam } from "@/lib/data/team-registry";
import { getFifaFlagUrl } from "@/lib/data/flag-utils";

import liveSeed from "../../../data/rankings/seed-live.json";
import yearStartSeed from "../../../data/rankings/seed-year-start.json";
import tournamentStartSeed from "../../../data/rankings/seed-tournament-start.json";

const BLOB_PATHS: Record<RankingMode, string> = {
  live: "rankings/live.json",
  yearStart: "rankings/snapshot-year-start.json",
  tournamentStart: "rankings/snapshot-tournament-start.json",
};

const LOCAL_SEEDS: Record<RankingMode, RankingsSnapshot> = {
  live: liveSeed as RankingsSnapshot,
  yearStart: yearStartSeed as RankingsSnapshot,
  tournamentStart: tournamentStartSeed as RankingsSnapshot,
};

function normalizeSnapshot(
  snapshot: RankingsSnapshot,
  mode: RankingMode,
): RankingsSnapshot {
  const entries: RankingEntry[] = [];

  for (const entry of snapshot.entries) {
    const team = resolveTeam(entry.teamId) ?? getAllTeams().find((t) => t.id === entry.teamId);
    if (!team) continue;
    entries.push({
      ...entry,
      teamId: team.id,
      flagUrl: entry.flagUrl ?? team.flagUrl ?? getFifaFlagUrl(team.id),
    });
  }

  return {
    ...snapshot,
    mode: mode === "live" ? "live" : "snapshot",
    entries,
  };
}

async function readFromBlob(path: string): Promise<RankingsSnapshot | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;

  try {
    const { list } = await import("@vercel/blob");
    const { blobs } = await list({ prefix: path, limit: 1 });
    const blob = blobs.find((item) => item.pathname === path);
    if (!blob) return null;

    const response = await fetch(blob.url, { next: { revalidate: 3600 } });
    if (!response.ok) return null;
    return (await response.json()) as RankingsSnapshot;
  } catch {
    return null;
  }
}

export async function getRankingsSnapshot(
  mode: RankingMode,
): Promise<RankingsSnapshot> {
  const blobData = await readFromBlob(BLOB_PATHS[mode]);
  if (blobData) return normalizeSnapshot(blobData, mode);
  return normalizeSnapshot(LOCAL_SEEDS[mode], mode);
}

export async function saveRankingsSnapshot(
  mode: RankingMode,
  snapshot: RankingsSnapshot,
): Promise<void> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN is required to save rankings");
  }

  const { put } = await import("@vercel/blob");
  await put(BLOB_PATHS[mode], JSON.stringify(snapshot, null, 2), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

export async function getRankingsMeta(): Promise<RankingsMeta> {
  const live = await getRankingsSnapshot("live");
  const yearStart = await getRankingsSnapshot("yearStart");
  const tournamentStart = await getRankingsSnapshot("tournamentStart");

  return {
    liveLastUpdated: live.fetchedAt,
    yearStartDate: yearStart.sourceDate,
    tournamentStartDate: tournamentStart.sourceDate,
  };
}

export function buildRankingsMap(
  snapshot: RankingsSnapshot,
): Map<string, RankingEntry> {
  const map = new Map<string, RankingEntry>();
  for (const entry of snapshot.entries) {
    map.set(entry.teamId, entry);
  }
  return map;
}
