import type { ReactNode } from "react";

interface Props {
  left: ReactNode;
  topRight: ReactNode;
  bottomRight: ReactNode;
}

export default function AppLayout({ left, topRight, bottomRight }: Props) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "3fr 2fr",
        gridTemplateRows: "1fr auto",
        height: "100vh",
        gap: 0,
      }}
    >
      <div
        style={{
          gridRow: "1 / 3",
          gridColumn: "1",
          overflow: "auto",
          borderRight: "1px solid #ddd",
          padding: 16,
          background: "#fff",
        }}
      >
        {left}
      </div>
      <div
        style={{
          gridRow: "1",
          gridColumn: "2",
          overflow: "auto",
          padding: 16,
          background: "#fafafa",
        }}
      >
        {topRight}
      </div>
      <div
        style={{
          gridRow: "2",
          gridColumn: "2",
          borderTop: "1px solid #ddd",
          padding: 16,
          background: "#fff",
        }}
      >
        {bottomRight}
      </div>
    </div>
  );
}
