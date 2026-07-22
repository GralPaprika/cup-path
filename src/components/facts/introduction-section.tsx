"use client";

import { TeamFlag } from "@/components/team/team-flag";
import { TeamTierBadge } from "@/components/team/team-tier-badge";
import { formatFifaPoints } from "@/lib/format";
import type { TeamTierId, TeamTiersDataset } from "@/lib/types";
import { useTranslations } from "next-intl";

const TIER_IDS: readonly TeamTierId[] = [
  "titleFavorites",
  "contenders",
  "darkHorses",
  "outsiders",
  "makeweights",
];

interface IntroductionSectionProps {
  teamTiers: TeamTiersDataset;
  className?: string;
}

export function IntroductionSection({
  teamTiers,
  className,
}: IntroductionSectionProps) {
  const t = useTranslations("home.intro");

  return (
    <section className={className}>
      <h2 className="text-lg font-semibold text-white">{t("title")}</h2>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
        <p>{t("lead")}</p>
        <p>{t("terms")}</p>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-white/8">
        <table className="w-full min-w-[420px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/8 bg-white/[0.02]">
              <th className="px-4 py-2.5 font-medium text-muted-foreground">
                {t("tierCol")}
              </th>
              <th className="px-4 py-2.5 font-medium text-muted-foreground">
                {t("pointsCol")}
              </th>
              <th className="px-4 py-2.5 font-medium text-muted-foreground">
                {t("teamsCol")}
              </th>
            </tr>
          </thead>
          <tbody>
            {TIER_IDS.map((tier) => {
              const note = t(`${tier}Note`);
              const members = teamTiers.tiers[tier];

              return (
                <tr
                  key={tier}
                  className="border-b border-white/6 last:border-b-0"
                >
                  <td className="align-top px-4 py-3">
                    <TeamTierBadge tier={tier} />
                    {note ? (
                      <p className="mt-1.5 text-xs text-muted-foreground/70">
                        {note}
                      </p>
                    ) : null}
                  </td>
                  <td className="align-top px-4 py-3 tabular-nums text-muted-foreground">
                    {t(`${tier}Points`)}
                  </td>
                  <td className="align-top px-4 py-3">
                    <div className="flex flex-wrap gap-x-2.5 gap-y-2">
                      {members.map((member) => (
                        <span
                          key={member.team.id}
                          title={`#${member.fifaRank} · ${formatFifaPoints(member.fifaPoints)}`}
                          className="inline-flex flex-col items-center gap-0.5"
                        >
                          <TeamFlag team={member.team} size="sm" />
                          <span className="font-mono text-[10px] font-semibold tracking-wide text-muted-foreground">
                            {member.team.id}
                          </span>
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
