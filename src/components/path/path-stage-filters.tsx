"use client";

import { Check } from "lucide-react";
import type { PathStage } from "@/lib/types";
import {
  isStageWithinReach,
  PATH_STAGES,
  serializePathStages,
} from "@/lib/domain/match/match-stages";
import { COMPARE_STAGE_I18N_KEYS } from "@/lib/i18n/stage-keys";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { PickerItem, PickerLabel, PickerList } from "@/components/shared/picker-list";
import { Switch } from "@/components/ui/switch";

interface PathStageFiltersProps {
  value: Set<PathStage>;
  onChange: (stages: Set<PathStage>) => void;
  labelKey?: "label" | "includeLabel";
  maxStageReached?: PathStage;
  /** When set, only these stages are shown (compare Show-teams coupling). Empty hides the control. */
  visibleStages?: PathStage[];
  variant?: "chips" | "picker" | "toggles";
  compact?: boolean;
  align?: "start" | "end";
  showLabel?: boolean;
  className?: string;
}

const STAGE_SHORT_LABEL_KEYS: Record<PathStage, string> = {
  group: "groupStageShort",
  r32: "round32Short",
  r16: "round16Short",
  qf: "quarterFinalShort",
  sf: "semiFinalShort",
  final: "finalShort",
};

export function PathStageFilters({
  value,
  onChange,
  labelKey = "includeLabel",
  maxStageReached,
  visibleStages,
  variant = "chips",
  compact = false,
  align = "start",
  showLabel = true,
  className,
}: PathStageFiltersProps) {
  const t = useTranslations("compare.stages");

  if (visibleStages && visibleStages.length === 0) {
    return null;
  }

  const enabledStages =
    visibleStages ??
    (maxStageReached
      ? PATH_STAGES.filter((stage) => isStageWithinReach(stage, maxStageReached))
      : PATH_STAGES);

  function isStageEnabled(stage: PathStage) {
    return enabledStages.includes(stage);
  }

  function toggleStage(stage: PathStage) {
    if (!isStageEnabled(stage)) return;

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

  const header = showLabel ? (
    <div
      className={cn(
        "space-y-1",
        align === "end" && "text-right",
      )}
    >
      <div
        className={cn(
          "flex flex-wrap items-center gap-2",
          align === "end" ? "justify-end" : "justify-between",
        )}
      >
        <PickerLabel>{t(labelKey)}</PickerLabel>
        {value.size < enabledStages.length && (
          <button
            type="button"
            onClick={selectAll}
            className="text-xs font-medium text-wc-sky hover:text-wc-lavender"
          >
            {t("selectAll")}
          </button>
        )}
      </div>
      <p
        className={cn(
          "text-muted-foreground",
          compact ? "text-[10px]" : "text-xs",
        )}
      >
        {t("includeHint")}
      </p>
    </div>
  ) : null;

  if (variant === "picker") {
    return (
      <div className="space-y-3">
        {header}
        <PickerList>
          {enabledStages.map((stage) => {
            const checked = value.has(stage);

            return (
              <PickerItem
                key={stage}
                active={checked}
                onClick={() => toggleStage(stage)}
                className={cn(checked && "text-white")}
              >
                <span
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded border",
                    checked &&
                      "border-wc-green/50 bg-wc-green/20 text-wc-green",
                    !checked &&
                      "border-white/20 bg-white/5 text-transparent",
                  )}
                >
                  <Check className="size-3" strokeWidth={3} />
                </span>
                <span className="truncate">{t(COMPARE_STAGE_I18N_KEYS[stage])}</span>
              </PickerItem>
            );
          })}
        </PickerList>
      </div>
    );
  }

  if (variant === "toggles") {
    return (
      <div
        className={cn(
          "flex flex-col",
          compact ? "gap-1.5" : "gap-3",
          align === "end" && "items-end",
          className,
        )}
      >
        {header}
        <div
          className={cn(
            "flex flex-wrap",
            compact ? "gap-1.5" : "gap-2",
            align === "end" && "justify-end",
          )}
        >
          {enabledStages.map((stage) => {
            const checked = value.has(stage);

            return (
              <label
                key={stage}
                title={t(COMPARE_STAGE_I18N_KEYS[stage])}
                className={cn(
                  "inline-flex cursor-pointer items-center gap-2 rounded-full border transition-colors",
                  compact ? "px-2 py-1" : "px-2.5 py-1.5",
                  checked
                    ? "border-wc-sky/40 bg-wc-sky/10 text-wc-sky"
                    : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/15 hover:bg-white/8",
                )}
              >
                <span
                  className={cn(
                    "font-semibold tracking-wide",
                    compact ? "text-[10px]" : "text-[11px]",
                  )}
                >
                  {t(STAGE_SHORT_LABEL_KEYS[stage])}
                </span>
                <Switch
                  checked={checked}
                  onChange={() => toggleStage(stage)}
                  size="sm"
                  accent="sky"
                />
              </label>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {header}
      <div className="flex flex-wrap gap-2">
        {enabledStages.map((stage) => {
          const checked = value.has(stage);

          return (
            <label
              key={stage}
              className={cn(
                "inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
                checked
                  ? "border-wc-green/30 bg-wc-green/10 text-wc-green"
                  : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/15 hover:bg-white/8",
              )}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleStage(stage)}
                className="size-4 rounded border-white/20 bg-white/5 text-wc-green focus:ring-wc-green/40"
              />
              {t(COMPARE_STAGE_I18N_KEYS[stage])}
            </label>
          );
        })}
      </div>
    </div>
  );
}

export { serializePathStages };
