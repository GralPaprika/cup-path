"use client";

import type { RankingMode } from "@/lib/types";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { PickerItem, PickerLabel, PickerList } from "@/components/picker-list";

interface RankingModeToggleProps {
  value: RankingMode;
  onChange: (mode: RankingMode) => void;
  variant?: "grid" | "compact" | "sidebar";
  showLabel?: boolean;
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
  showLabel = true,
}: RankingModeToggleProps) {
  const t = useTranslations("rankingMode");

  if (variant === "sidebar") {
    return (
      <div className="space-y-3">
        {showLabel && <PickerLabel>{t("label")}</PickerLabel>}
        <PickerList>
          {MODES.map((mode) => (
            <PickerItem
              key={mode}
              active={value === mode}
              onClick={() => onChange(mode)}
            >
              {t(mode)}
            </PickerItem>
          ))}
        </PickerList>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="flex flex-wrap gap-1.5 rounded-xl border border-white/10 bg-white/5 p-1">
        {MODES.map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => onChange(mode)}
            className={cn(
              "inline-flex flex-1 items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-all sm:flex-none",
              value === mode
                ? "bg-wc-sky/20 text-wc-sky shadow-sm ring-1 ring-wc-sky/30"
                : "text-muted-foreground hover:bg-white/6 hover:text-white",
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
                ? "border-wc-sky/40 bg-wc-sky/10 text-wc-sky ring-1 ring-wc-sky/20"
                : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/15 hover:bg-white/8",
            )}
          >
            <span className="block text-sm font-semibold">{t(mode)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
