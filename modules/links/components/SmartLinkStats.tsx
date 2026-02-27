"use client";

import { formatNumber } from "@/lib/utils/format";
import { ICONS } from "@/config/icons";
import { cn } from "@/lib/utils/cn";

interface SmartLinkStatsProps {
  links: SmartLink[];
  className?: string;
}

export default function SmartLinkStats({
  links,
  className,
}: SmartLinkStatsProps) {
  const totalClicks = links.reduce((s, l) => s + l.clickCount, 0);
  const totalUnique = links.reduce((s, l) => s + l.uniqueClickCount, 0);
  const activeLinks = links.filter((l) => l.isActive).length;

  const stats = [
    {
      label: "Total Clicks",
      value: totalClicks,
      icon: "links",
      color: "text-ds-brand-accent",
    },
    {
      label: "Unique Clicks",
      value: totalUnique,
      icon: "users",
      color: "text-ds-status-success",
    },
    {
      label: "Active Links",
      value: activeLinks,
      icon: "rocket",
      color: "text-ds-chart-3",
    },
  ];

  return (
    <div className={cn("flex items-center gap-6", className)}>
      {stats.map((stat) => {
        const Icon = ICONS[stat.icon as keyof typeof ICONS];
        return (
          <div key={stat.label} className="flex items-center gap-2">
            <Icon className={cn("text-lg", stat.color)} />
            <div>
              <p className={cn("text-lg font-bold font-ds-mono", stat.color)}>
                {formatNumber(stat.value)}
              </p>
              <p className="text-xs text-ds-text-subtle">{stat.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
