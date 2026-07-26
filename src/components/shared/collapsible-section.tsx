"use client";

import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { usePersistedUiState } from "@/hooks/use-persisted-ui-state";
import { cn } from "@/lib/utils";

interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  contentClassName?: string;
  className?: string;
  id?: string;
  /** Renders as a nested sub-panel instead of a standalone glass panel. */
  embedded?: boolean;
  /** Whether the section starts expanded. Defaults to collapsed. */
  defaultOpen?: boolean;
  /** When set, open/closed state is restored from localStorage. */
  persistKey?: string;
}

export function CollapsibleSection({
  title,
  subtitle,
  children,
  contentClassName,
  className,
  id,
  embedded = false,
  defaultOpen = false,
  persistKey,
}: CollapsibleSectionProps) {
  const [open, setOpen] = usePersistedUiState(persistKey ?? null, defaultOpen);

  return (
    <details
      id={id}
      className={cn(
        "group overflow-hidden scroll-mt-28",
        embedded
          ? "rounded-xl border border-white/8 bg-white/[0.02]"
          : "glass-panel",
        className,
      )}
      open={open}
      onToggle={(event) => {
        setOpen((event.currentTarget as HTMLDetailsElement).open);
      }}
    >
      <summary
        className={cn(
          "flex cursor-pointer list-none items-center justify-between gap-3 border-b border-white/8 bg-white/[0.03] marker:content-none [&::-webkit-details-marker]:hidden",
          embedded ? "px-4 py-3" : "px-5 py-4",
        )}
      >
        <div>
          <h2
            className={cn(
              "font-semibold text-white",
              embedded ? "text-base" : "text-lg",
            )}
          >
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>
      <div
        className={cn(
          "space-y-6",
          embedded ? "p-4 sm:p-5" : "p-5 sm:p-6",
          contentClassName,
        )}
      >
        {children}
      </div>
    </details>
  );
}
