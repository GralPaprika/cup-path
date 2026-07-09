import "server-only";

import { cache } from "react";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { unstable_cache } from "next/cache";
import {
  WORLDCUP_BLOB_PATH,
  WORLDCUP_RUNTIME_FILE,
  worldcupCacheTag,
  type WorldCupBundle,
} from "@/lib/data/worldcup-paths";
import { applyWorldCupBundle } from "@/lib/data/worldcup-loader";
import { initializeTeamRegistry } from "@/lib/data/team-registry";

import bundledWorldcup from "../../../data/worldcup/2026/worldcup.json";
import bundledTeams from "../../../data/worldcup/2026/worldcup.teams.json";
import bundledGroups from "../../../data/worldcup/2026/worldcup.groups.json";

const RUNTIME_DIR = path.join(process.cwd(), "data", "worldcup", "runtime");

const LOCAL_SEED: WorldCupBundle = {
  fetchedAt: "1970-01-01T00:00:00.000Z",
  name: (bundledWorldcup as { name?: string }).name ?? "World Cup 2026",
  matches: (bundledWorldcup as { matches: WorldCupBundle["matches"] }).matches,
  teams: bundledTeams as WorldCupBundle["teams"],
  groups: bundledGroups as WorldCupBundle["groups"],
};

function applyBundle(bundle: WorldCupBundle): void {
  applyWorldCupBundle(bundle);
  initializeTeamRegistry(bundle.teams);
}

async function readFromBlob(): Promise<WorldCupBundle | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;

  try {
    const { list } = await import("@vercel/blob");
    const { blobs } = await list({ prefix: WORLDCUP_BLOB_PATH, limit: 1 });
    const blob = blobs.find((item) => item.pathname === WORLDCUP_BLOB_PATH);
    if (!blob) return null;

    const response = await fetch(blob.url, { next: { revalidate: 3600 } });
    if (!response.ok) return null;
    return (await response.json()) as WorldCupBundle;
  } catch {
    return null;
  }
}

async function readRuntimeCache(): Promise<WorldCupBundle | null> {
  try {
    const filePath = path.join(RUNTIME_DIR, WORLDCUP_RUNTIME_FILE);
    const content = await readFile(filePath, "utf-8");
    return JSON.parse(content) as WorldCupBundle;
  } catch {
    return null;
  }
}

/** Uncached read: Blob → local runtime cache → bundled seed. */
export async function loadWorldCupBundle(): Promise<WorldCupBundle> {
  const blobData = await readFromBlob();
  if (blobData) return blobData;

  const runtimeData = await readRuntimeCache();
  if (runtimeData) return runtimeData;

  return LOCAL_SEED;
}

const loadWorldCupBundleCached = unstable_cache(
  () => loadWorldCupBundle(),
  ["worldcup-bundle"],
  {
    revalidate: 43200,
    tags: [worldcupCacheTag()],
  },
);

async function loadAndApplyWorldCupBundle(): Promise<WorldCupBundle> {
  const bundle =
    process.env.NODE_ENV === "development"
      ? await loadWorldCupBundle()
      : await loadWorldCupBundleCached();

  applyBundle(bundle);
  return bundle;
}

export const ensureWorldCupData = cache(loadAndApplyWorldCupBundle);

export async function writeRuntimeWorldCupBundle(
  bundle: WorldCupBundle,
): Promise<string> {
  await mkdir(RUNTIME_DIR, { recursive: true });
  const filePath = path.join(RUNTIME_DIR, WORLDCUP_RUNTIME_FILE);
  await writeFile(filePath, JSON.stringify(bundle, null, 2), "utf-8");
  applyBundle(bundle);
  return filePath;
}

export async function saveWorldCupBundle(bundle: WorldCupBundle): Promise<void> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN is required to save worldcup data");
  }

  const { put } = await import("@vercel/blob");
  await put(WORLDCUP_BLOB_PATH, JSON.stringify(bundle, null, 2), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

applyBundle(LOCAL_SEED);
