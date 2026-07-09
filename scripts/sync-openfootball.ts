import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fetchWorldCupBundleFromSource } from "../src/lib/data/worldcup-fetch";
import {
  WORLDCUP_RUNTIME_FILE,
} from "../src/lib/data/worldcup-paths";

const OUT_DIR = path.join(process.cwd(), "data", "worldcup", "2026");
const RUNTIME_DIR = path.join(process.cwd(), "data", "worldcup", "runtime");

async function syncOpenFootball() {
  const bundle = await fetchWorldCupBundleFromSource();

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(
    path.join(OUT_DIR, "worldcup.json"),
    JSON.stringify({ name: bundle.name, matches: bundle.matches }, null, 2),
    "utf-8",
  );
  await writeFile(
    path.join(OUT_DIR, "worldcup.teams.json"),
    JSON.stringify(bundle.teams, null, 2),
    "utf-8",
  );
  await writeFile(
    path.join(OUT_DIR, "worldcup.groups.json"),
    JSON.stringify(bundle.groups, null, 2),
    "utf-8",
  );

  await mkdir(RUNTIME_DIR, { recursive: true });
  const runtimePath = path.join(RUNTIME_DIR, WORLDCUP_RUNTIME_FILE);
  await writeFile(runtimePath, JSON.stringify(bundle, null, 2), "utf-8");

  console.log("Synced worldcup.json");
  console.log("Synced worldcup.teams.json");
  console.log("Synced worldcup.groups.json");
  console.log(`Wrote runtime bundle: ${runtimePath}`);
  console.log("Openfootball 2026 data synced successfully.");
}

syncOpenFootball().catch((error) => {
  console.error(error);
  process.exit(1);
});
