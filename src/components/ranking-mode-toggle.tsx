"use client";

import type { RankingMode } from "@/lib/types";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface RankingModeToggleProps {
  value: RankingMode;
  onChange: (mode: RankingMode) => void;
  variant?: "grid" | "compact";
}

const MODES: { id: RankingMode; icon: string }[] = [
  { id: "live", icon: "⚡" },
  { id: "june11", icon: "🏟️" },
  { id: "april", icon: "🌱" },
  { id: "january", icon: "📅" },
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
            key={mode.id}
            type="button"
            onClick={() => onChange(mode.id)}
            className={cn(
              "inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all sm:flex-none",
              value === mode.id
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-muted-foreground hover:bg-emerald-50 hover:text-emerald-900",
            )}
          >
            <span className="text-base leading-none">{mode.icon}</span>
            <span>{t(mode.id)}</span>
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
            key={mode.id}
            type="button"
            onClick={() => onChange(mode.id)}
            className={cn(
              "rounded-xl border p-3 text-left transition-all",
              value === mode.id
                ? "border-emerald-600 bg-emerald-50 shadow-sm ring-1 ring-emerald-600/20"
                : "border-border bg-card hover:border-emerald-300 hover:bg-emerald-50/50",
            )}
          >
            <span className="mb-1 block text-lg">{mode.icon}</span>
            <span className="block text-sm font-semibold">{t(mode.id)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
