"use client";

import type { PathStage } from "@/lib/types";
import { PATH_STAGES } from "@/lib/domain/match/match-stages";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface TeamRoundSelectorProps {
  value: PathStage;
  onChange: (stage: PathStage) => void;
  teamCount?: number;
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
}: TeamRoundSelectorProps) {
  const t = useTranslations("compare.teamRound");

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {t("label")}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{t("hint")}</p>
        </div>
        <span className="rounded-full border border-wc-sky/30 bg-wc-sky/10 px-3 py-1 text-xs font-semibold text-wc-sky">
          {teamCount != null
            ? t("teamCount", { count: teamCount })
            : t("loadingCount")}
        </span>
      </div>

      <div className="relative flex rounded-xl border border-white/10 bg-white/5 p-1">
        {PATH_STAGES.map((stage) => {
          const active = value === stage;

          return (
            <button
              key={stage}
              type="button"
              onClick={() => onChange(stage)}
              className={cn(
                "relative z-10 flex flex-1 flex-col items-center gap-0.5 rounded-lg px-1.5 py-2 text-center text-[11px] font-semibold transition-all sm:px-2 sm:text-xs",
                active
                  ? "bg-wc-sky/20 text-wc-sky shadow-sm ring-1 ring-wc-sky/30"
                  : "text-muted-foreground hover:bg-white/6 hover:text-white/80",
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
