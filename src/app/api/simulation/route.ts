import { NextRequest, NextResponse } from "next/server";
import { parseRankingMode } from "@/lib/data/ranking-modes";
import { emptySimulationScenario } from "@/lib/domain/simulation-scenario";
import { getSimulationAnalysis } from "@/lib/services/simulation-service";
import type { SimulationScenario } from "@/lib/types";

interface SimulationRequestBody {
  team?: string;
  compareTeam?: string;
  mode?: string;
  scenario?: SimulationScenario;
}

export async function POST(request: NextRequest) {
  let body: SimulationRequestBody;
  try {
    body = (await request.json()) as SimulationRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const teamId = body.team;
  const comparisonTeamId = body.compareTeam;
  const mode = parseRankingMode(body.mode ?? null);
  const scenario = body.scenario ?? emptySimulationScenario();

  if (!teamId) {
    return NextResponse.json(
      { error: "team is required" },
      { status: 400 },
    );
  }

  const result = await getSimulationAnalysis(
    teamId.toUpperCase(),
    mode,
    {
      knockoutWinners: scenario.knockoutWinners ?? {},
      slotOverrides: scenario.slotOverrides ?? {},
      groupFinishes: scenario.groupFinishes,
    },
    comparisonTeamId?.toUpperCase(),
  );

  if (!result) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  return NextResponse.json(result);
}
