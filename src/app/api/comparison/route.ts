import { NextRequest, NextResponse } from "next/server";
import {
  parsePathStages,
  parseTeamRound,
  syncTeamRoundToStages,
} from "@/lib/domain/match-stages";
import { getTeamCountsByStage } from "@/lib/domain/team-stages";
import { parseRankingMode } from "@/lib/data/ranking-modes";
import { getComparisonAnalysis } from "@/lib/services/analysis-service";

export async function GET(request: NextRequest) {
  const mode = parseRankingMode(request.nextUrl.searchParams.get("mode"));
  const selectedTeamId = request.nextUrl.searchParams.get("team")?.toUpperCase();
  const compareTeamId = request.nextUrl.searchParams.get("vs")?.toUpperCase();
  const stages = parsePathStages(request.nextUrl.searchParams.get("stages"));
  const teamRound = syncTeamRoundToStages(
    parseTeamRound(request.nextUrl.searchParams.get("teamRound")),
    stages,
  );
  const result = await getComparisonAnalysis(
    mode,
    selectedTeamId,
    stages,
    teamRound,
    compareTeamId,
  );
  const teamCounts = getTeamCountsByStage();

  return NextResponse.json({
    ...result,
    mode,
    teamRound,
    teamCounts,
  });
}
