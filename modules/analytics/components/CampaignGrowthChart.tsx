"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Skeleton } from "antd";
import { ANALYTICS_PAGE_CONTENT } from "@/config/content";
import GlassCard from "@/components/ui/GlassCard";

interface GrowthPoint {
  date: string;
  count: number;
}

interface Props {
  data: GrowthPoint[];
  loading?: boolean;
  height?: number;
}

export default function CampaignGrowthChart({
  data,
  loading = false,
  height = 240,
}: Props) {
  if (loading) return <Skeleton active paragraph={{ rows: 4 }} />;

  return (
    <GlassCard padding="lg">
      <h3 className="font-semibold text-ds-text-primary text-lg mb-4">
        {ANALYTICS_PAGE_CONTENT.growthTitle}
      </h3>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={data}
          margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--ds-brand-accent)"
                stopOpacity={0.4}
              />
              <stop
                offset="95%"
                stopColor="var(--ds-brand-accent)"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tick={{ fill: "var(--ds-text-subtle)", fontSize: 11 }}
            tickFormatter={(d) => d.slice(5)}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "var(--ds-text-subtle)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              background: "var(--ds-surface-elevated)",
              border: "1px solid var(--ds-border-base)",
              borderRadius: "8px",
              color: "var(--ds-text-primary)",
            }}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="var(--ds-brand-accent)"
            strokeWidth={2}
            fill="url(#growthGrad)"
            dot={false}
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </GlassCard>
  );
}
