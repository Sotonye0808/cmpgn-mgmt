"use client";

import { Tooltip } from "antd";
import { cn } from "@/lib/utils/cn";

interface RankBadgeProps {
  rank: RankLevel;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  className?: string;
}

const SIZE_CONFIG = {
  sm: {
    badgeClass: "text-base",
    nameClass: "text-xs",
    containerClass: "gap-1",
  },
  md: {
    badgeClass: "text-2xl",
    nameClass: "text-sm",
    containerClass: "gap-1.5",
  },
  lg: {
    badgeClass: "text-4xl",
    nameClass: "text-base",
    containerClass: "gap-2",
  },
};

export default function RankBadge({
  rank,
  size = "md",
  showName = true,
  className,
}: RankBadgeProps) {
  const config = SIZE_CONFIG[size];

  return (
    <Tooltip
      title={`Level ${rank.level} — ${rank.name}: ${rank.minScore}+ points`}>
      <div
        className={cn("flex items-center", config.containerClass, className)}>
        <span className={config.badgeClass}>{rank.badge}</span>
        {showName && (
          <span
            className={cn("font-semibold text-dynamic", config.nameClass)}
            style={{ "--_dc": rank.color } as React.CSSProperties}>
            {rank.name}
          </span>
        )}
      </div>
    </Tooltip>
  );
}
