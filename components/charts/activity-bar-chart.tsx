"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { DayCount } from "@/lib/stats";

const tooltipStyle = {
  background: "#2c1d0f",
  border: "none",
  borderRadius: 0,
  color: "#f4ede0",
  fontFamily: "DM Mono, monospace",
  fontSize: 11,
};

interface ActivityBarChartProps {
  data: DayCount[];
}

export function ActivityBarChart({ data }: ActivityBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fontFamily: "DM Mono, monospace", fill: "#7a5d3a" }}
          interval={4}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fontFamily: "DM Mono, monospace", fill: "#7a5d3a" }}
          axisLine={false}
          tickLine={false}
          width={28}
          allowDecimals={false}
        />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#ebdcb8" }} />
        <Bar dataKey="count" fill="#a87132" name="chapters" />
      </BarChart>
    </ResponsiveContainer>
  );
}
