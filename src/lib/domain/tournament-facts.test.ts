import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { applyWorldCupBundle } from "@/lib/data/worldcup-loader";
import { buildAllTeamSummaries } from "@/lib/domain/difficulty";
import { PATH_STAGES } from "@/lib/domain/match-stages";
import {
  groupAMatchesComplete,
  groupBMatchesComplete,
  rankingEntry,
  restoreBundledWorldCup,
} from "@/lib/domain/test-fixtures";
import { getTeamCountsByStage } from "@/lib/domain/team-stage-logic";
import { buildTournamentFacts } from "@/lib/domain/tournament-facts";
import type { TeamPathSummary } from "@/lib/types";

afterEach(() => {
  restoreBundledWorldCup();
});

function rankingsMap(
  entries: Array<{ id: string; rank: number; points: number }>,
): Map<string, ReturnType<typeof rankingEntry>> {
  return new Map(
    entries.map(({ id, rank, points }) => [id, rankingEntry(id, rank, points)]),
  );
}

describe("buildTournamentFacts", () => {
  it("builds cohort rows for every stage with team counts", () => {
    applyWorldCupBundle({
      name: "test",
      matches: [...groupAMatchesComplete(), ...groupBMatchesComplete()],
    });

    const rankings = rankingsMap([
      { id: "MEX", rank: 14, points: 1670 },
      { id: "CZE", rank: 22, points: 1590 },
      { id: "KOR", rank: 23, points: 1580 },
      { id: "RSA", rank: 60, points: 1400 },
    ]);
    const summaries = buildAllTeamSummaries(rankings);
    const teamCounts = getTeamCountsByStage();

    const facts = buildTournamentFacts(summaries, rankings, teamCounts);

    assert.ok(facts.groupStagePool.teamCount >= 48);
    assert.ok(facts.groupStagePool.avgFifaPoints !== null);
    assert.ok(facts.groupStagePool.medianFifaRank !== null);
    assert.ok(facts.groupStagePool.avgGroupRivalDifficulty !== null);
    assert.ok(facts.snapshot.avgFifaPoints !== null);
    assert.ok(facts.snapshot.medianFifaRank !== null);
  });

  it("picks the biggest giant-killing win by positive points gap", () => {
    const summaries: TeamPathSummary[] = [
      {
        team: {
          id: "AAA",
          displayName: "Team A",
          aliases: [],
          group: "A",
          flagUrl: "",
          confederation: "UEFA",
        },
        teamRank: 30,
        teamPoints: 1500,
        matches: [
          {
            round: "Matchday 1",
            date: "2026-06-11",
            opponent: {
              id: "BBB",
              displayName: "Team B",
              aliases: [],
              group: "A",
              flagUrl: "",
              confederation: "UEFA",
            },
            opponentRank: 5,
            opponentPoints: 1900,
            teamRank: 30,
            teamPoints: 1500,
            rankGap: -25,
            pointsGap: 400,
            result: "W",
            scoreLabel: "2-1",
            isNext: false,
            isPlayed: true,
          },
        ],
        avgOpponentPoints: 1900,
        avgOpponentRank: 5,
        isEliminated: false,
        nextOpponent: null,
        playedCount: 1,
        totalCount: 1,
      },
    ];

    const rankings = rankingsMap([
      { id: "AAA", rank: 30, points: 1500 },
      { id: "BBB", rank: 5, points: 1900 },
    ]);
    const teamCounts = Object.fromEntries(
      PATH_STAGES.map((stage) => [stage, 48]),
    ) as Record<(typeof PATH_STAGES)[number], number>;

    const facts = buildTournamentFacts(summaries, rankings, teamCounts);

    assert.equal(facts.highlights.biggestGiantKilling?.team.id, "AAA");
    assert.equal(facts.highlights.biggestGiantKilling?.pointsGap, 400);
    assert.equal(facts.highlights.giantKillerLeader?.team.id, "AAA");
    assert.equal(facts.highlights.giantKillerLeader?.value, 400);
  });

  it("marks over- and under-performers by stage delta vs seed", () => {
    applyWorldCupBundle({
      name: "test",
      matches: [...groupAMatchesComplete(), ...groupBMatchesComplete()],
    });

    const rankings = rankingsMap([
      { id: "MEX", rank: 2, points: 1830 },
      { id: "KOR", rank: 40, points: 1450 },
    ]);
    const summaries = buildAllTeamSummaries(rankings);
    const teamCounts = getTeamCountsByStage();
    const facts = buildTournamentFacts(summaries, rankings, teamCounts);

    if (facts.highlights.overPerformer) {
      assert.ok(facts.highlights.overPerformer.value > 0);
    }
    if (facts.highlights.underPerformer) {
      assert.ok(facts.highlights.underPerformer.value < 0);
    }
  });
});
