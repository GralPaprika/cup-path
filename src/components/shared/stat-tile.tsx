"use client";

import { cn } from "@/lib/utils";

interface StatTileProps {
  label: string;
  value: string;
  secondaryLabel?: string;
  secondaryValue?: string;
  hint?: string;
  footer?: React.ReactNode;
  preview?: React.ReactNode;
  valueClassName?: string;
}

export function StatTile({
  label,
  value,
  secondaryLabel,
  secondaryValue,
  hint,
  footer,
  preview,
  valueClassName,
}: StatTileProps) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 font-mono text-lg font-semibold tabular-nums text-white",
          valueClassName,
        )}
      >
        {value}
      </p>
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
        <p
          className={cn(
            "text-xs text-muted-foreground",
            secondaryLabel ? "mt-2" : "mt-1",
          )}
        >
          {hint}
        </p>
      ) : null}
      {footer}
      {preview}
    </div>
  );
}
