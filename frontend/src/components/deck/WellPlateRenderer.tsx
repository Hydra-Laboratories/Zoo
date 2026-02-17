import type { WellPlateConfig, WellPosition } from "../../types";
import { machineToSvg } from "../../utils/coordinates";

interface Props {
  config: WellPlateConfig;
  wells: Record<string, WellPosition>;
  svgWidth: number;
  svgHeight: number;
  machineXRange: [number, number];
  machineYRange: [number, number];
}

export default function WellPlateRenderer({
  config,
  wells,
  svgWidth,
  svgHeight,
  machineXRange,
  machineYRange,
}: Props) {
  const wellRadius = 3;
  const a1 = config.calibration.a1 ?? config.a1;
  if (!a1) return null;

  // Derive plate outline from A1 + pitch + grid size
  const topLeft = machineToSvg(
    a1.x + config.x_offset_mm * -0.5,
    a1.y - config.y_offset_mm * 0.5,
    svgWidth,
    svgHeight,
    machineXRange,
    machineYRange
  );
  const bottomRight = machineToSvg(
    a1.x + config.x_offset_mm * (config.columns - 0.5),
    a1.y + config.y_offset_mm * (config.rows - 0.5),
    svgWidth,
    svgHeight,
    machineXRange,
    machineYRange
  );

  const rectX = Math.min(topLeft.sx, bottomRight.sx);
  const rectY = Math.min(topLeft.sy, bottomRight.sy);
  const rectW = Math.abs(bottomRight.sx - topLeft.sx);
  const rectH = Math.abs(bottomRight.sy - topLeft.sy);

  return (
    <g>
      <rect
        x={rectX}
        y={rectY}
        width={rectW}
        height={rectH}
        fill="#dbeafe"
        fillOpacity={0.3}
        stroke="#2563eb"
        strokeWidth={1.5}
        rx={3}
      />
      <text x={rectX + 4} y={rectY - 4} fill="#2563eb" fontSize={10} fontWeight={500}>
        {config.name || "Well Plate"}
      </text>
      {Object.entries(wells).map(([id, pos]) => {
        const { sx, sy } = machineToSvg(
          pos.x,
          pos.y,
          svgWidth,
          svgHeight,
          machineXRange,
          machineYRange
        );
        return (
          <circle key={id} cx={sx} cy={sy} r={wellRadius} fill="#2563eb" opacity={0.5}>
            <title>
              {id}: ({pos.x}, {pos.y}, {pos.z})
            </title>
          </circle>
        );
      })}
    </g>
  );
}
