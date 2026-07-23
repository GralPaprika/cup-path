import "server-only";

import { revalidateTag } from "next/cache";
import { fetchSnapshotRankings } from "@/lib/data/rankings-client";
import { rankingsCacheTag } from "@/lib/data/rankings-paths";
import {
  SNAPSHOT_DATES,
  SNAPSHOT_MODES,
  type SnapshotMode,
} from "@/lib/data/ranking-modes";
import { saveRankingsSnapshot } from "@/lib/data/rankings-store";
import type { RankingsSnapshot } from "@/lib/types";

export interface SyncSnapshotsResult {
  mode: "snapshots";
  snapshots: Record<SnapshotMode, number>;
}

export async function syncSnapshotRankings(): Promise<SyncSnapshotsResult> {
  const snapshots = {} as Record<SnapshotMode, number>;

  for (const mode of SNAPSHOT_MODES) {
    const snapshot = await fetchSnapshotRankings(mode);
    const payload: RankingsSnapshot = {
      ...snapshot,
      mode: "snapshot",
      sourceDate: SNAPSHOT_DATES[mode],
    };

    await saveRankingsSnapshot(mode, payload);
    revalidateTag(rankingsCacheTag(mode), "max");
    snapshots[mode] = snapshot.entries.length;
  }

  return { mode: "snapshots", snapshots };
}
