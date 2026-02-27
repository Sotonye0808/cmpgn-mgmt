"use client";

import { Segmented } from "antd";
import { cn } from "@/lib/utils/cn";

interface LeaderboardFiltersProps {
  value: LeaderboardFilter;
  onChange: (value: LeaderboardFilter) => void;
  className?: string;
}

const FILTER_OPTIONS: Array<{ label: string; value: LeaderboardFilter }> = [
  { label: "Individual", value: "individual" },
  { label: "Global", value: "global" },
];

export default function LeaderboardFilters({
  value,
  onChange,
  className,
}: LeaderboardFiltersProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Segmented
        options={FILTER_OPTIONS}
        value={value}
        onChange={(v) => onChange(v as LeaderboardFilter)}
        className="bg-ds-surface-elevated"
      />
    </div>
  );
}
