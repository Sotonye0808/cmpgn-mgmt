"use client";

import { Progress, Tooltip } from "antd";
import { formatNumber } from "@/lib/utils/format";
import RankBadge from "./RankBadge";
import { cn } from "@/lib/utils/cn";

interface RankProgressProps {
  progress: RankProgress;
  className?: string;
}

export default function RankProgressBar({
  progress,
  className,
}: RankProgressProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <RankBadge rank={progress.currentRank} size="sm" />
        {progress.nextRank && <RankBadge rank={progress.nextRank} size="sm" />}
      </div>

      <Tooltip
        title={
          progress.pointsToNext
            ? `${formatNumber(progress.pointsToNext)} points to ${progress.nextRank?.name}`
            : "Maximum rank achieved!"
        }>
        <Progress
          percent={progress.progressPercent}
          strokeColor={{
            "0%": progress.currentRank.color,
            "100%": progress.nextRank?.color ?? progress.currentRank.color,
          }}
          showInfo={false}
          className="mb-0"
        />
      </Tooltip>

      <div className="flex items-center justify-between text-xs text-ds-text-subtle">
        <span className="font-ds-mono">
          {formatNumber(progress.totalScore)} pts
        </span>
        {progress.nextRank && (
          <span>
            <span className="font-ds-mono text-ds-text-primary">
              {formatNumber(progress.pointsToNext!)}
            </span>{" "}
            pts to {progress.nextRank.name}
          </span>
        )}
      </div>
    </div>
  );
}
