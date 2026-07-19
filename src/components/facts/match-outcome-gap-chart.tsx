"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import type { GroupMatchResult, MatchOutcomeGapEntry } from "@/lib/types";
import {
  gapBinForPoints,
  MATCH_OUTCOME_GAP_BINS,
  type MatchOutcomeGapBinId,
} from "@/lib/domain/match/match-outcome-gap";
import { cn } from "@/lib/utils";

export interface MatchOutcomeGapBinStats {
  id: MatchOutcomeGapBinId;
  label: string;
  total: number;
  wins: number;
  draws: number;
  losses: number;
  winPct: number;
  drawPct: number;
  lossPct: number;
}

type HoveredTarget =
  | {
      kind: "match";
      entry: MatchOutcomeGapEntry;
      x: number;
      y: number;
    }
  | {
      kind: "bin";
      bin: MatchOutcomeGapBinStats;
      x: number;
      y: number;
    };

export type MatchOutcomeGapChartLayout = "compact" | "expanded";

export interface DotTransform {
  scale: number;
  translateX: number;
  translateY: number;
}

export interface MatchOutcomeGapChartZoomApi {
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
}

export interface MatchOutcomeGapChartProps {
  matches: MatchOutcomeGapEntry[];
  binLabels: Record<MatchOutcomeGapBinId, string>;
  ariaLabel: string;
  xAxisLabel: string;
  yAxisLabel: string;
  legend?: ReactNode;
  footnotes?: ReactNode;
  renderMatchTooltip: (entry: MatchOutcomeGapEntry) => ReactNode;
  renderBinTooltip: (bin: MatchOutcomeGapBinStats) => ReactNode;
  getBinAriaLabel: (bin: MatchOutcomeGapBinStats) => string;
  layout?: MatchOutcomeGapChartLayout;
  interactiveDots?: boolean;
  hideBars?: boolean;
  hideLegend?: boolean;
  hideFootnotes?: boolean;
  dotTransform?: DotTransform;
  onDotTransformChange?: (transform: DotTransform) => void;
}

interface ChartLayoutConfig {
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  barAreaHeight: number;
  barGap: number;
  maxRowStep: number;
  dotRadius: number;
  dotRadiusHovered: number;
  hitRadius: number;
  outlierRadius: number;
}

const CHART_LAYOUTS: Record<MatchOutcomeGapChartLayout, ChartLayoutConfig> = {
  compact: {
    width: 640,
    height: 236,
    margin: { top: 16, right: 16, bottom: 20, left: 48 },
    barAreaHeight: 130,
    barGap: 28,
    maxRowStep: 12,
    dotRadius: 5,
    dotRadiusHovered: 6.5,
    hitRadius: 10,
    outlierRadius: 8,
  },
  expanded: {
    width: 1440,
    height: 340,
    margin: { top: 16, right: 28, bottom: 36, left: 40 },
    barAreaHeight: 0,
    barGap: 0,
    maxRowStep: 18,
    dotRadius: 10.5,
    dotRadiusHovered: 13,
    hitRadius: 18,
    outlierRadius: 13.5,
  },
};

const MIN_DOT_SCALE = 1;
const MAX_DOT_SCALE = 15;
/** Above this scale, gaps still open but point size stops growing. */
const MAX_DOT_SIZE_SCALE = 10;
const ZOOM_STEP = 0.5;
/** Visual radius grows as scale^power while positions grow as scale^1. */
const DOT_SIZE_ZOOM_POWER = 0.4;

const RESULT_DOT_CLASS: Record<GroupMatchResult, string> = {
  W: "fill-wc-green/85",
  D: "fill-wc-sky/85",
  L: "fill-wc-red/85",
};

const RESULT_BAR_CLASS: Record<GroupMatchResult, string> = {
  W: "fill-wc-green/80",
  D: "fill-wc-sky/80",
  L: "fill-wc-red/80",
};

const BAR_SEGMENT_RADIUS = 2;

export const INITIAL_DOT_TRANSFORM: DotTransform = {
  scale: 1,
  translateX: 0,
  translateY: 0,
};

function stackedBarSegmentPath(
  x: number,
  y: number,
  width: number,
  height: number,
  roundTop: boolean,
  roundBottom: boolean,
): string {
  if (height <= 0) return "";

  const left = x;
  const right = x + width;
  const top = y;
  const bottom = y + height;
  const r = Math.min(BAR_SEGMENT_RADIUS, width / 2, height / 2);

  if (!roundTop && !roundBottom) {
    return `M ${left} ${top} H ${right} V ${bottom} H ${left} Z`;
  }

  if (roundTop && roundBottom) {
    return [
      `M ${left + r} ${top}`,
      `H ${right - r}`,
      `Q ${right} ${top} ${right} ${top + r}`,
      `V ${bottom - r}`,
      `Q ${right} ${bottom} ${right - r} ${bottom}`,
      `H ${left + r}`,
      `Q ${left} ${bottom} ${left} ${bottom - r}`,
      `V ${top + r}`,
      `Q ${left} ${top} ${left + r} ${top}`,
      "Z",
    ].join(" ");
  }

  if (roundTop) {
    return [
      `M ${left + r} ${top}`,
      `H ${right - r}`,
      `Q ${right} ${top} ${right} ${top + r}`,
      `V ${bottom}`,
      `H ${left}`,
      `V ${top + r}`,
      `Q ${left} ${top} ${left + r} ${top}`,
      "Z",
    ].join(" ");
  }

  return [
    `M ${left} ${top}`,
    `H ${right}`,
    `V ${bottom - r}`,
    `Q ${right} ${bottom} ${right - r} ${bottom}`,
    `H ${left + r}`,
    `Q ${left} ${bottom} ${left} ${bottom - r}`,
    `V ${top}`,
    "Z",
  ].join(" ");
}

function buildBinStats(
  matches: MatchOutcomeGapEntry[],
  binLabels: Record<MatchOutcomeGapBinId, string>,
): MatchOutcomeGapBinStats[] {
  return MATCH_OUTCOME_GAP_BINS.map((bin) => {
    const bucket = matches.filter(
      (entry) => gapBinForPoints(entry.gapPoints) === bin.id,
    );
    const wins = bucket.filter((entry) => entry.favoriteResult === "W").length;
    const draws = bucket.filter((entry) => entry.favoriteResult === "D").length;
    const losses = bucket.filter((entry) => entry.favoriteResult === "L").length;
    const total = bucket.length;

    return {
      id: bin.id,
      label: binLabels[bin.id],
      total,
      wins,
      draws,
      losses,
      winPct: total > 0 ? (wins / total) * 100 : 0,
      drawPct: total > 0 ? (draws / total) * 100 : 0,
      lossPct: total > 0 ? (losses / total) * 100 : 0,
    };
  });
}

function svgCoordsToScreen(
  svg: SVGSVGElement,
  x: number,
  y: number,
): { x: number; y: number } | null {
  const ctm = svg.getScreenCTM();
  if (!ctm) return null;

  const point = svg.createSVGPoint();
  point.x = x;
  point.y = y;
  const screen = point.matrixTransform(ctm);
  return { x: screen.x, y: screen.y };
}

function applyDotTransform(
  x: number,
  y: number,
  transform: DotTransform,
): { x: number; y: number } {
  return {
    x: transform.translateX + x * transform.scale,
    y: transform.translateY + y * transform.scale,
  };
}

function zoomAtPoint(
  transform: DotTransform,
  focalX: number,
  focalY: number,
  newScale: number,
): DotTransform {
  const clampedScale = Math.min(MAX_DOT_SCALE, Math.max(MIN_DOT_SCALE, newScale));
  const scaleRatio = clampedScale / transform.scale;

  return {
    scale: clampedScale,
    translateX: focalX - (focalX - transform.translateX) * scaleRatio,
    translateY: focalY - (focalY - transform.translateY) * scaleRatio,
  };
}

function clampDotTransform(
  transform: DotTransform,
  dotLeft: number,
  dotTop: number,
  dotWidth: number,
  dotHeight: number,
): DotTransform {
  const scaledWidth = dotWidth * transform.scale;
  const scaledHeight = dotHeight * transform.scale;
  const paddingX = dotWidth * 0.15;
  const paddingY = dotHeight * 0.15;

  const minTranslateX = dotLeft + dotWidth - scaledWidth - paddingX;
  const maxTranslateX = dotLeft + paddingX;
  const minTranslateY = dotTop + dotHeight - scaledHeight - paddingY;
  const maxTranslateY = dotTop + paddingY;

  return {
    scale: transform.scale,
    translateX: Math.min(maxTranslateX, Math.max(minTranslateX, transform.translateX)),
    translateY: Math.min(maxTranslateY, Math.max(minTranslateY, transform.translateY)),
  };
}

function centeredDotTransform(
  contentCenterX: number,
  contentCenterY: number,
  viewportCenterX: number,
  viewportCenterY: number,
  scale = 1,
): DotTransform {
  return {
    scale,
    translateX: viewportCenterX - contentCenterX * scale,
    translateY: viewportCenterY - contentCenterY * scale,
  };
}

function computeDotContentCenter(
  dotRows: Array<{ entry: MatchOutcomeGapEntry; row: number }>,
  maxGap: number,
  marginLeft: number,
  chartWidth: number,
  yForDot: (row: number) => number,
  fallbackX: number,
  fallbackY: number,
): { x: number; y: number } {
  if (dotRows.length === 0) {
    return { x: fallbackX, y: fallbackY };
  }

  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const { entry, row } of dotRows) {
    const cx = xForGapInBinSlot(
      entry.gapPoints,
      maxGap,
      marginLeft,
      chartWidth,
    );
    const cy = yForDot(row);
    minX = Math.min(minX, cx);
    maxX = Math.max(maxX, cx);
    minY = Math.min(minY, cy);
    maxY = Math.max(maxY, cy);
  }

  return {
    x: (minX + maxX) / 2,
    y: (minY + maxY) / 2,
  };
}

function xForBinCenter(
  index: number,
  marginLeft: number,
  chartWidth: number,
  binCount: number,
): number {
  return marginLeft + (index + 0.5) * (chartWidth / binCount);
}

function xForGapInBinSlot(
  gap: number,
  maxGap: number,
  marginLeft: number,
  chartWidth: number,
): number {
  const binId = gapBinForPoints(gap);
  const binIndex = MATCH_OUTCOME_GAP_BINS.findIndex((bin) => bin.id === binId);
  const bin = MATCH_OUTCOME_GAP_BINS[binIndex];
  const slotWidth = chartWidth / MATCH_OUTCOME_GAP_BINS.length;
  const slotLeft = marginLeft + binIndex * slotWidth;

  const binMax =
    bin.max === Number.POSITIVE_INFINITY
      ? Math.max(maxGap, bin.min + 1)
      : bin.max;
  const range = Math.max(binMax - bin.min, 1);
  const t = Math.min(1, Math.max(0, (gap - bin.min) / range));

  const inset = slotWidth * 0.14;
  return slotLeft + inset + t * (slotWidth - inset * 2);
}

export const MatchOutcomeGapChart = forwardRef<
  MatchOutcomeGapChartZoomApi,
  MatchOutcomeGapChartProps
>(function MatchOutcomeGapChart(
  {
    matches,
    binLabels,
    ariaLabel,
    xAxisLabel,
    yAxisLabel,
    legend,
    footnotes,
    renderMatchTooltip,
    renderBinTooltip,
    getBinAriaLabel,
    layout = "compact",
    interactiveDots = false,
    hideBars = false,
    hideLegend = false,
    hideFootnotes = false,
    dotTransform: controlledDotTransform,
    onDotTransformChange,
  },
  ref,
) {
  const layoutConfig = CHART_LAYOUTS[layout];
  const { width, height, margin, barAreaHeight, barGap, maxRowStep } =
    layoutConfig;
  const showBars = !hideBars && barAreaHeight > 0;

  const [hoveredTarget, setHoveredTarget] = useState<HoveredTarget | null>(
    null,
  );
  const [internalDotTransform, setInternalDotTransform] =
    useState<DotTransform>(INITIAL_DOT_TRANSFORM);
  const dotTransform = controlledDotTransform ?? internalDotTransform;
  const dotTransformRef = useRef(dotTransform);
  dotTransformRef.current = dotTransform;

  const updateDotTransform = useCallback(
    (updater: DotTransform | ((current: DotTransform) => DotTransform)) => {
      const current = dotTransformRef.current;
      const next = typeof updater === "function" ? updater(current) : updater;

      if (onDotTransformChange) {
        onDotTransformChange(next);
      } else {
        setInternalDotTransform(next);
      }
    },
    [onDotTransformChange],
  );

  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{
    pointerX: number;
    pointerY: number;
    translateX: number;
    translateY: number;
    active: boolean;
  } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const effectiveBarHeight = showBars ? barAreaHeight : 0;
  const effectiveBarGap = showBars ? barGap : 12;
  const dotAreaTop = margin.top + effectiveBarHeight + effectiveBarGap;
  const chartWidth = width - margin.left - margin.right;
  const barBaselineY = margin.top + effectiveBarHeight;
  const binLabelY = showBars ? barBaselineY + 18 : height - margin.bottom - 6;
  const binCountY = showBars ? barBaselineY + 30 : height - margin.bottom + 8;
  const dotBaselineY = showBars
    ? height - margin.bottom
    : height - margin.bottom - 28;
  const dotRegionTop = showBars ? dotAreaTop - 10 : margin.top + 8;
  const dotRegionHeight = dotBaselineY - dotRegionTop;
  const dotPlotCenterY = dotRegionTop + dotRegionHeight / 2;
  const dotRegionCenterX = margin.left + chartWidth / 2;
  const centerDotsVertically = interactiveDots && hideBars;

  const zoomIn = useCallback(() => {
    updateDotTransform((current) =>
      clampDotTransform(
        zoomAtPoint(
          current,
          dotRegionCenterX,
          dotPlotCenterY,
          current.scale + ZOOM_STEP,
        ),
        margin.left,
        dotRegionTop,
        chartWidth,
        dotRegionHeight,
      ),
    );
  }, [
    chartWidth,
    dotRegionCenterX,
    dotPlotCenterY,
    dotRegionHeight,
    dotRegionTop,
    margin.left,
    updateDotTransform,
  ]);

  const zoomOut = useCallback(() => {
    updateDotTransform((current) =>
      clampDotTransform(
        zoomAtPoint(
          current,
          dotRegionCenterX,
          dotPlotCenterY,
          current.scale - ZOOM_STEP,
        ),
        margin.left,
        dotRegionTop,
        chartWidth,
        dotRegionHeight,
      ),
    );
  }, [
    chartWidth,
    dotRegionCenterX,
    dotPlotCenterY,
    dotRegionHeight,
    dotRegionTop,
    margin.left,
    updateDotTransform,
  ]);

  const showMatch = useCallback(
    (
      entry: MatchOutcomeGapEntry,
      cx: number,
      cy: number,
      svgElement: SVGSVGElement | null,
      transform: DotTransform,
    ) => {
      if (!svgElement) return;
      const transformed = applyDotTransform(cx, cy, transform);
      const screen = svgCoordsToScreen(
        svgElement,
        transformed.x,
        transformed.y,
      );
      if (!screen) return;

      setHoveredTarget({
        kind: "match",
        entry,
        x: screen.x,
        y: screen.y,
      });
    },
    [],
  );

  const showBin = useCallback(
    (
      bin: MatchOutcomeGapBinStats,
      cx: number,
      cy: number,
      svgElement: SVGSVGElement | null,
    ) => {
      if (!svgElement) return;
      const screen = svgCoordsToScreen(svgElement, cx, cy);
      if (!screen) return;

      setHoveredTarget({
        kind: "bin",
        bin,
        x: screen.x,
        y: screen.y,
      });
    },
    [],
  );

  const hideTooltip = useCallback(() => {
    setHoveredTarget(null);
  }, []);

  const clientToSvg = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } | null => {
      const svg = svgRef.current;
      if (!svg) return null;

      const point = svg.createSVGPoint();
      point.x = clientX;
      point.y = clientY;
      const ctm = svg.getScreenCTM();
      if (!ctm) return null;

      return point.matrixTransform(ctm.inverse());
    },
    [],
  );

  const isInDotRegion = useCallback(
    (y: number) => y >= dotRegionTop && y <= dotBaselineY,
    [dotBaselineY, dotRegionTop],
  );

  const handleDotWheel = useCallback(
    (event: WheelEvent) => {
      if (!interactiveDots) return;

      const svg = svgRef.current;
      if (!svg) return;

      const point = svg.createSVGPoint();
      point.x = event.clientX;
      point.y = event.clientY;
      const ctm = svg.getScreenCTM();
      if (!ctm) return;

      const svgPoint = point.matrixTransform(ctm.inverse());
      if (!isInDotRegion(svgPoint.y)) return;

      event.preventDefault();
      event.stopPropagation();

      const direction = event.deltaY < 0 ? 1 : -1;

      updateDotTransform((current) =>
        clampDotTransform(
          zoomAtPoint(
            current,
            svgPoint.x,
            svgPoint.y,
            current.scale + direction * ZOOM_STEP,
          ),
          margin.left,
          dotRegionTop,
          chartWidth,
          dotRegionHeight,
        ),
      );
    },
    [
      chartWidth,
      dotRegionHeight,
      dotRegionTop,
      interactiveDots,
      isInDotRegion,
      margin.left,
      updateDotTransform,
    ],
  );

  useEffect(() => {
    if (!interactiveDots) return;

    const container = chartContainerRef.current;
    if (!container) return;

    container.addEventListener("wheel", handleDotWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleDotWheel);
    };
  }, [handleDotWheel, interactiveDots]);

  const handlePanPointerDown = useCallback(
    (event: React.PointerEvent<SVGSVGElement>) => {
      if (!interactiveDots || event.button !== 0) return;

      const svgPoint = clientToSvg(event.clientX, event.clientY);
      if (!svgPoint || !isInDotRegion(svgPoint.y)) return;

      panStartRef.current = {
        pointerX: event.clientX,
        pointerY: event.clientY,
        translateX: dotTransformRef.current.translateX,
        translateY: dotTransformRef.current.translateY,
        active: false,
      };
    },
    [clientToSvg, interactiveDots, isInDotRegion],
  );

  const handlePanPointerMove = useCallback(
    (event: React.PointerEvent<SVGSVGElement>) => {
      if (!interactiveDots || !panStartRef.current || !svgRef.current) return;

      const deltaX = event.clientX - panStartRef.current.pointerX;
      const deltaY = event.clientY - panStartRef.current.pointerY;

      if (
        !panStartRef.current.active &&
        Math.hypot(deltaX, deltaY) < 4
      ) {
        return;
      }

      if (!panStartRef.current.active) {
        panStartRef.current.active = true;
        setIsPanning(true);
        setHoveredTarget(null);
      }

      const ctm = svgRef.current.getScreenCTM();
      if (!ctm) return;

      const scaleX = ctm.a;
      const scaleY = ctm.d;

      updateDotTransform(
        clampDotTransform(
          {
            scale: dotTransformRef.current.scale,
            translateX:
              panStartRef.current.translateX + deltaX / scaleX,
            translateY:
              panStartRef.current.translateY + deltaY / scaleY,
          },
          margin.left,
          dotRegionTop,
          chartWidth,
          dotRegionHeight,
        ),
      );
    },
    [
      chartWidth,
      dotRegionHeight,
      dotRegionTop,
      interactiveDots,
      margin.left,
      updateDotTransform,
    ],
  );

  const handlePanPointerUp = useCallback(() => {
    if (!interactiveDots) return;
    panStartRef.current = null;
    setIsPanning(false);
  }, [interactiveDots]);

  const bins = useMemo(
    () => buildBinStats(matches, binLabels),
    [matches, binLabels],
  );
  const maxGap = useMemo(
    () => (matches.length > 0 ? Math.max(...matches.map((e) => e.gapPoints)) : 0),
    [matches],
  );
  const barWidth = chartWidth / bins.length - 10;
  const dotRows = useMemo(() => {
    const gapCounts = new Map<number, number>();
    return matches.map((entry) => {
      const count = gapCounts.get(entry.gapPoints) ?? 0;
      gapCounts.set(entry.gapPoints, count + 1);
      return { entry, row: count };
    });
  }, [matches]);
  const rowCount = useMemo(() => {
    if (dotRows.length === 0) return 1;
    return Math.max(...dotRows.map((row) => row.row)) + 1;
  }, [dotRows]);
  const rowStep = useMemo(() => {
    const bottomPad = layoutConfig.outlierRadius + 2;
    const availableHeight = centerDotsVertically
      ? dotRegionHeight - 24
      : Math.max(dotBaselineY - dotAreaTop - bottomPad - 4, bottomPad);
    return Math.min(
      maxRowStep,
      availableHeight / Math.max(rowCount, 1),
    );
  }, [
    centerDotsVertically,
    dotAreaTop,
    dotBaselineY,
    dotRegionHeight,
    layoutConfig.outlierRadius,
    maxRowStep,
    rowCount,
  ]);
  const stackHeight = Math.max(0, (rowCount - 1) * rowStep);
  const yForDot = useCallback(
    (row: number) => {
      if (centerDotsVertically) {
        const stackTop = dotPlotCenterY - stackHeight / 2;
        return stackTop + row * rowStep;
      }
      return (
        dotBaselineY - (layoutConfig.outlierRadius + 2) - row * rowStep
      );
    },
    [
      centerDotsVertically,
      dotBaselineY,
      dotPlotCenterY,
      layoutConfig.outlierRadius,
      rowStep,
      stackHeight,
    ],
  );

  const defaultCenteredTransform = useMemo(() => {
    if (!interactiveDots || matches.length === 0) {
      return INITIAL_DOT_TRANSFORM;
    }

    const contentCenter = computeDotContentCenter(
      dotRows,
      maxGap,
      margin.left,
      chartWidth,
      yForDot,
      dotRegionCenterX,
      dotPlotCenterY,
    );

    return clampDotTransform(
      centeredDotTransform(
        contentCenter.x,
        contentCenter.y,
        dotRegionCenterX,
        dotPlotCenterY,
        1,
      ),
      margin.left,
      dotRegionTop,
      chartWidth,
      dotRegionHeight,
    );
  }, [
    chartWidth,
    dotPlotCenterY,
    dotRegionCenterX,
    dotRegionHeight,
    dotRegionTop,
    dotRows,
    interactiveDots,
    margin.left,
    matches.length,
    maxGap,
    yForDot,
  ]);

  const defaultCenteredTransformRef = useRef(defaultCenteredTransform);
  defaultCenteredTransformRef.current = defaultCenteredTransform;

  const resetZoom = useCallback(() => {
    updateDotTransform(
      defaultCenteredTransformRef.current ?? INITIAL_DOT_TRANSFORM,
    );
  }, [updateDotTransform]);

  useImperativeHandle(ref, () => ({ zoomIn, zoomOut, resetZoom }), [
    zoomIn,
    zoomOut,
    resetZoom,
  ]);

  useEffect(() => {
    setHoveredTarget(null);
    updateDotTransform(
      defaultCenteredTransformRef.current ?? INITIAL_DOT_TRANSFORM,
    );
  }, [matches, interactiveDots, defaultCenteredTransform, updateDotTransform]);

  if (matches.length === 0) return null;

  const clipId = `match-outcome-gap-dots-${layout}`;

  const gridLines = (
    <>
      <line
        x1={margin.left}
        x2={width - margin.right}
        y1={dotRegionTop}
        y2={dotRegionTop}
        className="stroke-white/10"
        strokeDasharray="3 3"
      />
      {MATCH_OUTCOME_GAP_BINS.map((bin, index) => {
        const slotX = margin.left + index * (chartWidth / bins.length);
        return (
          <line
            key={bin.id}
            x1={slotX}
            x2={slotX}
            y1={dotRegionTop}
            y2={dotBaselineY}
            className="stroke-white/6"
          />
        );
      })}
      <line
        x1={width - margin.right}
        x2={width - margin.right}
        y1={dotRegionTop}
        y2={dotBaselineY}
        className="stroke-white/6"
      />
    </>
  );

  const zoomScale = interactiveDots ? Math.max(dotTransform.scale, 0.001) : 1;
  // Positions spread with zoomScale; radii grow slower, then freeze after 1000%.
  const sizeZoom = Math.pow(
    Math.min(zoomScale, MAX_DOT_SIZE_SCALE),
    DOT_SIZE_ZOOM_POWER,
  );
  const screenLength = (value: number) => (value * sizeZoom) / zoomScale;

  const dotNodes = dotRows.map(({ entry, row }) => {
    const cx = xForGapInBinSlot(
      entry.gapPoints,
      maxGap,
      margin.left,
      chartWidth,
    );
    const cy = yForDot(row);
    const isHovered =
      hoveredTarget?.kind === "match" &&
      hoveredTarget.entry.id === entry.id;
    const dotRadius = screenLength(
      isHovered ? layoutConfig.dotRadiusHovered : layoutConfig.dotRadius,
    );

    return (
      <g
        key={entry.id}
        className="cursor-pointer"
        onMouseEnter={(event) =>
          showMatch(
            entry,
            cx,
            cy,
            event.currentTarget.ownerSVGElement,
            dotTransform,
          )
        }
        onMouseMove={(event) =>
          showMatch(
            entry,
            cx,
            cy,
            event.currentTarget.ownerSVGElement,
            dotTransform,
          )
        }
        onFocus={(event) =>
          showMatch(
            entry,
            cx,
            cy,
            event.currentTarget.ownerSVGElement,
            dotTransform,
          )
        }
        onBlur={hideTooltip}
        tabIndex={0}
        role="button"
        aria-label={`${entry.team1.id} vs ${entry.team2.id}, ${entry.scoreLabel}`}
      >
        {entry.isOutlier && (
          <circle
            cx={cx}
            cy={cy}
            r={screenLength(layoutConfig.outlierRadius)}
            fill="none"
            className={cn(
              "stroke-wc-orange transition-opacity",
              isHovered ? "opacity-100" : "opacity-80",
            )}
            strokeWidth={screenLength(2)}
          />
        )}
        <circle
          cx={cx}
          cy={cy}
          r={screenLength(layoutConfig.hitRadius)}
          fill="transparent"
        />
        <circle
          cx={cx}
          cy={cy}
          r={dotRadius}
          className={cn(
            RESULT_DOT_CLASS[entry.favoriteResult],
            "transition-[stroke-opacity] duration-150",
            isHovered && "stroke-white/70",
          )}
          strokeWidth={isHovered ? screenLength(1.5) : 0}
        />
      </g>
    );
  });

  const zoomedBinLabels = hideBars
    ? bins.map((bin, index) => {
        const cx = xForBinCenter(index, margin.left, chartWidth, bins.length);
        return (
          <g key={bin.id}>
            <text
              x={cx}
              y={binLabelY}
              textAnchor="middle"
              className="fill-muted-foreground text-[11px]"
            >
              {bin.label}
            </text>
            <text
              x={cx}
              y={binCountY}
              textAnchor="middle"
              className="fill-muted-foreground text-[10px]"
            >
              n={bin.total}
            </text>
          </g>
        );
      })
    : null;

  const clipPadY = layoutConfig.outlierRadius + 3;

  return (
    <figure className="space-y-2">
      {legend && !hideLegend ? (
        <figcaption className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
          {legend}
        </figcaption>
      ) : null}

      <div
        ref={chartContainerRef}
        className="relative"
        onMouseLeave={hideTooltip}
      >
        <svg
          ref={svgRef}
          className={cn(
            "h-auto w-full",
            interactiveDots && (isPanning ? "cursor-grabbing" : "cursor-grab"),
          )}
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={ariaLabel}
          onMouseLeave={hideTooltip}
          onPointerDown={interactiveDots ? handlePanPointerDown : undefined}
          onPointerMove={interactiveDots ? handlePanPointerMove : undefined}
          onPointerUp={interactiveDots ? handlePanPointerUp : undefined}
          onPointerCancel={interactiveDots ? handlePanPointerUp : undefined}
        >
          <defs>
            <clipPath id={clipId}>
              <rect
                x={margin.left}
                y={
                  dotRegionTop -
                  (centerDotsVertically ? 4 : clipPadY)
                }
                width={chartWidth}
                height={
                  dotRegionHeight +
                  (centerDotsVertically
                    ? layoutConfig.hitRadius + 8
                    : clipPadY * 2)
                }
              />
            </clipPath>
          </defs>

          {[25, 50, 75, 100].map((tick) =>
            showBars ? (
              <text
                key={tick}
                x={margin.left - 6}
                y={barBaselineY - (tick / 100) * barAreaHeight + 3}
                textAnchor="end"
                className="fill-muted-foreground text-[9px]"
              >
                {tick}%
              </text>
            ) : null,
          )}

          {showBars ? (
            <text
              x={12}
              y={margin.top + barAreaHeight / 2}
              textAnchor="middle"
              transform={`rotate(-90, 12, ${margin.top + barAreaHeight / 2})`}
              className="fill-muted-foreground text-[6px] uppercase tracking-wide"
            >
              {yAxisLabel}
            </text>
          ) : null}

          {showBars ? (
            <line
              x1={margin.left}
              x2={width - margin.right}
              y1={barBaselineY}
              y2={barBaselineY}
              className="stroke-white/15"
            />
          ) : null}

          {bins.map((bin, index) => {
            const cx = xForBinCenter(index, margin.left, chartWidth, bins.length);

            if (hideBars) {
              return null;
            }

            if (bin.total === 0) {
              return (
                <g key={bin.id}>
                  <text
                    x={cx}
                    y={binLabelY}
                    textAnchor="middle"
                    className="fill-muted-foreground text-[8px]"
                  >
                    {bin.label}
                  </text>
                </g>
              );
            }

            const x = cx - barWidth / 2;
            let stackTop = barBaselineY;

            const segments: Array<{ result: GroupMatchResult; pct: number }> = [
              { result: "W", pct: bin.winPct },
              { result: "D", pct: bin.drawPct },
              { result: "L", pct: bin.lossPct },
            ];
            const visibleSegments = segments.filter((segment) => segment.pct > 0);

            return (
              <g key={bin.id}>
                {visibleSegments.map((segment, segmentIndex) => {
                  const segmentHeight = (segment.pct / 100) * barAreaHeight;
                  stackTop -= segmentHeight;
                  const isBottom = segmentIndex === 0;
                  const isTop = segmentIndex === visibleSegments.length - 1;

                  return (
                    <path
                      key={segment.result}
                      d={stackedBarSegmentPath(
                        x,
                        stackTop,
                        barWidth,
                        segmentHeight,
                        isTop,
                        isBottom,
                      )}
                      className={RESULT_BAR_CLASS[segment.result]}
                    />
                  );
                })}
                <rect
                  x={x}
                  y={barBaselineY - barAreaHeight}
                  width={barWidth}
                  height={barAreaHeight}
                  fill="transparent"
                  className="cursor-default"
                  aria-label={getBinAriaLabel(bin)}
                  onMouseEnter={(event) =>
                    showBin(
                      bin,
                      cx,
                      barBaselineY - barAreaHeight,
                      event.currentTarget.ownerSVGElement,
                    )
                  }
                  onMouseMove={(event) =>
                    showBin(
                      bin,
                      cx,
                      barBaselineY - barAreaHeight,
                      event.currentTarget.ownerSVGElement,
                    )
                  }
                  onFocus={(event) =>
                    showBin(
                      bin,
                      cx,
                      barBaselineY - barAreaHeight,
                      event.currentTarget.ownerSVGElement,
                    )
                  }
                  onBlur={hideTooltip}
                  tabIndex={0}
                  role="img"
                />
                <text
                  x={cx}
                  y={binLabelY}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[8px]"
                >
                  {bin.label}
                </text>
                <text
                  x={cx}
                  y={binCountY}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[7px]"
                >
                  n={bin.total}
                </text>
              </g>
            );
          })}

          {interactiveDots ? (
            <g clipPath={`url(#${clipId})`}>
              <g
                transform={`translate(${dotTransform.translateX} ${dotTransform.translateY}) scale(${dotTransform.scale})`}
              >
                {gridLines}
                {dotNodes}
              </g>
            </g>
          ) : (
            <>
              {gridLines}
              <g clipPath={`url(#${clipId})`}>
                <g
                  transform={`translate(${dotTransform.translateX} ${dotTransform.translateY}) scale(${dotTransform.scale})`}
                >
                  {dotNodes}
                </g>
              </g>
            </>
          )}

          {zoomedBinLabels}

          <text
            x={margin.left + chartWidth / 2}
            y={showBars ? dotBaselineY + 12 : height - 6}
            textAnchor="middle"
            className="fill-muted-foreground text-[6px] uppercase tracking-wide"
          >
            {xAxisLabel}
          </text>
        </svg>

        {hoveredTarget && typeof document !== "undefined"
          ? createPortal(
              <div
                className="pointer-events-none fixed z-[120] transition-opacity duration-150"
                style={{
                  left: hoveredTarget.x,
                  top: hoveredTarget.y,
                  transform: "translate(-50%, calc(-100% - 14px))",
                }}
              >
                {hoveredTarget.kind === "match"
                  ? renderMatchTooltip(hoveredTarget.entry)
                  : renderBinTooltip(hoveredTarget.bin)}
              </div>,
              document.body,
            )
          : null}
      </div>

      {footnotes && !hideFootnotes ? footnotes : null}
    </figure>
  );
});

export function computeOutcomeShares(matches: MatchOutcomeGapEntry[]) {
  const total = matches.length;
  if (total === 0) {
    return { total: 0, winPct: 0, drawPct: 0, lossPct: 0 };
  }

  const wins = matches.filter((entry) => entry.favoriteResult === "W").length;
  const draws = matches.filter((entry) => entry.favoriteResult === "D").length;
  const losses = matches.filter((entry) => entry.favoriteResult === "L").length;

  return {
    total,
    winPct: Math.round((wins / total) * 100),
    drawPct: Math.round((draws / total) * 100),
    lossPct: Math.round((losses / total) * 100),
  };
}

export function computeCloseGapInsight(matches: MatchOutcomeGapEntry[]) {
  const close = matches.filter((entry) => entry.gapPoints <= 100);
  if (close.length < 3) return null;
  return computeOutcomeShares(close);
}
