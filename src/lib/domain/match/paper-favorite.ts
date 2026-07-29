export type PaperFavoriteOutcomeKind = "held" | "upset" | "slight" | "even";

/**
 * Gaps at or below this are close-gap: slight favorite only (no Upset /
 * Sorpresa). Aligns with MATCH_OUTCOME_GAP_BINS `"0-100"`.
 */
export const CLOSE_GAP_MAX_POINTS = 100;

export interface PaperFavorite {
  favoriteTeamId: string | null;
  underdogTeamId: string | null;
  isEqualRating: boolean;
  gapPoints: number;
}

/**
 * Rating-based paper favorite = higher FIFA points when both sides differ.
 * Equal or missing points ⇒ no favorite. Any positive gap (including under
 * 100) still has a favorite.
 */
export function resolvePaperFavorite(
  team1Id: string,
  team2Id: string,
  team1Points: number | null,
  team2Points: number | null,
): PaperFavorite {
  if (team1Points === null || team2Points === null) {
    return {
      favoriteTeamId: null,
      underdogTeamId: null,
      isEqualRating: false,
      gapPoints: 0,
    };
  }

  if (team1Points === team2Points) {
    return {
      favoriteTeamId: null,
      underdogTeamId: null,
      isEqualRating: true,
      gapPoints: 0,
    };
  }

  if (team1Points > team2Points) {
    return {
      favoriteTeamId: team1Id,
      underdogTeamId: team2Id,
      isEqualRating: false,
      gapPoints: team1Points - team2Points,
    };
  }

  return {
    favoriteTeamId: team2Id,
    underdogTeamId: team1Id,
    isEqualRating: false,
    gapPoints: team2Points - team1Points,
  };
}

/** True when the gap is wide enough for clear Fav / held / upset labels. */
export function hasClearFavorite(gapPoints: number): boolean {
  return gapPoints > CLOSE_GAP_MAX_POINTS;
}

export function isUpsetWin(
  favoriteTeamId: string | null,
  winnerTeamId: string,
): boolean {
  return favoriteTeamId !== null && winnerTeamId !== favoriteTeamId;
}

/** Underdog win only counts as Upset/Sorpresa when the gap is clear (> 100). */
export function isClearUpsetWin(
  favoriteTeamId: string | null,
  winnerTeamId: string,
  gapPoints: number,
): boolean {
  return (
    hasClearFavorite(gapPoints) && isUpsetWin(favoriteTeamId, winnerTeamId)
  );
}

/** Paper edge with a close gap — slight favorite, not a clear Fav / Upset. */
export function isSlightFavoriteGap(
  favoriteTeamId: string | null,
  gapPoints: number,
): boolean {
  return (
    favoriteTeamId !== null &&
    gapPoints > 0 &&
    !hasClearFavorite(gapPoints)
  );
}

/**
 * Late / KO label kind:
 * - even: no paper favorite (equal or missing points)
 * - slight: paper favorite with close gap (≤ {@link CLOSE_GAP_MAX_POINTS})
 * - held / upset: clear favorite (gap > 100) won / lost
 */
export function resolveFavoriteOutcomeKind(
  favoriteTeamId: string | null,
  upsetWin: boolean,
  gapPoints: number,
): PaperFavoriteOutcomeKind {
  if (favoriteTeamId === null) return "even";
  if (!hasClearFavorite(gapPoints)) return "slight";
  return upsetWin ? "upset" : "held";
}
