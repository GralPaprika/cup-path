"use client";

import type { Team } from "@/lib/types";
import { getTeamDisplayName } from "@/lib/i18n/team-display-name";
import { useTranslations } from "next-intl";
import Link from "next/link";

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
  href?: string;
}

export function TeamLabel({
  team,
  showCode = true,
  flagSize = "md",
  className = "",
  nameClassName = "",
  href,
}: TeamLabelProps) {
  const teamNames = useTranslations("teams");
  const displayName = getTeamDisplayName(teamNames, team);

  const content = (
    <>
      <TeamFlag team={team} size={flagSize} />
      {showCode && (
        <span className="shrink-0 font-mono text-xs font-semibold tracking-wide text-muted-foreground">
          {team.id}
        </span>
      )}
      <span className={`min-w-0 truncate ${nameClassName}`}>{displayName}</span>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={`inline-flex min-w-0 max-w-full items-center gap-2 transition-colors hover:opacity-90 ${className}`}
      >
        {content}
      </Link>
    );
  }

  return (
    <span className={`inline-flex min-w-0 max-w-full items-center gap-2 ${className}`}>
      {content}
    </span>
  );
}
