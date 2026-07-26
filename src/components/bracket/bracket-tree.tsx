"use client";

import {
  useEffect,
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
  getBracketGridRows,
  getMatchLayout,
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
import { getCuratedBracketMatchNums } from "@/lib/domain/bracket/bracket-resolver";
import { isThirdPlaceMatch } from "@/lib/domain/match/match-stages";
import { cn } from "@/lib/utils";

export type BracketRoundFilter =
  | "all"
  | "r32"
  | "r16"
  | "qf"
  | "sf"
  | "final";

const ROUND_FILTER_COLUMN_KEYS: Record<
  Exclude<BracketRoundFilter, "all">,
  readonly string[]
> = {
  r32: ["r32-left", "r32-right"],
  r16: ["r16-left", "r16-right"],
  qf: ["qf-left", "qf-right"],
  sf: ["sf-left", "sf-right"],
  final: ["center"],
};

const PATH_SLICE_ZOOM = 1.25;
const PATH_SLICE_COLUMN_MIN_PX = 150;
const PATH_SLICE_VIEWPORT_HEIGHT_PX = 480;
const DRAG_THRESHOLD_PX = 4;

interface BracketTreeProps {
  matches: ResolvedBracketMatch[];
  teams: Team[];
  scenarioWinners: Record<number, string | undefined>;
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
  compact,
  selectable,
  onClick,
}: {
  side: ResolvedBracketMatch["home"];
  teams: Team[];
  isWinner: boolean;
  isFocus: boolean;
  compact?: boolean;
  selectable: boolean;
  onClick: () => void;
}) {
  const teamNames = useTranslations("teams");
  const team = side.teamId
    ? teams.find((entry) => entry.id === side.teamId)
    : null;
  const name = team ? getTeamDisplayName(teamNames, team) : null;
  const canSelect = selectable && Boolean(side.teamId);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!canSelect}
      className={cn(
        "flex w-full items-center gap-1.5 rounded border px-1.5 py-1 text-left transition-colors",
        compact ? "text-[10px]" : "text-xs",
        canSelect && "hover:border-wc-sky/40 hover:bg-white/5",
        isWinner && "border-wc-sky/40 bg-wc-sky/10",
        isFocus && "ring-1 ring-wc-orange/60",
        !canSelect && "cursor-default opacity-50",
      )}
    >
      <span className="shrink-0 font-mono text-[9px] font-semibold text-wc-orange">
        {side.slotLabel}
      </span>
      {team && name ? (
        <>
          <TeamFlag team={team} size="sm" />
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

  return (
    <div
      className={cn(
        "flex min-h-0 flex-col justify-center rounded-lg border border-white/8 bg-white/[0.02] p-1.5 transition-[opacity,box-shadow,transform]",
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
        <p className="mb-1 text-center text-[9px] font-semibold uppercase tracking-widest text-wc-orange">
          {getRoundDisplayName(stages, match.round)}
        </p>
      )}
      <div className="mb-1 flex items-center justify-between gap-1">
        <span className="font-mono text-[9px] text-muted-foreground">
          #{match.num}
        </span>
        {feeder && !involvesFocus && (
          <span className="rounded bg-wc-sky/15 px-1 py-0.5 text-[8px] font-semibold uppercase text-wc-sky">
            {t("feederBadge")}
          </span>
        )}
        {needsWinner && (
          <span className="rounded bg-wc-purple/20 px-1 py-0.5 text-[8px] font-semibold uppercase text-wc-purple">
            {t("pickWinnerBadge")}
          </span>
        )}
        {overridden && !needsWinner && (
          <span className="rounded bg-wc-purple/15 px-1 py-0.5 text-[8px] font-semibold uppercase text-wc-purple">
            {t("simulated")}
          </span>
        )}
        {match.scoreLabel && !overridden && !needsWinner && (
          <span className="font-mono text-[9px] text-muted-foreground">
            {match.scoreLabel}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <BracketSide
          side={match.home}
          teams={teams}
          isWinner={selectedWinnerId === match.home.teamId}
          isFocus={focusTeamId === match.home.teamId}
          compact={!enlarged}
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
          compact={!enlarged}
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
  changedMatchNums,
  pendingWinnerMatchNums,
  focusTeamId,
  focusTeamMatchNums,
  feederNums,
  onSelectWinner,
  pathOnly,
  enlargePath,
  columnMinPx,
  matchCardRefs,
}: {
  matches: ResolvedBracketMatch[];
  visibleMatchNums: Set<number>;
  visibleColumns: BracketColumn[];
  teams: Team[];
  scenarioWinners: Record<number, string | undefined>;
  changedMatchNums: number[];
  pendingWinnerMatchNums: number[];
  focusTeamId: string;
  focusTeamMatchNums: number[];
  feederNums: Set<number>;
  onSelectWinner: (matchNum: number, teamId: string) => void;
  pathOnly: boolean;
  enlargePath: boolean;
  columnMinPx: number;
  matchCardRefs?: MutableRefObject<Map<number, HTMLDivElement | null>>;
}) {
  const stages = useTranslations("compare.stages");
  const gridRows = getBracketGridRows();
  const matchByNum = new Map(matches.map((match) => [match.num, match]));
  const columnIndexByKey = new Map(
    visibleColumns.map((column, index) => [column.key, index]),
  );
  const minWidthPx = Math.max(visibleColumns.length * columnMinPx, 280);

  return (
    <div
      className="inline-grid w-full gap-x-2 gap-y-1"
      style={{
        minWidth: `${minWidthPx}px`,
        gridTemplateColumns: `repeat(${visibleColumns.length}, minmax(${columnMinPx}px, 1fr))`,
        gridTemplateRows: `auto repeat(${gridRows}, minmax(0, auto))`,
      }}
    >
      {visibleColumns.map((column) => (
        <div
          key={column.key}
          className="mb-2 text-center text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
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
          const layout = getMatchLayout(match.num);
          const sourceColumn = BRACKET_COLUMNS[layout.column];
          const mappedColumn = columnIndexByKey.get(sourceColumn?.key);
          if (mappedColumn === undefined) return null;

          const overridden = Boolean(scenarioWinners[match.num]);
          const selectedWinnerId =
            scenarioWinners[match.num] ?? match.winnerTeamId;
          const involvesFocus = focusTeamMatchNums.includes(match.num);
          const isFeeder = feederNums.has(match.num);

          return (
            <div
              key={match.num}
              ref={(node) => {
                if (!matchCardRefs) return;
                if (node) matchCardRefs.current.set(match.num, node);
                else matchCardRefs.current.delete(match.num);
              }}
              data-match-num={match.num}
              className="flex flex-col justify-center"
              style={{
                gridColumn: mappedColumn + 1,
                gridRow: `${layout.rowStart + 1} / span ${layout.rowSpan}`,
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
  changedMatchNums: number[];
  pendingWinnerMatchNums: number[];
  focusTeamId: string;
  focusTeamMatchNums: number[];
  feederNums: Set<number>;
  onSelectWinner: (matchNum: number, teamId: string) => void;
  roundFilter: BracketRoundFilter;
  pathOnly: boolean;
}) {
  const visibleColumns = visibleColumnsForFilter(roundFilter);
  const visibleMatchNums = new Set(
    visibleColumns.flatMap((column) => column.matchNums),
  );

  return (
    <div className="overflow-x-auto pb-2">
      <BracketGrid
        matches={matches}
        visibleMatchNums={visibleMatchNums}
        visibleColumns={visibleColumns}
        teams={teams}
        scenarioWinners={scenarioWinners}
        changedMatchNums={changedMatchNums}
        pendingWinnerMatchNums={pendingWinnerMatchNums}
        focusTeamId={focusTeamId}
        focusTeamMatchNums={focusTeamMatchNums}
        feederNums={feederNums}
        onSelectWinner={onSelectWinner}
        pathOnly={pathOnly}
        enlargePath={pathOnly}
        columnMinPx={130}
      />
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
  changedMatchNums: number[];
  pendingWinnerMatchNums: number[];
  focusTeamId: string;
  focusTeamMatchNums: number[];
  feederNums: Set<number>;
  onSelectWinner: (matchNum: number, teamId: string) => void;
  emptyLabel: string;
}) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const contentMeasureRef = useRef<HTMLDivElement | null>(null);
  const matchCardRefs = useRef<Map<number, HTMLDivElement | null>>(new Map());
  const prevPathKeyRef = useRef<string>("");
  const [contentSize, setContentSize] = useState({ width: 0, height: 0 });
  const [grabbing, setGrabbing] = useState(false);
  const drag = useDragToScroll(viewportRef);

  const visibleColumns = useMemo(
    () => visibleColumnsForPathSlice(curatedMatchNums),
    [curatedMatchNums],
  );
  const visibleMatchNums = useMemo(
    () => new Set(curatedMatchNums),
    [curatedMatchNums],
  );
  const pathKey = pathMatchNums.join(",");

  useEffect(() => {
    const node = contentMeasureRef.current;
    if (!node || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setContentSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [visibleColumns.length, curatedMatchNums.length]);

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
    const targetNum =
      added.length > 0
        ? added[added.length - 1]
        : pathMatchNums[pathMatchNums.length - 1];

    if (targetNum === undefined) return;

    // Skip auto-pan on the very first paint so the default crop is stable.
    if (!prev) return;

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
  }, [pathKey, pathMatchNums, curatedMatchNums.length]);

  if (curatedMatchNums.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  const scaledWidth = contentSize.width * PATH_SLICE_ZOOM;
  const scaledHeight = contentSize.height * PATH_SLICE_ZOOM;

  return (
    <div
      ref={viewportRef}
      className={cn(
        "relative overflow-auto rounded-xl border border-white/8 bg-black/20",
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
      <div
        style={{
          width: Math.max(scaledWidth, 1),
          height: Math.max(scaledHeight, 1),
        }}
      >
        <div
          ref={contentMeasureRef}
          className="origin-top-left p-3"
          style={{ transform: `scale(${PATH_SLICE_ZOOM})` }}
        >
          <BracketGrid
            matches={matches}
            visibleMatchNums={visibleMatchNums}
            visibleColumns={visibleColumns}
            teams={teams}
            scenarioWinners={scenarioWinners}
            changedMatchNums={changedMatchNums}
            pendingWinnerMatchNums={pendingWinnerMatchNums}
            focusTeamId={focusTeamId}
            focusTeamMatchNums={focusTeamMatchNums}
            feederNums={feederNums}
            onSelectWinner={onSelectWinner}
            pathOnly={false}
            enlargePath
            columnMinPx={PATH_SLICE_COLUMN_MIN_PX}
            matchCardRefs={matchCardRefs}
          />
        </div>
      </div>
    </div>
  );
}

export function BracketTree({
  matches,
  teams,
  scenarioWinners,
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
  const [showFeeders, setShowFeeders] = useState(true);

  const curated = useMemo(
    () =>
      getCuratedBracketMatchNums(matches, focusTeamId, scenarioWinners),
    [matches, focusTeamId, scenarioWinners],
  );
  const feederNumSet = useMemo(
    () => new Set(curated.feeders),
    [curated.feeders],
  );
  const sliceMatchNums = useMemo(
    () => (showFeeders ? curated.curated : curated.path),
    [showFeeders, curated.curated, curated.path],
  );
  const sliceFocusMatchNums = useMemo(
    () => [...new Set([...focusTeamMatchNums, ...curated.path])],
    [focusTeamMatchNums, curated.path],
  );

  const roundFilters: Array<{
    id: BracketRoundFilter;
    label: string;
  }> = [
    { id: "all", label: tb("roundFilterAll") },
    { id: "r32", label: tb("roundFilterR32") },
    { id: "r16", label: tb("roundFilterR16") },
    { id: "qf", label: tb("roundFilterQf") },
    { id: "sf", label: tb("roundFilterSf") },
    { id: "final", label: tb("roundFilterFinal") },
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
        changedMatchNums={changedMatchNums}
        pendingWinnerMatchNums={pendingWinnerMatchNums}
        focusTeamId={focusTeamId}
        focusTeamMatchNums={sliceFocusMatchNums}
        feederNums={feederNumSet}
        onSelectWinner={onSelectWinner}
        emptyLabel={tb("noPathMatches")}
      />

      <Dialog open={fullOpen} onOpenChange={setFullOpen}>
        <DialogContent size="full">
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
