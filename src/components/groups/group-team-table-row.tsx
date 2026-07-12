"use client";

import type { GroupComparisonTeamEntry } from "@/lib/types";
import { QUALIFICATION_ROW_STYLES } from "@/components/groups/qualification-styles";
import {
  formatGoalDifference,
  formatStandingValue,
} from "@/components/groups/standing-format";
import { TeamLabel } from "@/components/team-flag";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatFifaPoints, formatStatValue } from "@/lib/format";

interface GroupTeamTableRowProps {
  entry: GroupComparisonTeamEntry;
  selectedTeamId?: string;
  variant: "summary" | "full";
}

export function GroupTeamTableRow({
  entry,
  selectedTeamId,
  variant,
}: GroupTeamTableRowProps) {
  const isSelected = entry.team.id === selectedTeamId;
  const cellPy = variant === "summary" ? "py-2" : "py-2.5";

  return (
    <TableRow
      className={cn(
        "border-white/6",
        entry.qualificationStatus &&
          QUALIFICATION_ROW_STYLES[entry.qualificationStatus],
        isSelected && "ring-1 ring-inset ring-wc-sky/50",
      )}
    >
      <TableCell
        className={cn(
          "px-3 text-center font-mono text-sm text-muted-foreground",
          cellPy,
        )}
      >
        {entry.standing.position}
      </TableCell>
      <TableCell
        className={cn(
          "whitespace-normal px-3",
          variant === "summary" ? "max-w-0" : "max-w-[10rem]",
          cellPy,
        )}
      >
        <TeamLabel
          team={entry.team}
          showCode
          flagSize="sm"
          className="w-full"
          nameClassName="text-sm font-medium text-white"
        />
      </TableCell>
      {variant === "full" ? (
        <>
          <TableCell
            className={cn(
              "px-3 text-center font-mono text-sm tabular-nums text-white",
              cellPy,
            )}
          >
            {formatStandingValue(entry.standing.played, entry.standing.points)}
          </TableCell>
          <TableCell
            className={cn(
              "px-3 text-center font-mono text-sm tabular-nums text-muted-foreground",
              cellPy,
            )}
          >
            {entry.standing.played > 0
              ? formatGoalDifference(entry.standing.gd)
              : "—"}
          </TableCell>
          <TableCell
            className={cn(
              "px-3 text-center font-mono text-sm tabular-nums text-white",
              cellPy,
            )}
          >
            {formatStandingValue(entry.standing.played, entry.standing.gf)}
          </TableCell>
          <TableCell
            className={cn(
              "px-3 text-center font-mono text-sm tabular-nums text-white",
              cellPy,
            )}
          >
            {formatStandingValue(entry.standing.played, entry.standing.ga)}
          </TableCell>
        </>
      ) : null}
      <TableCell
        className={cn(
          "whitespace-nowrap px-3 text-right font-mono text-sm tabular-nums text-wc-orange",
          cellPy,
        )}
      >
        {formatFifaPoints(entry.fifaPoints)}
      </TableCell>
      <TableCell
        className={cn(
          "whitespace-nowrap px-3 text-right font-mono text-sm tabular-nums text-white",
          cellPy,
        )}
      >
        {entry.fifaRank ?? "—"}
      </TableCell>
      {variant === "full" ? (
        <>
          <TableCell
            className={cn(
              "whitespace-nowrap px-3 text-right font-mono text-sm tabular-nums text-wc-orange",
              cellPy,
            )}
          >
            {formatFifaPoints(entry.avgOpponentPoints)}
          </TableCell>
          <TableCell
            className={cn(
              "whitespace-nowrap px-3 text-right font-mono text-sm tabular-nums text-white",
              cellPy,
            )}
          >
            {entry.avgOpponentRank !== null
              ? formatStatValue(entry.avgOpponentRank, 1)
              : "—"}
          </TableCell>
          <TableCell
            className={cn(
              "whitespace-nowrap px-3 text-center font-mono text-sm tabular-nums text-muted-foreground",
              cellPy,
            )}
          >
            {entry.rankAmongTeams ?? "—"}
          </TableCell>
        </>
      ) : null}
    </TableRow>
  );
}
