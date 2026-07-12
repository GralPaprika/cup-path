import type { Team } from "@/lib/types";
import { TeamFlag } from "@/components/team-flag";

export function PathChartLegendLineItem({
  color,
  dashed,
  label,
  team,
}: {
  color: string;
  dashed?: boolean;
  label: string;
  team?: Pick<Team, "id" | "flagUrl" | "displayName">;
}) {
  return (
    <span className="flex items-center gap-1.5" style={{ color }}>
      <span
        className="inline-block w-5 border-t"
        style={{
          borderColor: color,
          borderTopStyle: dashed ? "dashed" : "solid",
        }}
      />
      {team ? <TeamFlag team={team} size="sm" /> : null}
      <span className="font-mono text-[10px] font-semibold">{label}</span>
    </span>
  );
}

export function PathChartLegendBarItem({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <span className="flex items-center gap-1.5 text-muted-foreground">
      <span
        className="inline-block h-2.5 w-3 rounded-sm"
        style={{ backgroundColor: color }}
      />
      <span className="text-[10px] font-semibold">{label}</span>
    </span>
  );
}
