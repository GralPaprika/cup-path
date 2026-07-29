"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ListFilter, Maximize2 } from "lucide-react";
import type { BestThirdRankingEntry, GroupFinishCard, Team } from "@/lib/types";
import type { GroupFinishPosition } from "@/lib/domain/group/group-finish-swap";
import { getTeamDisplayName } from "@/lib/i18n/team-display-name";
import { useTranslations } from "next-intl";
import { TeamFlag } from "@/components/team/team-flag";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePersistedUiState } from "@/hooks/use-persisted-ui-state";
import {
  CAROUSEL_WHEEL_IDLE_MS,
  CAROUSEL_WHEEL_STEP_THRESHOLD,
  getCarouselWindowLetters,
  GROUPS_CAROUSEL_SLIDING_SLOTS,
  normalizeWheelDelta,
  orderRotatingGroupLetters,
  parseVisibleGroupLetters,
  SIMULATE_VISIBLE_GROUPS_KEY,
  takeCarouselWheelSteps,
  wrapCarouselIndex,
} from "@/lib/client/simulate-ui-preference";
import { cn } from "@/lib/utils";

interface GroupFinishEditorProps {
  teams: Team[];
  groupCards: GroupFinishCard[];
  bestThirdRanking: BestThirdRankingEntry[];
  focusTeamId: string;
  onSwapPositions: (
    groupLetter: string,
    positionA: GroupFinishPosition,
    positionB: GroupFinishPosition,
  ) => void;
  onSortByPoints: () => void;
  /** When true, omit the outer glass panel and page title. */
  embedded?: boolean;
}

function PositionRow({
  position,
  teamId,
  teams,
  focusTeamId,
  thirdQualifies,
  onSwapUp,
  onSwapDown,
  canSwapUp,
  canSwapDown,
}: {
  position: GroupFinishPosition;
  teamId: string;
  teams: Team[];
  focusTeamId: string;
  thirdQualifies: boolean;
  onSwapUp: () => void;
  onSwapDown: () => void;
  canSwapUp: boolean;
  canSwapDown: boolean;
}) {
  const teamNames = useTranslations("teams");
  const t = useTranslations("simulate.groups");
  const team = teams.find((entry) => entry.id === teamId);
  const name = team ? getTeamDisplayName(teamNames, team) : teamId;
  const isFocus = teamId === focusTeamId;

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border border-white/8 px-2 py-1.5",
        isFocus && "border-wc-orange/40 bg-wc-orange/5",
        position === 3 && thirdQualifies && "border-wc-sky/30 bg-wc-sky/5",
        position === 4 && "opacity-80",
      )}
    >
      <span className="w-5 shrink-0 text-center font-mono text-xs font-semibold text-wc-orange">
        {position}
      </span>
      {team ? (
        <TeamFlag team={team} size="sm" />
      ) : (
        <span className="h-4 w-6 shrink-0" />
      )}
      <span className="min-w-0 flex-1 truncate text-sm text-white">{name}</span>
      {position === 3 && thirdQualifies && (
        <span className="shrink-0 rounded bg-wc-sky/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-wc-sky">
          {t("bestThird")}
        </span>
      )}
      {position === 4 && (
        <span className="shrink-0 rounded bg-white/8 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-muted-foreground">
          {t("eliminated")}
        </span>
      )}
      <div className="flex shrink-0 flex-col gap-0.5">
        <button
          type="button"
          disabled={!canSwapUp}
          onClick={onSwapUp}
          className="rounded border border-white/10 px-1 text-[10px] text-muted-foreground transition-colors hover:border-white/20 hover:text-white disabled:opacity-30"
          aria-label={t("moveUp")}
        >
          ↑
        </button>
        <button
          type="button"
          disabled={!canSwapDown}
          onClick={onSwapDown}
          className="rounded border border-white/10 px-1 text-[10px] text-muted-foreground transition-colors hover:border-white/20 hover:text-white disabled:opacity-30"
          aria-label={t("moveDown")}
        >
          ↓
        </button>
      </div>
    </div>
  );
}

function GroupCard({
  card,
  teams,
  focusTeamId,
  focusGroupLetter,
  onSwapPositions,
  className,
}: {
  card: GroupFinishCard;
  teams: Team[];
  focusTeamId: string;
  focusGroupLetter: string | null;
  onSwapPositions: GroupFinishEditorProps["onSwapPositions"];
  className?: string;
}) {
  const t = useTranslations("simulate");
  const isFocusGroup = card.groupLetter === focusGroupLetter;

  return (
    <div
      className={cn(
        "rounded-xl border border-white/8 bg-white/[0.02] p-3",
        isFocusGroup && "border-wc-orange/35 bg-wc-orange/[0.04]",
        className,
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {t("groupLabel", { letter: card.groupLetter })}
        </p>
        {isFocusGroup && (
          <span className="rounded bg-wc-orange/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-wc-orange">
            {t("yourGroup")}
          </span>
        )}
      </div>
      <div className="space-y-1.5">
        {card.positions.map(({ position, teamId }) => (
          <PositionRow
            key={position}
            position={position}
            teamId={teamId}
            teams={teams}
            focusTeamId={focusTeamId}
            thirdQualifies={card.thirdQualifies}
            canSwapUp={position > 1}
            canSwapDown={position < 4}
            onSwapUp={() =>
              onSwapPositions(
                card.groupLetter,
                position,
                (position - 1) as GroupFinishPosition,
              )
            }
            onSwapDown={() =>
              onSwapPositions(
                card.groupLetter,
                position,
                (position + 1) as GroupFinishPosition,
              )
            }
          />
        ))}
      </div>
    </div>
  );
}

function GroupsGrid({
  cards,
  teams,
  focusTeamId,
  focusGroupLetter,
  onSwapPositions,
}: {
  cards: GroupFinishCard[];
  teams: Team[];
  focusTeamId: string;
  focusGroupLetter: string | null;
  onSwapPositions: GroupFinishEditorProps["onSwapPositions"];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <GroupCard
          key={card.groupLetter}
          card={card}
          teams={teams}
          focusTeamId={focusTeamId}
          focusGroupLetter={focusGroupLetter}
          onSwapPositions={onSwapPositions}
        />
      ))}
    </div>
  );
}

function GroupsCarousel({
  cardsByLetter,
  visibleLetters,
  focusTeamId,
  focusGroupLetter,
  onSwapPositions,
  teams,
  onViewAll,
  viewAllLabel,
}: {
  cardsByLetter: Map<string, GroupFinishCard>;
  visibleLetters: string[];
  teams: Team[];
  focusTeamId: string;
  focusGroupLetter: string | null;
  onSwapPositions: GroupFinishEditorProps["onSwapPositions"];
  onViewAll: () => void;
  viewAllLabel: string;
}) {
  const t = useTranslations("simulate");
  const rotatingLetters = useMemo(
    () => orderRotatingGroupLetters(visibleLetters, focusGroupLetter),
    [visibleLetters, focusGroupLetter],
  );

  const windowKey = `${focusGroupLetter}:${rotatingLetters.join(",")}`;
  const [windowState, setWindowState] = useState({ key: windowKey, index: 0 });
  const gridRef = useRef<HTMLDivElement>(null);
  const accumulatorRef = useRef(0);
  const lastWheelAtRef = useRef(0);

  if (windowState.key !== windowKey) {
    setWindowState({ key: windowKey, index: 0 });
  }

  const pageCount = rotatingLetters.length;
  const windowIndex =
    windowState.key === windowKey
      ? wrapCarouselIndex(windowState.index, pageCount)
      : 0;

  const showControls = rotatingLetters.length > GROUPS_CAROUSEL_SLIDING_SLOTS;

  function setWindowIndex(index: number) {
    setWindowState({
      key: windowKey,
      index: wrapCarouselIndex(index, pageCount),
    });
  }

  useEffect(() => {
    const node = gridRef.current;
    if (!node || !showControls) return;

    function handleWheel(event: WheelEvent) {
      const delta = normalizeWheelDelta(event.deltaX, event.deltaMode);
      if (delta === 0) return;
      event.preventDefault();

      const idle =
        event.timeStamp - lastWheelAtRef.current > CAROUSEL_WHEEL_IDLE_MS;
      const flipped =
        Math.sign(delta) !== Math.sign(accumulatorRef.current) &&
        accumulatorRef.current !== 0;
      lastWheelAtRef.current = event.timeStamp;
      if (idle || flipped) accumulatorRef.current = 0;

      const { steps, remainder } = takeCarouselWheelSteps(
        accumulatorRef.current + delta,
        CAROUSEL_WHEEL_STEP_THRESHOLD,
      );
      accumulatorRef.current = remainder;
      if (steps === 0) return;

      setWindowState((current) => ({
        key: windowKey,
        index: wrapCarouselIndex(
          (current.key === windowKey ? current.index : 0) + steps,
          pageCount,
        ),
      }));
    }

    node.addEventListener("wheel", handleWheel, { passive: false });
    return () => node.removeEventListener("wheel", handleWheel);
  }, [showControls, windowKey, pageCount]);

  const slidingLetters = getCarouselWindowLetters(
    rotatingLetters,
    windowIndex,
    GROUPS_CAROUSEL_SLIDING_SLOTS,
  );

  const slotLetters = focusGroupLetter
    ? [focusGroupLetter, ...slidingLetters]
    : slidingLetters;

  const slotCards = slotLetters
    .map((letter) => cardsByLetter.get(letter))
    .filter((card): card is GroupFinishCard => Boolean(card));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">{t("groupsCarouselHint")}</p>
        <div className="flex items-center gap-1">
          {showControls && (
            <>
              <button
                type="button"
                onClick={() => setWindowIndex(windowIndex - 1)}
                aria-label={t("carouselPrev")}
                className="inline-flex size-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-colors hover:border-white/25 hover:bg-white/10"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setWindowIndex(windowIndex + 1)}
                aria-label={t("carouselNext")}
                className="inline-flex size-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-colors hover:border-white/25 hover:bg-white/10"
              >
                <ChevronRight className="size-4" />
              </button>
            </>
          )}
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label={viewAllLabel}
            onClick={onViewAll}
          >
            <Maximize2 />
          </Button>
        </div>
      </div>

      <div
        ref={gridRef}
        className="grid grid-cols-1 gap-3 overscroll-contain sm:grid-cols-2 lg:grid-cols-4"
      >
        {slotCards.map((card) => (
          <GroupCard
            key={
              card.groupLetter === focusGroupLetter
                ? `focus-${card.groupLetter}`
                : `${windowIndex}-${card.groupLetter}`
            }
            card={card}
            teams={teams}
            focusTeamId={focusTeamId}
            focusGroupLetter={focusGroupLetter}
            onSwapPositions={onSwapPositions}
            className="h-full"
          />
        ))}
      </div>

      {showControls && (
        <div className="flex items-center justify-center gap-1.5" aria-hidden>
          {Array.from({ length: pageCount }, (_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setWindowIndex(index)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                index === windowIndex
                  ? "w-4 bg-wc-sky"
                  : "w-1.5 bg-white/20 hover:bg-white/35",
              )}
              aria-label={`${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BestThirdRankingTable({
  teams,
  ranking,
  focusTeamId,
}: {
  teams: Team[];
  ranking: BestThirdRankingEntry[];
  focusTeamId: string;
}) {
  const t = useTranslations("simulate.bestThird");
  const teamNames = useTranslations("teams");

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{t("subtitle")}</p>

      <div className="overflow-x-auto rounded-xl border border-white/8">
        <Table>
          <TableHeader>
            <TableRow className="border-white/8 hover:bg-transparent">
              <TableHead className="text-muted-foreground">{t("rank")}</TableHead>
              <TableHead className="text-muted-foreground">{t("group")}</TableHead>
              <TableHead className="text-muted-foreground">{t("team")}</TableHead>
              <TableHead className="text-right text-muted-foreground">
                {t("played")}
              </TableHead>
              <TableHead className="text-right text-muted-foreground">
                {t("points")}
              </TableHead>
              <TableHead className="text-right text-muted-foreground">
                {t("gd")}
              </TableHead>
              <TableHead className="text-right text-muted-foreground">
                {t("gf")}
              </TableHead>
              <TableHead className="text-right text-muted-foreground">
                {t("ga")}
              </TableHead>
              <TableHead className="text-right text-muted-foreground">
                {t("status")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ranking.map((entry) => {
              const team = teams.find((item) => item.id === entry.teamId);
              const name = team
                ? getTeamDisplayName(teamNames, team)
                : entry.teamId;
              const isFocus = entry.teamId === focusTeamId;
              const isCutoff = entry.rank === 8;

              return (
                <TableRow
                  key={`${entry.groupLetter}-${entry.teamId}`}
                  className={cn(
                    "border-white/6",
                    entry.qualifies && "bg-wc-sky/5",
                    isFocus && "bg-wc-orange/5",
                    isCutoff && "border-b-2 border-b-wc-sky/40",
                  )}
                >
                  <TableCell className="font-mono tabular-nums text-white">
                    #{entry.rank}
                  </TableCell>
                  <TableCell className="font-mono text-muted-foreground">
                    {entry.groupLetter}
                  </TableCell>
                  <TableCell>
                    {team ? (
                      <span className="inline-flex items-center gap-2">
                        <TeamFlag team={team} size="sm" />
                        <span className="font-medium text-white">{name}</span>
                      </span>
                    ) : (
                      name
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums text-muted-foreground">
                    {entry.played}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums text-wc-orange">
                    {entry.points}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums text-white">
                    {entry.gd > 0 ? `+${entry.gd}` : entry.gd}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums text-muted-foreground">
                    {entry.gf}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums text-muted-foreground">
                    {entry.ga}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                        entry.qualifies
                          ? "bg-wc-sky/15 text-wc-sky"
                          : "bg-white/8 text-muted-foreground",
                      )}
                    >
                      {entry.qualifies ? t("qualifies") : t("eliminated")}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">{t("footnote")}</p>
    </div>
  );
}

export function GroupFinishEditor({
  teams,
  groupCards,
  bestThirdRanking,
  focusTeamId,
  onSwapPositions,
  onSortByPoints,
  embedded = false,
}: GroupFinishEditorProps) {
  const t = useTranslations("simulate");
  const [activeTab, setActiveTab] = useState<"groups" | "bestThird">("groups");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [allGroupsOpen, setAllGroupsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const [storedVisible, setStoredVisible] = usePersistedUiState<string[] | null>(
    SIMULATE_VISIBLE_GROUPS_KEY,
    null,
  );

  useEffect(() => {
    if (!pickerOpen) return;

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (pickerRef.current?.contains(target)) return;
      setPickerOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setPickerOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [pickerOpen]);

  const focusGroupLetter = useMemo(() => {
    return (
      groupCards.find((card) =>
        card.positions.some((entry) => entry.teamId === focusTeamId),
      )?.groupLetter ?? null
    );
  }, [groupCards, focusTeamId]);

  const allLetters = useMemo(
    () =>
      [...groupCards]
        .map((card) => card.groupLetter)
        .sort((a, b) => a.localeCompare(b)),
    [groupCards],
  );

  const visibleLetters = useMemo(
    () => parseVisibleGroupLetters(storedVisible, allLetters, focusGroupLetter),
    [storedVisible, allLetters, focusGroupLetter],
  );

  const cardsByLetter = useMemo(() => {
    return new Map(groupCards.map((card) => [card.groupLetter, card]));
  }, [groupCards]);

  const alphabeticalCards = useMemo(() => {
    return [...groupCards].sort((a, b) =>
      a.groupLetter.localeCompare(b.groupLetter),
    );
  }, [groupCards]);

  function toggleGroupVisibility(letter: string) {
    if (letter === focusGroupLetter) return;
    setStoredVisible((current) => {
      const base = parseVisibleGroupLetters(
        current,
        allLetters,
        focusGroupLetter,
      );
      if (base.includes(letter)) {
        return base.filter((entry) => entry !== letter);
      }
      return [...base, letter];
    });
  }

  function selectAllGroups() {
    setStoredVisible(allLetters);
  }

  function selectFocusOnly() {
    setStoredVisible(focusGroupLetter ? [focusGroupLetter] : []);
  }

  return (
    <div
      className={cn(
        "space-y-4",
        !embedded && "glass-panel p-5 sm:p-6",
      )}
    >
      {!embedded && (
        <div>
          <h2 className="text-lg font-semibold text-white">
            {t("groupFinishes")}
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {t("groupFinishesHint")}
          </p>
        </div>
      )}

      <p className="text-xs text-muted-foreground">{t("groupEditClearsWinners")}</p>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex rounded-lg border border-white/10 bg-white/5 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("groups")}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              activeTab === "groups"
                ? "bg-white/12 text-white"
                : "text-muted-foreground hover:text-white",
            )}
          >
            {t("groupsTab")}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("bestThird")}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              activeTab === "bestThird"
                ? "bg-white/12 text-white"
                : "text-muted-foreground hover:text-white",
            )}
          >
            {t("bestThirdTab")}
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <div className="relative" ref={pickerRef}>
            {activeTab === "groups" && (
              <>
                <button
                  type="button"
                  onClick={() => setPickerOpen((current) => !current)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-white/20 hover:text-white"
                  aria-expanded={pickerOpen}
                >
                  <ListFilter className="size-3.5" />
                  {t("selectGroups")}
                </button>
                {pickerOpen && (
                  <div className="absolute top-full right-0 z-20 mt-2 w-56 rounded-xl border border-white/10 bg-wc-navy/95 p-3 shadow-xl backdrop-blur-xl">
                    <div className="mb-2 flex gap-2">
                      <button
                        type="button"
                        onClick={selectFocusOnly}
                        className="rounded border border-white/10 px-2 py-1 text-[11px] text-muted-foreground hover:text-white"
                      >
                        {t("showFocusGroupOnly")}
                      </button>
                      <button
                        type="button"
                        onClick={selectAllGroups}
                        className="rounded border border-white/10 px-2 py-1 text-[11px] text-muted-foreground hover:text-white"
                      >
                        {t("showAllGroups")}
                      </button>
                    </div>
                    <ul className="scrollbar-subtle max-h-64 space-y-1 overflow-y-auto">
                      {allLetters.map((letter) => {
                        const locked = letter === focusGroupLetter;
                        const checked = visibleLetters.includes(letter);
                        return (
                          <li key={letter}>
                            <label
                              className={cn(
                                "flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-white/6",
                                locked && "cursor-default opacity-90",
                              )}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                disabled={locked}
                                onChange={() => toggleGroupVisibility(letter)}
                                className="size-3.5 rounded border-white/20 bg-white/5 text-wc-sky"
                              />
                              <span className="text-white">
                                {t("groupLabel", { letter })}
                              </span>
                              {locked && (
                                <span className="ml-auto text-[10px] uppercase tracking-wide text-wc-orange">
                                  {t("yourGroup")}
                                </span>
                              )}
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
          <button
            type="button"
            onClick={onSortByPoints}
            className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-white/20 hover:text-white"
          >
            {t("sortByPoints")}
          </button>
        </div>
      </div>

      {activeTab === "groups" ? (
        <GroupsCarousel
          cardsByLetter={cardsByLetter}
          visibleLetters={visibleLetters}
          teams={teams}
          focusTeamId={focusTeamId}
          focusGroupLetter={focusGroupLetter}
          onSwapPositions={onSwapPositions}
          onViewAll={() => setAllGroupsOpen(true)}
          viewAllLabel={t("viewAllGroups")}
        />
      ) : (
        <BestThirdRankingTable
          teams={teams}
          ranking={bestThirdRanking}
          focusTeamId={focusTeamId}
        />
      )}

      <Dialog open={allGroupsOpen} onOpenChange={setAllGroupsOpen}>
        <DialogContent size="full">
          <DialogHeader>
            <DialogTitle>{t("allGroupsTitle")}</DialogTitle>
            <DialogDescription>{t("allGroupsDescription")}</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <GroupsGrid
              cards={alphabeticalCards}
              teams={teams}
              focusTeamId={focusTeamId}
              focusGroupLetter={focusGroupLetter}
              onSwapPositions={onSwapPositions}
            />
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
}
