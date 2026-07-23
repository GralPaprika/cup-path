import { NextRequest, NextResponse } from "next/server";
import { RANKING_MODE_COOKIE } from "@/lib/client/ranking-mode-preference";
import { parseRankingMode } from "@/lib/data/ranking-modes";
import { getGroupsAnalysis } from "@/lib/services/analysis-service";

export async function GET(request: NextRequest) {
  const mode = parseRankingMode(
    request.cookies.get(RANKING_MODE_COOKIE)?.value ?? null,
  );
  const result = await getGroupsAnalysis(mode);

  return NextResponse.json({
    ...result,
    mode,
  });
}
