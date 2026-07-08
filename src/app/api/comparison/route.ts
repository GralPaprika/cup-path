import { NextRequest, NextResponse } from "next/server";
import { parseRankingMode } from "@/lib/data/ranking-modes";
import { getComparisonAnalysis } from "@/lib/services/analysis-service";

export async function GET(request: NextRequest) {
  const mode = parseRankingMode(request.nextUrl.searchParams.get("mode"));
  const selectedTeamId = request.nextUrl.searchParams.get("team")?.toUpperCase();
  const comparison = await getComparisonAnalysis(mode, selectedTeamId);

  return NextResponse.json({ comparison, mode });
}
