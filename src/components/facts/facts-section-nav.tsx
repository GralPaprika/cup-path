"use client";

import { useEffect, useRef, useState } from "react";
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
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    // Match sticky `top-12` so chrome appears when the bar actually docks.
    const observer = new IntersectionObserver(
      ([entry]) => {
        setStuck(!entry.isIntersecting);
      },
      { root: null, threshold: 0, rootMargin: "-48px 0px 0px 0px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

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

  const chipItems = [...overviewItems, ...knockoutItems];

  return (
    <>
      <div className="min-w-0 max-w-full lg:hidden">
        <div ref={sentinelRef} className="h-px w-full" aria-hidden />
        <nav
          aria-label={t("sectionNav.label")}
          data-stuck={stuck ? "true" : undefined}
          className={cn(
            "sticky top-12 z-20 min-w-0 max-w-full py-1.5 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-150",
            stuck
              ? "-mx-3 border-b border-white/10 bg-wc-navy/95 px-3 shadow-lg shadow-black/20 backdrop-blur-xl sm:-mx-6 sm:px-6"
              : "px-0",
          )}
        >
          <ul className="scrollbar-subtle flex min-w-0 w-full gap-1.5 overflow-x-auto overscroll-x-contain pb-0.5">
            {chipItems.map((item) => (
              <li key={item.id} className="shrink-0">
                <a
                  href={`#${item.id}`}
                  className="block whitespace-nowrap rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-white/20 hover:bg-white/8 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wc-sky"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <nav
        aria-label={t("sectionNav.label")}
        className={cn(
          "glass-panel hidden h-fit p-5 lg:sticky lg:top-[var(--shell-sticky-top)] lg:block",
          className,
        )}
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
    </>
  );
}
