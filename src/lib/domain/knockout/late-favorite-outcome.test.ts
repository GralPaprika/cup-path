import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveLateFavoriteOutcome } from "@/lib/domain/knockout/late-favorite-outcome";
import {
  hasClearFavorite,
  isUpsetWin,
  resolvePaperFavorite,
} from "@/lib/domain/match/paper-favorite";
import type { KnockoutFixtureEntry, Team } from "@/lib/types";

function team(id: string): Team {
  return {
    id,
    displayName: id,
    aliases: [],
    group: "A",
    flagUrl: "",
    confederation: "UEFA",
  };
}

function fixture(
  overrides: Partial<KnockoutFixtureEntry> &
    Pick<
      KnockoutFixtureEntry,
      "team1FifaPoints" | "team2FifaPoints" | "winnerTeamId"
    >,
): KnockoutFixtureEntry {
  const team1 = overrides.team1 ?? team("FRA");
  const team2 = overrides.team2 ?? team("ESP");
  const paper = resolvePaperFavorite(
    team1.id,
    team2.id,
    overrides.team1FifaPoints,
    overrides.team2FifaPoints,
  );
  const upsetWin =
    overrides.upsetWin ??
    (hasClearFavorite(paper.gapPoints) &&
      isUpsetWin(paper.favoriteTeamId, overrides.winnerTeamId));

  return {
    matchNum: 101,
    date: "2026-07-14",
    team1,
    team2,
    gapPoints: paper.gapPoints,
    scoreFt: "0-2",
    scoreEt: null,
    scorePens: null,
    favoriteTeamId: paper.favoriteTeamId,
    isEqualRating: paper.isEqualRating,
    isGapOutlier: false,
    upsetWin,
    ...overrides,
  };
}

describe("resolveLateFavoriteOutcome", () => {
  it("marks favorite held when a clear favorite wins", () => {
    const outcome = resolveLateFavoriteOutcome(
      fixture({
        team1FifaPoints: 1700,
        team2FifaPoints: 1875,
        winnerTeamId: "ESP",
      }),
    );

    assert.equal(outcome.kind, "held");
    assert.equal(outcome.favoriteTeamId, "ESP");
    assert.equal(outcome.underdogTeamId, "FRA");
  });

  it("marks upset when a clear underdog wins", () => {
    const outcome = resolveLateFavoriteOutcome(
      fixture({
        team1: team("ENG"),
        team2: team("ARG"),
        team1FifaPoints: 1700,
        team2FifaPoints: 1877,
        winnerTeamId: "ENG",
      }),
    );

    assert.equal(outcome.kind, "upset");
    assert.equal(outcome.favoriteTeamId, "ARG");
    assert.equal(outcome.underdogTeamId, "ENG");
  });

  it("marks even when FIFA points are equal or missing", () => {
    assert.equal(
      resolveLateFavoriteOutcome(
        fixture({
          team1FifaPoints: 1800,
          team2FifaPoints: 1800,
          winnerTeamId: "FRA",
        }),
      ).kind,
      "even",
    );
    assert.equal(
      resolveLateFavoriteOutcome(
        fixture({
          team1FifaPoints: null,
          team2FifaPoints: 1800,
          winnerTeamId: "FRA",
        }),
      ).kind,
      "even",
    );
  });

  it("marks slight favorite for close-gap ties (no Upset / Sorpresa)", () => {
    const outcome = resolveLateFavoriteOutcome(
      fixture({
        team1: team("ESP"),
        team2: team("ARG"),
        team1FifaPoints: 1874.71,
        team2FifaPoints: 1877.27,
        winnerTeamId: "ESP",
      }),
    );

    assert.equal(outcome.kind, "slight");
    assert.equal(outcome.favoriteTeamId, "ARG");
    assert.equal(outcome.underdogTeamId, "ESP");
  });
});
