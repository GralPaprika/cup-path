import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import {
  fetchLiveRankings,
  fetchSnapshotRankings,
} from "@/lib/data/rankings-client";
import { rankingsCacheTag } from "@/lib/data/rankings-paths";
import {
  SNAPSHOT_DATES,
  SNAPSHOT_MODES,
} from "@/lib/data/ranking-modes";
import { saveRankingsSnapshot } from "@/lib/data/rankings-store";

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV === "development";

  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${secret}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const live = await fetchLiveRankings();
    await saveRankingsSnapshot("live", live);
    revalidateTag(rankingsCacheTag("live"), "max");

    return NextResponse.json({
      ok: true,
      mode: "live",
      entries: live.entries.length,
      fetchedAt: live.fetchedAt,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Sync failed",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const action = request.nextUrl.searchParams.get("action");

  try {
    if (action === "seed-snapshots") {
      const results: Record<string, number> = {};

      for (const mode of SNAPSHOT_MODES) {
        const snapshot = await fetchSnapshotRankings(mode);
        await saveRankingsSnapshot(mode, {
          ...snapshot,
          mode: "snapshot",
          sourceDate: SNAPSHOT_DATES[mode],
        });
        revalidateTag(rankingsCacheTag(mode), "max");
        results[mode] = snapshot.entries.length;
      }

      return NextResponse.json({ ok: true, ...results });
    }

    const live = await fetchLiveRankings();
    await saveRankingsSnapshot("live", live);
    revalidateTag(rankingsCacheTag("live"), "max");

    return NextResponse.json({
      ok: true,
      entries: live.entries.length,
      fetchedAt: live.fetchedAt,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Sync failed",
      },
      { status: 500 },
    );
  }
}
