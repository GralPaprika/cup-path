import { NextRequest, NextResponse } from "next/server";
import { parseRankingMode } from "@/lib/data/ranking-modes";
import { getGroupsAnalysis } from "@/lib/services/analysis-service";

export async function GET(request: NextRequest) {
  const mode = parseRankingMode(request.nextUrl.searchParams.get("mode"));
  const result = await getGroupsAnalysis(mode);

  return NextResponse.json({
    ...result,
    mode,
  });
}
