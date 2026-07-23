import { existsSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fetchSnapshotRankings } from "../src/lib/data/rankings-client";
import {
  SNAPSHOT_DATES,
  SNAPSHOT_MODES,
} from "../src/lib/data/ranking-modes";
import { BLOB_PATHS, RUNTIME_FILES } from "../src/lib/data/rankings-paths";
import {
  getBlobAccess,
  hasBlobStorage,
} from "../src/lib/data/blob-config";

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

async function seedSnapshots() {
  loadEnvFile(".env.local");
  loadEnvFile(".env");

  const runtimeDir = path.join(process.cwd(), "data", "rankings", "runtime");
  mkdirSync(runtimeDir, { recursive: true });

  for (const mode of SNAPSHOT_MODES) {
    console.log(`Seeding ${mode} snapshot...`);
    const snapshot = await fetchSnapshotRankings(mode);
    const payload = {
      ...snapshot,
      mode: "snapshot" as const,
      sourceDate: SNAPSHOT_DATES[mode],
    };

    const runtimePath = path.join(runtimeDir, RUNTIME_FILES[mode]);
    writeFileSync(runtimePath, `${JSON.stringify(payload, null, 2)}\n`);
    console.log(`  Wrote runtime cache: ${runtimePath}`);

    if (hasBlobStorage()) {
      const { put } = await import("@vercel/blob");
      await put(BLOB_PATHS[mode], JSON.stringify(payload, null, 2), {
        access: getBlobAccess(),
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "application/json",
      });
      console.log("  Uploaded to Vercel Blob.");
    }
  }

  console.log("All ranking snapshots seeded.");
}

seedSnapshots().catch((error) => {
  console.error(error);
  process.exit(1);
});
