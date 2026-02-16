import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import AppLayout from "./components/layout/AppLayout";
import DeckVisualization from "./components/deck/DeckVisualization";
import GantryPositionWidget from "./components/gantry/GantryPositionWidget";
import EditorTabs from "./components/editor/EditorTabs";
import DeckEditor from "./components/editor/DeckEditor";
import BoardEditor from "./components/editor/BoardEditor";
import GantryEditor from "./components/editor/GantryEditor";
import { useDeckConfigs, useDeck, useSaveDeck } from "./hooks/useDeck";
import { useBoardConfigs, useBoard, useSaveBoard } from "./hooks/useBoard";
import { useGantryPosition, useGantryConfigs, useGantry, useSaveGantry } from "./hooks/useGantryPosition";
import type { DeckResponse, WorkingVolume } from "./types";

export default function App() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState("Deck");
  const [campaignId, setCampaignId] = useState("");

  const [deckFile, setDeckFile] = useState<string | null>(null);
  const [boardFile, setBoardFile] = useState<string | null>(null);
  const [gantryFile, setGantryFile] = useState<string | null>(null);

  const deckConfigs = useDeckConfigs();
  const deckQuery = useDeck(deckFile);
  const saveDeck = useSaveDeck(deckFile ?? "");

  const boardConfigs = useBoardConfigs();
  const boardQuery = useBoard(boardFile);
  const saveBoard = useSaveBoard(boardFile ?? "");

  const gantryConfigs = useGantryConfigs();
  const gantryQuery = useGantry(gantryFile);
  const saveGantry = useSaveGantry(gantryFile ?? "");
  const gantryPosition = useGantryPosition();

  const [localDeck, setLocalDeck] = useState<DeckResponse | null>(null);
  const displayDeck = localDeck ?? deckQuery.data ?? null;

  const workingVolume: WorkingVolume | null = gantryQuery.data?.config.working_volume ?? null;
  const machineXRange: [number, number] = workingVolume
    ? [workingVolume.x_min, workingVolume.x_max]
    : [-300, 0];
  const machineYRange: [number, number] = workingVolume
    ? [workingVolume.y_min, workingVolume.y_max]
    : [-200, 0];

  const refreshAll = () => {
    qc.invalidateQueries({ queryKey: ["deck"] });
    qc.invalidateQueries({ queryKey: ["board"] });
    qc.invalidateQueries({ queryKey: ["gantry"] });
    setLocalDeck(null);
  };

  const left = (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>Zoo</h2>
        <p style={{ margin: "2px 0 0", fontSize: 12, color: "#888" }}>An online pen for managing Pandas</p>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 2, fontSize: 12 }}>
          <span style={{ color: "#666" }}>Campaign ID</span>
          <input
            type="text"
            value={campaignId}
            onChange={(e) => setCampaignId(e.target.value)}
            placeholder="e.g. mofcat_001"
            style={campaignInputStyle}
          />
        </label>
      </div>
      <EditorTabs activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === "Deck" && (
        <DeckEditor
          configs={deckConfigs.data ?? []}
          selectedFile={deckFile}
          onSelectFile={setDeckFile}
          deck={deckQuery.data ?? null}
          onSave={(body) => saveDeck.mutate(body)}
          onLocalChange={setLocalDeck}
          onRefresh={refreshAll}
        />
      )}
      {activeTab === "Board" && (
        <BoardEditor
          configs={boardConfigs.data ?? []}
          selectedFile={boardFile}
          onSelectFile={setBoardFile}
          board={boardQuery.data ?? null}
          onSave={(body) => saveBoard.mutate(body)}
          onRefresh={refreshAll}
        />
      )}
      {activeTab === "Gantry" && (
        <GantryEditor
          configs={gantryConfigs.data ?? []}
          selectedFile={gantryFile}
          onSelectFile={setGantryFile}
          gantry={gantryQuery.data ?? null}
          onSave={(body) => saveGantry.mutate(body)}
          onRefresh={refreshAll}
        />
      )}
    </div>
  );

  const topRight = (
    <div>
      <h3 style={{ margin: "0 0 8px", fontSize: 14, color: "#666" }}>Deck Visualization</h3>
      <DeckVisualization
        deck={displayDeck}
        board={boardQuery.data ?? null}
        gantryPosition={gantryPosition.data ?? null}
        machineXRange={machineXRange}
        machineYRange={machineYRange}
      />
    </div>
  );

  const bottomRight = (
    <GantryPositionWidget
      position={gantryPosition.data ?? null}
      workingVolume={workingVolume}
    />
  );

  return <AppLayout left={left} topRight={topRight} bottomRight={bottomRight} />;
}

const campaignInputStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #ccc",
  color: "#1a1a1a",
  padding: "4px 8px",
  borderRadius: 4,
  fontSize: 13,
};
