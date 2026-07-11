import type { BracketTemplateMatch } from "@/lib/types";
import bracketTemplate from "../../../data/worldcup/2026/bracket-template.json";

interface BracketTemplateFile {
  source: string;
  matches: BracketTemplateMatch[];
}

const template = bracketTemplate as BracketTemplateFile;

export function getBracketTemplateMatches(): BracketTemplateMatch[] {
  return template.matches;
}

export function getKnockoutTemplateMatchNums(): number[] {
  return template.matches.map((match) => match.num);
}
