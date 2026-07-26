"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

const PICK_WINNERS_ALERT_TIMEOUT_MS = 5000;

interface SimulateScenarioActionsProps {
  hasOverrides: boolean;
  pendingWinnerCount: number;
  showPickAllStrongest: boolean;
  showPickSimulatedStrongest: boolean;
  onReset: () => void;
  onPickAllStrongest: () => void;
  onPickSimulatedStrongest: () => void;
}

/** Inline scenario actions meant to sit inside the bracket controls row. */
export function SimulateScenarioActions({
  hasOverrides,
  pendingWinnerCount,
  showPickAllStrongest,
  showPickSimulatedStrongest,
  onReset,
  onPickAllStrongest,
  onPickSimulatedStrongest,
}: SimulateScenarioActionsProps) {
  const t = useTranslations("simulate");

  return (
    <>
      {showPickAllStrongest && (
        <button
          type="button"
          onClick={onPickAllStrongest}
          className="rounded-lg border border-wc-sky/30 px-3 py-1.5 text-sm font-medium text-wc-sky transition-colors hover:border-wc-sky/50 hover:bg-wc-sky/10"
        >
          {t("pickAllStrongestWinners")}
        </button>
      )}
      {showPickSimulatedStrongest && (
        <button
          type="button"
          onClick={onPickSimulatedStrongest}
          className="rounded-lg border border-wc-purple/30 px-3 py-1.5 text-sm font-medium text-wc-purple transition-colors hover:border-wc-purple/50 hover:bg-wc-purple/10"
        >
          {t("pickSimulatedStrongestWinners")}
        </button>
      )}
      {hasOverrides && (
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-white/25 hover:text-white"
        >
          {t("reset")}
        </button>
      )}
      {pendingWinnerCount > 0 && (
        <span className="rounded-lg border border-wc-purple/40 bg-wc-purple/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-wc-purple">
          {t("pendingWinnersBadge", { count: pendingWinnerCount })}
        </span>
      )}
    </>
  );
}

interface SimulatePendingWinnersAlertProps {
  count: number;
  visible: boolean;
  onDismiss: () => void;
}

/** Bottom-right toast: auto-dismisses after 5s or when the user closes it. */
export function SimulatePendingWinnersAlert({
  count,
  visible,
  onDismiss,
}: SimulatePendingWinnersAlertProps) {
  const t = useTranslations("simulate");
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;
  const show = count > 0 && visible;

  useEffect(() => {
    if (!show) return;
    const timeoutId = window.setTimeout(
      () => onDismissRef.current(),
      PICK_WINNERS_ALERT_TIMEOUT_MS,
    );
    return () => window.clearTimeout(timeoutId);
  }, [show]);

  if (!show) return null;

  return (
    <div
      role="status"
      className="fixed right-4 bottom-4 z-50 w-[min(24rem,calc(100vw-2rem))] rounded-xl border border-wc-purple/30 bg-wc-navy/95 px-4 py-3 pr-10 shadow-xl backdrop-blur-xl"
    >
      <button
        type="button"
        onClick={onDismiss}
        aria-label={t("pickWinnersAlertDismiss")}
        className="absolute right-2 top-2 rounded p-0.5 text-muted-foreground transition-colors hover:bg-white/10 hover:text-white"
      >
        <span aria-hidden className="text-sm leading-none">
          ×
        </span>
      </button>
      <p className="text-sm font-medium text-wc-purple">
        {t("pickWinnersAlertTitle")}
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">
        {t("pickWinnersAlertBody", { count })}
      </p>
    </div>
  );
}
