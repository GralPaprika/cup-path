"use client";

import { cn } from "@/lib/utils";

interface StatTileProps {
  label: string;
  value: string;
  secondaryLabel?: string;
  secondaryValue?: string;
  hint?: React.ReactNode;
  footer?: React.ReactNode;
  preview?: React.ReactNode;
  delta?: string | null;
  deltaTone?: "positive" | "negative" | "neutral";
  basis?: string;
  className?: string;
  valueClassName?: string;
  size?: "sm" | "md" | "lg";
}

const DELTA_TONES = {
  positive: "text-wc-green",
  negative: "text-wc-red",
  neutral: "text-muted-foreground",
} as const;

export function StatTile({
  label,
  value,
  secondaryLabel,
  secondaryValue,
  hint,
  footer,
  preview,
  delta,
  deltaTone = "neutral",
  basis,
  className,
  valueClassName,
  size = "md",
}: StatTileProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3",
        className,
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 font-semibold tabular-nums text-white",
          size === "sm" && "font-mono text-lg",
          size === "md" && "font-mono text-xl",
          size === "lg" && "text-2xl font-bold leading-tight sm:text-3xl",
          valueClassName,
        )}
      >
        {value}
      </p>
      {(delta || basis) && (
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
          {delta ? (
            <span
              className={cn(
                "font-mono text-xs font-semibold tabular-nums",
                DELTA_TONES[deltaTone],
              )}
            >
              {delta}
            </span>
          ) : null}
          {basis ? (
            <span className="text-xs text-muted-foreground">{basis}</span>
          ) : null}
        </div>
      )}
      {secondaryLabel && secondaryValue ? (
        <>
          <p className="mt-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {secondaryLabel}
          </p>
          <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-white">
            {secondaryValue}
          </p>
        </>
      ) : null}
      {hint ? (
        <div
          className={cn(
            "text-xs text-muted-foreground",
            secondaryLabel || delta || basis ? "mt-2" : "mt-1",
          )}
        >
          {hint}
        </div>
      ) : null}
      {footer}
      {preview}
    </div>
  );
}
