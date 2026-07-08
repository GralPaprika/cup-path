import { NextRequest, NextResponse } from "next/server";
import type { RankingMode } from "@/lib/types";
import { getAllTeamsEnriched } from "@/lib/data/team-registry";

export async function GET(request: NextRequest) {
  const mode = (request.nextUrl.searchParams.get("mode") as RankingMode) ?? "live";
  const teams = await getAllTeamsEnriched(mode);
  return NextResponse.json({ teams });
}
