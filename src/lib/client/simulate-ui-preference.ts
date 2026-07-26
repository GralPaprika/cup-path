export const SIMULATE_COLLAPSE_IMPACT_KEY =
  "cuppath:simulate:collapse:impact";
export const SIMULATE_COLLAPSE_GROUPS_KEY =
  "cuppath:simulate:collapse:groups";
export const SIMULATE_COLLAPSE_BRACKET_KEY =
  "cuppath:simulate:collapse:bracket";
export const SIMULATE_VISIBLE_GROUPS_KEY =
  "cuppath:simulate:visible-groups";

export const SIMULATE_SECTION_IDS = {
  impact: "simulate-impact",
  groups: "simulate-groups",
  bracket: "simulate-bracket",
} as const;

export function parseVisibleGroupLetters(
  value: unknown,
  allLetters: string[],
  focusLetter: string | null,
): string[] {
  const allowed = new Set(allLetters);
  const focus = focusLetter && allowed.has(focusLetter) ? focusLetter : null;

  if (!Array.isArray(value)) {
    return focus
      ? [focus, ...allLetters.filter((letter) => letter !== focus)]
      : [...allLetters];
  }

  const unique = [
    ...new Set(
      value.filter(
        (letter): letter is string =>
          typeof letter === "string" && allowed.has(letter),
      ),
    ),
  ];

  if (unique.length === 0) {
    return focus
      ? [focus, ...allLetters.filter((letter) => letter !== focus)]
      : [...allLetters];
  }

  if (focus) {
    return [focus, ...unique.filter((letter) => letter !== focus)];
  }

  return unique;
}

/**
 * Non-focus groups in alphabetical order, rotated so the sequence starts
 * just after the focus letter (wrapping A–L). Used for the 3 sliding carousel slots.
 */
export function orderRotatingGroupLetters(
  letters: string[],
  focusLetter: string | null,
): string[] {
  const others = [...new Set(letters)]
    .filter((letter) => letter !== focusLetter)
    .sort((a, b) => a.localeCompare(b));

  if (!focusLetter) return others;

  const after = others.filter((letter) => letter.localeCompare(focusLetter) > 0);
  const before = others.filter((letter) => letter.localeCompare(focusLetter) < 0);
  return [...after, ...before];
}

/** Normalizes any integer index into `0..length-1`, including negatives. */
export function wrapCarouselIndex(index: number, length: number): number {
  if (length <= 0) return 0;
  return ((index % length) + length) % length;
}

/**
 * Sliding window of `slots` letters starting at `windowIndex`, wrapping past the end.
 * Caps at `rotatingLetters.length` so a short list never repeats a letter.
 */
export function getCarouselWindowLetters(
  rotatingLetters: string[],
  windowIndex: number,
  slots: number,
): string[] {
  const length = rotatingLetters.length;
  if (length === 0 || slots <= 0) return [];

  const count = Math.min(slots, length);
  const start = wrapCarouselIndex(windowIndex, length);
  const result: string[] = [];
  for (let offset = 0; offset < count; offset += 1) {
    result.push(rotatingLetters[(start + offset) % length]!);
  }
  return result;
}

export const GROUPS_CAROUSEL_SLIDING_SLOTS = 3;
export const GROUPS_CAROUSEL_TOTAL_SLOTS = 4;

/** Accumulated wheel delta needed to advance one carousel step. */
export const CAROUSEL_WHEEL_STEP_THRESHOLD = 80;
/** Idle gap (ms) after which a new wheel gesture resets the accumulator. */
export const CAROUSEL_WHEEL_IDLE_MS = 250;

/**
 * Picks the dominant wheel axis and scales by `deltaMode`
 * (0 = pixels, 1 = lines ×16, 2 = pages ×100).
 * Negative = previous (up/left), positive = next (down/right).
 */
export function normalizeWheelDelta(
  deltaX: number,
  deltaY: number,
  deltaMode: number,
): number {
  const raw = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
  if (raw === 0) return 0;
  if (deltaMode === 1) return raw * 16;
  if (deltaMode === 2) return raw * 100;
  return raw;
}

/**
 * Converts accumulated wheel delta into discrete carousel steps,
 * returning the unused remainder for the next event.
 */
export function takeCarouselWheelSteps(
  accumulated: number,
  threshold: number,
): { steps: number; remainder: number } {
  if (threshold <= 0 || accumulated === 0) {
    return { steps: 0, remainder: accumulated };
  }
  const steps = Math.trunc(accumulated / threshold);
  return { steps, remainder: accumulated - steps * threshold };
}
