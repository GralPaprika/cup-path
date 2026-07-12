"use client";

import { History } from "lucide-react";
import { useTranslations } from "next-intl";
import { parseRankingMode, RANKING_MODES } from "@/lib/data/ranking-modes";
import { useRankingMode } from "@/components/ranking-mode-provider";
import { navbarSelectTriggerClassName } from "@/components/navbar-select-trigger";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function RankingModeSwitcher() {
  const { mode, setMode } = useRankingMode();
  const t = useTranslations("rankingMode");
  const nav = useTranslations("nav");

  return (
    <Select
      value={mode}
      onValueChange={(value) => {
        if (value) setMode(parseRankingMode(value));
      }}
    >
      <SelectTrigger
        size="sm"
        aria-label={nav("rankingSnapshot")}
        className={navbarSelectTriggerClassName("min-w-0")}
      >
        <History className="size-3.5 shrink-0 text-white/70" aria-hidden />
        <SelectValue>
          <span className="hidden sm:inline">{t(`short.${mode}`)}</span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="end" className="min-w-44">
        {RANKING_MODES.map((value) => (
          <SelectItem key={value} value={value} className="text-sm">
            {t(value)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
