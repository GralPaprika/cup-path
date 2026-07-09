"use client";

import type { RankingMode } from "@/lib/types";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface RankingModeToggleProps {
  value: RankingMode;
  onChange: (mode: RankingMode) => void;
  variant?: "grid" | "compact";
}

const MODES: RankingMode[] = [
  "live",
  "june11",
  "april",
  "january",
  "november19",
];

export function RankingModeToggle({
  value,
  onChange,
  variant = "grid",
}: RankingModeToggleProps) {
  const t = useTranslations("rankingMode");

  if (variant === "compact") {
    return (
      <div className="flex flex-wrap gap-1.5 rounded-xl border bg-white p-1 shadow-sm">
        {MODES.map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => onChange(mode)}
            className={cn(
              "inline-flex flex-1 items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-all sm:flex-none",
              value === mode
                ? "bg-pitch-500 text-white shadow-sm"
                : "text-muted-foreground hover:bg-hermes-50 hover:text-hermes-800",
            )}
          >
            {t(mode)}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {t("label")}
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {MODES.map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => onChange(mode)}
            className={cn(
              "rounded-xl border p-3 text-left transition-all",
              value === mode
                ? "border-pitch-500 bg-hermes-50 shadow-sm ring-1 ring-pitch-500/20"
                : "border-border bg-card hover:border-hermes-200 hover:bg-hermes-50/50",
            )}
          >
            <span className="block text-sm font-semibold">{t(mode)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
