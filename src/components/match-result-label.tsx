import type { GroupMatchResult, MatchResult } from "@/lib/types";
import { cn } from "@/lib/utils";

type ResultCode = GroupMatchResult | MatchResult;

export function matchResultTextClass(result: ResultCode): string {
  if (result === "W") return "text-wc-green";
  if (result === "L") return "text-wc-red";
  return "text-muted-foreground";
}

export function matchResultBadgeClass(result: ResultCode): string {
  if (result === "W") {
    return "border-wc-green/30 bg-wc-green/20 text-wc-green";
  }
  if (result === "L") {
    return "border-wc-red/30 bg-wc-red/20 text-wc-red";
  }
  return "border-white/15 bg-white/10 text-muted-foreground";
}

export function matchResultRowClass(result: ResultCode): string {
  if (result === "W") return "bg-wc-green/8 hover:bg-wc-green/12";
  if (result === "L") return "bg-wc-red/8 hover:bg-wc-red/12";
  return "bg-white/[0.04] hover:bg-white/[0.06]";
}

interface MatchResultLabelProps {
  result: ResultCode;
  label: string;
  className?: string;
}

export function MatchResultLabel({
  result,
  label,
  className,
}: MatchResultLabelProps) {
  return (
    <span className={cn(matchResultTextClass(result), className)}>{label}</span>
  );
}
