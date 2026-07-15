"use client";

import { useCallback, useMemo } from "react";
import type { GapChartPoint } from "@/components/facts/gap-distribution-chart";
import { MatchOutcomeGapMatchTooltip } from "@/components/facts/match-outcome-gap-match-tooltip";
import {
  groupMatchPointId,
  toGapMatchTooltipEntry,
} from "@/components/groups/group-gap-match-tooltip";
import type { GroupExpectedMatchEntry } from "@/lib/types";
import { useTranslations } from "next-intl";

type OutlierMode = "draw" | "winLoss";

function isOutlierForMode(
  entry: GroupExpectedMatchEntry,
  mode: OutlierMode,
): boolean {
  return mode === "draw" ? entry.isDrawGapOutlier : entry.isWinLossGapOutlier;
}

export function useGroupGapMatchTooltip(
  matches: GroupExpectedMatchEntry[],
  mode: OutlierMode,
) {
  const t = useTranslations("home.groupExpectedFinishes");
  const outcome = useTranslations("home.matchOutcomeGap");

  const entriesById = useMemo(() => {
    const map = new Map<string, GroupExpectedMatchEntry>();
    for (const entry of matches) {
      map.set(groupMatchPointId(entry), entry);
    }
    return map;
  }, [matches]);

  return useCallback(
    (point: GapChartPoint) => {
      const entry = entriesById.get(point.id);
      if (!entry) return null;

      return (
        <MatchOutcomeGapMatchTooltip
          entry={toGapMatchTooltipEntry(entry, isOutlierForMode(entry, mode))}
          roundLabel={t("groupLabel", { letter: entry.groupLetter })}
          favoriteWinLabel={outcome("favoriteWin")}
          drawLabel={outcome("draw")}
          upsetLabel={outcome("upset")}
          gapLabel={outcome("tooltipGap")}
          favoriteLabel={outcome("tooltipFavorite")}
          evenlyMatchedLabel={outcome("tooltipEvenlyMatched")}
          outlierLabel={outcome("outlier")}
        />
      );
    },
    [entriesById, mode, outcome, t],
  );
}
