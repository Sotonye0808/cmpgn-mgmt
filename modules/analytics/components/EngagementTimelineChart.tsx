"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { Skeleton } from "antd";

interface Props {
  data: EngagementTimelinePoint[];
  loading?: boolean;
  height?: number;
}

export default function EngagementTimelineChart({
  data,
  loading = false,
  height = 280,
}: Props) {
  if (loading) return <Skeleton active paragraph={{ rows: 5 }} />;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="date"
          tick={{ fill: "var(--ds-text-subtle)", fontSize: 11 }}
          tickFormatter={(d) => d.slice(5)} // MM-DD
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "var(--ds-text-subtle)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: "var(--ds-surface-elevated)",
            border: "1px solid var(--ds-border-base)",
            borderRadius: "8px",
            color: "var(--ds-text-primary)",
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: 12, color: "var(--ds-text-subtle)" }}
        />
        <Line
          type="monotone"
          dataKey="clicks"
          stroke="var(--ds-chart-3)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="shares"
          stroke="var(--ds-chart-2)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="conversions"
          stroke="var(--ds-brand-accent)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
