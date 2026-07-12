"use client";

import { RoundOf32OpponentDifficultyInsightsPanel } from "@/components/round-of-32-opponent-difficulty-insights";
import type { Round32OpponentDifficultyStrip } from "@/lib/types";
import { formatFifaPoints } from "@/lib/format";
import { CHART_COLORS } from "@/lib/chart-colors";
import { useTranslations } from "next-intl";

interface RoundOf32OpponentDifficultyChartProps {
  strip: Round32OpponentDifficultyStrip;
  mode: string;
}

const BAR_WIDTH = 26;
const BAR_GAP = 8;
const HEIGHT = 220;
const MARGIN = { top: 20, right: 16, bottom: 52, left: 44 };

export function RoundOf32OpponentDifficultyChart({
  strip,
  mode,
}: RoundOf32OpponentDifficultyChartProps) {
  const t = useTranslations("home.roundOf32");

  const { entries } = strip;
  if (entries.length === 0) return null;

  const minVal = strip.minOpponentPoints ?? 0;
  const maxVal = strip.maxOpponentPoints ?? 1;
  const padding = Math.max(40, (maxVal - minVal) * 0.06);
  const domainMin = Math.max(0, Math.floor((minVal - padding) / 50) * 50);
  const domainMax = Math.ceil((maxVal + padding) / 50) * 50;

  const chartHeight = HEIGHT - MARGIN.top - MARGIN.bottom;
  const chartWidth =
    entries.length * (BAR_WIDTH + BAR_GAP) - BAR_GAP + MARGIN.left + MARGIN.right;
  const width = Math.max(640, chartWidth);
  const baselineY = HEIGHT - MARGIN.bottom;

  const y = (value: number) =>
    MARGIN.top +
    chartHeight -
    ((value - domainMin) / Math.max(domainMax - domainMin, 1)) * chartHeight;

  const referenceLines = [
    {
      value: strip.meanOpponentPoints,
      stroke: CHART_COLORS.mean,
      dash: "4 4",
      label: t("opponentDifficultyLegendMean"),
      className: "text-wc-orange",
    },
    {
      value: strip.maxOpponentPoints,
      stroke: "var(--color-wc-red)",
      dash: "2 3",
      label: t("opponentDifficultyLegendHighest"),
      className: "text-wc-red",
    },
    {
      value: strip.minOpponentPoints,
      stroke: "var(--color-wc-sky)",
      dash: "2 3",
      label: t("opponentDifficultyLegendLowest"),
      className: "text-wc-sky",
    },
  ].filter(
    (line): line is typeof line & { value: number } => line.value !== null,
  );

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-white">
          {t("opponentDifficultyTitle")}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("opponentDifficultySubtitle", { count: entries.length })}
        </p>
      </div>

      <RoundOf32OpponentDifficultyInsightsPanel
        insights={strip.insights}
        meanOpponentPoints={strip.meanOpponentPoints}
        mode={mode}
      />

      <figure className="overflow-hidden rounded-xl border border-white/8 bg-black/10 p-3">
        <figcaption className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-5 rounded-sm bg-wc-green/80" />
            {t("opponentDifficultyLegendQualified")}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-5 rounded-sm bg-wc-red/80" />
            {t("opponentDifficultyLegendEliminated")}
          </span>
          {referenceLines.map((line) => (
            <span
              key={line.label}
              className={`flex items-center gap-1.5 ${line.className}`}
            >
              <span
                className="inline-block w-5 border-t"
                style={{
                  borderColor: line.stroke,
                  borderTopStyle: "dashed",
                }}
              />
              {line.label}
            </span>
          ))}
        </figcaption>

        <div className="scrollbar-subtle max-w-full overflow-x-auto overscroll-x-contain pb-1">
          <svg
            width={width}
            height={HEIGHT}
            viewBox={`0 0 ${width} ${HEIGHT}`}
            className="block shrink-0"
            role="img"
            aria-label={t("opponentDifficultyCaption")}
          >
            <line
              x1={MARGIN.left}
              x2={width - MARGIN.right}
              y1={baselineY}
              y2={baselineY}
              className="stroke-white/15"
            />

            {referenceLines.map((line) => (
              <g key={line.label}>
                <line
                  x1={MARGIN.left}
                  x2={width - MARGIN.right}
                  y1={y(line.value)}
                  y2={y(line.value)}
                  stroke={line.stroke}
                  strokeWidth={1}
                  strokeDasharray={line.dash}
                />
                <text
                  x={MARGIN.left - 6}
                  y={y(line.value) + 3}
                  textAnchor="end"
                  className="fill-muted-foreground text-[9px]"
                >
                  {formatFifaPoints(Math.round(line.value))}
                </text>
              </g>
            ))}

            {entries.map((entry, index) => {
              const x = MARGIN.left + index * (BAR_WIDTH + BAR_GAP);
              const barTop = y(entry.opponentFifaPoints);
              const barHeight = baselineY - barTop;
              const href = `/team-analysis?team=${entry.team.id}&mode=${mode}`;

              return (
                <a key={entry.team.id} href={href} className="cursor-pointer">
                  <rect
                    x={x}
                    y={barTop}
                    width={BAR_WIDTH}
                    height={Math.max(barHeight, 2)}
                    rx={4}
                    className={
                      entry.qualified
                        ? "fill-wc-green/80 transition-opacity hover:opacity-90"
                        : "fill-wc-red/75 transition-opacity hover:opacity-90"
                    }
                  >
                    <title>
                      {t("opponentDifficultyTooltip", {
                        team: entry.team.id,
                        opponent: entry.opponent.id,
                        points: formatFifaPoints(entry.opponentFifaPoints),
                        status: entry.qualified
                          ? t("opponentDifficultyQualified")
                          : t("opponentDifficultyEliminated"),
                      })}
                    </title>
                  </rect>
                  <image
                    href={entry.team.flagUrl}
                    x={x + (BAR_WIDTH - 16) / 2}
                    y={baselineY + 8}
                    width={16}
                    height={11}
                    className="rounded-sm"
                  />
                  <text
                    x={x + BAR_WIDTH / 2}
                    y={baselineY + 32}
                    textAnchor="middle"
                    className="fill-white font-mono text-[9px] font-semibold"
                  >
                    {entry.team.id}
                  </text>
                </a>
              );
            })}
          </svg>
        </div>

        <p className="mt-2 text-xs text-muted-foreground">
          {t("opponentDifficultyFootnote")}
        </p>
      </figure>
    </div>
  );
}
