"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export type SortDirection = "desc" | "asc";

interface SortButtonProps {
  active: boolean;
  direction: SortDirection;
  onClick: () => void;
  children: React.ReactNode;
}

export function SortButton({
  active,
  direction,
  onClick,
  children,
}: SortButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-medium transition-colors",
        active
          ? "bg-wc-sky/15 text-wc-sky"
          : "text-muted-foreground hover:bg-white/6 hover:text-white",
      )}
    >
      {children}
      {active &&
        (direction === "desc" ? (
          <ArrowDown className="size-3 shrink-0" />
        ) : (
          <ArrowUp className="size-3 shrink-0" />
        ))}
    </button>
  );
}
