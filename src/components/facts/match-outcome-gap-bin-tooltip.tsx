"use client";

import type { MatchOutcomeGapBinStats } from "@/components/facts/match-outcome-gap-chart";
import type { GroupMatchResult } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MatchOutcomeGapBinTooltipProps {
  bin: MatchOutcomeGapBinStats;
  gapRangeLabel: string;
  matchesLabel: string;
  favoriteWinLabel: string;
  drawLabel: string;
  upsetLabel: string;
}

const OUTCOME_ROWS: Array<{
  result: GroupMatchResult;
  countKey: "wins" | "draws" | "losses";
  pctKey: "winPct" | "drawPct" | "lossPct";
  swatchClass: string;
  textClass: string;
}> = [
  {
    result: "W",
    countKey: "wins",
    pctKey: "winPct",
    swatchClass: "bg-wc-green/80",
    textClass: "text-wc-green",
  },
  {
    result: "D",
    countKey: "draws",
    pctKey: "drawPct",
    swatchClass: "bg-wc-sky/80",
    textClass: "text-wc-sky",
  },
  {
    result: "L",
    countKey: "losses",
    pctKey: "lossPct",
    swatchClass: "bg-wc-red/80",
    textClass: "text-wc-red",
  },
];

function outcomeLabel(
  result: GroupMatchResult,
  labels: {
    favoriteWinLabel: string;
    drawLabel: string;
    upsetLabel: string;
  },
) {
  if (result === "W") return labels.favoriteWinLabel;
  if (result === "L") return labels.upsetLabel;
  return labels.drawLabel;
}

export function MatchOutcomeGapBinTooltip({
  bin,
  gapRangeLabel,
  matchesLabel,
  favoriteWinLabel,
  drawLabel,
  upsetLabel,
}: MatchOutcomeGapBinTooltipProps) {
  const labels = { favoriteWinLabel, drawLabel, upsetLabel };
  const segments = OUTCOME_ROWS.filter((row) => bin[row.pctKey] > 0);

  return (
    <div className="relative min-w-[220px] max-w-[280px] rounded-xl border border-white/15 bg-[#070b14]/95 p-3 shadow-2xl shadow-black/40 backdrop-blur-md">
      <div className="flex items-start justify-between gap-3">
        <p className="font-mono text-sm font-semibold tabular-nums text-white">
          {gapRangeLabel}
        </p>
        <p className="shrink-0 text-[11px] font-medium text-muted-foreground">
          {matchesLabel}
        </p>
      </div>

      {segments.length > 0 ? (
        <div className="mt-3 flex h-2 overflow-hidden rounded-sm">
          {segments.map((row) => (
            <div
              key={row.result}
              className={cn("h-full", row.swatchClass)}
              style={{ width: `${bin[row.pctKey]}%` }}
            />
          ))}
        </div>
      ) : null}

      <div className="mt-3 space-y-2">
        {OUTCOME_ROWS.map((row) => {
          const count = bin[row.countKey];
          const pct = Math.round(bin[row.pctKey]);

          return (
            <div
              key={row.result}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className={cn(
                    "inline-block h-2.5 w-5 shrink-0 rounded-sm",
                    row.swatchClass,
                  )}
                />
                <span className="truncate text-[11px] text-muted-foreground">
                  {outcomeLabel(row.result, labels)}
                </span>
              </div>
              <div className="flex shrink-0 items-baseline gap-2 font-mono tabular-nums">
                <span className="text-xs font-semibold text-white">{count}</span>
                <span className={cn("text-[11px] font-medium", row.textClass)}>
                  {pct}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div
        aria-hidden
        className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-[7px] border-t-[7px] border-x-transparent border-t-white/15"
      />
    </div>
  );
}
