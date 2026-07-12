"use client";

import type { NumericStats } from "@/lib/types";
import { useTranslations } from "next-intl";
import { formatFifaPoints, formatStatValue } from "@/lib/format";

export type StatsMetricKey =
  | "mean"
  | "median"
  | "stdDev"
  | "variance"
  | "min"
  | "max";

const FULL_METRICS: StatsMetricKey[] = [
  "mean",
  "median",
  "stdDev",
  "variance",
  "min",
  "max",
];

const COMPACT_METRICS: StatsMetricKey[] = ["median", "stdDev", "min", "max"];

interface StatsBlockProps {
  title: string;
  stats: NumericStats;
  isRank: boolean;
  rankDecimals?: number;
  metrics?: StatsMetricKey[];
  variant?: "full" | "compact";
}

export function StatsBlock({
  title,
  stats,
  isRank,
  rankDecimals = 1,
  metrics,
  variant = "full",
}: StatsBlockProps) {
  const t = useTranslations("groups.stats");

  const formatValue = (value: number | null) => {
    if (value === null) return "—";
    if (isRank) return formatStatValue(value, rankDecimals);
    return formatFifaPoints(value);
  };

  const formatSpreadValue = (value: number | null) => {
    if (value === null) return "—";
    return isRank
      ? formatStatValue(value, rankDecimals)
      : formatStatValue(value, 2);
  };

  const activeMetrics =
    metrics ?? (variant === "compact" ? COMPACT_METRICS : FULL_METRICS);

  const rows = activeMetrics.map((key) => {
    const spreadKeys = new Set<StatsMetricKey>(["stdDev", "variance"]);
    return {
      key,
      value: spreadKeys.has(key)
        ? formatSpreadValue(stats[key])
        : formatValue(stats[key]),
    };
  });

  return (
    <div className="glass-panel-subtle overflow-hidden">
      <div className="border-b border-white/8 px-4 py-3">
        <h4 className="text-sm font-semibold text-white">{title}</h4>
        <p className="text-xs text-muted-foreground">
          {t("sampleSize", { count: stats.count })}
        </p>
      </div>
      <dl className="divide-y divide-white/6">
        {rows.map((row) => (
          <div
            key={row.key}
            className="flex items-center justify-between gap-3 px-4 py-2.5"
          >
            <dt className="text-sm text-muted-foreground">{t(row.key)}</dt>
            <dd className="font-mono text-sm font-medium tabular-nums text-white">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
