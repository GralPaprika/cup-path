/** Map SVG user-space coordinates to viewport (screen) coordinates. */
export function svgCoordsToScreen(
  svg: SVGSVGElement,
  x: number,
  y: number,
): { x: number; y: number } | null {
  const ctm = svg.getScreenCTM();
  if (!ctm) return null;

  const point = svg.createSVGPoint();
  point.x = x;
  point.y = y;
  const screen = point.matrixTransform(ctm);
  return { x: screen.x, y: screen.y };
}
