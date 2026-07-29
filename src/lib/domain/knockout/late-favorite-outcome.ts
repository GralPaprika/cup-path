import type { KnockoutFixtureEntry } from "@/lib/types";
import {
  resolveFavoriteOutcomeKind,
  type PaperFavoriteOutcomeKind,
} from "@/lib/domain/match/paper-favorite";

export type LateFavoriteOutcomeKind = PaperFavoriteOutcomeKind;

export interface LateFavoriteOutcome {
  kind: LateFavoriteOutcomeKind;
  favoriteTeamId: string | null;
  underdogTeamId: string | null;
}

/**
 * Favorite outcome for late KO spotlight UI.
 * Close gap (≤ 100) with a paper edge → "slight"; equal/missing → "even";
 * clear gap → held / upset. Uses fixture fields from buildKnockoutFixture.
 */
export function resolveLateFavoriteOutcome(
  fixture: Pick<
    KnockoutFixtureEntry,
    "team1" | "team2" | "favoriteTeamId" | "upsetWin" | "gapPoints"
  >,
): LateFavoriteOutcome {
  const { favoriteTeamId } = fixture;

  if (favoriteTeamId === null) {
    return {
      kind: "even",
      favoriteTeamId: null,
      underdogTeamId: null,
    };
  }

  const underdogTeamId =
    favoriteTeamId === fixture.team1.id ? fixture.team2.id : fixture.team1.id;

  return {
    kind: resolveFavoriteOutcomeKind(
      favoriteTeamId,
      fixture.upsetWin,
      fixture.gapPoints,
    ),
    favoriteTeamId,
    underdogTeamId,
  };
}
