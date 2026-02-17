/**
 * Machine coord -> SVG coord transform.
 *
 * Machine coordinates are typically negative (X: -300 to 0, Y: -200 to 0).
 * SVG origin (0,0) is top-left; machine home (0,0) maps to top-right.
 * Uses a proper linear mapping so coordinates beyond the machine range
 * (e.g. well plates that extend past 0) render correctly instead of
 * folding back.
 */

export const SVG_PADDING = 20;

export function machineToSvg(
  mx: number,
  my: number,
  svgWidth: number,
  svgHeight: number,
  machineXRange: [number, number],
  machineYRange: [number, number]
): { sx: number; sy: number } {
  const mxSpan = machineXRange[1] - machineXRange[0]; // e.g. 300
  const mySpan = machineYRange[1] - machineYRange[0]; // e.g. 200
  const drawW = svgWidth - 2 * SVG_PADDING;
  const drawH = svgHeight - 2 * SVG_PADDING;

  // Linear map: machineXRange[0] → left edge, machineXRange[1] → right edge
  const sx = SVG_PADDING + ((mx - machineXRange[0]) / mxSpan) * drawW;
  // Linear map: machineYRange[1] (0) → top edge, machineYRange[0] (-200) → bottom edge
  const sy = SVG_PADDING + ((machineYRange[1] - my) / mySpan) * drawH;

  return { sx, sy };
}
