"use client";

import { Skeleton } from "antd";
import { ICONS } from "@/config/icons";
import { cn } from "@/lib/utils/cn";
import type { IconKey } from "@/config/icons";

interface StatCardTrend {
  value: number;
  direction: "up" | "down";
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: IconKey | React.ReactNode;
  /** DS token string, e.g. "var(--ds-chart-3)" */
  color?: string;
  trend?: StatCardTrend;
  loading?: boolean;
  className?: string;
}

/**
 * StatCard — generic glass KPI stat card.
 *
 * Promoted from modules/analytics/components/KpiStatCard so it's available
 * to all modules without cross-module imports.
 *
 * DS rules:
 *   - glass-surface (KPI / analytics context only)
 *   - --_dc dynamic color via inline style
 *   - rounded-ds-xl
 */
export default function StatCard({
  label,
  value,
  icon,
  color = "var(--ds-brand-accent)",
  trend,
  loading = false,
  className,
}: StatCardProps) {
  if (loading) {
    return (
      <div className={cn("glass-surface rounded-ds-xl p-5", className)}>
        <Skeleton active paragraph={{ rows: 2 }} />
      </div>
    );
  }

  const renderIcon = () => {
    if (!icon) return null;
    if (typeof icon === "string") {
      const IconComponent = ICONS[icon as IconKey] ?? ICONS.analytics;
      return <IconComponent className="text-xl text-dynamic" />;
    }
    return icon;
  };

  return (
    <div
      className={cn(
        "glass-surface rounded-ds-xl p-5 hover:glow-border transition-all duration-200",
        className,
      )}
      style={{ "--_dc": color } as React.CSSProperties}>
      {icon && (
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-ds-lg flex items-center justify-center bg-dynamic-muted">
            {renderIcon()}
          </div>
          {trend && (
            <div
              className={cn(
                "flex items-center gap-1 text-xs font-semibold",
                trend.direction === "up"
                  ? "text-ds-brand-success"
                  : "text-ds-status-error",
              )}>
              {trend.direction === "up" ? (
                <ICONS.arrowUp className="text-xs" />
              ) : (
                <ICONS.arrowDown className="text-xs" />
              )}
              {trend.value}%
            </div>
          )}
        </div>
      )}
      <div className="text-2xl font-extrabold font-ds-mono mb-1 text-dynamic">
        {value ?? "—"}
      </div>
      <div className="text-xs text-ds-text-subtle font-medium uppercase tracking-wide">
        {label}
      </div>
    </div>
  );
}
