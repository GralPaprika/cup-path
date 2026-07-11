"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Search } from "lucide-react";
import type { Team } from "@/lib/types";
import {
  getTeamDisplayName,
  teamMatchesQuery,
} from "@/lib/i18n/team-display-name";
import { useTranslations } from "next-intl";
import { TeamFlag } from "@/components/team-flag";
import { PickerLabel } from "@/components/picker-list";
import { cn } from "@/lib/utils";

interface TeamSelectorProps {
  teams: Team[];
  value: string;
  onChange: (teamId: string) => void;
  label?: string;
  placeholder?: string;
}

export function TeamSelector({
  teams,
  value,
  onChange,
  label,
  placeholder,
}: TeamSelectorProps) {
  const t = useTranslations("teamSelector");
  const teamNames = useTranslations("teams");
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

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

    function updateMenuPosition() {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      });
    }

    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);
    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (
        containerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
      setQuery("");
      setMenuPosition(null);
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
    setMenuPosition(null);
  }

  function toggleOpen() {
    setOpen((current) => {
      if (current) {
        setMenuPosition(null);
        return false;
      }
      const rect = triggerRef.current?.getBoundingClientRect();
      if (rect) {
        setMenuPosition({
          top: rect.bottom + 8,
          left: rect.left,
          width: rect.width,
        });
      }
      return true;
    });
  }

  const selectedName = selected
    ? getTeamDisplayName(teamNames, selected)
    : null;

  const menu = open && menuPosition && (
    <div
      ref={menuRef}
      className="fixed z-[200] overflow-hidden rounded-xl border border-white/10 bg-wc-navy/95 shadow-xl backdrop-blur-xl"
      style={{
        top: menuPosition.top,
        left: menuPosition.left,
        width: menuPosition.width,
      }}
    >
      <div className="border-b border-white/8 p-2">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("searchPlaceholder")}
            className="h-9 w-full rounded-lg border border-white/10 bg-white/5 pr-3 pl-8 text-sm text-white outline-none placeholder:text-muted-foreground focus:border-wc-sky/40 focus:ring-1 focus:ring-wc-sky/30"
          />
        </div>
      </div>

      <ul
        role="listbox"
        className="scrollbar-subtle max-h-64 overflow-y-auto p-1"
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
                      ? "bg-white/12 text-white"
                      : "text-white/80 hover:bg-white/6",
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
  );

  return (
    <div className="space-y-3" ref={containerRef}>
      <PickerLabel>{label ?? t("label")}</PickerLabel>

      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          onClick={toggleOpen}
          aria-expanded={open}
          aria-haspopup="listbox"
          className="flex h-12 w-full items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 text-left text-base transition-colors hover:border-white/15 hover:bg-white/8 focus-visible:border-wc-sky/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wc-sky/30"
        >
          {selected ? (
            <span className="flex min-w-0 items-center gap-2">
              <TeamFlag team={selected} size="md" />
              <span className="shrink-0 font-mono text-xs font-semibold tracking-wide text-muted-foreground">
                {selected.id}
              </span>
              <span className="truncate font-medium text-white">
                {selectedName}
              </span>
            </span>
          ) : (
            <span className="text-muted-foreground">
              {placeholder ?? t("placeholder")}
            </span>
          )}
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
          />
        </button>

        {typeof document !== "undefined" && menu
          ? createPortal(menu, document.body)
          : null}
      </div>
    </div>
  );
}
