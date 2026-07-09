import "server-only";

import { revalidateTag } from "next/cache";
import { fetchWorldCupBundleFromSource } from "@/lib/data/worldcup-fetch";
import { hasBlobStorage } from "@/lib/data/blob-config";
import {
  saveWorldCupBundle,
  writeRuntimeWorldCupBundle,
} from "@/lib/data/worldcup-store";
import { worldcupCacheTag } from "@/lib/data/worldcup-paths";

export interface SyncWorldCupResult {
  matches: number;
  teams: number;
  fetchedAt: string;
}

export async function syncWorldCupData(): Promise<SyncWorldCupResult> {
  const bundle = await fetchWorldCupBundleFromSource();
  await writeRuntimeWorldCupBundle(bundle);

  if (hasBlobStorage()) {
    await saveWorldCupBundle(bundle);
  }

  revalidateTag(worldcupCacheTag(), "max");

  return {
    matches: bundle.matches.length,
    teams: bundle.teams.length,
    fetchedAt: bundle.fetchedAt,
  };
}
