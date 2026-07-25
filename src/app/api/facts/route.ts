import { NextRequest, NextResponse } from "next/server";
import { resolveRankingMode } from "@/lib/api/ranking-mode";
import { getTournamentFacts } from "@/lib/services/facts-service";

export async function GET(request: NextRequest) {
  const mode = resolveRankingMode(request, request.nextUrl.searchParams.get("mode"));
  const facts = await getTournamentFacts(mode);

  return NextResponse.json({ mode, ...facts });
}
