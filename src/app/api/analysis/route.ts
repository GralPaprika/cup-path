import { NextRequest, NextResponse } from "next/server";
import { parseRankingMode } from "@/lib/data/ranking-modes";
import { getTeamAnalysis } from "@/lib/services/analysis-service";

export async function GET(request: NextRequest) {
  const teamId = request.nextUrl.searchParams.get("team");
  const mode = parseRankingMode(request.nextUrl.searchParams.get("mode"));

  if (!teamId) {
    return NextResponse.json({ error: "team parameter is required" }, { status: 400 });
  }

  const analysis = await getTeamAnalysis(teamId.toUpperCase(), mode);
  if (!analysis) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  return NextResponse.json(analysis);
}
