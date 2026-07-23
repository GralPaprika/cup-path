import { NextRequest, NextResponse } from "next/server";
import { RANKING_MODE_COOKIE } from "@/lib/client/ranking-mode-preference";
import { parseRankingMode } from "@/lib/data/ranking-modes";
import { getAllTeamsEnriched } from "@/lib/data/team-registry";

export async function GET(request: NextRequest) {
  const mode = parseRankingMode(
    request.cookies.get(RANKING_MODE_COOKIE)?.value ?? null,
  );
  const teams = await getAllTeamsEnriched(mode);
  return NextResponse.json({ teams });
}
