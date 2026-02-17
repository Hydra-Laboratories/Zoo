import { useState } from "react";
import { gantryApi } from "../../api/client";
import type { GantryPosition, WorkingVolume } from "../../types";

interface Props {
  position: GantryPosition | null;
  workingVolume: WorkingVolume | null;
}

export default function GantryPositionWidget({ position, workingVolume }: Props) {
  const [loading, setLoading] = useState(false);
  const [jogBusy, setJogBusy] = useState(false);
  const [stepXY, setStepXY] = useState("0.5");
  const [stepZ, setStepZ] = useState("0.5");

  const connected = position?.connected ?? false;

  const handleConnect = async () => {
    setLoading(true);
    try {
      await gantryApi.connect();
    } catch (e) {
      alert(`Connection failed: ${e}`);
    }
    setLoading(false);
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      await gantryApi.disconnect();
    } catch (e) {
      alert(`Disconnect failed: ${e}`);
    }
    setLoading(false);
  };

  const jog = async (x: number, y: number, z: number) => {
    if (jogBusy || !connected) return;
    setJogBusy(true);
    try {
      await gantryApi.jog(x, y, z);
    } catch (e) {
      console.error("Jog failed:", e);
    }
    setJogBusy(false);
  };

  const handleHome = async () => {
    if (!connected) return;
    if (!window.confirm("Confirm you want to go to home?")) return;
    setJogBusy(true);
    try {
      await gantryApi.home();
    } catch (e) {
      console.error("Homing failed:", e);
    }
    setJogBusy(false);
  };

  // 800 steps/mm → min 0.00125mm; clamp to 0.001mm floor
  const MIN_STEP = 0.001;
  const xyStep = Math.max(MIN_STEP, parseFloat(stepXY) || 0.5);
  const zStep = Math.max(MIN_STEP, parseFloat(stepZ) || 0.5);
  const xyBelowMin = (parseFloat(stepXY) || 0) > 0 && (parseFloat(stepXY) || 0) < MIN_STEP;
  const zBelowMin = (parseFloat(stepZ) || 0) > 0 && (parseFloat(stepZ) || 0) < MIN_STEP;
  const jogDisabled = !connected || jogBusy;

  return (
    <div>
      <h3 style={{ margin: "0 0 12px", fontSize: 14 }}>Gantry Control</h3>

      {/* Top row: D-pad + Z on left, XYZ readout on right */}
      <div style={{ display: "flex", gap: 24, marginBottom: 12 }}>
        {/* Jog controls */}
        <div>
          <div style={{ display: "flex", gap: 24, alignItems: "center", marginBottom: 8 }}>
            {/* XY D-pad */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 40px)", gridTemplateRows: "repeat(3, 40px)", gap: 2 }}>
              <div />
              <button style={jogBtnStyle} disabled={jogDisabled} onClick={() => jog(0, -xyStep, 0)} title="Y-">
                ↑
              </button>
              <div />
              <button style={jogBtnStyle} disabled={jogDisabled} onClick={() => jog(-xyStep, 0, 0)} title="X-">
                ←
              </button>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#bbb" }}>
                XY
              </div>
              <button style={jogBtnStyle} disabled={jogDisabled} onClick={() => jog(xyStep, 0, 0)} title="X+">
                →
              </button>
              <div />
              <button style={jogBtnStyle} disabled={jogDisabled} onClick={() => jog(0, xyStep, 0)} title="Y+">
                ↓
              </button>
              <div />
            </div>

            {/* Z controls */}
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <button style={jogBtnStyle} disabled={jogDisabled} onClick={() => jog(0, 0, zStep)} title="Z+">
                Z+
              </button>
              <div style={{ fontSize: 10, color: "#bbb", textAlign: "center" }}>Z</div>
              <button style={jogBtnStyle} disabled={jogDisabled} onClick={() => jog(0, 0, -zStep)} title="Z-">
                Z−
              </button>
            </div>
          </div>

          {/* Step size inputs */}
          <div style={{ display: "flex", gap: 12, fontSize: 11 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ color: "#888" }}>XY mm</span>
              <input
                type="text"
                inputMode="decimal"
                value={stepXY}
                onChange={(e) => setStepXY(e.target.value)}
                style={{ ...inputStyle, width: 48, fontSize: 11, padding: "2px 4px", borderColor: xyBelowMin ? "#dc2626" : "#ccc" }}
              />
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ color: "#888" }}>Z mm</span>
              <input
                type="text"
                inputMode="decimal"
                value={stepZ}
                onChange={(e) => setStepZ(e.target.value)}
                style={{ ...inputStyle, width: 48, fontSize: 11, padding: "2px 4px", borderColor: zBelowMin ? "#dc2626" : "#ccc" }}
              />
            </label>
            {(xyBelowMin || zBelowMin) && (
              <span style={{ color: "#dc2626", fontSize: 10, alignSelf: "center" }}>min {MIN_STEP}mm</span>
            )}
          </div>
        </div>

        {/* XYZ Readout */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 6 }}>
          {(["X", "Y", "Z"] as const).map((axis) => (
            <div key={axis} style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ color: "#888", fontSize: 13, fontWeight: 600, width: 14 }}>{axis}</span>
              <span style={coordStyle}>
                {connected ? position![axis.toLowerCase() as "x" | "y" | "z"].toFixed(3) : "\u2014"}
              </span>
            </div>
          ))}
          <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>
            {position?.status ?? "Not connected"}
          </div>
        </div>
      </div>

      {/* Home button */}
      <div style={{ marginBottom: 10 }}>
        <button onClick={handleHome} disabled={jogDisabled} style={homeBtnStyle}>
          Home
        </button>
      </div>

      {workingVolume && (
        <div style={{ fontSize: 10, color: "#bbb", marginBottom: 8 }}>
          Vol: X[{workingVolume.x_min}, {workingVolume.x_max}] Y[{workingVolume.y_min},{" "}
          {workingVolume.y_max}] Z[{workingVolume.z_min}, {workingVolume.z_max}]
        </div>
      )}

      {/* Connection controls — bottom */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", borderTop: "1px solid #eee", paddingTop: 10 }}>
        {!connected ? (
          <button onClick={handleConnect} disabled={loading} style={btnStyle}>
            {loading ? "Scanning..." : "Connect"}
          </button>
        ) : (
          <button onClick={handleDisconnect} disabled={loading} style={btnStyle}>
            {loading ? "..." : "Disconnect"}
          </button>
        )}
      </div>
    </div>
  );
}

const coordStyle: React.CSSProperties = {
  fontFamily: "monospace",
  fontSize: 26,
  fontWeight: 700,
  minWidth: 100,
  textAlign: "right",
  display: "inline-block",
  color: "#1a1a1a",
};

const btnStyle: React.CSSProperties = {
  background: "#f5f5f5",
  color: "#1a1a1a",
  border: "1px solid #ccc",
  padding: "4px 12px",
  borderRadius: 4,
  cursor: "pointer",
  fontSize: 12,
};

const inputStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #ccc",
  color: "#1a1a1a",
  padding: "4px 8px",
  borderRadius: 4,
  fontSize: 12,
};

const homeBtnStyle: React.CSSProperties = {
  background: "#fff",
  color: "#d97706",
  border: "1px solid #d97706",
  padding: "5px 16px",
  borderRadius: 4,
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 600,
};

const jogBtnStyle: React.CSSProperties = {
  width: 40,
  height: 40,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#f5f5f5",
  border: "1px solid #ccc",
  borderRadius: 4,
  cursor: "pointer",
  fontSize: 16,
  fontWeight: 600,
  color: "#1a1a1a",
};
