"use client";

import { Skeleton } from "antd";
import { ICONS } from "@/config/icons";

interface Props {
  config: KpiCardConfig;
  value: string | number | null;
  loading?: boolean;
}

export default function KpiStatCard({ config, value, loading = false }: Props) {
  const IconComponent =
    ICONS[config.icon as keyof typeof ICONS] ?? ICONS.analytics;

  if (loading) {
    return (
      <div className="glass-surface rounded-ds-xl p-5">
        <Skeleton active paragraph={{ rows: 2 }} />
      </div>
    );
  }

  return (
    <div
      className="glass-surface rounded-ds-xl p-5 hover:glow-border transition-all duration-200"
      style={{ "--_dc": config.color } as React.CSSProperties}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-ds-lg flex items-center justify-center bg-dynamic-muted">
          <IconComponent className="text-xl text-dynamic" />
        </div>
      </div>
      <div className="text-2xl font-extrabold font-ds-mono mb-1 text-dynamic">
        {value ?? "—"}
      </div>
      <div className="text-xs text-ds-text-subtle font-medium uppercase tracking-wide">
        {config.label}
      </div>
    </div>
  );
}
