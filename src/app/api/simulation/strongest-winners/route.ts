import { NextRequest, NextResponse } from "next/server";
import { resolveRankingMode } from "@/lib/api/ranking-mode";
import { emptySimulationScenario } from "@/lib/domain/core/simulation-scenario";
import {
  buildStrongestKnockoutWinners,
  type StrongestWinnerScope,
} from "@/lib/domain/core/strongest-path-winners";
import { getSimulationStrongestWinnersContext } from "@/lib/services/simulation-service";
import type { SimulationScenario } from "@/lib/types";

interface StrongestWinnersRequestBody {
  mode?: string;
  scenario?: SimulationScenario;
  scope?: StrongestWinnerScope;
}

function parseScope(raw: string | undefined): StrongestWinnerScope {
  return raw === "simulated" ? "simulated" : "all";
}

export async function POST(request: NextRequest) {
  let body: StrongestWinnersRequestBody;
  try {
    body = (await request.json()) as StrongestWinnersRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const mode = resolveRankingMode(request, body.mode);
  const scenario = body.scenario ?? emptySimulationScenario();
  const scope = parseScope(body.scope);
  const context = await getSimulationStrongestWinnersContext(scenario, mode);

  const knockoutWinners = buildStrongestKnockoutWinners(
    context.ctx,
    context.effectiveScenario,
    context.actualWinnersByMatchNum,
    context.teamRankings,
    context.suppressPlayedResultsMatchNums,
    scenario.knockoutWinners,
    scope,
  );

  if (!knockoutWinners) {
    return NextResponse.json({ knockoutWinners: null });
  }

  return NextResponse.json({ knockoutWinners });
}
