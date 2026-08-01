import type { OpponentPointsObservation } from "@/lib/domain/path/path-opponent-observations";
import { formatFifaPoints } from "@/lib/format";
import { chartStrokeForFill } from "@/lib/chart-colors";

interface OpponentBarProps {
  opponent: OpponentPointsObservation;
  fill: string;
  /** Opposite-kit outline for black / dark-blue fills. */
  outline?: string | null;
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
  outline,
  barWidth,
  x,
  barTop,
  barBottom,
  title,
  barKey,
}: OpponentBarProps) {
  const stroke = chartStrokeForFill(fill, outline);
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
        stroke={stroke?.stroke}
        strokeWidth={stroke?.strokeWidth}
      >
        <title>
          {title || `${opponent.displayName}: ${formatFifaPoints(opponent.points)}`}
        </title>
      </rect>
    </g>
  );
}
