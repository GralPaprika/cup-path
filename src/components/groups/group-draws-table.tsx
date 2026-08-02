"use client";

import type { GroupExpectedMatchEntry } from "@/lib/types";
import { GroupGapMatchesTable } from "@/components/groups/group-gap-matches-table";
import { OVERVIEW_SORT_GROUP_DRAWS_KEY } from "@/lib/client/overview-ui-preference";
import { useTranslations } from "next-intl";

interface GroupDrawsTableProps {
  drawMatches: GroupExpectedMatchEntry[];
  meanGap: number | null;
}

function isAboveMeanGap(gapPoints: number, meanGap: number | null): boolean {
  return meanGap !== null && gapPoints > meanGap;
}

export function GroupDrawsTable({
  drawMatches,
  meanGap,
}: GroupDrawsTableProps) {
  const t = useTranslations("home.groupExpectedFinishes");

  return (
    <GroupGapMatchesTable
      matches={drawMatches}
      sortStorageKey={OVERVIEW_SORT_GROUP_DRAWS_KEY}
      defaultSort="desc"
      outlierColumnLabel={t("drawsColumnOutlier")}
      getHighlightClassName={(entry) =>
        isAboveMeanGap(entry.gapPoints, meanGap)
          ? "bg-wc-turquoise/10"
          : undefined
      }
      getBadgeLabel={(entry) =>
        entry.isDrawGapOutlier ? t("outlierDraw") : null
      }
      footer={({ filteredRows }) =>
        meanGap !== null &&
        filteredRows.some((entry) =>
          isAboveMeanGap(entry.gapPoints, meanGap),
        ) ? (
          <p className="text-xs text-muted-foreground">
            {t("drawsTableAboveMeanHint")}
          </p>
        ) : null
      }
    />
  );
}
