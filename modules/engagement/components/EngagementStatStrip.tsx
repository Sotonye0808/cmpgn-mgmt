"use client";

import { Tooltip } from "antd";
import { ICONS } from "@/config/icons";
import { formatNumber } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

interface EngagementStatStripProps {
  stats: EngagementStats;
  className?: string;
}

const STAT_CONFIG: Array<{
  key: keyof Omit<EngagementStats, "userId" | "campaignId">;
  label: string;
  iconKey: keyof typeof ICONS;
  color: string;
}> = [
  {
    key: "clicks",
    label: "Clicks",
    iconKey: "links",
    color: "text-ds-chart-3",
  },
  {
    key: "views",
    label: "Views",
    iconKey: "view",
    color: "text-ds-brand-accent",
  },
  {
    key: "shares",
    label: "Shares",
    iconKey: "share",
    color: "text-ds-brand-success",
  },
  {
    key: "conversions",
    label: "Conversions",
    iconKey: "check",
    color: "text-ds-brand-success",
  },
  {
    key: "referrals",
    label: "Referrals",
    iconKey: "users",
    color: "text-ds-chart-4",
  },
  {
    key: "uniqueVisitors",
    label: "Unique Visitors",
    iconKey: "trend",
    color: "text-ds-chart-5",
  },
];

export default function EngagementStatStrip({
  stats,
  className,
}: EngagementStatStripProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {STAT_CONFIG.map((cfg) => {
        const IconComponent = ICONS[cfg.iconKey];
        return (
          <Tooltip key={cfg.key} title={cfg.label}>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-ds-surface-elevated border border-ds-border-base text-xs font-medium">
              <IconComponent className={cn("text-sm", cfg.color)} />
              <span className="font-ds-mono text-ds-text-primary">
                {formatNumber(stats[cfg.key] as number)}
              </span>
              <span className="text-ds-text-subtle hidden sm:inline">
                {cfg.label}
              </span>
            </div>
          </Tooltip>
        );
      })}
    </div>
  );
}
