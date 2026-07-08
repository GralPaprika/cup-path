import { NextRequest, NextResponse } from "next/server";
import type { RankingMode } from "@/lib/types";
import { analyzeAllTeams, buildComparison } from "@/lib/domain/difficulty";

const VALID_MODES: RankingMode[] = ["yearStart", "tournamentStart", "live"];

function parseMode(value: string | null): RankingMode {
  if (value && VALID_MODES.includes(value as RankingMode)) {
    return value as RankingMode;
  }
  return "live";
}

export async function GET(request: NextRequest) {
  const mode = parseMode(request.nextUrl.searchParams.get("mode"));
  const selectedTeamId = request.nextUrl.searchParams.get("team")?.toUpperCase();

  const summaries = await analyzeAllTeams(mode, selectedTeamId);
  const comparison = buildComparison(summaries, selectedTeamId);

  return NextResponse.json({ comparison, mode });
}
