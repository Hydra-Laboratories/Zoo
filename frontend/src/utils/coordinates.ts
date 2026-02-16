/**
 * Machine coord -> SVG coord transform.
 *
 * Machine coordinates are negative (X: 0 to -300, Y: 0 to -200).
 * SVG maps |x| and |y| to screen coords so origin (0,0) is top-right,
 * matching the physical gantry home position.
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

  // |mx| maps 0..300 → right..left, so SVG x = right side - scaled |mx|
  const sx = SVG_PADDING + drawW - ((Math.abs(mx) - Math.abs(machineXRange[1])) / mxSpan) * drawW;
  const sy = SVG_PADDING + ((Math.abs(my) - Math.abs(machineYRange[1])) / mySpan) * drawH;

  return { sx, sy };
}
