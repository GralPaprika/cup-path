"use client";

import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AboutFeatureCardProps {
  icon: LucideIcon;
  title: string;
  summary: string;
  ctaLabel: string;
  onLearnMore: () => void;
  className?: string;
}

export function AboutFeatureCard({
  icon: Icon,
  title,
  summary,
  ctaLabel,
  onLearnMore,
  className,
}: AboutFeatureCardProps) {
  return (
    <div
      className={cn(
        "glass-panel-subtle flex flex-col gap-4 p-5",
        className,
      )}
    >
      <div className="flex size-10 items-center justify-center rounded-xl bg-wc-sky/15 text-wc-sky">
        <Icon className="size-5" aria-hidden />
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <p className="text-sm leading-6 text-muted-foreground">{summary}</p>
      </div>
      <Button type="button" className="w-full" onClick={onLearnMore}>
        {ctaLabel}
      </Button>
    </div>
  );
}
