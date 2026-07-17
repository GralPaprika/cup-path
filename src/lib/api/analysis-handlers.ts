import { parseRankingMode } from "@/lib/data/ranking-modes";
import {
  parsePathStages,
  parseTeamRound,
  syncTeamRoundToStages,
} from "@/lib/domain/match/match-stages";
import type { PathStage, RankingMode } from "@/lib/types";

interface AnalysisRequestBody {
  team?: string;
  mode?: string;
  stages?: string;
}

interface ComparisonRequestBody {
  mode?: string;
  team?: string;
  vs?: string;
  stages?: string;
  teamRound?: string;
}

type TeamAnalysisLoader = (
  teamId: string,
  mode: RankingMode,
  stages: Set<PathStage>,
) => Promise<object | null>;

type ComparisonAnalysisLoader = (
  mode: RankingMode,
  selectedTeamId: string | undefined,
  stages: Set<PathStage>,
  teamRound: PathStage,
  compareTeamId: string | undefined,
) => Promise<object>;

async function readJsonObject(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await request.json();
    return body !== null && typeof body === "object" && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

export async function handleAnalysisRequest(
  request: Request,
  getTeamAnalysis: TeamAnalysisLoader,
): Promise<Response> {
  const rawBody = await readJsonObject(request);
  if (!rawBody) {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const body = rawBody as AnalysisRequestBody;
  const teamId = typeof body.team === "string" ? body.team : undefined;
  const mode = parseRankingMode(typeof body.mode === "string" ? body.mode : null);
  const stages = parsePathStages(
    typeof body.stages === "string" ? body.stages : null,
  );

  if (!teamId) {
    return Response.json({ error: "team is required" }, { status: 400 });
  }

  const analysis = await getTeamAnalysis(teamId.toUpperCase(), mode, stages);
  if (!analysis) {
    return Response.json({ error: "Team not found" }, { status: 404 });
  }

  return Response.json(analysis);
}

export async function handleComparisonRequest(
  request: Request,
  getComparisonAnalysis: ComparisonAnalysisLoader,
): Promise<Response> {
  const rawBody = await readJsonObject(request);
  if (!rawBody) {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const body = rawBody as ComparisonRequestBody;
  const mode = parseRankingMode(typeof body.mode === "string" ? body.mode : null);
  const selectedTeamId =
    typeof body.team === "string" ? body.team.toUpperCase() : undefined;
  const compareTeamId =
    typeof body.vs === "string" ? body.vs.toUpperCase() : undefined;
  const stages = parsePathStages(
    typeof body.stages === "string" ? body.stages : null,
  );
  const teamRound = syncTeamRoundToStages(
    parseTeamRound(typeof body.teamRound === "string" ? body.teamRound : null),
    stages,
  );
  const result = await getComparisonAnalysis(
    mode,
    selectedTeamId,
    stages,
    teamRound,
    compareTeamId,
  );

  return Response.json({
    ...result,
    mode,
    teamRound,
  });
}
