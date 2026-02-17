interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
  disabledTabs?: string[];
  disabledMessage?: string | null;
}

const TABS = ["Gantry", "Deck", "Board", "Protocol"];

export default function EditorTabs({ activeTab, onTabChange, disabledTabs = [], disabledMessage }: Props) {
  return (
    <div>
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #ddd", marginBottom: disabledMessage && activeTab === "Protocol" ? 0 : 16 }}>
        {TABS.map((tab) => {
          const disabled = disabledTabs.includes(tab);
          return (
            <button
              key={tab}
              onClick={() => {
                if (disabled && disabledMessage) {
                  onTabChange(tab);
                } else if (!disabled) {
                  onTabChange(tab);
                }
              }}
              style={{
                background: activeTab === tab ? "#f5f5f5" : "transparent",
                color: disabled ? "#ccc" : activeTab === tab ? "#1a1a1a" : "#888",
                border: "none",
                borderBottom: activeTab === tab ? "2px solid #2563eb" : "2px solid transparent",
                padding: "8px 20px",
                cursor: disabled ? "default" : "pointer",
                fontSize: 14,
                fontWeight: activeTab === tab ? 600 : 400,
              }}
            >
              {tab}
            </button>
          );
        })}
      </div>
      {disabledMessage && disabledTabs.includes(activeTab) && (
        <div style={{ padding: "12px 16px", marginBottom: 16, fontSize: 12, color: "#b45309", background: "#fffbeb", border: "1px solid #fde68a", borderTop: "none", borderRadius: "0 0 4px 4px" }}>
          {disabledMessage}
        </div>
      )}
    </div>
  );
}
