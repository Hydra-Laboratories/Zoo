import { useState } from "react";
import { gantryApi } from "../../api/client";
import type { GantryPosition, WorkingVolume } from "../../types";

interface Props {
  position: GantryPosition | null;
  workingVolume: WorkingVolume | null;
}

export default function GantryPositionWidget({ position, workingVolume }: Props) {
  const [port, setPort] = useState("/dev/cu.usbserial-2130");
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    try {
      await gantryApi.connect(port);
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

  const connected = position?.connected ?? false;

  const coordStyle: React.CSSProperties = {
    fontFamily: "monospace",
    fontSize: 20,
    fontWeight: 600,
    minWidth: 80,
    textAlign: "right",
    display: "inline-block",
    color: "#1a1a1a",
  };

  return (
    <div>
      <h3 style={{ margin: "0 0 8px", fontSize: 14 }}>Gantry Position</h3>

      <div style={{ display: "flex", gap: 24, marginBottom: 8 }}>
        <div>
          <span style={{ color: "#888", fontSize: 11 }}>X</span>
          <span style={coordStyle}>{connected ? position!.x.toFixed(3) : "\u2014"}</span>
        </div>
        <div>
          <span style={{ color: "#888", fontSize: 11 }}>Y</span>
          <span style={coordStyle}>{connected ? position!.y.toFixed(3) : "\u2014"}</span>
        </div>
        <div>
          <span style={{ color: "#888", fontSize: 11 }}>Z</span>
          <span style={coordStyle}>{connected ? position!.z.toFixed(3) : "\u2014"}</span>
        </div>
      </div>

      <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>
        Status:{" "}
        <strong style={{ color: connected ? "#16a34a" : "#888" }}>
          {position?.status ?? "Not connected"}
        </strong>
      </div>

      {workingVolume && (
        <div style={{ fontSize: 11, color: "#999", marginBottom: 8 }}>
          Volume: X[{workingVolume.x_min}, {workingVolume.x_max}] Y[{workingVolume.y_min},{" "}
          {workingVolume.y_max}] Z[{workingVolume.z_min}, {workingVolume.z_max}]
        </div>
      )}

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {!connected ? (
          <>
            <input
              value={port}
              onChange={(e) => setPort(e.target.value)}
              placeholder="Serial port"
              style={{
                background: "#fff",
                border: "1px solid #ccc",
                color: "#1a1a1a",
                padding: "4px 8px",
                borderRadius: 4,
                fontSize: 12,
              }}
            />
            <button onClick={handleConnect} disabled={loading} style={btnStyle}>
              {loading ? "Connecting..." : "Connect"}
            </button>
          </>
        ) : (
          <button onClick={handleDisconnect} disabled={loading} style={btnStyle}>
            {loading ? "Disconnecting..." : "Disconnect"}
          </button>
        )}
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  background: "#f5f5f5",
  color: "#1a1a1a",
  border: "1px solid #ccc",
  padding: "4px 12px",
  borderRadius: 4,
  cursor: "pointer",
  fontSize: 12,
};
