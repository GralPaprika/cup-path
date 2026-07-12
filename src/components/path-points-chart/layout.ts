import type { OpponentPointsObservation } from "@/lib/domain/path/path-opponent-observations";
import {
  BAR_GAP_THREE_SERIES,
  BAR_GAP_TWO_SERIES,
  BAR_MAX_WIDTH_THREE_SERIES,
  BAR_MAX_WIDTH_TWO_SERIES,
  BAR_SLOT_FILL,
  PATH_CHART_DOMAIN_STEP,
  PATH_CHART_HEIGHT,
  PATH_CHART_MARGIN,
  PATH_CHART_WIDTH,
} from "@/components/path-points-chart/constants";

export interface PathChartBarGeometry {
  barWidth: number;
  barGap: number;
  getBarShift: (seriesIndex: number) => number;
}

export interface PathChartScale {
  domainMax: number;
  y: (value: number) => number;
  slotCenter: (index: number) => number;
  ticks: number[];
  labelInsetLeft: string;
  labelInsetRight: string;
  barBottom: number;
  slotWidth: number;
  chartWidth: number;
  chartHeight: number;
  margin: typeof PATH_CHART_MARGIN;
}

export function computeBarGeometry(
  slotWidth: number,
  seriesCount: number,
): PathChartBarGeometry {
  const barGap = seriesCount === 3 ? BAR_GAP_THREE_SERIES : BAR_GAP_TWO_SERIES;
  const maxBarWidth =
    seriesCount === 3 ? BAR_MAX_WIDTH_THREE_SERIES : BAR_MAX_WIDTH_TWO_SERIES;
  const barWidth = Math.min(
    maxBarWidth,
    (slotWidth * BAR_SLOT_FILL - barGap * (seriesCount - 1)) / seriesCount,
  );

  function getBarShift(seriesIndex: number): number {
    const totalWidth = seriesCount * barWidth + (seriesCount - 1) * barGap;
    const offset = -totalWidth / 2 + barWidth / 2;
    return offset + seriesIndex * (barWidth + barGap);
  }

  return { barWidth, barGap, getBarShift };
}

export function buildPathChartScale(
  values: number[],
  slotCount: number,
): PathChartScale | null {
  if (values.length === 0) return null;

  const margin = PATH_CHART_MARGIN;
  const chartWidth = PATH_CHART_WIDTH - margin.left - margin.right;
  const chartHeight = PATH_CHART_HEIGHT - margin.top - margin.bottom;
  const slotWidth = chartWidth / Math.max(slotCount, 1);
  const scaleMax = Math.max(...values);
  const domainMax = Math.ceil(scaleMax / PATH_CHART_DOMAIN_STEP) * PATH_CHART_DOMAIN_STEP;

  const y = (value: number) =>
    margin.top + chartHeight - (value / domainMax) * chartHeight;
  const slotCenter = (index: number) =>
    margin.left + slotWidth * index + slotWidth / 2;

  return {
    domainMax,
    y,
    slotCenter,
    ticks: [0, domainMax / 2, domainMax],
    labelInsetLeft: `${(margin.left / PATH_CHART_WIDTH) * 100}%`,
    labelInsetRight: `${(margin.right / PATH_CHART_WIDTH) * 100}%`,
    barBottom: y(0),
    slotWidth,
    chartWidth,
    chartHeight,
    margin,
  };
}

export function collectNumericValues(
  values: Array<number | null | undefined>,
): number[] {
  return values.filter((value): value is number => value !== null && value !== undefined);
}

export interface PathChartBarSeries {
  opponents: OpponentPointsObservation[];
  color: string;
  legendLabel: string;
  barTitle?: (opponent: OpponentPointsObservation) => string;
}

export function opponentSlotCount(
  ...opponentLists: Array<OpponentPointsObservation[] | undefined>
): number {
  return Math.max(...opponentLists.map((list) => list?.length ?? 0), 1);
}
