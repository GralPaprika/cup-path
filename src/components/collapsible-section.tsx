"use client";

import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  contentClassName?: string;
}

export function CollapsibleSection({
  title,
  subtitle,
  children,
  contentClassName,
}: CollapsibleSectionProps) {
  return (
    <details className="glass-panel group overflow-hidden" open>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 border-b border-white/8 bg-white/[0.03] px-5 py-4 marker:content-none [&::-webkit-details-marker]:hidden">
        <div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          {subtitle ? (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>
      <div className={cn("space-y-6 p-5 sm:p-6", contentClassName)}>
        {children}
      </div>
    </details>
  );
}
