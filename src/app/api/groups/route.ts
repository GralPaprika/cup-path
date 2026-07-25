import { NextRequest, NextResponse } from "next/server";
import { resolveRankingMode } from "@/lib/api/ranking-mode";
import { getGroupsAnalysis } from "@/lib/services/analysis-service";

export async function GET(request: NextRequest) {
  const mode = resolveRankingMode(request, request.nextUrl.searchParams.get("mode"));
  const result = await getGroupsAnalysis(mode);

  return NextResponse.json({
    ...result,
    mode,
  });
}
