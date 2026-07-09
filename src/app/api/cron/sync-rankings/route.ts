import { NextRequest, NextResponse } from "next/server";
import {
  syncLiveRankings,
  syncSnapshotRankings,
} from "@/lib/services/rankings-sync-service";

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV === "development";

  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${secret}`;
}

function syncAction(request: NextRequest): "live" | "snapshots" {
  const action = request.nextUrl.searchParams.get("action");
  if (action === "snapshots" || action === "seed-snapshots") {
    return "snapshots";
  }
  return "live";
}

async function runSync(request: NextRequest) {
  if (syncAction(request) === "snapshots") {
    const result = await syncSnapshotRankings();
    return NextResponse.json({ ok: true, ...result });
  }

  const result = await syncLiveRankings();
  return NextResponse.json({ ok: true, ...result });
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return await runSync(request);
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

  try {
    return await runSync(request);
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
