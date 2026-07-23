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
import {
  getBlobAccess,
  hasBlobStorage,
  readJsonBlob,
} from "@/lib/data/blob-config";
import { RANKING_MODES } from "@/lib/data/ranking-modes";

import july20Seed from "../../../data/rankings/seed-july20.json";
import januarySeed from "../../../data/rankings/seed-january.json";
import aprilSeed from "../../../data/rankings/seed-april.json";
import june11Seed from "../../../data/rankings/seed-june11.json";
import november19Seed from "../../../data/rankings/seed-november19.json";

const RUNTIME_DIR = path.join(process.cwd(), "data", "rankings", "runtime");

const LOCAL_SEEDS: Record<RankingMode, RankingsSnapshot> = {
  july20: july20Seed as RankingsSnapshot,
  january: januarySeed as RankingsSnapshot,
  april: aprilSeed as RankingsSnapshot,
  june11: june11Seed as RankingsSnapshot,
  november19: november19Seed as RankingsSnapshot,
};

function normalizeSnapshot(snapshot: RankingsSnapshot): RankingsSnapshot {
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
    mode: "snapshot",
    entries,
  };
}

async function readFromBlob(blobPath: string): Promise<RankingsSnapshot | null> {
  return readJsonBlob<RankingsSnapshot>(blobPath);
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
  if (blobData) return normalizeSnapshot(blobData);

  const runtimeData = await readRuntimeCache(mode);
  if (runtimeData) return normalizeSnapshot(runtimeData);

  return normalizeSnapshot(LOCAL_SEEDS[mode]);
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
      revalidate: false,
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
  if (!hasBlobStorage()) {
    throw new Error(
      "Blob storage is not configured (BLOB_STORE_ID or BLOB_READ_WRITE_TOKEN)",
    );
  }

  const { put } = await import("@vercel/blob");
  await put(BLOB_PATHS[mode], JSON.stringify(snapshot, null, 2), {
    access: getBlobAccess(),
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

export async function getRankingsMeta(): Promise<RankingsMeta> {
  const snapshots = Object.fromEntries(
    await Promise.all(
      RANKING_MODES.map(async (mode) => {
        const snapshot = await getRankingsSnapshot(mode);
        return [mode, snapshot] as const;
      }),
    ),
  ) as Record<RankingMode, RankingsSnapshot>;

  return {
    july20Date: snapshots.july20.sourceDate,
    januaryDate: snapshots.january.sourceDate,
    aprilDate: snapshots.april.sourceDate,
    june11Date: snapshots.june11.sourceDate,
    november19Date: snapshots.november19.sourceDate,
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
