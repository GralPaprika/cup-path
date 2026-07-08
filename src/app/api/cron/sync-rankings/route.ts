import { NextRequest, NextResponse } from "next/server";
import {
  fetchLiveRankings,
  fetchNearestRankingOnOrBefore,
  SNAPSHOT_DATES,
} from "@/lib/data/rankings-client";
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
      const yearStart = await fetchNearestRankingOnOrBefore(
        SNAPSHOT_DATES.yearStart,
      );
      const tournamentStart = await fetchNearestRankingOnOrBefore(
        SNAPSHOT_DATES.tournamentStart,
      );

      await saveRankingsSnapshot("yearStart", {
        ...yearStart,
        mode: "snapshot",
        sourceDate: SNAPSHOT_DATES.yearStart,
      });
      await saveRankingsSnapshot("tournamentStart", {
        ...tournamentStart,
        mode: "snapshot",
        sourceDate: SNAPSHOT_DATES.tournamentStart,
      });

      return NextResponse.json({
        ok: true,
        yearStart: yearStart.entries.length,
        tournamentStart: tournamentStart.entries.length,
      });
    }

    const live = await fetchLiveRankings();
    await saveRankingsSnapshot("live", live);

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
