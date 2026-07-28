"use client";

import { History } from "lucide-react";
import { useTranslations } from "next-intl";
import { parseRankingMode, RANKING_MODES } from "@/lib/data/ranking-modes";
import { useRankingMode } from "@/components/layout/ranking-mode-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function RankingModeSwitcher({
  collapsed = false,
}: {
  collapsed?: boolean;
}) {
  const { mode, setMode } = useRankingMode();
  const t = useTranslations("rankingMode");
  const nav = useTranslations("nav");

  return (
    <div className={cn("flex flex-col gap-1.5", collapsed && "items-center")}>
      {!collapsed && (
        <span className="px-0.5 text-[11px] font-medium tracking-wide text-muted-foreground">
          {nav("rankingSnapshot")}
        </span>
      )}
      <Select
        value={mode}
        onValueChange={(value) => {
          if (value) setMode(parseRankingMode(value));
        }}
      >
        <SelectTrigger
          size="sm"
          aria-label={nav("rankingSnapshot")}
          title={collapsed ? nav("rankingSnapshot") : undefined}
          className={cn(
            "h-9 border-white/15 bg-white/5 text-sm font-medium text-white shadow-none hover:bg-white/10 focus-visible:border-wc-sky/40 focus-visible:ring-wc-sky/20 data-placeholder:text-white/70 [&_svg]:text-white/70",
            collapsed ? "w-full justify-center px-1.5" : "w-full",
          )}
        >
          <History className="size-3.5 shrink-0 text-white/70" aria-hidden />
          <SelectValue>
            {collapsed ? (
              <span className="sr-only">{t(`short.${mode}`)}</span>
            ) : (
              <span>{t(`short.${mode}`)}</span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent
          align={collapsed ? "center" : "start"}
          side="top"
          className="min-w-44"
        >
          {RANKING_MODES.map((value) => (
            <SelectItem key={value} value={value} className="text-sm">
              {t(value)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
