"use client";

import type { RankingMode } from "@/lib/types";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface RankingModeToggleProps {
  value: RankingMode;
  onChange: (mode: RankingMode) => void;
}

const MODES: { id: RankingMode; icon: string }[] = [
  { id: "yearStart", icon: "📅" },
  { id: "tournamentStart", icon: "🏟️" },
  { id: "live", icon: "⚡" },
];

export function RankingModeToggle({ value, onChange }: RankingModeToggleProps) {
  const t = useTranslations("rankingMode");

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {t("label")}
      </p>
      <div className="grid gap-2 sm:grid-cols-3">
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
            <span className="mt-0.5 block text-xs text-muted-foreground">
              {t(`${mode.id}Hint`)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
