"use client";

import Link from "next/link";
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

function TierTeamFlags({
  members,
}: {
  members: TeamTiersDataset["tiers"][TeamTierId];
}) {
  return (
    <div className="flex min-w-0 w-full flex-wrap gap-x-1.5 gap-y-1.5 md:gap-x-2.5 md:gap-y-2">
      {members.map((member) => (
        <Link
          key={member.team.id}
          href={`/?team=${member.team.id}`}
          title={`#${member.fifaRank} · ${formatFifaPoints(member.fifaPoints)}`}
          className="inline-flex flex-col items-center gap-0.5 transition-opacity hover:opacity-80"
        >
          <TeamFlag team={member.team} size="sm" />
          <span className="font-mono text-[10px] font-semibold tracking-wide text-muted-foreground group-hover:text-wc-sky">
            {member.team.id}
          </span>
        </Link>
      ))}
    </div>
  );
}

export function IntroductionSection({
  teamTiers,
  className,
}: IntroductionSectionProps) {
  const t = useTranslations("home.intro");

  return (
    <section className={`min-w-0 w-full ${className ?? ""}`}>
      <h2 className="text-lg font-semibold text-white">{t("title")}</h2>
      <div className="mt-3 space-y-2.5 text-sm leading-relaxed text-muted-foreground sm:mt-4 sm:space-y-3 sm:text-base">
        <p>{t("lead")}</p>
        <p>{t("terms")}</p>
      </div>

      <ul className="mt-3 min-w-0 w-full divide-y divide-white/6 rounded-xl border border-white/8 md:hidden">
        {TIER_IDS.map((tier) => {
          const note = t(`${tier}Note`);
          const members = teamTiers.tiers[tier];

          return (
            <li key={tier} className="min-w-0 px-2 py-2">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <TeamTierBadge tier={tier} />
                  <span className="tabular-nums text-xs text-muted-foreground">
                    {t(`${tier}Points`)}
                  </span>
                </div>
                {note ? (
                  <p className="text-xs text-muted-foreground/70">{note}</p>
                ) : null}
              </div>
              <div className="mt-3.5">
                <TierTeamFlags members={members} />
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 hidden overflow-x-auto rounded-xl border border-white/8 md:block">
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
                    <TierTeamFlags members={members} />
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
