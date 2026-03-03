"use client";

import { Segmented } from "antd";
import { cn } from "@/lib/utils/cn";

/** 0 = all time */
export type Period = 7 | 14 | 30 | 90 | 0;

interface PeriodOption {
  label: string;
  value: Period;
}

export const PERIOD_OPTIONS: PeriodOption[] = [
  { label: "7d", value: 7 },
  { label: "14d", value: 14 },
  { label: "30d", value: 30 },
  { label: "90d", value: 90 },
  { label: "All time", value: 0 },
];

interface PeriodSelectorProps {
  value: Period;
  onChange: (v: Period) => void;
  options?: PeriodOption[];
  className?: string;
  label?: string;
}

/**
 * Shared segmented period selector for analytics, leaderboard, and engagement views.
 * Passes `days` as a numeric query param; 0 = no date restriction.
 */
export default function PeriodSelector({
  value,
  onChange,
  options = PERIOD_OPTIONS,
  className,
  label,
}: PeriodSelectorProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {label && (
        <span className="text-xs text-ds-text-subtle font-medium whitespace-nowrap">
          {label}
        </span>
      )}
      <Segmented
        size="small"
        value={value}
        options={options}
        onChange={(v) => onChange(v as Period)}
      />
    </div>
  );
}
