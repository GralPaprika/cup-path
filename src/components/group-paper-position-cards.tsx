"use client";

import Link from "next/link";
import type {
  GroupExpectedFinishEntry,
  GroupExpectedUnderperformer,
} from "@/lib/types";
import { TeamFlag } from "@/components/team-flag";
import { formatFifaPoints } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { ArrowDown } from "lucide-react";

interface GroupPaperPositionCardsProps {
  positionMisses: GroupExpectedFinishEntry[];
  eliminatedUnderperformers: GroupExpectedUnderperformer[];
  mode: string;
}

function mergePositionMisses(
  positionMisses: GroupExpectedFinishEntry[],
  eliminatedUnderperformers: GroupExpectedUnderperformer[],
): Array<{ entry: GroupExpectedFinishEntry; eliminated: boolean }> {
  const eliminatedIds = new Set(
    eliminatedUnderperformers.map((entry) => entry.team.id),
  );

  return [...positionMisses]
    .sort(sortByMiss)
    .map((entry) => ({
      entry,
      eliminated: eliminatedIds.has(entry.team.id),
    }));
}
type PositionEntry = GroupExpectedFinishEntry;

function sortByMiss(entryA: PositionEntry, entryB: PositionEntry): number {
  if (entryB.positionDelta !== entryA.positionDelta) {
    return entryB.positionDelta - entryA.positionDelta;
  }
  return (entryB.fifaPoints ?? 0) - (entryA.fifaPoints ?? 0);
}

function PositionLadder({
  expected,
  actual,
}: {
  expected: number;
  actual: number;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4].map((slot) => {
        const isExpected = slot === expected;
        const isActual = slot === actual;

        return (
          <div
            key={slot}
            className={cn(
              "flex h-7 min-w-7 flex-1 items-center justify-center rounded-md font-mono text-[10px] font-semibold tabular-nums transition-colors",
              isExpected &&
                isActual &&
                "bg-wc-orange/20 text-wc-orange ring-1 ring-wc-orange/50",
              isExpected &&
                !isActual &&
                "border border-dashed border-wc-sky/50 bg-wc-sky/10 text-wc-sky",
              isActual &&
                !isExpected &&
                "bg-wc-orange/20 text-wc-orange ring-1 ring-wc-orange/50",
              !isExpected &&
                !isActual &&
                "bg-white/[0.04] text-muted-foreground/50",
            )}
          >
            {slot}
          </div>
        );
      })}
    </div>
  );
}

function PositionMissCard({
  entry,
  mode,
  eliminated,
}: {
  entry: PositionEntry;
  mode: string;
  eliminated?: boolean;
}) {
  const t = useTranslations("home.groupExpectedFinishes");

  return (
    <Link
      href={`/team-analysis?team=${entry.team.id}&mode=${mode}`}
      className={cn(
        "group flex flex-col gap-3 rounded-xl border p-4 transition-all",
        eliminated
          ? "border-wc-orange/35 bg-gradient-to-br from-wc-orange/12 to-wc-red/5 hover:border-wc-orange/50 hover:from-wc-orange/16"
          : "border-white/8 bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.05]",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <TeamFlag team={entry.team} size="md" />
          <div className="min-w-0">
            <p className="font-mono text-sm font-semibold text-white">
              {entry.team.id}
            </p>
            <p className="font-mono text-[10px] text-muted-foreground">
              {t("groupLabel", { letter: entry.groupLetter })}
            </p>
          </div>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-0.5 rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold tabular-nums",
            eliminated
              ? "bg-wc-red/20 text-wc-red"
              : "bg-wc-orange/15 text-wc-orange",
          )}
        >
          <ArrowDown className="size-3" aria-hidden />
          {entry.positionDelta}
        </span>
      </div>

      <PositionLadder
        expected={entry.expectedPosition}
        actual={entry.actualPosition}
      />

      <div className="flex items-end justify-between gap-2 text-[10px]">
        <div>
          <p className="uppercase tracking-widest text-muted-foreground">
            {t("positionLadderPaper")}
          </p>
          <p className="font-mono text-sm font-semibold tabular-nums text-wc-sky">
            #{entry.expectedPosition}
          </p>
        </div>
        <div className="text-center text-muted-foreground">→</div>
        <div className="text-right">
          <p className="uppercase tracking-widest text-muted-foreground">
            {t("positionLadderActual")}
          </p>
          <p className="font-mono text-sm font-semibold tabular-nums text-wc-orange">
            #{entry.actualPosition}
          </p>
        </div>
        {entry.fifaPoints !== null && (
          <div className="ml-auto text-right">
            <p className="uppercase tracking-widest text-muted-foreground">
              FIFA
            </p>
            <p className="font-mono text-sm font-semibold tabular-nums text-white">
              {formatFifaPoints(entry.fifaPoints)}
            </p>
          </div>
        )}
      </div>

      {eliminated ? (
        <span className="inline-flex w-fit rounded-md border border-wc-red/30 bg-wc-red/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-wc-red">
          {t("eliminatedBadge")}
        </span>
      ) : null}
    </Link>
  );
}

export function GroupPaperPositionCards({
  positionMisses,
  eliminatedUnderperformers,
  mode,
}: GroupPaperPositionCardsProps) {
  const t = useTranslations("home.groupExpectedFinishes");

  const merged = mergePositionMisses(
    positionMisses,
    eliminatedUnderperformers,
  );
  const eliminatedCount = merged.filter((item) => item.eliminated).length;

  if (merged.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {t("positionMisses")}
        </p>
        <p className="text-xs text-muted-foreground">
          {t("positionMissesMergedCount", {
            count: merged.length,
            eliminated: eliminatedCount,
          })}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {merged.map(({ entry, eliminated }) => (
          <PositionMissCard
            key={entry.team.id}
            entry={entry}
            mode={mode}
            eliminated={eliminated}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {t("positionLadderHint")}
      </p>
    </div>
  );
}
