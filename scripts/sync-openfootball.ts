import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE_URL =
  "https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026";

const FILES = [
  "worldcup.json",
  "worldcup.teams.json",
  "worldcup.groups.json",
] as const;

async function syncOpenFootball() {
  const outDir = path.join(process.cwd(), "data", "worldcup", "2026");
  await mkdir(outDir, { recursive: true });

  for (const file of FILES) {
    const response = await fetch(`${BASE_URL}/${file}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${file}: ${response.status}`);
    }
    const data = await response.text();
    await writeFile(path.join(outDir, file), data, "utf-8");
    console.log(`Synced ${file}`);
  }

  console.log("Openfootball 2026 data synced successfully.");
}

syncOpenFootball().catch((error) => {
  console.error(error);
  process.exit(1);
});
