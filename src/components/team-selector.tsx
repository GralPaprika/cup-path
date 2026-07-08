"use client";

import type { Team } from "@/lib/types";
import { useTranslations } from "next-intl";
import { TeamFlag, TeamLabel } from "@/components/team-flag";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TeamSelectorProps {
  teams: Team[];
  value: string;
  onChange: (teamId: string) => void;
}

export function TeamSelector({ teams, value, onChange }: TeamSelectorProps) {
  const t = useTranslations("teamSelector");
  const selected = teams.find((team) => team.id === value);

  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {t("label")}
      </label>
      <Select
        value={value}
        onValueChange={(next) => {
          if (next) onChange(next);
        }}
      >
        <SelectTrigger className="h-12 w-full border-emerald-200 bg-white text-base shadow-sm">
          <SelectValue placeholder={t("placeholder")}>
            {selected && (
              <TeamLabel team={selected} showCode flagSize="md" nameClassName="font-medium" />
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {teams.map((team) => (
            <SelectItem key={team.id} value={team.id}>
              <span className="flex items-center gap-2">
                <TeamFlag team={team} size="sm" />
                <span>{team.displayName}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
