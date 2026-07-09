import "server-only";

import {
  syncLiveRankings,
  syncSnapshotRankings,
} from "@/lib/services/rankings-sync-service";
import { syncWorldCupData } from "@/lib/services/worldcup-sync-service";

export async function syncScheduledData() {
  const [snapshots, worldcup, live] = await Promise.all([
    syncSnapshotRankings(),
    syncWorldCupData(),
    syncLiveRankings(),
  ]);

  return { snapshots, worldcup, live };
}

export { syncLiveRankings };
