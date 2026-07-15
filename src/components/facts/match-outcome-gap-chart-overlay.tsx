"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Minus, Plus, RotateCcw, X } from "lucide-react";
import {
  MatchOutcomeGapChart,
  type DotTransform,
  type MatchOutcomeGapChartProps,
  type MatchOutcomeGapChartZoomApi,
} from "@/components/facts/match-outcome-gap-chart";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type MatchOutcomeGapChartOverlayProps = Omit<
  MatchOutcomeGapChartProps,
  | "layout"
  | "interactiveDots"
  | "hideBars"
  | "hideLegend"
  | "hideFootnotes"
  | "dotTransform"
  | "onDotTransformChange"
> & {
  open: boolean;
  onClose: () => void;
  title: string;
  closeLabel: string;
  zoomInLabel: string;
  zoomOutLabel: string;
  resetZoomLabel: string;
  interactionHint: string;
  legend: MatchOutcomeGapChartProps["legend"];
  stageFilters?: ReactNode;
  noMatchesMessage?: string;
};

export function MatchOutcomeGapChartOverlay({
  open,
  onClose,
  title,
  closeLabel,
  zoomInLabel,
  zoomOutLabel,
  resetZoomLabel,
  interactionHint,
  legend,
  stageFilters,
  noMatchesMessage,
  footnotes,
  matches,
  ...chartProps
}: MatchOutcomeGapChartOverlayProps) {
  const chartRef = useRef<MatchOutcomeGapChartZoomApi>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [dotTransform, setDotTransform] = useState<DotTransform | undefined>(
    undefined,
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const frame = requestAnimationFrame(() => {
      const closeButton = dialogRef.current?.querySelector<HTMLButtonElement>(
        "[data-slot='overlay-close']",
      );
      closeButton?.focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      previousFocusRef.current?.focus();
      setDotTransform(undefined);
    };
  }, [open, onClose]);

  const handleBackdropClick = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="presentation"
    >
      <div
        className="absolute inset-0 bg-black/65 backdrop-blur-sm"
        aria-hidden
        onMouseDown={handleBackdropClick}
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="match-outcome-gap-overlay-title"
        className={cn(
          "glass-panel relative z-[101] flex w-full max-w-[min(1440px,calc(100vw-2rem))] flex-col overflow-hidden",
        )}
      >
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-white/8 bg-white/[0.03] px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <h3
              id="match-outcome-gap-overlay-title"
              className="text-base font-semibold text-white sm:text-lg"
            >
              {title}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {interactionHint}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label={zoomOutLabel}
              onClick={() => chartRef.current?.zoomOut()}
            >
              <Minus />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label={zoomInLabel}
              onClick={() => chartRef.current?.zoomIn()}
            >
              <Plus />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-label={resetZoomLabel}
              onClick={() => chartRef.current?.resetZoom()}
            >
              <RotateCcw />
              <span className="hidden sm:inline">{resetZoomLabel}</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              data-slot="overlay-close"
              aria-label={closeLabel}
              onClick={onClose}
            >
              <X />
            </Button>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-white/8 px-4 py-2.5 sm:px-5">
          <div className="flex min-w-0 flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
            {legend}
          </div>
          {stageFilters ? (
            <div className="shrink-0">{stageFilters}</div>
          ) : null}
        </div>

        <div className="overflow-hidden px-3 py-3 sm:px-5 sm:py-4">
          {matches.length === 0 && noMatchesMessage ? (
            <p className="text-sm text-muted-foreground">{noMatchesMessage}</p>
          ) : (
            <MatchOutcomeGapChart
              ref={chartRef}
              {...chartProps}
              matches={matches}
              layout="expanded"
              interactiveDots
              hideBars
              hideLegend
              hideFootnotes
              footnotes={footnotes}
              dotTransform={dotTransform}
              onDotTransformChange={setDotTransform}
            />
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
