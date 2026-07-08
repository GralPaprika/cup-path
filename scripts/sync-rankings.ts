import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { RankingMode, RankingsSnapshot } from "../src/lib/types";
import {
  SNAPSHOT_DATES,
  SNAPSHOT_MODES,
  type SnapshotMode,
} from "../src/lib/data/ranking-modes";
import {
  fetchLiveRankings,
  fetchSnapshotRankings,
} from "../src/lib/data/rankings-client";
import {
  saveRankingsSnapshot,
  writeRuntimeSnapshot,
} from "../src/lib/data/rankings-store";

import januarySeed from "../data/rankings/seed-january.json";
import aprilSeed from "../data/rankings/seed-april.json";
import june11Seed from "../data/rankings/seed-june11.json";

const SEED_FALLBACKS: Record<SnapshotMode, RankingsSnapshot> = {
  january: januarySeed as RankingsSnapshot,
  april: aprilSeed as RankingsSnapshot,
  june11: june11Seed as RankingsSnapshot,
};

function loadEnvFile(fileName: string): void {
  const filePath = path.join(process.cwd(), fileName);
  if (!existsSync(filePath)) return;

  for (const line of readFileSync(filePath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

async function persistSnapshot(
  mode: RankingMode,
  snapshot: RankingsSnapshot,
): Promise<void> {
  const filePath = await writeRuntimeSnapshot(mode, snapshot);
  console.log(`  Wrote runtime cache: ${filePath}`);

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    await saveRankingsSnapshot(mode, snapshot);
    console.log("  Uploaded to Vercel Blob.");
  }
}

async function syncSnapshot(mode: SnapshotMode): Promise<void> {
  const label = SNAPSHOT_DATES[mode];
  console.log(`Fetching ${mode} snapshot (${label})...`);

  let snapshot: RankingsSnapshot;
  try {
    snapshot = await fetchSnapshotRankings(mode);
  } catch {
    console.warn(`  API unavailable for ${mode}; using bundled seed.`);
    snapshot = SEED_FALLBACKS[mode];
  }

  await persistSnapshot(mode, {
    ...snapshot,
    mode: "snapshot",
    sourceDate: SNAPSHOT_DATES[mode],
  });
}

async function syncRankings() {
  loadEnvFile(".env.local");
  loadEnvFile(".env");

  if (!process.env.RAPIDAPI_KEY) {
    throw new Error("RAPIDAPI_KEY is required. Add it to .env.local.");
  }

  for (const mode of SNAPSHOT_MODES) {
    await syncSnapshot(mode);
  }

  console.log("Fetching live rankings...");
  const live = await fetchLiveRankings();
  await persistSnapshot("live", live);

  console.log("\nRankings synced.");
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.log(
      "Tip: set BLOB_READ_WRITE_TOKEN to also upload snapshots to Vercel Blob.",
    );
  }
}

syncRankings().catch((error) => {
  console.error(error);
  process.exit(1);
});
