import "server-only";

import {
  syncLiveRankings,
  syncSnapshotRankings,
} from "@/lib/services/rankings-sync-service";
import { syncWorldCupData } from "@/lib/services/worldcup-sync-service";

export async function syncScheduledData() {
  const [snapshots, worldcup] = await Promise.all([
    syncSnapshotRankings(),
    syncWorldCupData(),
  ]);

  return { snapshots, worldcup };
}

export { syncLiveRankings };
