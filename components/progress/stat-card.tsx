import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  sub: string;
  pct?: number;
  icon?: ReactNode;
}

export function StatCard({ label, value, sub, pct, icon }: StatCardProps) {
  return (
    <div
      className="p-6"
      style={{ background: "#fbf6ea", border: "1px solid #d4be96" }}
    >
      <div
        className="flex items-center justify-between"
        style={{
          fontFamily: "DM Mono, monospace",
          fontSize: 10,
          letterSpacing: "0.3em",
          color: "#7a5d3a",
          textTransform: "uppercase",
        }}
      >
        <span>{label}</span>
        {icon && <span style={{ color: "#a87132" }}>{icon}</span>}
      </div>
      <div
        style={{
          fontSize: 42,
          fontWeight: 500,
          lineHeight: 1.1,
          marginTop: 12,
          fontStyle: "italic",
          fontFamily: "Cormorant Garamond, serif",
          color: "#2c1d0f",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: "DM Mono, monospace",
          fontSize: 11,
          color: "#7a5d3a",
          marginTop: 4,
        }}
      >
        {sub}
      </div>
      {pct !== undefined && (
        <div
          style={{
            height: 2,
            background: "#ebdcb8",
            marginTop: 16,
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              width: `${Math.min(pct, 100)}%`,
              background: "#a87132",
            }}
          />
        </div>
      )}
    </div>
  );
}
