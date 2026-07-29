"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type MutableRefObject,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { Grid2x2 } from "lucide-react";
import type { ResolvedBracketMatch, Team } from "@/lib/types";
import { getTeamDisplayName } from "@/lib/i18n/team-display-name";
import { getRoundDisplayName } from "@/lib/i18n/round-display-name";
import { useTranslations } from "next-intl";
import { TeamFlag } from "@/components/team/team-flag";
import {
  BRACKET_COLUMNS,
  exclusiveCenterMatchNums,
  getBracketGridRows,
  getMatchLayout,
  getPathSliceLayouts,
  visibleColumnsForPathSlice,
  type BracketColumn,
} from "@/components/bracket/bracket-tree-layout";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getCuratedBracketMatchNums, isKnockoutWinnerOverride } from "@/lib/domain/bracket/bracket-resolver";
import { isThirdPlaceMatch } from "@/lib/domain/match/match-stages";
import { cn } from "@/lib/utils";

export type BracketRoundFilter = "all" | "r16" | "qf" | "sf";

type BracketCardDensity = "compact" | "cozy" | "comfortable" | "roomy";

const ROUND_FILTER_COLUMN_KEYS: Record<
  Exclude<BracketRoundFilter, "all">,
  readonly string[]
> = {
  r16: [
    "r16-left",
    "qf-left",
    "sf-left",
    "center",
    "sf-right",
    "qf-right",
    "r16-right",
  ],
  qf: ["qf-left", "sf-left", "center", "sf-right", "qf-right"],
  sf: ["sf-left", "center", "sf-right"],
};

const DENSITY_COLUMN_SIZES: Record<
  BracketCardDensity,
  { minPx: number; maxPx?: number }
> = {
  compact: { minPx: 130 },
  cozy: { minPx: 150 },
  comfortable: { minPx: 160, maxPx: 220 },
  roomy: { minPx: 180, maxPx: 260 },
};

function densityForRoundFilter(filter: BracketRoundFilter): BracketCardDensity {
  if (filter === "sf") return "roomy";
  if (filter === "qf") return "comfortable";
  return "compact";
}

const PATH_SLICE_COLUMN_MIN_PX = 170;
const PATH_SLICE_VIEWPORT_HEIGHT_PX = 480;
const DRAG_THRESHOLD_PX = 4;

interface BracketTreeProps {
  matches: ResolvedBracketMatch[];
  teams: Team[];
  scenarioWinners: Record<number, string | undefined>;
  actualWinnersByMatchNum: Record<number, string | null>;
  affectedMatchNums: number[];
  changedMatchNums: number[];
  pendingWinnerMatchNums: number[];
  focusTeamId: string;
  focusTeamMatchNums: number[];
  onSelectWinner: (matchNum: number, teamId: string) => void;
  /** When true, omit the page-level title (CollapsibleSection provides it). */
  embedded?: boolean;
  /** Extra scenario actions rendered inline in the controls row. */
  actions?: ReactNode;
}

function BracketSide({
  side,
  teams,
  isWinner,
  isFocus,
  density,
  selectable,
  onClick,
}: {
  side: ResolvedBracketMatch["home"];
  teams: Team[];
  isWinner: boolean;
  isFocus: boolean;
  density: BracketCardDensity;
  selectable: boolean;
  onClick: () => void;
}) {
  const teamNames = useTranslations("teams");
  const team = side.teamId
    ? teams.find((entry) => entry.id === side.teamId)
    : null;
  const name = team ? getTeamDisplayName(teamNames, team) : null;
  const canSelect = selectable && Boolean(side.teamId);
  const flagSize =
    density === "compact"
      ? "xs"
      : density === "cozy"
        ? "sm"
        : density === "comfortable"
          ? "sm"
          : "md";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!canSelect}
      className={cn(
        "flex w-full items-center rounded border text-left transition-colors",
        density === "roomy"
          ? "gap-2 px-2 py-1.5 text-sm"
          : density === "comfortable"
            ? "gap-1.5 px-2 py-1 text-xs"
            : density === "cozy"
              ? "gap-1.5 px-1.5 py-1 text-[11px]"
              : "gap-1 px-1 py-0.5 text-[9px]",
        canSelect && "hover:border-wc-sky/40 hover:bg-white/5",
        isWinner && "border-wc-sky/40 bg-wc-sky/10",
        isFocus && "ring-1 ring-wc-orange/60",
        !canSelect && "cursor-default opacity-50",
      )}
    >
      <span
        className={cn(
          "shrink-0 font-mono font-semibold text-wc-orange",
          density === "roomy"
            ? "text-xs"
            : density === "comfortable"
              ? "text-[10px]"
              : density === "cozy"
                ? "text-[10px]"
                : "text-[8px]",
        )}
      >
        {side.slotLabel}
      </span>
      {team && name ? (
        <>
          <TeamFlag team={team} size={flagSize} />
          <span className="min-w-0 truncate font-medium text-white">{name}</span>
        </>
      ) : (
        <span className="text-muted-foreground">—</span>
      )}
    </button>
  );
}

function BracketMatchCard({
  match,
  teams,
  selectedWinnerId,
  overridden,
  changed,
  needsWinner,
  focusTeamId,
  focusTeamMatchNums,
  pathOnly,
  enlarged,
  density = "compact",
  feeder,
  onSelectWinner,
}: {
  match: ResolvedBracketMatch;
  teams: Team[];
  selectedWinnerId: string | null;
  overridden: boolean;
  changed: boolean;
  needsWinner: boolean;
  focusTeamId: string;
  focusTeamMatchNums: number[];
  pathOnly: boolean;
  enlarged: boolean;
  density?: BracketCardDensity;
  feeder?: boolean;
  onSelectWinner: (matchNum: number, teamId: string) => void;
}) {
  const t = useTranslations("simulate.bracket");
  const stages = useTranslations("compare.stages");
  const involvesFocus = focusTeamMatchNums.includes(match.num);
  const isCenter = match.num === 103 || match.num === 104;
  const isThirdPlace = isThirdPlaceMatch(match.round);
  const canPickWinner = !isThirdPlace;
  const dimmed = pathOnly && !involvesFocus && !feeder;
  const sideDensity: BracketCardDensity = enlarged ? "comfortable" : density;
  const metaText =
    density === "roomy"
      ? "text-[11px]"
      : density === "comfortable"
        ? "text-[10px]"
        : density === "cozy"
          ? "text-[10px]"
          : "text-[9px]";
  const badgeText =
    density === "compact" ? "text-[8px]" : "text-[9px]";

  return (
    <div
      className={cn(
        "flex min-h-0 flex-col justify-center rounded-lg border border-white/8 bg-white/[0.02] transition-[opacity,box-shadow,transform]",
        density === "roomy"
          ? "p-2.5"
          : density === "comfortable"
            ? "p-2"
            : "p-1.5",
        changed && "border-wc-orange/40 bg-wc-orange/5",
        needsWinner &&
          "border-wc-purple/50 bg-wc-purple/10 ring-1 ring-wc-purple/30",
        involvesFocus &&
          !changed &&
          !needsWinner &&
          "border-wc-orange/40 bg-wc-orange/[0.04] shadow-[0_0_0_1px_rgba(249,115,22,0.15)]",
        feeder &&
          !involvesFocus &&
          !changed &&
          !needsWinner &&
          "border-wc-sky/25 bg-wc-sky/[0.03]",
        isThirdPlace && "opacity-90",
        dimmed && "opacity-30",
        enlarged && "scale-[1.03] p-2",
      )}
    >
      {isCenter && (
        <p
          className={cn(
            "mb-1 text-center font-semibold uppercase tracking-widest text-wc-orange",
            metaText,
          )}
        >
          {getRoundDisplayName(stages, match.round)}
        </p>
      )}
      <div className="mb-1 flex items-center justify-between gap-1">
        <span className={cn("font-mono text-muted-foreground", metaText)}>
          #{match.num}
        </span>
        {feeder && !involvesFocus && (
          <span
            className={cn(
              "rounded bg-wc-sky/15 px-1 py-0.5 font-semibold uppercase text-wc-sky",
              badgeText,
            )}
          >
            {t("feederBadge")}
          </span>
        )}
        {needsWinner && (
          <span
            className={cn(
              "rounded bg-wc-purple/20 px-1 py-0.5 font-semibold uppercase text-wc-purple",
              badgeText,
            )}
          >
            {t("pickWinnerBadge")}
          </span>
        )}
        {overridden && !needsWinner && (
          <span
            className={cn(
              "rounded bg-wc-purple/15 px-1 py-0.5 font-semibold uppercase text-wc-purple",
              badgeText,
            )}
          >
            {t("simulated")}
          </span>
        )}
        {match.scoreLabel && !overridden && !needsWinner && (
          <span className={cn("font-mono text-muted-foreground", metaText)}>
            {match.scoreLabel}
          </span>
        )}
      </div>
      <div className={cn(density === "compact" ? "space-y-1" : density === "cozy" ? "space-y-1" : "space-y-1.5")}>
        <BracketSide
          side={match.home}
          teams={teams}
          isWinner={selectedWinnerId === match.home.teamId}
          isFocus={focusTeamId === match.home.teamId}
          density={sideDensity}
          selectable={canPickWinner}
          onClick={() =>
            canPickWinner &&
            match.home.teamId &&
            onSelectWinner(match.num, match.home.teamId)
          }
        />
        <BracketSide
          side={match.away}
          teams={teams}
          isWinner={selectedWinnerId === match.away.teamId}
          isFocus={focusTeamId === match.away.teamId}
          density={sideDensity}
          selectable={canPickWinner}
          onClick={() =>
            canPickWinner &&
            match.away.teamId &&
            onSelectWinner(match.num, match.away.teamId)
          }
        />
      </div>
    </div>
  );
}

function visibleColumnsForFilter(
  filter: BracketRoundFilter,
): BracketColumn[] {
  if (filter === "all") return BRACKET_COLUMNS;
  const keys = new Set(ROUND_FILTER_COLUMN_KEYS[filter]);
  return BRACKET_COLUMNS.filter((column) => keys.has(column.key));
}

function BracketGrid({
  matches,
  visibleMatchNums,
  visibleColumns,
  teams,
  scenarioWinners,
  actualWinnersByMatchNum,
  affectedMatchNums,
  changedMatchNums,
  pendingWinnerMatchNums,
  focusTeamId,
  focusTeamMatchNums,
  feederNums,
  onSelectWinner,
  pathOnly,
  enlargePath,
  density = "compact",
  columnMinPx,
  columnMaxPx,
  matchCardRefs,
  stacked = false,
  showConnectors = false,
}: {
  matches: ResolvedBracketMatch[];
  visibleMatchNums: Set<number>;
  visibleColumns: BracketColumn[];
  teams: Team[];
  scenarioWinners: Record<number, string | undefined>;
  actualWinnersByMatchNum: Record<number, string | null>;
  affectedMatchNums: Set<number>;
  changedMatchNums: number[];
  pendingWinnerMatchNums: number[];
  focusTeamId: string;
  focusTeamMatchNums: number[];
  feederNums: Set<number>;
  onSelectWinner: (matchNum: number, teamId: string) => void;
  pathOnly: boolean;
  enlargePath: boolean;
  density?: BracketCardDensity;
  columnMinPx: number;
  columnMaxPx?: number;
  matchCardRefs?: MutableRefObject<Map<number, HTMLDivElement | null>>;
  /** One-column-per-round path slice with bracket-branch vertical spanning. */
  stacked?: boolean;
  /** Draw elbow links between feeder sources and their child matches. */
  showConnectors?: boolean;
}) {
  const stages = useTranslations("compare.stages");
  const gridRef = useRef<HTMLDivElement>(null);
  const localCardRefs = useRef<Map<number, HTMLDivElement | null>>(new Map());
  const [connectorPaths, setConnectorPaths] = useState<string[]>([]);

  const sourcesByMatch = useMemo(() => {
    if (!stacked && !showConnectors) return undefined;
    const map = new Map<number, number[]>();
    for (const match of matches) {
      if (!visibleMatchNums.has(match.num)) continue;
      const sources = [
        match.home.sourceMatchNum,
        match.away.sourceMatchNum,
      ].filter((num): num is number => num !== undefined);
      if (sources.length > 0) map.set(match.num, sources);
    }
    return map;
  }, [stacked, showConnectors, matches, visibleMatchNums]);
  const stackedLayouts = useMemo(
    () =>
      stacked ? getPathSliceLayouts(visibleColumns, sourcesByMatch) : null,
    [stacked, visibleColumns, sourcesByMatch],
  );
  const gridRows = stackedLayouts?.gridRows || getBracketGridRows();
  const matchByNum = new Map(matches.map((match) => [match.num, match]));
  const columnIndexByKey = new Map(
    visibleColumns.map((column, index) => [column.key, index]),
  );
  const trackMax = columnMaxPx ?? columnMinPx;
  const columnGapPx = stacked ? 40 : showConnectors ? 24 : 8;
  const minWidthPx = Math.max(
    visibleColumns.length * columnMinPx +
      Math.max(0, visibleColumns.length - 1) * columnGapPx,
    280,
  );
  // Path slice: fixed card width, columns spread across full container width.
  // Full bracket: optional max track width; otherwise grow with 1fr.
  const spreadColumns = stacked;
  const stretch = !spreadColumns && columnMaxPx === undefined;

  function setCardRef(matchNum: number, node: HTMLDivElement | null) {
    if (node) {
      localCardRefs.current.set(matchNum, node);
      matchCardRefs?.current.set(matchNum, node);
    } else {
      localCardRefs.current.delete(matchNum);
      matchCardRefs?.current.delete(matchNum);
    }
  }

  useLayoutEffect(() => {
    // Paths are only painted when showConnectors is true; skip measuring otherwise.
    if (!showConnectors || !sourcesByMatch) return;
    const sourceMap = sourcesByMatch;

    function measure() {
      const container = gridRef.current;
      if (!container) return;
      const cRect = container.getBoundingClientRect();
      // Account for ancestor CSS scale (path slice zoom) so SVG user space matches layout.
      const scaleX = cRect.width / Math.max(container.offsetWidth, 1);
      const scaleY = cRect.height / Math.max(container.offsetHeight, 1);
      const paths: string[] = [];

      for (const [targetNum, sources] of sourceMap) {
        const targetEl = localCardRefs.current.get(targetNum);
        if (!targetEl || !visibleMatchNums.has(targetNum)) continue;
        const tRect = targetEl.getBoundingClientRect();
        const tMidX = tRect.left + tRect.width / 2;
        const y2 = (tRect.top + tRect.height / 2 - cRect.top) / scaleY;

        for (const sourceNum of sources) {
          if (!visibleMatchNums.has(sourceNum)) continue;
          const sourceEl = localCardRefs.current.get(sourceNum);
          if (!sourceEl) continue;
          const sRect = sourceEl.getBoundingClientRect();
          const sMidX = sRect.left + sRect.width / 2;
          const y1 = (sRect.top + sRect.height / 2 - cRect.top) / scaleY;
          // Mirrored full bracket: right-half sources sit to the right of their child.
          const sourceOnLeft = sMidX <= tMidX;
          const x1 =
            (sourceOnLeft ? sRect.right - cRect.left : sRect.left - cRect.left) /
            scaleX;
          const x2 =
            (sourceOnLeft ? tRect.left - cRect.left : tRect.right - cRect.left) /
            scaleX;
          const midX = (x1 + x2) / 2;
          paths.push(`M ${x1} ${y1} H ${midX} V ${y2} H ${x2}`);
        }
      }

      setConnectorPaths((prev) => {
        if (
          prev.length === paths.length &&
          prev.every((path, index) => path === paths[index])
        ) {
          return prev;
        }
        return paths;
      });
    }

    measure();

    const container = gridRef.current;
    if (!container || typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(() => measure());
    observer.observe(container);
    for (const el of localCardRefs.current.values()) {
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [showConnectors, sourcesByMatch, visibleMatchNums, stackedLayouts]);

  return (
    <div
      ref={gridRef}
      className={cn(
        "relative gap-y-5",
        spreadColumns
          ? undefined
          : stacked
            ? "gap-x-10"
            : showConnectors
              ? "gap-x-6"
              : "gap-x-2",
        stretch || spreadColumns ? "inline-grid w-full" : "grid",
      )}
      style={{
        minWidth: stretch || spreadColumns ? `${minWidthPx}px` : undefined,
        width: stretch || spreadColumns
          ? undefined
          : `${visibleColumns.length * trackMax + (visibleColumns.length - 1) * columnGapPx}px`,
        gridTemplateColumns: spreadColumns
          ? `repeat(${visibleColumns.length}, ${columnMinPx}px)`
          : stretch
            ? `repeat(${visibleColumns.length}, minmax(${columnMinPx}px, 1fr))`
            : `repeat(${visibleColumns.length}, minmax(${columnMinPx}px, ${trackMax}px))`,
        justifyContent: spreadColumns ? "space-between" : undefined,
        gridTemplateRows: `auto repeat(${gridRows}, minmax(0, auto))`,
      }}
    >
      {showConnectors && connectorPaths.length > 0 && (
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 overflow-visible"
        >
          {connectorPaths.map((d, index) => (
            <path
              key={index}
              d={d}
              fill="none"
              className="stroke-white/25"
              strokeWidth={1.5}
              strokeLinecap="square"
              strokeLinejoin="miter"
            />
          ))}
        </svg>
      )}

      {visibleColumns.map((column) => (
        <div
          key={column.key}
          className={cn(
            "relative z-10 mb-2 text-center font-semibold uppercase tracking-widest text-muted-foreground",
            density === "roomy"
              ? "text-xs"
              : density === "comfortable"
                ? "text-[11px]"
                : density === "cozy"
                  ? "text-[10px]"
                  : "text-[10px]",
          )}
          style={{
            gridColumn: (columnIndexByKey.get(column.key) ?? 0) + 1,
            gridRow: 1,
          }}
        >
          {stages(column.roundKey)}
        </div>
      ))}

      {matches
        .filter((match) => visibleMatchNums.has(match.num))
        .map((match) => {
          let mappedColumn: number | undefined;
          let rowStart: number;
          let rowSpan: number;

          if (stackedLayouts) {
            const layout = stackedLayouts.layouts.get(match.num);
            if (!layout) return null;
            mappedColumn = layout.columnIndex;
            rowStart = layout.rowStart;
            rowSpan = layout.rowSpan;
          } else {
            const layout = getMatchLayout(match.num);
            const sourceColumn = BRACKET_COLUMNS[layout.column];
            mappedColumn = columnIndexByKey.get(sourceColumn?.key);
            rowStart = layout.rowStart;
            rowSpan = layout.rowSpan;
          }
          if (mappedColumn === undefined) return null;

          const scenarioWinner = scenarioWinners[match.num];
          const overridden = isKnockoutWinnerOverride(
            actualWinnersByMatchNum[match.num],
            scenarioWinner,
            {
              playedResultSuppressed: affectedMatchNums.has(match.num),
            },
          );
          const selectedWinnerId = scenarioWinner ?? match.winnerTeamId;
          const involvesFocus = focusTeamMatchNums.includes(match.num);
          const isFeeder = feederNums.has(match.num);

          return (
            <div
              key={match.num}
              ref={(node) => setCardRef(match.num, node)}
              data-match-num={match.num}
              className="relative z-10 flex flex-col justify-center"
              style={{
                gridColumn: mappedColumn + 1,
                gridRow: `${rowStart + 1} / span ${rowSpan}`,
              }}
            >
              <BracketMatchCard
                match={matchByNum.get(match.num) ?? match}
                teams={teams}
                selectedWinnerId={selectedWinnerId}
                overridden={overridden}
                changed={changedMatchNums.includes(match.num)}
                needsWinner={pendingWinnerMatchNums.includes(match.num)}
                focusTeamId={focusTeamId}
                focusTeamMatchNums={focusTeamMatchNums}
                pathOnly={pathOnly}
                enlarged={enlargePath && (involvesFocus || isFeeder)}
                density={density}
                feeder={isFeeder}
                onSelectWinner={onSelectWinner}
              />
            </div>
          );
        })}
    </div>
  );
}

function FullBracketGrid({
  matches,
  teams,
  scenarioWinners,
  actualWinnersByMatchNum,
  affectedMatchNums,
  changedMatchNums,
  pendingWinnerMatchNums,
  focusTeamId,
  focusTeamMatchNums,
  feederNums,
  onSelectWinner,
  roundFilter,
  pathOnly,
}: {
  matches: ResolvedBracketMatch[];
  teams: Team[];
  scenarioWinners: Record<number, string | undefined>;
  actualWinnersByMatchNum: Record<number, string | null>;
  affectedMatchNums: Set<number>;
  changedMatchNums: number[];
  pendingWinnerMatchNums: number[];
  focusTeamId: string;
  focusTeamMatchNums: number[];
  feederNums: Set<number>;
  onSelectWinner: (matchNum: number, teamId: string) => void;
  roundFilter: BracketRoundFilter;
  pathOnly: boolean;
}) {
  const visibleColumns = useMemo(
    () => visibleColumnsForFilter(roundFilter),
    [roundFilter],
  );
  const visibleMatchNums = useMemo(
    () => new Set(visibleColumns.flatMap((column) => column.matchNums)),
    [visibleColumns],
  );
  const density = densityForRoundFilter(roundFilter);
  const { minPx, maxPx } = DENSITY_COLUMN_SIZES[density];
  const centered = maxPx !== undefined;

  return (
    <div
      className={cn(
        "scrollbar-subtle overflow-x-auto pb-2",
        centered && "flex min-h-[min(52vh,520px)] items-center",
      )}
    >
      <div
        className={cn(centered && "flex w-full min-w-full justify-center px-1")}
      >
        <BracketGrid
          matches={matches}
          visibleMatchNums={visibleMatchNums}
          visibleColumns={visibleColumns}
          teams={teams}
          scenarioWinners={scenarioWinners}
          actualWinnersByMatchNum={actualWinnersByMatchNum}
          affectedMatchNums={affectedMatchNums}
          changedMatchNums={changedMatchNums}
          pendingWinnerMatchNums={pendingWinnerMatchNums}
          focusTeamId={focusTeamId}
          focusTeamMatchNums={focusTeamMatchNums}
          feederNums={feederNums}
          onSelectWinner={onSelectWinner}
          pathOnly={pathOnly}
          enlargePath={pathOnly}
          density={density}
          columnMinPx={minPx}
          columnMaxPx={maxPx}
          showConnectors
        />
      </div>
    </div>
  );
}

function useDragToScroll(viewportRef: RefObject<HTMLDivElement | null>) {
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    scrollLeft: number;
    scrollTop: number;
    moved: boolean;
  } | null>(null);
  const suppressClickRef = useRef(false);

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    const viewport = viewportRef.current;
    if (!viewport) return;

    // Don't capture pointer on team buttons — that swallows the click and
    // prevents winner selection while still moving :focus to the row.
    const target = event.target;
    if (
      target instanceof Element &&
      target.closest("button, a, input, textarea, select, [role='button']")
    ) {
      return;
    }

    suppressClickRef.current = false;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      scrollLeft: viewport.scrollLeft,
      scrollTop: viewport.scrollTop,
      moved: false,
    };
    viewport.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const viewport = viewportRef.current;
    if (!drag || !viewport || drag.pointerId !== event.pointerId) return;

    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (
      !drag.moved &&
      Math.abs(dx) < DRAG_THRESHOLD_PX &&
      Math.abs(dy) < DRAG_THRESHOLD_PX
    ) {
      return;
    }

    drag.moved = true;
    suppressClickRef.current = true;
    viewport.scrollLeft = drag.scrollLeft - dx;
    viewport.scrollTop = drag.scrollTop - dy;
  }

  function endDrag(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const viewport = viewportRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    dragRef.current = null;
    if (viewport?.hasPointerCapture(event.pointerId)) {
      viewport.releasePointerCapture(event.pointerId);
    }
  }

  function onClickCapture(event: ReactMouseEvent<HTMLDivElement>) {
    if (!suppressClickRef.current) return;
    suppressClickRef.current = false;
    event.preventDefault();
    event.stopPropagation();
  }

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
    onClickCapture,
    isDragSessionActive: () => dragRef.current !== null,
  };
}

function FocusedBracketSlice({
  matches,
  curatedMatchNums,
  pathMatchNums,
  teams,
  scenarioWinners,
  actualWinnersByMatchNum,
  affectedMatchNums,
  changedMatchNums,
  pendingWinnerMatchNums,
  focusTeamId,
  focusTeamMatchNums,
  feederNums,
  onSelectWinner,
  emptyLabel,
}: {
  matches: ResolvedBracketMatch[];
  curatedMatchNums: number[];
  pathMatchNums: number[];
  teams: Team[];
  scenarioWinners: Record<number, string | undefined>;
  actualWinnersByMatchNum: Record<number, string | null>;
  affectedMatchNums: Set<number>;
  changedMatchNums: number[];
  pendingWinnerMatchNums: number[];
  focusTeamId: string;
  focusTeamMatchNums: number[];
  feederNums: Set<number>;
  onSelectWinner: (matchNum: number, teamId: string) => void;
  emptyLabel: string;
}) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const matchCardRefs = useRef<Map<number, HTMLDivElement | null>>(new Map());
  const prevPathKeyRef = useRef<string>("");
  const [grabbing, setGrabbing] = useState(false);
  const drag = useDragToScroll(viewportRef);

  const visibleMatchNums = useMemo(
    () => exclusiveCenterMatchNums(curatedMatchNums, focusTeamMatchNums),
    [curatedMatchNums, focusTeamMatchNums],
  );
  const visibleColumns = useMemo(
    () => visibleColumnsForPathSlice(visibleMatchNums),
    [visibleMatchNums],
  );
  const pathKey = pathMatchNums.join(",");
  const pendingKey = pendingWinnerMatchNums.join(",");

  useEffect(() => {
    if (curatedMatchNums.length === 0) {
      prevPathKeyRef.current = pathKey;
      return;
    }

    const viewport = viewportRef.current;
    if (!viewport) return;

    const prev = prevPathKeyRef.current;
    prevPathKeyRef.current = pathKey;

    const prevNums = prev ? prev.split(",").filter(Boolean).map(Number) : [];
    const prevSet = new Set(prevNums);
    const added = pathMatchNums.filter((num) => !prevSet.has(num));
    const pendingTarget = pendingWinnerMatchNums[0];
    const targetNum =
      pendingTarget ??
      (added.length > 0
        ? added[added.length - 1]
        : pathMatchNums[pathMatchNums.length - 1]);

    if (targetNum === undefined) return;

    // Skip auto-pan on the very first paint so the default crop is stable.
    if (!prev && pendingWinnerMatchNums.length === 0) return;

    const card = matchCardRefs.current.get(targetNum);
    if (!card) return;

    const frame = requestAnimationFrame(() => {
      const vRect = viewport.getBoundingClientRect();
      const cRect = card.getBoundingClientRect();
      const pad = 32;
      let nextLeft = viewport.scrollLeft;
      let nextTop = viewport.scrollTop;

      if (cRect.left < vRect.left + pad) {
        nextLeft -= vRect.left + pad - cRect.left;
      } else if (cRect.right > vRect.right - pad) {
        nextLeft += cRect.right - (vRect.right - pad);
      }

      if (cRect.top < vRect.top + pad) {
        nextTop -= vRect.top + pad - cRect.top;
      } else if (cRect.bottom > vRect.bottom - pad) {
        nextTop += cRect.bottom - (vRect.bottom - pad);
      }

      viewport.scrollTo({ left: nextLeft, top: nextTop, behavior: "smooth" });
    });
    return () => cancelAnimationFrame(frame);
  }, [pathKey, pendingKey, pathMatchNums, pendingWinnerMatchNums, curatedMatchNums.length]);

  if (curatedMatchNums.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <div
      ref={viewportRef}
      className={cn(
        "scrollbar-subtle relative w-full overflow-auto rounded-xl border border-white/8 bg-black/20 p-3",
        grabbing ? "cursor-grabbing select-none" : "cursor-grab",
      )}
      style={{ height: PATH_SLICE_VIEWPORT_HEIGHT_PX }}
      onPointerDown={(event) => {
        drag.onPointerDown(event);
        if (drag.isDragSessionActive()) setGrabbing(true);
      }}
      onPointerMove={drag.onPointerMove}
      onPointerUp={(event) => {
        setGrabbing(false);
        drag.onPointerUp(event);
      }}
      onPointerCancel={(event) => {
        setGrabbing(false);
        drag.onPointerCancel(event);
      }}
      onClickCapture={drag.onClickCapture}
    >
      <BracketGrid
        matches={matches}
        visibleMatchNums={visibleMatchNums}
        visibleColumns={visibleColumns}
        teams={teams}
        scenarioWinners={scenarioWinners}
        actualWinnersByMatchNum={actualWinnersByMatchNum}
        affectedMatchNums={affectedMatchNums}
        changedMatchNums={changedMatchNums}
        pendingWinnerMatchNums={pendingWinnerMatchNums}
        focusTeamId={focusTeamId}
        focusTeamMatchNums={focusTeamMatchNums}
        feederNums={feederNums}
        onSelectWinner={onSelectWinner}
        pathOnly={false}
        enlargePath={false}
        density="cozy"
        columnMinPx={PATH_SLICE_COLUMN_MIN_PX}
        matchCardRefs={matchCardRefs}
        stacked
        showConnectors
      />
    </div>
  );
}

export function BracketTree({
  matches,
  teams,
  scenarioWinners,
  actualWinnersByMatchNum,
  affectedMatchNums,
  changedMatchNums,
  pendingWinnerMatchNums,
  focusTeamId,
  focusTeamMatchNums,
  onSelectWinner,
  embedded = false,
  actions,
}: BracketTreeProps) {
  const t = useTranslations("simulate");
  const tb = useTranslations("simulate.bracket");
  const [fullOpen, setFullOpen] = useState(false);
  const [roundFilter, setRoundFilter] = useState<BracketRoundFilter>("all");
  const [pathOnly, setPathOnly] = useState(true);
  const [showFeeders, setShowFeeders] = useState(false);

  const curated = useMemo(
    () =>
      getCuratedBracketMatchNums(matches, focusTeamId, scenarioWinners),
    [matches, focusTeamId, scenarioWinners],
  );
  const feederNumSet = useMemo(
    () => new Set(curated.feeders),
    [curated.feeders],
  );
  const affectedMatchNumSet = useMemo(
    () => new Set(affectedMatchNums),
    [affectedMatchNums],
  );
  const sliceMatchNums = useMemo(() => {
    const base = showFeeders ? curated.curated : curated.path;
    return [...new Set([...base, ...pendingWinnerMatchNums])].sort(
      (a, b) => a - b,
    );
  }, [showFeeders, curated.curated, curated.path, pendingWinnerMatchNums]);
  const sliceFocusMatchNums = useMemo(
    () => [...new Set([...focusTeamMatchNums, ...curated.path])],
    [focusTeamMatchNums, curated.path],
  );

  const roundFilters: Array<{
    id: BracketRoundFilter;
    label: string;
  }> = [
    { id: "all", label: tb("roundFilterAll") },
    { id: "r16", label: tb("roundFilterR16") },
    { id: "qf", label: tb("roundFilterQf") },
    { id: "sf", label: tb("roundFilterSf") },
  ];

  return (
    <div className="space-y-3">
      {!embedded && (
        <div>
          <h2 className="text-lg font-semibold text-white">
            {t("knockoutBracket")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("bracketHint")}</p>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowFeeders((current) => !current)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
              showFeeders
                ? "border-wc-sky/40 bg-wc-sky/10 text-wc-sky"
                : "border-white/10 text-muted-foreground hover:border-white/20 hover:text-white",
            )}
          >
            {showFeeders ? tb("hideFeeders") : tb("showFeeders")}
          </button>
          {actions}
        </div>
        <button
          type="button"
          onClick={() => setFullOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-white/20 hover:text-white"
        >
          <Grid2x2 className="size-3.5" />
          {tb("showFullBracket")}
        </button>
      </div>

      <p className="text-xs text-muted-foreground">{tb("focusedHint")}</p>

      <FocusedBracketSlice
        matches={matches}
        curatedMatchNums={sliceMatchNums}
        pathMatchNums={curated.path}
        teams={teams}
        scenarioWinners={scenarioWinners}
        actualWinnersByMatchNum={actualWinnersByMatchNum}
        affectedMatchNums={affectedMatchNumSet}
        changedMatchNums={changedMatchNums}
        pendingWinnerMatchNums={pendingWinnerMatchNums}
        focusTeamId={focusTeamId}
        focusTeamMatchNums={sliceFocusMatchNums}
        feederNums={feederNumSet}
        onSelectWinner={onSelectWinner}
        emptyLabel={tb("noPathMatches")}
      />

      <Dialog open={fullOpen} onOpenChange={setFullOpen}>
        <DialogContent
          size="full"
          className="max-h-[min(94vh,980px)] max-w-[min(98vw,1560px)]"
        >
          <DialogHeader>
            <DialogTitle>{tb("fullBracketTitle")}</DialogTitle>
            <DialogDescription>{tb("fullBracketDescription")}</DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex flex-wrap rounded-lg border border-white/10 bg-white/5 p-1">
                {roundFilters.map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setRoundFilter(filter.id)}
                    className={cn(
                      "rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors sm:text-sm",
                      roundFilter === filter.id
                        ? "bg-white/12 text-white"
                        : "text-muted-foreground hover:text-white",
                    )}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setPathOnly((current) => !current)}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                  pathOnly
                    ? "border-wc-orange/40 bg-wc-orange/10 text-wc-orange"
                    : "border-white/10 text-muted-foreground hover:border-white/20 hover:text-white",
                )}
              >
                {tb("myPathOnly")}
              </button>
            </div>
            <FullBracketGrid
              matches={matches}
              teams={teams}
              scenarioWinners={scenarioWinners}
              actualWinnersByMatchNum={actualWinnersByMatchNum}
              affectedMatchNums={affectedMatchNumSet}
              changedMatchNums={changedMatchNums}
              pendingWinnerMatchNums={pendingWinnerMatchNums}
              focusTeamId={focusTeamId}
              focusTeamMatchNums={focusTeamMatchNums}
              feederNums={feederNumSet}
              onSelectWinner={onSelectWinner}
              roundFilter={roundFilter}
              pathOnly={pathOnly}
            />
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
}
