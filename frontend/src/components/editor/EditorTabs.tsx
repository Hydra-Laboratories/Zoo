interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TABS = ["Deck", "Board", "Gantry"];

export default function EditorTabs({ activeTab, onTabChange }: Props) {
  return (
    <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #ddd", marginBottom: 16 }}>
      {TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          style={{
            background: activeTab === tab ? "#f5f5f5" : "transparent",
            color: activeTab === tab ? "#1a1a1a" : "#888",
            border: "none",
            borderBottom: activeTab === tab ? "2px solid #2563eb" : "2px solid transparent",
            padding: "8px 20px",
            cursor: "pointer",
            fontSize: 14,
            fontWeight: activeTab === tab ? 600 : 400,
          }}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
