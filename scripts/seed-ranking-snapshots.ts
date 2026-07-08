import {
  fetchLiveRankings,
  fetchSnapshotRankings,
} from "../src/lib/data/rankings-client";
import { SNAPSHOT_DATES, SNAPSHOT_MODES } from "../src/lib/data/ranking-modes";
import {
  saveRankingsSnapshot,
  writeRuntimeSnapshot,
} from "../src/lib/data/rankings-store";

async function seedSnapshots() {
  for (const mode of SNAPSHOT_MODES) {
    console.log(`Seeding ${mode} snapshot...`);
    const snapshot = await fetchSnapshotRankings(mode);
    const payload = {
      ...snapshot,
      mode: "snapshot" as const,
      sourceDate: SNAPSHOT_DATES[mode],
    };
    await writeRuntimeSnapshot(mode, payload);
    await saveRankingsSnapshot(mode, payload);
  }

  console.log("Seeding live snapshot...");
  const live = await fetchLiveRankings();
  await writeRuntimeSnapshot("live", live);
  await saveRankingsSnapshot("live", live);

  console.log("All ranking snapshots seeded.");
}

seedSnapshots().catch((error) => {
  console.error(error);
  process.exit(1);
});
