"use client";

import type { GroupExpectedMatchEntry } from "@/lib/types";
import { GroupGapMatchesTable } from "@/components/groups/group-gap-matches-table";
import { OVERVIEW_SORT_GROUP_WIN_LOSS_KEY } from "@/lib/client/overview-ui-preference";
import { useTranslations } from "next-intl";

interface GroupWinLossTableProps {
  winLossMatches: GroupExpectedMatchEntry[];
}

export function GroupWinLossTable({
  winLossMatches,
}: GroupWinLossTableProps) {
  const t = useTranslations("home.groupExpectedFinishes");

  return (
    <GroupGapMatchesTable
      matches={winLossMatches}
      sortStorageKey={OVERVIEW_SORT_GROUP_WIN_LOSS_KEY}
      defaultSort="asc"
      outlierColumnLabel={t("winLossColumnUpset")}
      getHighlightClassName={(entry) =>
        entry.upsetWin ? "bg-wc-orange/10" : undefined
      }
      getBadgeLabel={(entry) =>
        entry.isWinLossGapOutlier ? t("upsetWinBadge") : null
      }
      footer={({ filteredRows }) => (
        <div className="space-y-1">
          {filteredRows.some((entry) => entry.upsetWin) && (
            <p className="text-xs text-muted-foreground">
              {t("winLossTableUnderdogHint")}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {t("winLossTableUpsetHint")}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("winLossTableGapHint")}
          </p>
        </div>
      )}
    />
  );
}
