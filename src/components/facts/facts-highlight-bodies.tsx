"use client";

import type { TeamHighlightFact, UpsetMatchFact } from "@/lib/types";
import { TeamLabel } from "@/components/team/team-flag";
import { useTranslations } from "next-intl";

export function formatStageDelta(
  delta: number,
  t: ReturnType<typeof useTranslations<"home">>,
): string {
  if (delta > 0) return t("highlights.stageDeltaPositive", { delta });
  if (delta < 0) {
    return t("highlights.stageDeltaNegative", { delta: Math.abs(delta) });
  }
  return "0";
}

export function TeamHighlightBody({
  highlight,
  valueLabel,
  stageLabel,
}: {
  highlight: TeamHighlightFact;
  valueLabel: string;
  stageLabel: string;
}) {
  return (
    <div className="space-y-2">
      <TeamLabel
        team={highlight.team}
        showCode
        flagSize="md"
        nameClassName="text-sm font-semibold text-white"
      />
      <p className="text-xs text-muted-foreground">
        {stageLabel} · FIFA #{highlight.fifaRank ?? "—"}
      </p>
      <p className="font-mono text-sm font-semibold tabular-nums text-wc-orange">
        {valueLabel}
      </p>
    </div>
  );
}

export function UpsetHighlightBody({
  upset,
  roundLabel,
  pointsGapLabel,
}: {
  upset: UpsetMatchFact;
  roundLabel: string;
  pointsGapLabel: string;
}) {
  return (
    <div className="space-y-2">
      <TeamLabel
        team={upset.team}
        showCode
        flagSize="md"
        nameClassName="text-sm font-semibold text-white"
      />
      <p className="text-xs text-muted-foreground">
        {roundLabel}
        {upset.scoreLabel ? ` · ${upset.scoreLabel}` : ""}
      </p>
      <p className="text-xs text-muted-foreground">
        vs{" "}
        <TeamLabel
          team={upset.opponent}
          showCode
          flagSize="sm"
          nameClassName="inline text-xs font-medium text-white"
        />
      </p>
      <p className="font-mono text-sm font-semibold tabular-nums text-wc-orange">
        {pointsGapLabel}
      </p>
    </div>
  );
}
