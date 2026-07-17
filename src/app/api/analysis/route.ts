import type { NextRequest } from "next/server";
import { handleAnalysisRequest } from "@/lib/api/analysis-handlers";
import { getTeamAnalysis } from "@/lib/services/analysis-service";

export async function POST(request: NextRequest) {
  return handleAnalysisRequest(request, getTeamAnalysis);
}
