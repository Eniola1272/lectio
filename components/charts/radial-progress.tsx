"use client";

import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import { TOTAL_CH } from "@/lib/bible";

interface RadialProgressProps {
  pct: number;
  total: number;
}

export function RadialProgress({ pct, total }: RadialProgressProps) {
  const data = [{ name: "Total", value: pct }];

  return (
    <div style={{ position: "relative", width: "100%", height: 240 }}>
      <ResponsiveContainer>
        <RadialBarChart
          innerRadius="75%"
          outerRadius="100%"
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar
            background={{ fill: "#ebdcb8" }}
            dataKey="value"
            cornerRadius={0}
            fill="#a87132"
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontSize: 56,
            fontWeight: 500,
            lineHeight: 1,
            fontStyle: "italic",
            fontFamily: "Cormorant Garamond, serif",
            color: "#2c1d0f",
          }}
        >
          {pct.toFixed(1)}
          <span style={{ fontSize: 24, color: "#a87132" }}>%</span>
        </div>
        <div
          style={{
            fontFamily: "DM Mono, monospace",
            fontSize: 10,
            letterSpacing: "0.25em",
            color: "#7a5d3a",
            marginTop: 4,
          }}
        >
          {total} / {TOTAL_CH} chapters
        </div>
      </div>
    </div>
  );
}
