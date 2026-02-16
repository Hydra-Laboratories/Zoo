import { useEffect, useState } from "react";
import type { BoardResponse, InstrumentConfig, BoardConfig } from "../../types";
import { NumberField, SaveButton, TextField } from "./fields";
import ImportFromFile from "./ImportFromFile";

interface Props {
  configs: string[];
  selectedFile: string | null;
  onSelectFile: (f: string) => void;
  board: BoardResponse | null;
  onSave: (body: BoardConfig) => void;
  onRefresh: () => void;
}

const INSTRUMENT_TEMPLATES: Record<string, InstrumentConfig> = {
  uvvis_ccs: {
    type: "uvvis_ccs",
    serial_number: "",
    dll_path: "TLCCS_64.dll",
    default_integration_time_s: 0.24,
    offset_x: 0.0,
    offset_y: 0.0,
    depth: 0.0,
    measurement_height: 0.0,
  },
  pipette: {
    type: "pipette",
    pipette_model: "p300_single_gen2",
    port: "",
    baud_rate: 115200,
    command_timeout: 30.0,
    offset_x: 0.0,
    offset_y: 0.0,
    depth: 0.0,
    measurement_height: 0.0,
  },
  filmetrics: {
    type: "filmetrics",
    exe_path: "",
    recipe_name: "",
    command_timeout: 30.0,
    offset_x: 0.0,
    offset_y: 0.0,
    depth: 0.0,
    measurement_height: 0.0,
  },
};

const PIPETTE_MODELS = [
  "p20_single_gen2",
  "p300_single_gen2",
  "p1000_single_gen2",
  "p20_multi_gen2",
  "p300_multi_gen2",
  "flex_1channel_50",
  "flex_1channel_1000",
  "flex_8channel_50",
  "flex_8channel_1000",
  "flex_96channel_1000",
];

const INSTRUMENT_LABELS: Record<string, string> = {
  uvvis_ccs: "UV-Vis CCS (Thorlabs)",
  pipette: "Pipette (Opentrons)",
  filmetrics: "Filmetrics",
};

const INSTRUMENT_COLORS: Record<string, string> = {
  uvvis_ccs: "#7c3aed",
  pipette: "#059669",
  filmetrics: "#d97706",
};

export default function BoardEditor({ configs, selectedFile, onSelectFile, board, onSave }: Props) {
  const [instruments, setInstruments] = useState<Record<string, InstrumentConfig>>({});
  const [addType, setAddType] = useState<string>("uvvis_ccs");
  const [saveAs, setSaveAs] = useState("");

  useEffect(() => {
    if (board) {
      setInstruments(structuredClone(board.instruments));
    }
  }, [board]);

  const update = (key: string, inst: InstrumentConfig) => {
    setInstruments({ ...instruments, [key]: inst });
  };

  const remove = (key: string) => {
    const next = { ...instruments };
    delete next[key];
    setInstruments(next);
  };

  const addInstrument = () => {
    const idx = Object.keys(instruments).length + 1;
    const key = `${addType}_${idx}`;
    const template = structuredClone(INSTRUMENT_TEMPLATES[addType]);
    setInstruments({ ...instruments, [key]: template });
  };

  const hasItems = Object.keys(instruments).length > 0;

  return (
    <div>
      <ImportFromFile configs={configs} onSelectFile={onSelectFile} label="Import board config" />

      <div style={{ display: "flex", gap: 8, margin: "12px 0", alignItems: "center" }}>
        <select value={addType} onChange={(e) => setAddType(e.target.value)} style={selectStyle}>
          {Object.entries(INSTRUMENT_LABELS).map(([k, label]) => (
            <option key={k} value={k}>{label}</option>
          ))}
        </select>
        <button onClick={addInstrument} style={addBtnStyle}>+ Add</button>
      </div>

      {Object.entries(instruments).map(([key, inst]) => {
        const color = INSTRUMENT_COLORS[inst.type] ?? "#666";
        return (
          <div key={key} style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <h4 style={{ margin: 0, color, fontSize: 13 }}>
                {key} <span style={{ fontWeight: 400, color: "#888", fontSize: 11 }}>({INSTRUMENT_LABELS[inst.type] ?? inst.type})</span>
              </h4>
              <button onClick={() => remove(key)} style={removeBtnStyle}>Remove</button>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <NumberField label="Offset X" value={inst.offset_x} onChange={(v) => update(key, { ...inst, offset_x: v })} />
              <NumberField label="Offset Y" value={inst.offset_y} onChange={(v) => update(key, { ...inst, offset_y: v })} />
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <NumberField label="Depth" value={Number(inst.depth ?? 0)} onChange={(v) => update(key, { ...inst, depth: v })} />
              <NumberField label="Meas. height" value={Number(inst.measurement_height ?? 0)} onChange={(v) => update(key, { ...inst, measurement_height: v })} />
            </div>

            {inst.type === "uvvis_ccs" && (
              <div style={{ marginTop: 8 }}>
                <TextField label="Serial number" value={String(inst.serial_number ?? "")} onChange={(v) => update(key, { ...inst, serial_number: v })} />
                <TextField label="DLL path" value={String(inst.dll_path ?? "")} onChange={(v) => update(key, { ...inst, dll_path: v })} />
                <NumberField label="Integration time (s)" value={Number(inst.default_integration_time_s ?? 0.24)} onChange={(v) => update(key, { ...inst, default_integration_time_s: v })} />
              </div>
            )}

            {inst.type === "pipette" && (
              <div style={{ marginTop: 8 }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 2, fontSize: 12 }}>
                  <span style={{ color: "#666" }}>Pipette model</span>
                  <select
                    value={String(inst.pipette_model ?? "p300_single_gen2")}
                    onChange={(e) => update(key, { ...inst, pipette_model: e.target.value })}
                    style={selectStyle}
                  >
                    {PIPETTE_MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </label>
                <TextField label="Port" value={String(inst.port ?? "")} onChange={(v) => update(key, { ...inst, port: v })} />
                <NumberField label="Baud rate" value={Number(inst.baud_rate ?? 115200)} step={1} onChange={(v) => update(key, { ...inst, baud_rate: v })} />
                <NumberField label="Command timeout (s)" value={Number(inst.command_timeout ?? 30)} onChange={(v) => update(key, { ...inst, command_timeout: v })} />
              </div>
            )}

            {inst.type === "filmetrics" && (
              <div style={{ marginTop: 8 }}>
                <TextField label="Exe path" value={String(inst.exe_path ?? "")} onChange={(v) => update(key, { ...inst, exe_path: v })} />
                <TextField label="Recipe name" value={String(inst.recipe_name ?? "")} onChange={(v) => update(key, { ...inst, recipe_name: v })} />
                <NumberField label="Command timeout (s)" value={Number(inst.command_timeout ?? 30)} onChange={(v) => update(key, { ...inst, command_timeout: v })} />
              </div>
            )}
          </div>
        );
      })}

      {hasItems && (
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12 }}>
          <input
            value={saveAs}
            onChange={(e) => setSaveAs(e.target.value)}
            placeholder={selectedFile ?? "my_board.yaml"}
            style={filenameInputStyle}
          />
          <SaveButton onClick={() => {
            if (saveAs.trim()) onSelectFile(saveAs.trim().endsWith(".yaml") ? saveAs.trim() : saveAs.trim() + ".yaml");
            onSave({ instruments });
          }} />
        </div>
      )}
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: "#fafafa",
  border: "1px solid #e0e0e0",
  borderRadius: 6,
  padding: 12,
  marginTop: 8,
};

const selectStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #ccc",
  color: "#1a1a1a",
  padding: "4px 6px",
  borderRadius: 4,
  fontSize: 13,
};

const addBtnStyle: React.CSSProperties = {
  background: "#fff",
  color: "#7c3aed",
  border: "1px solid #7c3aed",
  padding: "5px 14px",
  borderRadius: 4,
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 600,
  whiteSpace: "nowrap",
};

const removeBtnStyle: React.CSSProperties = {
  background: "transparent",
  color: "#999",
  border: "1px solid #ddd",
  padding: "2px 10px",
  borderRadius: 4,
  cursor: "pointer",
  fontSize: 11,
};

const filenameInputStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #ccc",
  color: "#1a1a1a",
  padding: "4px 8px",
  borderRadius: 4,
  fontSize: 13,
  flex: 1,
};
