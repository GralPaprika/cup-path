export function scrollIntoViewRespectingMotion(
  element: HTMLElement | null | undefined,
  options: ScrollIntoViewOptions = {},
) {
  if (!element) return;

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  element.scrollIntoView({
    block: "start",
    behavior: reduceMotion ? "auto" : "smooth",
    ...options,
  });
}
