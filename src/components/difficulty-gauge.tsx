"use client";

import { useId, useMemo } from "react";
import { formatFifaPoints } from "@/lib/format";
import { cn } from "@/lib/utils";

interface DifficultyGaugeProps {
  value: number | null;
  hardestPathRank: number | null;
  cohortSize: number;
  label: string;
  rankTitle?: string;
  rankValue?: string;
  rankMeta?: string;
  rankAltNote?: string;
  className?: string;
}

/** Rank 1 = full arc (hardest path), rank N = nearly empty (easiest path). */
function computeFillPercent(
  rank: number | null,
  cohortSize: number,
): number {
  if (!rank) return 0;
  if (cohortSize <= 1) return 100;
  return 100 * (1 - (rank - 1) / (cohortSize - 1));
}

function splitLabel(label: string): [string, string] {
  const words = label.trim().split(/\s+/);
  if (words.length < 2) return [label, ""];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}

export function DifficultyGauge({
  value,
  hardestPathRank,
  cohortSize,
  label,
  rankTitle,
  rankValue,
  rankMeta,
  rankAltNote,
  className,
}: DifficultyGaugeProps) {
  const uid = useId().replace(/:/g, "");
  const [labelLine1, labelLine2] = useMemo(() => splitLabel(label), [label]);
  const fillPercent = computeFillPercent(hardestPathRank, cohortSize);

  const width = 300;
  const height = 168;
  const cx = width / 2;
  const cy = 118;
  const radius = 108;
  const strokeWidth = 15;

  const startX = cx - radius;
  const endX = cx + radius;
  const arcPath = `M ${startX} ${cy} A ${radius} ${radius} 0 0 1 ${endX} ${cy}`;
  const arcLength = Math.PI * radius;
  const dashOffset = arcLength * (1 - fillPercent / 100);

  const gradientId = `gauge-gradient-${uid}`;
  const glowId = `gauge-glow-${uid}`;

  return (
    <div
      className={cn("relative mx-auto w-full max-w-[300px]", className)}
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="absolute inset-0 h-full w-full overflow-visible"
        aria-hidden
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="28%" stopColor="#facc15" />
            <stop offset="62%" stopColor="#ff6b00" />
            <stop offset="100%" stopColor="#e31937" />
          </linearGradient>
          <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path
          d={arcPath}
          fill="none"
          stroke="rgba(148, 163, 184, 0.18)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <path
          d={arcPath}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={arcLength}
          strokeDashoffset={dashOffset}
          filter={`url(#${glowId})`}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>

      <div className="absolute inset-x-[16%] top-[30%] bottom-[14%] flex flex-col items-center justify-between text-center">
        <div className="space-y-0.5">
          <p className="text-[9px] font-semibold uppercase leading-tight tracking-[0.13em] text-white/80 sm:text-[10px]">
            {labelLine1}
          </p>
          {labelLine2 && (
            <p className="text-[9px] font-semibold uppercase leading-tight tracking-[0.13em] text-white/80 sm:text-[10px]">
              {labelLine2}
            </p>
          )}
        </div>

        <p
          className="bg-gradient-to-b from-[#ffb366] via-[#ff6b00] to-[#c4181f] bg-clip-text text-[1.65rem] font-bold leading-none tabular-nums text-transparent sm:text-[1.85rem]"
          style={{ WebkitBackgroundClip: "text" }}
        >
          {value !== null ? formatFifaPoints(value) : "—"}
        </p>

        <div className="space-y-0.5">
          {rankTitle && (
            <p className="text-[10px] text-slate-400">{rankTitle}</p>
          )}
          {(rankValue || rankMeta || rankAltNote) && (
            <p className="text-sm font-bold text-[#f0a070]">
              {rankValue}
              {rankValue && rankMeta && (
                <span className="font-normal text-slate-500"> · </span>
              )}
              {rankMeta && (
                <span className="text-[11px] font-medium text-slate-400">
                  {rankMeta}
                </span>
              )}
            </p>
          )}
          {rankAltNote && (
            <p className="text-[10px] font-medium text-slate-500">
              {rankAltNote}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
