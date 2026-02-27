"use client";

import { Progress } from "antd";
import { ICONS } from "@/config/icons";
import { formatNumber } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

interface MyRankCardProps {
  rankInfo: UserRankInfo;
  firstName: string;
  totalParticipants: number;
  className?: string;
}

export default function MyRankCard({
  rankInfo,
  firstName,
  totalParticipants,
  className,
}: MyRankCardProps) {
  return (
    <div className={cn("glass-surface rounded-ds-xl p-5", className)}>
      <div className="flex items-center gap-2 mb-4">
        <ICONS.trophy className="text-ds-brand-accent" />
        <span className="text-sm font-medium text-ds-text-secondary">
          Your Ranking
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Rank position */}
        <div className="flex-shrink-0 w-16 h-16 rounded-full bg-ds-brand-accent/10 border-2 border-ds-brand-accent flex flex-col items-center justify-center">
          <span className="text-xs text-ds-text-subtle leading-none">Rank</span>
          <span className="text-xl font-bold text-ds-brand-accent font-ds-mono leading-tight">
            #{rankInfo.position}
          </span>
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-ds-text-primary truncate">
            {firstName}
          </p>
          <p className="text-xs text-ds-text-subtle mb-2">
            Top{" "}
            <span className="font-ds-mono font-medium text-ds-brand-accent">
              {rankInfo.percentile}%
            </span>{" "}
            · {formatNumber(rankInfo.score)} pts
          </p>
          <Progress
            percent={rankInfo.percentile}
            strokeColor={{ "0%": "#7C3AED", "100%": "#A855F7" }}
            showInfo={false}
            size="small"
          />
        </div>
      </div>

      <p className="text-xs text-ds-text-subtle mt-3 text-center">
        {rankInfo.position} of {totalParticipants} participants
      </p>
    </div>
  );
}
