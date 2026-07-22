"use client";

import { classifyTeamTier } from "@/lib/domain/team/team-tiers";
import type { TeamTierId } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

const TIER_BADGE_CLASS: Record<TeamTierId, string> = {
  titleFavorites:
    "border-wc-yellow/35 bg-wc-yellow/15 text-wc-yellow",
  contenders: "border-wc-orange/35 bg-wc-orange/15 text-wc-orange",
  darkHorses: "border-wc-lavender/35 bg-wc-lavender/15 text-wc-lavender",
  outsiders: "border-wc-sky/35 bg-wc-sky/15 text-wc-sky",
  makeweights: "border-white/20 bg-white/8 text-muted-foreground",
};

export function teamTierBadgeClass(tier: TeamTierId): string {
  return TIER_BADGE_CLASS[tier];
}

type TeamTierBadgeProps = {
  size?: "sm" | "md";
  className?: string;
} & (
  | { tier: TeamTierId; points?: never }
  | { points: number; tier?: never }
);

export function TeamTierBadge({
  size = "md",
  className,
  ...props
}: TeamTierBadgeProps) {
  const t = useTranslations("teamTiers");
  const tier =
    "points" in props ? classifyTeamTier(props.points) : props.tier;
  const noteKey = `${tier}Note` as const;
  const note = t.has(noteKey) ? t(noteKey) : "";

  return (
    <span
      title={note || undefined}
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border font-medium tracking-wide",
        size === "sm"
          ? "px-1.5 py-0.5 text-[9px] uppercase"
          : "px-2 py-0.5 text-[10px] uppercase",
        teamTierBadgeClass(tier),
        className,
      )}
    >
      {t(tier)}
    </span>
  );
}
