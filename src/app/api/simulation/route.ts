import { NextRequest, NextResponse } from "next/server";
import { parseRankingMode } from "@/lib/data/ranking-modes";
import type { SimulationScenario } from "@/lib/types";
import { getSimulationAnalysis } from "@/lib/services/simulation-service";

function parseScenario(raw: string | null): SimulationScenario {
  if (!raw) return { knockoutWinners: {}, slotOverrides: {} };
  try {
    const parsed = JSON.parse(raw) as SimulationScenario;
    return {
      knockoutWinners: parsed.knockoutWinners ?? {},
      slotOverrides: parsed.slotOverrides ?? {},
      groupFinishes: parsed.groupFinishes,
    };
  } catch {
    return { knockoutWinners: {}, slotOverrides: {} };
  }
}

export async function GET(request: NextRequest) {
  const teamId = request.nextUrl.searchParams.get("team");
  const mode = parseRankingMode(request.nextUrl.searchParams.get("mode"));
  const scenario = parseScenario(request.nextUrl.searchParams.get("scenario"));

  if (!teamId) {
    return NextResponse.json(
      { error: "team parameter is required" },
      { status: 400 },
    );
  }

  const result = await getSimulationAnalysis(
    teamId.toUpperCase(),
    mode,
    scenario,
  );

  if (!result) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  return NextResponse.json(result);
}
