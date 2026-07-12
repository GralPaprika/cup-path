"use client";

import type { AvgPointsContext } from "@/lib/types";
import { getTeamDisplayName } from "@/lib/i18n/team-display-name";
import { useTranslations } from "next-intl";
import { TeamFlag } from "@/components/team/team-flag";
import { formatFifaPoints } from "@/lib/format";
import { cn } from "@/lib/utils";

interface AvgPointsContextHintProps {
  context: AvgPointsContext | null | undefined;
  className?: string;
  align?: "left" | "right";
}

export function AvgPointsContextHint({
  context,
  className,
  align = "right",
}: AvgPointsContextHintProps) {
  const t = useTranslations("pointsAnchor");
  const teamNames = useTranslations("teams");

  if (!context) return null;

  const anchorName = context.anchor
    ? getTeamDisplayName(teamNames, context.anchor.team)
    : null;

  return (
    <div
      className={cn(
        "mt-1.5 space-y-1",
        align === "right" && "text-right",
        className,
      )}
    >
      <p className="text-[11px] leading-snug text-muted-foreground">
        {t("harderThan", { percent: context.percentile })}
      </p>
      {context.anchor && anchorName && (
        <p
          className={cn(
            "flex flex-wrap items-center gap-1 text-[11px] leading-snug text-muted-foreground",
            align === "right" && "justify-end",
          )}
        >
          <span aria-hidden="true">≈</span>
          <TeamFlag team={context.anchor.team} size="sm" />
          <span>
            {t("comparable", {
              team: anchorName,
              points: formatFifaPoints(context.anchor.points),
            })}
          </span>
        </p>
      )}
    </div>
  );
}

export function AvgPointsContextFootnote({ className }: { className?: string }) {
  const t = useTranslations("pointsAnchor");

  return (
    <p className={cn("text-xs leading-relaxed text-muted-foreground", className)}>
      {t("footnotePercentile")} {t("footnoteAnchor")}
    </p>
  );
}
