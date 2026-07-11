export const ROUND_DISPLAY_KEYS = {
  "Round of 32": "round32",
  "Round of 16": "round16",
  "Quarter-final": "quarterFinal",
  "Semi-final": "semiFinal",
  Final: "final",
  "Match for third place": "thirdPlace",
} as const;

export type RoundDisplayKey =
  (typeof ROUND_DISPLAY_KEYS)[keyof typeof ROUND_DISPLAY_KEYS];

type RoundTranslator = (key: RoundDisplayKey) => string;

export function getRoundDisplayName(
  t: RoundTranslator,
  round: string,
): string {
  const key = ROUND_DISPLAY_KEYS[round as keyof typeof ROUND_DISPLAY_KEYS];
  return key ? t(key) : round;
}
