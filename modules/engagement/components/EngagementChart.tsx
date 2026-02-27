"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils/cn";

interface EngagementChartProps {
  timeline: EngagementTimelinePoint[];
  className?: string;
}

const CHART_LINES: Array<{
  key: keyof Omit<EngagementTimelinePoint, "date">;
  label: string;
  color: string;
}> = [
  { key: "clicks", label: "Clicks", color: "var(--ds-chart-3)" },
  { key: "shares", label: "Shares", color: "var(--ds-chart-2)" },
  { key: "conversions", label: "Conversions", color: "var(--ds-brand-accent)" },
];

export default function EngagementChart({
  timeline,
  className,
}: EngagementChartProps) {
  if (!timeline.length) {
    return (
      <div
        className={cn(
          "h-48 flex items-center justify-center text-ds-text-subtle text-sm",
          className,
        )}>
        No engagement data yet
      </div>
    );
  }

  return (
    <div className={cn("w-full h-64", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={timeline}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--ds-border-subtle)"
          />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }}
            tickFormatter={(v: string) => v.slice(5)} // MM-DD
          />
          <YAxis tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }} />
          <Tooltip
            contentStyle={{
              background: "var(--ds-surface-elevated)",
              border: "1px solid var(--ds-border-base)",
              borderRadius: "8px",
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {CHART_LINES.map((line) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.label}
              stroke={line.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
