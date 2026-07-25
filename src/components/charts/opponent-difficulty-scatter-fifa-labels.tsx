/**
 * Removable FIFA-code labels for opponent-difficulty scatter charts.
 * Delete this file + the showFifaLabels toggle/prop wiring to remove labels
 * without touching outcome/search filters.
 */

interface FifaLabelPoint {
  id: string;
  fifaCode: string;
  cx: number;
  cy: number;
}

interface OpponentDifficultyScatterFifaLabelsProps {
  points: FifaLabelPoint[];
  /** Offset above the dot center so the code doesn’t cover the circle. */
  offsetY?: number;
}

const DEFAULT_OFFSET_Y = 12;

export function OpponentDifficultyScatterFifaLabels({
  points,
  offsetY = DEFAULT_OFFSET_Y,
}: OpponentDifficultyScatterFifaLabelsProps) {
  return (
    <g aria-hidden="true" className="pointer-events-none">
      {points.map((point) => (
        <text
          key={`fifa-label-${point.id}`}
          x={point.cx}
          y={point.cy - offsetY}
          textAnchor="middle"
          className="fill-muted-foreground text-[9px]"
        >
          {point.fifaCode}
        </text>
      ))}
    </g>
  );
}
