import { NextRequest, NextResponse } from "next/server";
import { parseRankingMode } from "@/lib/data/ranking-modes";
import { getAllTeamsEnriched } from "@/lib/data/team-registry";

export async function GET(request: NextRequest) {
  const mode = parseRankingMode(request.nextUrl.searchParams.get("mode"));
  const teams = await getAllTeamsEnriched(mode);
  return NextResponse.json({ teams });
}
