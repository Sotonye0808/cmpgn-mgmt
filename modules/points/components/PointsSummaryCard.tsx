"use client";

import { Tooltip } from "antd";
import { formatNumber } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

interface PointsSummaryCardProps {
  summary: PointsSummary;
  className?: string;
}

const POINT_TYPES: Array<{
  key: keyof Pick<
    PointsSummary,
    "impact" | "consistency" | "leadership" | "reliability"
  >;
  label: string;
  abbr: string;
  color: string;
  description: string;
}> = [
  {
    key: "impact",
    label: "Impact Points",
    abbr: "IP",
    color: "#3B82F6",
    description:
      "Earned from clicks, shares, and conversions your link generates",
  },
  {
    key: "consistency",
    label: "Consistency Points",
    abbr: "CP",
    color: "#10B981",
    description: "Earned from daily and weekly activity streaks",
  },
  {
    key: "leadership",
    label: "Leadership Points",
    abbr: "LP",
    color: "#F59E0B",
    description: "Earned from referrals, team milestones, and mentoring",
  },
  {
    key: "reliability",
    label: "Reliability Points",
    abbr: "RP",
    color: "#8B5CF6",
    description: "Earned from meeting goals and accurate reporting",
  },
];

export default function PointsSummaryCard({
  summary,
  className,
}: PointsSummaryCardProps) {
  return (
    <div className={cn("glass-surface rounded-ds-xl p-5 space-y-4", className)}>
      {/* Total */}
      <div className="text-center">
        <p className="text-xs text-ds-text-subtle uppercase tracking-wider mb-1">
          Total Score
        </p>
        <p className="text-4xl font-bold text-ds-brand-accent font-ds-mono">
          {formatNumber(summary.total)}
        </p>
      </div>

      {/* Breakdown grid */}
      <div className="grid grid-cols-2 gap-3">
        {POINT_TYPES.map((pt) => (
          <Tooltip key={pt.key} title={pt.description}>
            <div
              className="flex flex-col gap-1 p-3 rounded-ds-lg bg-ds-surface-base border border-ds-border-base border-l-3 border-l-dynamic cursor-help"
              style={{ "--_dc": pt.color } as React.CSSProperties}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold font-ds-mono text-dynamic">
                  {pt.abbr}
                </span>
                <span className="text-xs text-ds-text-subtle">
                  {pt.label.replace(" Points", "")}
                </span>
              </div>
              <span className="text-xl font-bold text-ds-text-primary font-ds-mono">
                {formatNumber(summary[pt.key])}
              </span>
            </div>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}
