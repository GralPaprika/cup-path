"use client";

import { useMemo } from "react";
import { ChevronDown } from "lucide-react";
import type { GroupComparisonCard } from "@/lib/types";
import {
  computeGroupStrengthOrdering,
  getGroupStrengthRank,
} from "@/lib/domain/group-strength-ordering";
import { useTranslations } from "next-intl";
import { formatStatValue } from "@/lib/format";
import { cn } from "@/lib/utils";

interface GroupsAdvancedPanelProps {
  groups: GroupComparisonCard[];
  selectedGroupLetter: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function CorrelationTile({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="glass-panel-subtle px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-mono text-xl font-bold tabular-nums text-white">
        {value}
      </p>
    </div>
  );
}

export function GroupsAdvancedPanel({
  groups,
  selectedGroupLetter,
  open,
  onOpenChange,
}: GroupsAdvancedPanelProps) {
  const t = useTranslations("groups.advanced");

  const ordering = useMemo(
    () => computeGroupStrengthOrdering(groups),
    [groups],
  );
  const selectedRank = getGroupStrengthRank(ordering, selectedGroupLetter);

  const formatCorrelation = (value: number | null) =>
    value === null ? "—" : formatStatValue(value, 3);

  return (
    <details
      className="glass-panel group overflow-hidden"
      open={open}
      onToggle={(event) => {
        onOpenChange(event.currentTarget.open);
      }}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 border-b border-white/8 bg-white/[0.03] px-5 py-4 marker:content-none [&::-webkit-details-marker]:hidden">
        <div>
          <h2 className="text-lg font-semibold text-white">{t("title")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <ChevronDown
          className={cn(
            "size-5 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </summary>

      <div className="space-y-5 px-5 py-5">
        <section>
          <h3 className="mb-1 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            {t("groupOrderingTitle")}
          </h3>
          <p className="mb-3 text-xs text-muted-foreground">
            {t("groupOrderingHint", { count: ordering.groupCount })}
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <CorrelationTile
              label={t("spearmanRho")}
              value={formatCorrelation(ordering.correlation.spearmanRho)}
            />
            <CorrelationTile
              label={t("kendallTau")}
              value={formatCorrelation(ordering.correlation.kendallTau)}
            />
            <CorrelationTile
              label={t("selectedRankByPoints", {
                group: selectedGroupLetter,
              })}
              value={
                selectedRank.byPoints !== null
                  ? t("rankValue", {
                      rank: selectedRank.byPoints,
                      total: ordering.groupCount,
                    })
                  : "—"
              }
            />
            <CorrelationTile
              label={t("selectedRankByAvgRank", {
                group: selectedGroupLetter,
              })}
              value={
                selectedRank.byAvgRank !== null
                  ? t("rankValue", {
                      rank: selectedRank.byAvgRank,
                      total: ordering.groupCount,
                    })
                  : "—"
              }
            />
          </div>
        </section>

        <div className="space-y-3 border-t border-white/8 pt-4 text-xs leading-relaxed text-muted-foreground">
          <p>{t("groupOrderingIntro")}</p>
          <p>{t("spearmanBody")}</p>
          <p>{t("kendallBody")}</p>
          <p>{t("footnotePrimary")}</p>
        </div>
      </div>
    </details>
  );
}
