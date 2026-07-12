"use client";

import { Check } from "lucide-react";
import type { PathStage } from "@/lib/types";
import {
  isStageWithinReach,
  PATH_STAGES,
  serializePathStages,
} from "@/lib/domain/match-stages";
import { COMPARE_STAGE_I18N_KEYS } from "@/lib/i18n/stage-keys";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { PickerItem, PickerLabel, PickerList } from "@/components/picker-list";
import { Switch } from "@/components/ui/switch";

interface PathStageFiltersProps {
  value: Set<PathStage>;
  onChange: (stages: Set<PathStage>) => void;
  labelKey?: "label" | "includeLabel";
  maxStageReached?: PathStage;
  variant?: "chips" | "picker" | "toggles";
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
  variant = "chips",
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

  const header = (
    <div className="space-y-1">
      <div className="flex flex-wrap items-center justify-between gap-2">
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
      <p className="text-xs text-muted-foreground">{t("includeHint")}</p>
    </div>
  );

  if (variant === "picker") {
    return (
      <div className="space-y-3">
        {header}
        <PickerList>
          {PATH_STAGES.map((stage) => {
            const checked = value.has(stage);
            const disabled =
              maxStageReached !== undefined &&
              !isStageWithinReach(stage, maxStageReached);

            return (
              <PickerItem
                key={stage}
                active={checked}
                disabled={disabled}
                onClick={() => toggleStage(stage)}
                className={cn(checked && !disabled && "text-white")}
              >
                <span
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded border",
                    disabled && "border-white/10 bg-transparent",
                    !disabled &&
                      checked &&
                      "border-wc-green/50 bg-wc-green/20 text-wc-green",
                    !disabled &&
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
      <div className="space-y-3">
        {header}
        <div className="flex flex-wrap gap-1.5">
          {PATH_STAGES.map((stage) => {
            const checked = value.has(stage);
            const disabled =
              maxStageReached !== undefined &&
              !isStageWithinReach(stage, maxStageReached);

            return (
              <div
                key={stage}
                title={t(COMPARE_STAGE_I18N_KEYS[stage])}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 transition-colors",
                  disabled
                    ? "border-white/5 bg-white/[0.02] text-muted-foreground/40"
                    : checked
                      ? "border-wc-sky/30 bg-wc-sky/15 text-wc-sky"
                      : "border-white/10 bg-white/5 text-muted-foreground",
                )}
              >
                <label
                  htmlFor={`stage-toggle-${stage}`}
                  className={cn(
                    "cursor-pointer text-[11px] font-semibold tracking-wide",
                    disabled && "cursor-not-allowed",
                    checked && !disabled && "text-wc-sky",
                  )}
                >
                  {t(STAGE_SHORT_LABEL_KEYS[stage])}
                </label>
                <Switch
                  id={`stage-toggle-${stage}`}
                  checked={checked}
                  disabled={disabled}
                  size="sm"
                  accent="sky"
                  onChange={() => toggleStage(stage)}
                />
              </div>
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
                  ? "cursor-not-allowed border-white/5 bg-white/[0.02] text-muted-foreground/40"
                  : "cursor-pointer",
                !disabled &&
                  (checked
                    ? "border-wc-green/30 bg-wc-green/10 text-wc-green"
                    : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/15 hover:bg-white/8"),
              )}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={() => toggleStage(stage)}
                className="size-4 rounded border-white/20 bg-white/5 text-wc-green focus:ring-wc-green/40 disabled:cursor-not-allowed disabled:opacity-50"
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
