import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  handleAnalysisRequest,
  handleComparisonRequest,
} from "@/lib/api/analysis-handlers";
import type { PathStage, RankingMode } from "@/lib/types";

function jsonRequest(body: unknown): Request {
  return new Request("http://localhost/api/test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("analysis API handler", () => {
  it("rejects malformed JSON bodies", async () => {
    const request = new Request("http://localhost/api/analysis", {
      method: "POST",
      body: "{",
    });

    const response = await handleAnalysisRequest(request, async () => ({}));

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { error: "Invalid JSON body" });
  });

  it("requires a team", async () => {
    const response = await handleAnalysisRequest(
      jsonRequest({ mode: "june11" }),
      async () => ({}),
    );

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { error: "team is required" });
  });

  it("normalizes body parameters and returns the analysis", async () => {
    let received:
      | { teamId: string; mode: RankingMode; stages: PathStage[] }
      | undefined;
    const expected = { summary: { team: { id: "ALG" } } };

    const response = await handleAnalysisRequest(
      jsonRequest({
        team: "alg",
        mode: "june11",
        stages: "group,r32,invalid",
      }),
      async (teamId, mode, stages) => {
        received = { teamId, mode, stages: [...stages] };
        return expected;
      },
    );

    assert.equal(response.status, 200);
    assert.deepEqual(received, {
      teamId: "ALG",
      mode: "june11",
      stages: ["group", "r32"],
    });
    assert.deepEqual(await response.json(), expected);
  });

  it("returns 404 when the team is unknown", async () => {
    const response = await handleAnalysisRequest(
      jsonRequest({ team: "unknown" }),
      async () => null,
    );

    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), { error: "Team not found" });
  });
});

describe("comparison API handler", () => {
  it("rejects non-object JSON bodies", async () => {
    const response = await handleComparisonRequest(
      jsonRequest(null),
      async () => ({}),
    );

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { error: "Invalid JSON body" });
  });

  it("normalizes teams and constrains the round to selected stages", async () => {
    let received:
      | {
          mode: RankingMode;
          selectedTeamId: string | undefined;
          stages: PathStage[];
          teamRound: PathStage;
          compareTeamId: string | undefined;
        }
      | undefined;
    const result = { comparison: [], cohortSize: 32 };

    const response = await handleComparisonRequest(
      jsonRequest({
        mode: "june11",
        team: "alg",
        vs: "aus",
        stages: "group,r32",
        teamRound: "final",
      }),
      async (mode, selectedTeamId, stages, teamRound, compareTeamId) => {
        received = {
          mode,
          selectedTeamId,
          stages: [...stages],
          teamRound,
          compareTeamId,
        };
        return result;
      },
    );

    assert.equal(response.status, 200);
    assert.deepEqual(received, {
      mode: "june11",
      selectedTeamId: "ALG",
      stages: ["group", "r32"],
      teamRound: "r32",
      compareTeamId: "AUS",
    });
    assert.deepEqual(await response.json(), {
      ...result,
      mode: "june11",
      teamRound: "r32",
    });
  });

  it("uses API defaults for omitted filters", async () => {
    let received:
      | { mode: RankingMode; stages: PathStage[]; teamRound: PathStage }
      | undefined;

    const response = await handleComparisonRequest(
      jsonRequest({}),
      async (mode, _selectedTeamId, stages, teamRound) => {
        received = { mode, stages: [...stages], teamRound };
        return { comparison: [] };
      },
    );

    assert.equal(response.status, 200);
    assert.deepEqual(received, {
      mode: "live",
      stages: ["group"],
      teamRound: "group",
    });
  });
});
