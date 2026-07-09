"use client";

import type { PathStage } from "@/lib/types";
import {
  isStageWithinReach,
  PATH_STAGES,
  serializePathStages,
} from "@/lib/domain/match-stages";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface PathStageFiltersProps {
  value: Set<PathStage>;
  onChange: (stages: Set<PathStage>) => void;
  labelKey?: "label" | "includeLabel";
  maxStageReached?: PathStage;
}

const STAGE_LABEL_KEYS: Record<PathStage, string> = {
  group: "groupStage",
  r32: "round32",
  r16: "round16",
  qf: "quarterFinal",
  sf: "semiFinal",
  final: "final",
};

export function PathStageFilters({
  value,
  onChange,
  labelKey = "includeLabel",
  maxStageReached,
}: PathStageFiltersProps) {
  const t = useTranslations("compare.stages");

  const enabledStages = maxStageReached
    ? PATH_STAGES.filter((stage) => isStageWithinReach(stage, maxStageReached))
    : PATH_STAGES;

  function toggleStage(stage: PathStage) {
    if (maxStageReached && !isStageWithinReach(stage, maxStageReached)) return;

    const next = new Set(value);
    if (next.has(stage)) {
      if (next.size === 1) return;
      next.delete(stage);
    } else {
      next.add(stage);
    }
    onChange(next);
  }

  function selectAll() {
    onChange(new Set(enabledStages));
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t(labelKey)}
          </p>
          {value.size < enabledStages.length && (
            <button
              type="button"
              onClick={selectAll}
              className="text-xs font-medium text-emerald-700 hover:text-emerald-900"
            >
              {t("selectAll")}
            </button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{t("includeHint")}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {PATH_STAGES.map((stage) => {
          const checked = value.has(stage);
          const disabled =
            maxStageReached !== undefined &&
            !isStageWithinReach(stage, maxStageReached);

          return (
            <label
              key={stage}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
                disabled
                  ? "cursor-not-allowed border-border/60 bg-muted/20 text-muted-foreground/50"
                  : "cursor-pointer",
                !disabled &&
                  (checked
                    ? "border-emerald-300 bg-emerald-50 text-emerald-950"
                    : "border-border bg-background text-muted-foreground hover:bg-muted/40"),
              )}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={() => toggleStage(stage)}
                className="size-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
              />
              {t(STAGE_LABEL_KEYS[stage])}
            </label>
          );
        })}
      </div>
    </div>
  );
}

export { serializePathStages };
