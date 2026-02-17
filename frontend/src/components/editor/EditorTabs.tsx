interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
  disabledTabs?: string[];
}

const TABS = ["Gantry", "Deck", "Board", "Protocol"];

export default function EditorTabs({ activeTab, onTabChange, disabledTabs = [] }: Props) {
  return (
    <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #ddd", marginBottom: 16 }}>
      {TABS.map((tab) => {
        const disabled = disabledTabs.includes(tab);
        return (
          <button
            key={tab}
            onClick={() => !disabled && onTabChange(tab)}
            disabled={disabled}
            style={{
              background: activeTab === tab ? "#f5f5f5" : "transparent",
              color: disabled ? "#ccc" : activeTab === tab ? "#1a1a1a" : "#888",
              border: "none",
              borderBottom: activeTab === tab ? "2px solid #2563eb" : "2px solid transparent",
              padding: "8px 20px",
              cursor: disabled ? "not-allowed" : "pointer",
              fontSize: 14,
              fontWeight: activeTab === tab ? 600 : 400,
            }}
            title={disabled ? "Load Gantry, Deck, and Board configs first" : undefined}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}
