"use client";

import { TeamTierBadge } from "@/components/team/team-tier-badge";
import type { EvenMatchesByTierInsight } from "@/lib/types";
import { useTranslations } from "next-intl";

interface EvenMatchesByTierStoryProps {
  insight: EvenMatchesByTierInsight;
}

export function EvenMatchesByTierStory({
  insight,
}: EvenMatchesByTierStoryProps) {
  const t = useTranslations("home.matchOutcomeGap");

  return (
    <div className="space-y-3 text-base leading-7 text-muted-foreground">
      <p>
        {t("evenMatchesLead", {
          groupStagePct: insight.groupStagePct,
        })}
      </p>
      <p>{t("evenMatchesBody")}</p>
      <p>{t("evenMatchesDistributionIntro")}</p>

      <div className="w-fit max-w-full overflow-x-auto rounded-xl border border-white/8">
        <table className="text-left text-sm">
          <thead>
            <tr className="border-b border-white/8 bg-white/[0.02]">
              <th className="px-4 py-2.5 font-medium text-muted-foreground">
                {t("evenMatchesTierCol")}
              </th>
              <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">
                {t("evenMatchesCountCol")}
              </th>
            </tr>
          </thead>
          <tbody>
            {insight.rows.map(({ tier, count }) => (
              <tr
                key={tier}
                className="border-b border-white/6 last:border-b-0"
              >
                <td className="px-4 py-3">
                  <TeamTierBadge tier={tier} />
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-white">
                  {count}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
