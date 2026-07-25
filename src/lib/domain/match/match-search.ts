import { normalizeTeamSearch } from "@/lib/i18n/team-display-name";

export interface MatchSearchTarget {
  teamIds: [string, string];
  teamNames: [string, string];
  scoreFt: string | null;
  scoreEt: string | null;
  decidedOnPenalties: boolean;
}

const SCORE_QUERY_RE = /^(\d{1,2})\s*[-–:x\s]\s*(\d{1,2})$/;

const EXTRA_TIME_KEYWORDS = [
  "et",
  "aet",
  "extra",
  "extra time",
  "ot",
  "overtime",
  "prorroga",
  "tiempo extra",
] as const;

const PENALTY_KEYWORDS = [
  "pen",
  "pens",
  "penalties",
  "penales",
  "shootout",
  "tanda",
] as const;

function parseScoreQuery(query: string): [number, number] | null {
  const match = SCORE_QUERY_RE.exec(query.trim());
  if (!match) return null;
  return [Number(match[1]), Number(match[2])];
}

function scoreEqualsEitherWay(
  score: string | null,
  a: number,
  b: number,
): boolean {
  if (!score) return false;
  const pair = SCORE_QUERY_RE.exec(score.trim());
  if (!pair) return false;
  const left = Number(pair[1]);
  const right = Number(pair[2]);
  return (left === a && right === b) || (left === b && right === a);
}

function keywordMatches(
  normalizedQuery: string,
  keywords: readonly string[],
): boolean {
  return keywords.some((keyword) => {
    const normalizedKeyword = normalizeTeamSearch(keyword);
    return (
      normalizedKeyword.startsWith(normalizedQuery) ||
      normalizedQuery.startsWith(normalizedKeyword)
    );
  });
}

function teamMatches(
  teamId: string,
  teamName: string,
  normalizedQuery: string,
): boolean {
  return (
    normalizeTeamSearch(teamName).includes(normalizedQuery) ||
    teamId.toLowerCase().includes(normalizedQuery)
  );
}

export function matchTargetMatchesQuery(
  target: MatchSearchTarget,
  query: string,
): boolean {
  const normalized = normalizeTeamSearch(query);
  if (!normalized) return true;

  const scorePair = parseScoreQuery(query);
  if (scorePair) {
    const [a, b] = scorePair;
    return (
      scoreEqualsEitherWay(target.scoreFt, a, b) ||
      scoreEqualsEitherWay(target.scoreEt, a, b)
    );
  }

  const matchesExtraTime =
    target.scoreEt !== null &&
    keywordMatches(normalized, EXTRA_TIME_KEYWORDS);
  const matchesPenalties =
    target.decidedOnPenalties &&
    keywordMatches(normalized, PENALTY_KEYWORDS);
  const matchesTeam =
    teamMatches(target.teamIds[0], target.teamNames[0], normalized) ||
    teamMatches(target.teamIds[1], target.teamNames[1], normalized);

  return matchesExtraTime || matchesPenalties || matchesTeam;
}
