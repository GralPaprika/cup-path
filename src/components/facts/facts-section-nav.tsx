"use client";

import type { KnockoutFactsRoundId } from "@/lib/types";
import { KNOCKOUT_FACTS_ROUNDS } from "@/lib/domain/knockout/knockout-facts-round-config";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export const KNOCKOUT_SECTION_IDS: Record<KnockoutFactsRoundId, string> = {
  r32: "round-of-32",
  r16: "round-of-16",
  qf: "quarter-finals",
  sf: "semi-finals",
  final: "final",
};

const KNOCKOUT_NAV_KEYS: Record<
  KnockoutFactsRoundId,
  | "sectionNav.roundOf32"
  | "sectionNav.roundOf16"
  | "sectionNav.quarterFinals"
  | "sectionNav.semiFinals"
  | "sectionNav.final"
> = {
  r32: "sectionNav.roundOf32",
  r16: "sectionNav.roundOf16",
  qf: "sectionNav.quarterFinals",
  sf: "sectionNav.semiFinals",
  final: "sectionNav.final",
};

interface FactsSectionNavProps {
  availableKnockoutRounds: ReadonlySet<KnockoutFactsRoundId>;
  className?: string;
}

export function FactsSectionNav({
  availableKnockoutRounds,
  className,
}: FactsSectionNavProps) {
  const t = useTranslations("home");

  const knockoutItems = KNOCKOUT_FACTS_ROUNDS.flatMap((round) =>
    availableKnockoutRounds.has(round.id)
      ? [
          {
            id: KNOCKOUT_SECTION_IDS[round.id],
            label: t(KNOCKOUT_NAV_KEYS[round.id]),
          },
        ]
      : [],
  );

  const groups = [
    {
      heading: t("sectionNav.overviewGroup"),
      items: [
        { id: "introduction", label: t("sectionNav.introduction") },
        { id: "tournament-snapshot", label: t("sectionNav.snapshot") },
        { id: "group-round", label: t("sectionNav.groupRound") },
      ],
    },
    ...(knockoutItems.length > 0
      ? [
          {
            heading: t("sectionNav.knockoutGroup"),
            items: knockoutItems,
          },
        ]
      : []),
  ];

  return (
    <nav
      aria-label={t("sectionNav.label")}
      className={cn("glass-panel h-fit p-5 lg:sticky lg:top-20", className)}
    >
      <div className="space-y-6">
        {groups.map((group) => (
          <div key={group.heading}>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {group.heading}
            </p>
            <ul className="mt-3 space-y-1">
              {group.items.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="block rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-white/6 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wc-sky"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
