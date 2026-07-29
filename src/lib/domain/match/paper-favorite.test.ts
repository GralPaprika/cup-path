import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CLOSE_GAP_MAX_POINTS,
  hasClearFavorite,
  isClearUpsetWin,
  isSlightFavoriteGap,
  isUpsetWin,
  resolveFavoriteOutcomeKind,
  resolvePaperFavorite,
} from "@/lib/domain/match/paper-favorite";

describe("resolvePaperFavorite", () => {
  it("picks the higher-rated side as favorite", () => {
    const result = resolvePaperFavorite("FRA", "ESP", 1870, 1875);

    assert.equal(result.favoriteTeamId, "ESP");
    assert.equal(result.underdogTeamId, "FRA");
    assert.equal(result.isEqualRating, false);
    assert.equal(result.gapPoints, 5);
  });

  it("keeps a rating favorite for small gaps under 100", () => {
    const result = resolvePaperFavorite("ENG", "ARG", 1828, 1877);

    assert.equal(result.favoriteTeamId, "ARG");
    assert.equal(result.underdogTeamId, "ENG");
    assert.equal(result.isEqualRating, false);
    assert.equal(result.gapPoints, 49);
  });

  it("marks equal points as even with no favorite", () => {
    const result = resolvePaperFavorite("FRA", "ESP", 1800, 1800);

    assert.equal(result.favoriteTeamId, null);
    assert.equal(result.underdogTeamId, null);
    assert.equal(result.isEqualRating, true);
    assert.equal(result.gapPoints, 0);
  });

  it("marks missing points as even with no favorite", () => {
    assert.deepEqual(resolvePaperFavorite("FRA", "ESP", null, 1800), {
      favoriteTeamId: null,
      underdogTeamId: null,
      isEqualRating: false,
      gapPoints: 0,
    });
    assert.deepEqual(resolvePaperFavorite("FRA", "ESP", 1800, null), {
      favoriteTeamId: null,
      underdogTeamId: null,
      isEqualRating: false,
      gapPoints: 0,
    });
  });
});

describe("hasClearFavorite", () => {
  it("is false at or below the close-gap max", () => {
    assert.equal(hasClearFavorite(0), false);
    assert.equal(hasClearFavorite(2.56), false);
    assert.equal(hasClearFavorite(CLOSE_GAP_MAX_POINTS), false);
  });

  it("is true above the close-gap max", () => {
    assert.equal(hasClearFavorite(CLOSE_GAP_MAX_POINTS + 1), true);
    assert.equal(hasClearFavorite(177), true);
  });
});

describe("isUpsetWin", () => {
  it("is true when the underdog wins", () => {
    assert.equal(isUpsetWin("ARG", "ENG"), true);
  });

  it("is false when the favorite wins or there is no favorite", () => {
    assert.equal(isUpsetWin("ARG", "ARG"), false);
    assert.equal(isUpsetWin(null, "ENG"), false);
  });
});

describe("isClearUpsetWin", () => {
  it("requires a clear gap", () => {
    assert.equal(isClearUpsetWin("ARG", "ENG", 177), true);
    assert.equal(isClearUpsetWin("ARG", "ENG", 49), false);
    assert.equal(isClearUpsetWin("ARG", "ARG", 177), false);
    assert.equal(isClearUpsetWin(null, "ENG", 177), false);
  });
});

describe("isSlightFavoriteGap", () => {
  it("is true for paper favorites inside the close-gap band", () => {
    assert.equal(isSlightFavoriteGap("ARG", 2.56), true);
    assert.equal(isSlightFavoriteGap("ARG", CLOSE_GAP_MAX_POINTS), true);
    assert.equal(isSlightFavoriteGap("ARG", 101), false);
    assert.equal(isSlightFavoriteGap(null, 50), false);
    assert.equal(isSlightFavoriteGap("ARG", 0), false);
  });
});

describe("resolveFavoriteOutcomeKind", () => {
  it("maps clear favorites to held or upset", () => {
    assert.equal(resolveFavoriteOutcomeKind("ESP", false, 175), "held");
    assert.equal(resolveFavoriteOutcomeKind("ARG", true, 177), "upset");
  });

  it("maps close-gap paper favorites to slight", () => {
    assert.equal(resolveFavoriteOutcomeKind("ARG", false, 2.56), "slight");
    assert.equal(resolveFavoriteOutcomeKind("ARG", true, 49), "slight");
    assert.equal(
      resolveFavoriteOutcomeKind("A", true, CLOSE_GAP_MAX_POINTS),
      "slight",
    );
  });

  it("maps missing favorites to even", () => {
    assert.equal(resolveFavoriteOutcomeKind(null, false, 0), "even");
    assert.equal(resolveFavoriteOutcomeKind(null, true, 50), "even");
  });
});
