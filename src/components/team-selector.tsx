"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import type { Team } from "@/lib/types";
import {
  getTeamDisplayName,
  teamMatchesQuery,
} from "@/lib/i18n/team-display-name";
import { useTranslations } from "next-intl";
import { TeamFlag } from "@/components/team-flag";
import { cn } from "@/lib/utils";

interface TeamSelectorProps {
  teams: Team[];
  value: string;
  onChange: (teamId: string) => void;
}

export function TeamSelector({ teams, value, onChange }: TeamSelectorProps) {
  const t = useTranslations("teamSelector");
  const teamNames = useTranslations("teams");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = teams.find((team) => team.id === value);

  const localizedTeams = useMemo(
    () =>
      teams.map((team) => ({
        team,
        name: getTeamDisplayName(teamNames, team),
      })),
    [teamNames, teams],
  );

  const filteredTeams = useMemo(() => {
    const sorted = [...localizedTeams].sort((a, b) =>
      a.name.localeCompare(b.name),
    );
    return sorted.filter(({ team, name }) => teamMatchesQuery(team, name, query));
  }, [localizedTeams, query]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  function selectTeam(teamId: string) {
    onChange(teamId);
    setOpen(false);
    setQuery("");
  }

  const selectedName = selected
    ? getTeamDisplayName(teamNames, selected)
    : null;

  return (
    <div className="space-y-3" ref={containerRef}>
      <label className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {t("label")}
      </label>

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-haspopup="listbox"
          className="flex h-12 w-full items-center justify-between gap-3 rounded-xl border border-hermes-100 bg-white px-3 text-left text-base shadow-sm transition-colors hover:border-hermes-200 focus-visible:border-hermes-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hermes-200/60"
        >
          {selected ? (
            <span className="flex min-w-0 items-center gap-2">
              <TeamFlag team={selected} size="md" />
              <span className="shrink-0 font-mono text-xs font-semibold tracking-wide text-muted-foreground">
                {selected.id}
              </span>
              <span className="truncate font-medium text-heather">
                {selectedName}
              </span>
            </span>
          ) : (
            <span className="text-muted-foreground">{t("placeholder")}</span>
          )}
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
          />
        </button>

        {open && (
          <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-hermes-100 bg-white shadow-lg">
            <div className="border-b border-hermes-50 p-2">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t("searchPlaceholder")}
                  className="h-9 w-full rounded-lg border border-hermes-100 bg-mist-50/60 pr-3 pl-8 text-sm text-heather outline-none placeholder:text-muted-foreground focus:border-hermes-200 focus:ring-2 focus:ring-hermes-100"
                />
              </div>
            </div>

            <ul
              role="listbox"
              className="max-h-64 overflow-y-auto p-1"
              aria-label={t("label")}
            >
              {filteredTeams.length === 0 ? (
                <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                  {t("noResults")}
                </li>
              ) : (
                filteredTeams.map(({ team, name }) => {
                  const active = team.id === value;

                  return (
                    <li key={team.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={active}
                        onClick={() => selectTeam(team.id)}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                          active
                            ? "bg-hermes-50 text-hermes-800"
                            : "text-heather hover:bg-mist-50",
                        )}
                      >
                        <TeamFlag team={team} size="sm" />
                        <span className="w-9 shrink-0 font-mono text-xs font-semibold tracking-wide text-muted-foreground">
                          {team.id}
                        </span>
                        <span className="truncate font-medium">{name}</span>
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
