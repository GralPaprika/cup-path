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

export function MatchScoreBreakdown({
  ft,
  et,
  pens,
  className,
  align = "center",
  ftClassName = "text-muted-foreground",
}: MatchScoreBreakdownProps) {
  const t = useTranslations("common");

  return (
    <div
      className={cn(
        "flex flex-col gap-0.5 font-mono tabular-nums leading-tight",
        align === "center" ? "items-center text-center" : "items-start",
        className,
      )}
    >
      <span className={ftClassName}>{ft}</span>
      {et ? (
        <span className="text-[10px] text-muted-foreground/85">
          {t("scoreEt")} {et}
        </span>
      ) : null}
      {pens ? (
        <span className="text-[10px] text-muted-foreground/85">
          {t("scorePens")} {pens}
        </span>
      ) : null}
    </div>
  );
}
