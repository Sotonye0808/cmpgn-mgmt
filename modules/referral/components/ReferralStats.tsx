"use client";

import { formatNumber } from "@/lib/utils/format";
import { ICONS } from "@/config/icons";
import { cn } from "@/lib/utils/cn";

interface ReferralStatsProps {
  stats: ReferralStats;
  className?: string;
}

const STAT_CONFIG = [
  {
    key: "totalReferrals" as const,
    label: "Total Referrals",
    icon: <ICONS.users className="text-ds-chart-4" />,
    color: "border-l-ds-chart-4",
  },
  {
    key: "activeReferrals" as const,
    label: "Active Referrals",
    icon: <ICONS.check className="text-ds-brand-success" />,
    color: "border-l-ds-brand-success",
  },
  {
    key: "directInvites" as const,
    label: "Direct Invites",
    icon: <ICONS.links className="text-ds-chart-3" />,
    color: "border-l-ds-chart-3",
  },
];

export default function ReferralStats({
  stats,
  className,
}: ReferralStatsProps) {
  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-3 gap-3", className)}>
      {STAT_CONFIG.map((cfg) => (
        <div
          key={cfg.key}
          className={cn(
            "flex flex-col gap-1.5 p-4 bg-ds-surface-elevated border border-ds-border-base rounded-ds-lg border-l-4",
            cfg.color,
          )}>
          <div className="flex items-center gap-2 text-ds-text-subtle text-xs">
            {cfg.icon}
            <span>{cfg.label}</span>
          </div>
          <span className="text-2xl font-bold text-ds-text-primary font-ds-mono">
            {formatNumber(stats[cfg.key] as number)}
          </span>
        </div>
      ))}

      {/* Conversion rate card */}
      <div className="flex flex-col gap-1.5 p-4 bg-ds-surface-elevated border border-ds-border-base rounded-ds-lg border-l-4 border-l-ds-brand-accent">
        <div className="flex items-center gap-2 text-ds-text-subtle text-xs">
          <ICONS.trend className="text-ds-brand-accent" />
          <span>Conv. Rate</span>
        </div>
        <span className="text-2xl font-bold text-ds-text-primary font-ds-mono">
          {Math.round(stats.conversionRate * 100)}%
        </span>
      </div>
    </div>
  );
}
