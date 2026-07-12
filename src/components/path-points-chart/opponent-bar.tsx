import type { OpponentPointsObservation } from "@/lib/domain/path/path-opponent-observations";
import { formatFifaPoints } from "@/lib/format";

interface OpponentBarProps {
  opponent: OpponentPointsObservation;
  fill: string;
  barWidth: number;
  x: number;
  barTop: number;
  barBottom: number;
  title: string;
  barKey: string;
}

export function OpponentBar({
  opponent,
  fill,
  barWidth,
  x,
  barTop,
  barBottom,
  title,
  barKey,
}: OpponentBarProps) {
  return (
    <g key={barKey}>
      <rect
        x={x}
        y={barTop}
        width={barWidth}
        height={barBottom - barTop}
        rx={5}
        fill={fill}
        fillOpacity={0.82}
      >
        <title>
          {title || `${opponent.displayName}: ${formatFifaPoints(opponent.points)}`}
        </title>
      </rect>
    </g>
  );
}
