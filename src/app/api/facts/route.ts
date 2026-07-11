import { NextRequest, NextResponse } from "next/server";
import { parseRankingMode } from "@/lib/data/ranking-modes";
import { getTournamentFacts } from "@/lib/services/facts-service";

export async function GET(request: NextRequest) {
  const mode = parseRankingMode(request.nextUrl.searchParams.get("mode"));
  const facts = await getTournamentFacts(mode);

  return NextResponse.json({ mode, ...facts });
}
