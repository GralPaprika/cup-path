"use client";

import { QUALIFICATION_LEGEND_STYLES } from "@/components/groups/qualification-styles";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const LEGEND_STATUSES = ["first", "second", "bestThird"] as const;

export function QualificationLegend() {
  const t = useTranslations("groups");

  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
      {LEGEND_STATUSES.map((status) => (
        <span key={status} className="inline-flex items-center gap-2">
          <span
            className={cn(
              "size-3 rounded-sm",
              QUALIFICATION_LEGEND_STYLES[status],
            )}
          />
          {t(`legend.${status}`)}
        </span>
      ))}
    </div>
  );
}
