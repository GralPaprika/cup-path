import type { Team } from "@/lib/types";
import { TeamFlag } from "@/components/team/team-flag";
import { formatFifaPoints } from "@/lib/format";

export function splitScoreLabel(scoreLabel: string): [string, string] {
  const [home = "—", away = "—"] = scoreLabel.split("-");
  return [home, away];
}

export function FixturePreviewTeamRow({
  team,
  fifaPoints,
  goals,
}: {
  team: Team;
  fifaPoints: number | null;
  goals: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <TeamFlag team={team} size="sm" />
      <p className="min-w-0 truncate font-mono text-[11px] font-semibold text-white">
        {team.id}
      </p>
      <p className="shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground">
        {formatFifaPoints(fifaPoints)}
      </p>
      <span className="ml-auto shrink-0 font-mono text-[11px] font-semibold tabular-nums text-white">
        {goals}
      </span>
    </div>
  );
}
