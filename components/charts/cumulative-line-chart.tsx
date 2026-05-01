"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const PALETTE = ["#2c1d0f", "#a87132", "#5d7a3a", "#7a4a3a", "#3a5a7a"];

const tooltipStyle = {
  background: "#2c1d0f",
  border: "none",
  borderRadius: 0,
  color: "#f4ede0",
  fontFamily: "DM Mono, monospace",
  fontSize: 11,
};

interface SeriesConfig {
  key: string;
  label: string;
  isMe: boolean;
}

interface CumulativeLineChartProps {
  data: Record<string, string | number>[];
  series: SeriesConfig[];
}

export function CumulativeLineChart({ data, series }: CumulativeLineChartProps) {
  return (
    <div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fontFamily: "DM Mono, monospace", fill: "#7a5d3a" }}
            interval={5}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fontFamily: "DM Mono, monospace", fill: "#7a5d3a" }}
            axisLine={false}
            tickLine={false}
            width={32}
            allowDecimals={false}
          />
          <Tooltip contentStyle={tooltipStyle} />
          {series.map((s, i) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={PALETTE[i % PALETTE.length]}
              strokeWidth={s.isMe ? 2.5 : 1.5}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      <div
        className="flex gap-6 mt-4 flex-wrap"
        style={{
          fontFamily: "DM Mono, monospace",
          fontSize: 10,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "#7a5d3a",
        }}
      >
        {series.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            <span
              style={{
                width: 18,
                height: 2,
                background: PALETTE[i % PALETTE.length],
                display: "inline-block",
              }}
            />
            {s.label}
          </div>
        ))}
      </div>
    </div>
  );
}
