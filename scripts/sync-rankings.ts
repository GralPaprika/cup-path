import { existsSync, readFileSync, mkdirSync, writeFileSync, unlinkSync } from "node:fs";
import path from "node:path";
import { fetchRankingsByDate } from "../src/lib/data/rankings-client";
import {
  SNAPSHOT_DATES,
  SNAPSHOT_MODES,
} from "../src/lib/data/ranking-modes";
import { RUNTIME_FILES } from "../src/lib/data/rankings-paths";

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

async function main() {
  loadEnvFile(".env.local");
  loadEnvFile(".env");

  if (!process.env.RAPIDAPI_KEY) {
    throw new Error("RAPIDAPI_KEY is required. Add it to .env.local.");
  }

  const runtimeDir = path.join(process.cwd(), "data", "rankings", "runtime");
  mkdirSync(runtimeDir, { recursive: true });

  for (const mode of SNAPSHOT_MODES) {
    console.log(`Fetching ${mode} (${SNAPSHOT_DATES[mode]})...`);
    const snapshot = await fetchRankingsByDate(SNAPSHOT_DATES[mode]);
    const payload = {
      ...snapshot,
      mode: "snapshot" as const,
      sourceDate: SNAPSHOT_DATES[mode],
    };
    const filePath = path.join(runtimeDir, RUNTIME_FILES[mode]);
    writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`);
    console.log(`  Wrote ${filePath} (${payload.entries.length} entries)`);
  }

  const staleLive = path.join(runtimeDir, "live.json");
  if (existsSync(staleLive)) {
    unlinkSync(staleLive);
    console.log("Removed stale runtime/live.json");
  }

  console.log("\nRankings synced to local runtime cache.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
