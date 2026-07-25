"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { getTeamDisplayName } from "@/lib/i18n/team-display-name";
import {
  matchTargetMatchesQuery,
  type MatchSearchTarget,
} from "@/lib/domain/match/match-search";
import type { Team } from "@/lib/types";

export interface MatchSearchFields {
  teams: [Pick<Team, "id" | "displayName">, Pick<Team, "id" | "displayName">];
  scoreFt: string | null;
  scoreEt: string | null;
  decidedOnPenalties: boolean;
}

export function useMatchSearch<T>(
  rows: T[],
  toFields: (row: T) => MatchSearchFields,
) {
  const teamNames = useTranslations("teams");
  const [query, setQuery] = useState("");

  const filteredRows = useMemo(() => {
    if (!query.trim()) return rows;

    return rows.filter((row) => {
      const fields = toFields(row);
      const target: MatchSearchTarget = {
        teamIds: [fields.teams[0].id, fields.teams[1].id],
        teamNames: [
          getTeamDisplayName(teamNames, fields.teams[0]),
          getTeamDisplayName(teamNames, fields.teams[1]),
        ],
        scoreFt: fields.scoreFt,
        scoreEt: fields.scoreEt,
        decidedOnPenalties: fields.decidedOnPenalties,
      };
      return matchTargetMatchesQuery(target, query);
    });
  }, [query, rows, teamNames, toFields]);

  return { query, setQuery, filteredRows };
}
