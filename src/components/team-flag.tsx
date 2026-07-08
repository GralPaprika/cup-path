import type { Team } from "@/lib/types";

interface TeamFlagProps {
  team: Pick<Team, "id" | "flagUrl" | "displayName">;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-6",
  md: "h-5 w-7",
  lg: "h-8 w-11",
};

export function TeamFlag({ team, size = "md", className = "" }: TeamFlagProps) {
  return (
    <img
      src={team.flagUrl}
      alt={`${team.displayName} flag`}
      className={`${sizeClasses[size]} shrink-0 rounded-sm object-cover shadow-sm ${className}`}
      loading="lazy"
    />
  );
}

interface TeamLabelProps {
  team: Pick<Team, "id" | "flagUrl" | "displayName">;
  showCode?: boolean;
  flagSize?: "sm" | "md" | "lg";
  className?: string;
  nameClassName?: string;
}

export function TeamLabel({
  team,
  showCode = true,
  flagSize = "md",
  className = "",
  nameClassName = "",
}: TeamLabelProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <TeamFlag team={team} size={flagSize} />
      {showCode && (
        <span className="font-mono text-xs font-semibold tracking-wide text-muted-foreground">
          {team.id}
        </span>
      )}
      <span className={nameClassName}>{team.displayName}</span>
    </span>
  );
}
