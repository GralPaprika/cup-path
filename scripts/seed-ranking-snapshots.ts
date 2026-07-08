import {
  fetchLiveRankings,
  fetchNearestRankingOnOrBefore,
  SNAPSHOT_DATES,
} from "../src/lib/data/rankings-client";
import { saveRankingsSnapshot } from "../src/lib/data/rankings-store";

async function seedSnapshots() {
  console.log("Seeding year-start snapshot...");
  const yearStart = await fetchNearestRankingOnOrBefore(SNAPSHOT_DATES.yearStart);
  await saveRankingsSnapshot("yearStart", {
    ...yearStart,
    mode: "snapshot",
    sourceDate: SNAPSHOT_DATES.yearStart,
  });

  console.log("Seeding tournament-start snapshot...");
  const tournamentStart = await fetchNearestRankingOnOrBefore(
    SNAPSHOT_DATES.tournamentStart,
  );
  await saveRankingsSnapshot("tournamentStart", {
    ...tournamentStart,
    mode: "snapshot",
    sourceDate: SNAPSHOT_DATES.tournamentStart,
  });

  console.log("Seeding live snapshot...");
  const live = await fetchLiveRankings();
  await saveRankingsSnapshot("live", live);

  console.log("All ranking snapshots seeded.");
}

seedSnapshots().catch((error) => {
  console.error(error);
  process.exit(1);
});
