import type { PathChartBarSeries } from "@/components/path-points-chart/layout";
import { OpponentSlotColumn } from "@/components/path-points-chart/opponent-slot-column";
import {
  SLOT_LABEL_GAP_THREE_SERIES,
  SLOT_LABEL_GAP_TWO_SERIES,
} from "@/components/path-points-chart/constants";

interface MatchSlotLabelGridProps {
  slotCount: number;
  series: PathChartBarSeries[];
  matchLabel: string;
  labelInsetLeft: string;
  labelInsetRight: string;
  isSlotChanged?: (slotIndex: number) => boolean;
  highlightChangedSeriesIndex?: number;
}

export function MatchSlotLabelGrid({
  slotCount,
  series,
  matchLabel,
  labelInsetLeft,
  labelInsetRight,
  isSlotChanged,
  highlightChangedSeriesIndex = 1,
}: MatchSlotLabelGridProps) {
  const columnGap =
    series.length > 2 ? SLOT_LABEL_GAP_THREE_SERIES : SLOT_LABEL_GAP_TWO_SERIES;

  return (
    <div
      className="mt-1 grid gap-y-1"
      style={{
        paddingLeft: labelInsetLeft,
        paddingRight: labelInsetRight,
        gridTemplateColumns: `repeat(${slotCount}, minmax(0, 1fr))`,
      }}
    >
      {Array.from({ length: slotCount }, (_, slotIndex) => (
        <div
          key={`slot-${slotIndex}`}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span className="font-mono text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
            {matchLabel} {slotIndex + 1}
          </span>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${series.length}, auto)`,
              columnGap,
              justifyContent: "center",
              alignItems: "end",
            }}
          >
            {series.map((entry, seriesIndex) => (
              <OpponentSlotColumn
                key={`${slotIndex}-${seriesIndex}`}
                opponent={entry.opponents[slotIndex]}
                color={entry.color}
                changed={
                  isSlotChanged?.(slotIndex) &&
                  seriesIndex === highlightChangedSeriesIndex
                }
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
