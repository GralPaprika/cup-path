"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Search } from "lucide-react";
import type { Team } from "@/lib/types";
import {
  getTeamDisplayName,
  teamMatchesQuery,
} from "@/lib/i18n/team-display-name";
import { useTranslations } from "next-intl";
import { TeamFlag } from "@/components/team/team-flag";
import { PickerLabel } from "@/components/shared/picker-list";
import { cn } from "@/lib/utils";

interface TeamSelectorProps {
  teams: Team[];
  value: string;
  onChange: (teamId: string) => void;
  label?: string;
  placeholder?: string;
  /** Compact trigger for page headers and tight layouts. */
  size?: "default" | "compact";
  /** Hide the visible label (still exposed via aria attributes). */
  hideLabel?: boolean;
  /** Allow clearing the selection via a leading “(none)” option. */
  allowNone?: boolean;
  /** Label shown when `allowNone` is set and `value` is empty. */
  noneLabel?: string;
  className?: string;
  triggerClassName?: string;
}

type SelectableOption =
  | { kind: "none"; id: string }
  | { kind: "team"; id: string; team: Team; name: string };

export function TeamSelector({
  teams,
  value,
  onChange,
  label,
  placeholder,
  size = "default",
  hideLabel = false,
  allowNone = false,
  noneLabel,
  className,
  triggerClassName,
}: TeamSelectorProps) {
  const t = useTranslations("teamSelector");
  const teamNames = useTranslations("teams");
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const compact = size === "compact";
  const selected = teams.find((team) => team.id === value);
  const fieldLabel = label ?? t("label");
  const emptyLabel = noneLabel ?? t("none");
  const showNoneOption = allowNone && !query.trim();

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

  const selectableOptions = useMemo<SelectableOption[]>(() => {
    const options: SelectableOption[] = [];
    if (showNoneOption) {
      options.push({ kind: "none", id: "" });
    }
    for (const { team, name } of filteredTeams) {
      options.push({ kind: "team", id: team.id, team, name });
    }
    return options;
  }, [showNoneOption, filteredTeams]);

  useEffect(() => {
    if (!open) return;
    setHighlightedIndex(selectableOptions.length > 0 ? 0 : -1);
  }, [open, query, selectableOptions.length]);

  useEffect(() => {
    if (!open || highlightedIndex < 0) return;
    optionRefs.current
      .get(highlightedIndex)
      ?.scrollIntoView({ block: "nearest" });
  }, [open, highlightedIndex]);

  useEffect(() => {
    if (!open) return;

    function updateMenuPosition() {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const width = Math.max(rect.width, compact ? 260 : rect.width);
      const left = Math.min(rect.left, window.innerWidth - width - 8);
      setMenuPosition({
        top: rect.bottom + 8,
        left: Math.max(8, left),
        width,
      });
    }

    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);
    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [open, compact]);

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

  function closeMenu() {
    setOpen(false);
    setQuery("");
    setMenuPosition(null);
    setHighlightedIndex(-1);
  }

  function selectTeam(teamId: string) {
    onChange(teamId);
    closeMenu();
  }

  function toggleOpen() {
    setOpen((current) => {
      if (current) {
        setMenuPosition(null);
        setHighlightedIndex(-1);
        return false;
      }
      const rect = triggerRef.current?.getBoundingClientRect();
      if (rect) {
        const width = Math.max(rect.width, compact ? 260 : rect.width);
        const left = Math.min(rect.left, window.innerWidth - width - 8);
        setMenuPosition({
          top: rect.bottom + 8,
          left: Math.max(8, left),
          width,
        });
      }
      return true;
    });
  }

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    const optionCount = selectableOptions.length;

    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault();
        if (optionCount === 0) return;
        setHighlightedIndex((current) =>
          current < 0 ? 0 : (current + 1) % optionCount,
        );
        break;
      }
      case "ArrowUp": {
        event.preventDefault();
        if (optionCount === 0) return;
        setHighlightedIndex((current) =>
          current < 0
            ? optionCount - 1
            : (current - 1 + optionCount) % optionCount,
        );
        break;
      }
      case "Enter": {
        event.preventDefault();
        if (highlightedIndex < 0 || highlightedIndex >= optionCount) return;
        selectTeam(selectableOptions[highlightedIndex].id);
        break;
      }
      case "Escape": {
        event.preventDefault();
        closeMenu();
        triggerRef.current?.focus();
        break;
      }
    }
  }

  function optionClassName(selected: boolean, highlighted: boolean) {
    return cn(
      "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
      selected && "bg-white/12 text-white",
      !selected && highlighted && "bg-white/8 text-white",
      !selected && !highlighted && "text-white/80 hover:bg-white/6",
    );
  }

  const selectedName = selected
    ? getTeamDisplayName(teamNames, selected)
    : null;

  const activeOptionId =
    highlightedIndex >= 0
      ? `${listboxId}-option-${highlightedIndex}`
      : undefined;

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
            role="combobox"
            aria-expanded={open}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={activeOptionId}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder={t("searchPlaceholder")}
            className="h-9 w-full rounded-lg border border-white/10 bg-white/5 pr-3 pl-8 text-sm text-white outline-none placeholder:text-muted-foreground focus:border-wc-sky/40 focus:ring-1 focus:ring-wc-sky/30"
          />
        </div>
      </div>

      <ul
        id={listboxId}
        role="listbox"
        className="scrollbar-subtle max-h-64 overflow-y-auto p-1"
        aria-label={fieldLabel}
      >
        {selectableOptions.length === 0 ? (
          <li className="px-3 py-6 text-center text-sm text-muted-foreground">
            {t("noResults")}
          </li>
        ) : (
          selectableOptions.map((option, index) => {
            const isSelected = option.id === value;
            const isHighlighted = index === highlightedIndex;
            const optionId = `${listboxId}-option-${index}`;

            if (option.kind === "none") {
              return (
                <li key="none">
                  <button
                    ref={(node) => {
                      if (node) optionRefs.current.set(index, node);
                      else optionRefs.current.delete(index);
                    }}
                    id={optionId}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => selectTeam("")}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={optionClassName(isSelected, isHighlighted)}
                  >
                    <span className="truncate font-medium text-muted-foreground">
                      {emptyLabel}
                    </span>
                  </button>
                </li>
              );
            }

            return (
              <li key={option.team.id}>
                <button
                  ref={(node) => {
                    if (node) optionRefs.current.set(index, node);
                    else optionRefs.current.delete(index);
                  }}
                  id={optionId}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => selectTeam(option.team.id)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={optionClassName(isSelected, isHighlighted)}
                >
                  <TeamFlag team={option.team} size="sm" />
                  <span className="w-9 shrink-0 font-mono text-xs font-semibold tracking-wide text-muted-foreground">
                    {option.team.id}
                  </span>
                  <span className="truncate font-medium">{option.name}</span>
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );

  return (
    <div className={cn(compact ? "space-y-1.5" : "space-y-3", className)} ref={containerRef}>
      {!hideLabel && <PickerLabel>{fieldLabel}</PickerLabel>}

      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          onClick={toggleOpen}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label={hideLabel ? fieldLabel : undefined}
          className={cn(
            "flex w-full items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 text-left transition-colors hover:border-white/15 hover:bg-white/8 focus-visible:border-wc-sky/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wc-sky/30",
            compact ? "h-11 min-w-[11rem] max-w-xs gap-2 px-2.5 text-sm" : "h-12 px-3 text-base",
            triggerClassName,
          )}
        >
          {selected ? (
            <span className="flex min-w-0 items-center gap-2">
              <TeamFlag team={selected} size={compact ? "sm" : "md"} />
              <span className="shrink-0 font-mono text-xs font-semibold tracking-wide text-muted-foreground">
                {selected.id}
              </span>
              <span className="truncate font-medium text-white">
                {selectedName}
              </span>
            </span>
          ) : allowNone ? (
            <span className="truncate font-medium text-muted-foreground">
              {emptyLabel}
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
