import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface MatchScoreBreakdownProps {
  ft: string;
  et?: string | null;
  pens?: string | null;
  className?: string;
  align?: "center" | "start";
  ftClassName?: string;
}

/** Prefer ET (final after 120') when present; otherwise full-time. */
export function resolveFinalScoreLabel(
  ft: string,
  et?: string | null,
): string {
  return et ?? ft;
}

export function MatchScoreBreakdown({
  ft,
  et,
  pens,
  className,
  align = "center",
  ftClassName = "text-muted-foreground",
}: MatchScoreBreakdownProps) {
  const t = useTranslations("common");
  const finalScore = resolveFinalScoreLabel(ft, et);
  const wentToEt = Boolean(et);

  return (
    <div
      className={cn(
        "flex font-mono tabular-nums leading-tight",
        align === "center" ? "items-center text-center" : "items-start",
        className,
      )}
    >
      <span className={ftClassName}>
        {finalScore}
        {wentToEt && !pens ? ` ${t("scoreEt")}` : null}
        {pens ? ` (${pens})` : null}
      </span>
    </div>
  );
}
