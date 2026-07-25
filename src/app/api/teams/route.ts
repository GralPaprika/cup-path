import { NextRequest, NextResponse } from "next/server";
import { resolveRankingMode } from "@/lib/api/ranking-mode";
import { getAllTeamsEnriched } from "@/lib/data/team-registry";

export async function GET(request: NextRequest) {
  const mode = resolveRankingMode(request, request.nextUrl.searchParams.get("mode"));
  const teams = await getAllTeamsEnriched(mode);
  return NextResponse.json({ teams });
}
