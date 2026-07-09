"use client";

import type { PathStage } from "@/lib/types";
import {
  isStageWithinReach,
  PATH_STAGES,
  stageIndex,
} from "@/lib/domain/match-stages";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface TeamRoundSelectorProps {
  value: PathStage;
  onChange: (stage: PathStage) => void;
  teamCount?: number;
  minStage?: PathStage;
}

const SHORT_LABEL_KEYS: Record<PathStage, string> = {
  group: "groupShort",
  r32: "round32Short",
  r16: "round16Short",
  qf: "quarterFinalShort",
  sf: "semiFinalShort",
  final: "finalShort",
};

export function TeamRoundSelector({
  value,
  onChange,
  teamCount,
  minStage = "group",
}: TeamRoundSelectorProps) {
  const t = useTranslations("compare.teamRound");

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t("label")}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{t("hint")}</p>
        </div>
        <span className="rounded-full bg-hermes-50 px-3 py-1 text-xs font-semibold text-hermes-700">
          {teamCount != null
            ? t("teamCount", { count: teamCount })
            : t("loadingCount")}
        </span>
      </div>

      <div className="relative flex rounded-xl border bg-white p-1 shadow-sm">
        {PATH_STAGES.map((stage, index) => {
          const active = value === stage;
          const isPast = stageIndex(value) >= index;
          const disabled = !isStageWithinReach(stage, minStage);

          return (
            <button
              key={stage}
              type="button"
              disabled={disabled}
              onClick={() => onChange(stage)}
              className={cn(
                "relative z-10 flex-1 rounded-lg px-1.5 py-2.5 text-center text-[11px] font-semibold transition-all sm:px-2 sm:text-xs",
                disabled &&
                  "cursor-not-allowed text-muted-foreground/40 opacity-50",
                !disabled &&
                  (active
                    ? "bg-pitch-500 text-white shadow-md"
                    : isPast
                      ? "text-hermes-700 hover:bg-hermes-50"
                      : "text-muted-foreground hover:bg-muted/50"),
              )}
            >
              {t(SHORT_LABEL_KEYS[stage])}
            </button>
          );
        })}
      </div>
    </div>
  );
}
