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

  const overviewItems = [
    { id: "introduction", label: t("sectionNav.introduction") },
    { id: "tournament-snapshot", label: t("sectionNav.snapshot") },
    { id: "group-round", label: t("sectionNav.groupRound") },
  ];

  const groups = [
    {
      heading: t("sectionNav.overviewGroup"),
      items: overviewItems,
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
      className={cn(
        "sticky top-0 z-20 -mx-3 hidden border-b border-white/10 bg-wc-navy/95 px-3 py-2.5 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:block",
        className,
      )}
    >
      <div className="flex w-full flex-wrap items-center gap-x-3 gap-y-2">
        {groups.map((group, groupIndex) => (
          <div key={group.heading} className="contents">
            {groupIndex > 0 && (
              <span
                aria-hidden
                className="size-1 shrink-0 rounded-full bg-white/35"
              />
            )}
            <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5">
              <p className="shrink-0 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {group.heading}
              </p>
              <ul className="flex min-w-0 flex-wrap items-center gap-1">
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
          </div>
        ))}
      </div>
    </nav>
  );
}
