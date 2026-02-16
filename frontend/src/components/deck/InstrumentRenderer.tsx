import type { GantryPosition, InstrumentConfig } from "../../types";
import { machineToSvg } from "../../utils/coordinates";

interface Props {
  label: string;
  instrument: InstrumentConfig;
  gantryPosition: GantryPosition | null;
  svgWidth: number;
  svgHeight: number;
  machineXRange: [number, number];
  machineYRange: [number, number];
}

const INSTRUMENT_COLORS: Record<string, string> = {
  uvvis_ccs: "#7c3aed",
  mock_uvvis_ccs: "#7c3aed",
  pipette: "#059669",
  mock_pipette: "#059669",
  filmetrics: "#d97706",
  mock_filmetrics: "#d97706",
};

export default function InstrumentRenderer({
  label,
  instrument,
  gantryPosition,
  svgWidth,
  svgHeight,
  machineXRange,
  machineYRange,
}: Props) {
  const color = INSTRUMENT_COLORS[instrument.type] ?? "#6b7280";

  // If gantry is connected, show instrument at gantry position + offset
  if (gantryPosition?.connected) {
    const instX = gantryPosition.x + (instrument.offset_x ?? 0);
    const instY = gantryPosition.y + (instrument.offset_y ?? 0);
    const { sx, sy } = machineToSvg(instX, instY, svgWidth, svgHeight, machineXRange, machineYRange);

    return (
      <g>
        <rect x={sx - 7} y={sy - 7} width={14} height={14} rx={2} fill={color} opacity={0.7}>
          <title>
            {label} ({instrument.type}) at ({instX.toFixed(1)}, {instY.toFixed(1)})
          </title>
        </rect>
        <text x={sx} y={sy - 10} fill={color} fontSize={9} textAnchor="middle" fontWeight={600}>
          {label}
        </text>
      </g>
    );
  }

  // When not connected, show instrument offset as a vector from origin (0,0)
  const originSvg = machineToSvg(0, 0, svgWidth, svgHeight, machineXRange, machineYRange);
  const offsetSvg = machineToSvg(
    instrument.offset_x ?? 0,
    instrument.offset_y ?? 0,
    svgWidth,
    svgHeight,
    machineXRange,
    machineYRange
  );

  return (
    <g>
      <line
        x1={originSvg.sx}
        y1={originSvg.sy}
        x2={offsetSvg.sx}
        y2={offsetSvg.sy}
        stroke={color}
        strokeWidth={1}
        strokeDasharray="4 2"
        opacity={0.5}
      />
      <rect x={offsetSvg.sx - 7} y={offsetSvg.sy - 7} width={14} height={14} rx={2} fill="none" stroke={color} strokeWidth={1.5} opacity={0.6}>
        <title>
          {label} ({instrument.type}) offset: ({instrument.offset_x}, {instrument.offset_y})
        </title>
      </rect>
      <text x={offsetSvg.sx} y={offsetSvg.sy - 10} fill={color} fontSize={9} textAnchor="middle" fontWeight={600} opacity={0.7}>
        {label}
      </text>
    </g>
  );
}
