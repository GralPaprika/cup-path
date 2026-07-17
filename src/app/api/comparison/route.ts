import type { NextRequest } from "next/server";
import { handleComparisonRequest } from "@/lib/api/analysis-handlers";
import { getComparisonAnalysis } from "@/lib/services/analysis-service";

export async function POST(request: NextRequest) {
  return handleComparisonRequest(request, getComparisonAnalysis);
}
