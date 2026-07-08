import { NextRequest, NextResponse } from "next/server";
import type { RankingMode } from "@/lib/types";
import {
  analyzeAllTeams,
  analyzeTeamPath,
  buildComparison,
  getHardestPathRank,
} from "@/lib/domain/difficulty";

const VALID_MODES: RankingMode[] = ["yearStart", "tournamentStart", "live"];

function parseMode(value: string | null): RankingMode {
  if (value && VALID_MODES.includes(value as RankingMode)) {
    return value as RankingMode;
  }
  return "live";
}

export async function GET(request: NextRequest) {
  const teamId = request.nextUrl.searchParams.get("team");
  const mode = parseMode(request.nextUrl.searchParams.get("mode"));

  if (!teamId) {
    return NextResponse.json({ error: "team parameter is required" }, { status: 400 });
  }

  const summary = await analyzeTeamPath(teamId.toUpperCase(), mode);
  if (!summary) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  const allSummaries = await analyzeAllTeams(mode, teamId.toUpperCase());

  return NextResponse.json({
    summary,
    hardestPathRank: getHardestPathRank(allSummaries, teamId.toUpperCase()),
    comparison: buildComparison(allSummaries, teamId.toUpperCase()),
  });
}
