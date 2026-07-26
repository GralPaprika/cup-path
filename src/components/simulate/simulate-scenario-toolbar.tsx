"use client";

import { useTranslations } from "next-intl";

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

export function SimulatePendingWinnersAlert({
  count,
  visible,
  onDismiss,
}: SimulatePendingWinnersAlertProps) {
  const t = useTranslations("simulate");

  if (count <= 0 || !visible) return null;

  return (
    <div
      role="status"
      className="relative rounded-lg border border-wc-purple/30 bg-wc-purple/5 px-3 py-2.5 pr-9"
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
