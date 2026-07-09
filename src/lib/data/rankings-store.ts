import "server-only";

import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { unstable_cache } from "next/cache";
import type {
  RankingEntry,
  RankingMode,
  RankingsMeta,
  RankingsSnapshot,
} from "@/lib/types";
import { getAllTeams, resolveTeam } from "@/lib/data/team-registry";
import { getFifaFlagUrl } from "@/lib/data/flag-utils";
import {
  BLOB_PATHS,
  RUNTIME_FILES,
  rankingsCacheTag,
} from "@/lib/data/rankings-paths";

import liveSeed from "../../../data/rankings/seed-live.json";
import januarySeed from "../../../data/rankings/seed-january.json";
import aprilSeed from "../../../data/rankings/seed-april.json";
import june11Seed from "../../../data/rankings/seed-june11.json";
import november19Seed from "../../../data/rankings/seed-november19.json";

const RUNTIME_DIR = path.join(process.cwd(), "data", "rankings", "runtime");

const LOCAL_SEEDS: Record<RankingMode, RankingsSnapshot> = {
  live: liveSeed as RankingsSnapshot,
  january: januarySeed as RankingsSnapshot,
  april: aprilSeed as RankingsSnapshot,
  june11: june11Seed as RankingsSnapshot,
  november19: november19Seed as RankingsSnapshot,
};

const REVALIDATE_SECONDS: Record<RankingMode, number | false> = {
  live: 3600,
  january: false,
  april: false,
  june11: false,
  november19: false,
};

function normalizeSnapshot(
  snapshot: RankingsSnapshot,
  mode: RankingMode,
): RankingsSnapshot {
  const entries: RankingEntry[] = [];

  for (const entry of snapshot.entries) {
    const team =
      resolveTeam(entry.teamId) ??
      getAllTeams().find((t) => t.id === entry.teamId);
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

async function readFromBlob(blobPath: string): Promise<RankingsSnapshot | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;

  try {
    const { list } = await import("@vercel/blob");
    const { blobs } = await list({ prefix: blobPath, limit: 1 });
    const blob = blobs.find((item) => item.pathname === blobPath);
    if (!blob) return null;

    const response = await fetch(blob.url, { next: { revalidate: 3600 } });
    if (!response.ok) return null;
    return (await response.json()) as RankingsSnapshot;
  } catch {
    return null;
  }
}

async function readRuntimeCache(
  mode: RankingMode,
): Promise<RankingsSnapshot | null> {
  try {
    const filePath = path.join(RUNTIME_DIR, RUNTIME_FILES[mode]);
    const content = await readFile(filePath, "utf-8");
    return JSON.parse(content) as RankingsSnapshot;
  } catch {
    return null;
  }
}

/** Uncached read: Blob → local runtime cache → bundled seed. No network API calls. */
export async function loadRankingsSnapshot(
  mode: RankingMode,
): Promise<RankingsSnapshot> {
  const blobData = await readFromBlob(BLOB_PATHS[mode]);
  if (blobData) return normalizeSnapshot(blobData, mode);

  const runtimeData = await readRuntimeCache(mode);
  if (runtimeData) return normalizeSnapshot(runtimeData, mode);

  return normalizeSnapshot(LOCAL_SEEDS[mode], mode);
}

export function getRankingsSnapshot(
  mode: RankingMode,
): Promise<RankingsSnapshot> {
  // Local runtime files are updated by `npm run sync:rankings` without going
  // through Next cache tags, so always read fresh data during development.
  if (process.env.NODE_ENV === "development") {
    return loadRankingsSnapshot(mode);
  }

  return unstable_cache(
    () => loadRankingsSnapshot(mode),
    ["rankings-snapshot", mode],
    {
      revalidate: REVALIDATE_SECONDS[mode],
      tags: [rankingsCacheTag(mode)],
    },
  )();
}

export async function writeRuntimeSnapshot(
  mode: RankingMode,
  snapshot: RankingsSnapshot,
): Promise<string> {
  await mkdir(RUNTIME_DIR, { recursive: true });
  const filePath = path.join(RUNTIME_DIR, RUNTIME_FILES[mode]);
  await writeFile(filePath, JSON.stringify(snapshot, null, 2), "utf-8");
  return filePath;
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
  const january = await getRankingsSnapshot("january");
  const april = await getRankingsSnapshot("april");
  const june11 = await getRankingsSnapshot("june11");
  const november19 = await getRankingsSnapshot("november19");

  return {
    liveLastUpdated: live.fetchedAt,
    januaryDate: january.sourceDate,
    aprilDate: april.sourceDate,
    june11Date: june11.sourceDate,
    november19Date: november19.sourceDate,
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
