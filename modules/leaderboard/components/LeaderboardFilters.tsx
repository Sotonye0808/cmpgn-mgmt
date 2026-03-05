"use client";

import { useState, useEffect } from "react";
import { Segmented, Select } from "antd";
import { cn } from "@/lib/utils/cn";
import { ROUTES } from "@/config/routes";

interface LeaderboardFiltersProps {
  value: LeaderboardFilter;
  campaignId?: string;
  onChange: (filter: LeaderboardFilter, campaignId?: string) => void;
  className?: string;
}

const FILTER_OPTIONS: Array<{ label: string; value: LeaderboardFilter }> = [
  { label: "Individual", value: "individual" },
  { label: "Global", value: "global" },
];

export default function LeaderboardFilters({
  value,
  campaignId,
  onChange,
  className,
}: LeaderboardFiltersProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  // Fetch active campaigns to populate the campaign selector for individual mode
  useEffect(() => {
    if (value !== "individual") return;
    fetch(`${ROUTES.API.CAMPAIGNS.BASE}?status=ACTIVE&pageSize=50`)
      .then((r) => r.json())
      .then((json) => setCampaigns(json.data ?? []))
      .catch(() => {
        /* silent fail */
      });
  }, [value]);

  return (
    <div className={cn("flex items-center gap-3 flex-wrap", className)}>
      <Segmented
        options={FILTER_OPTIONS}
        value={value}
        onChange={(v) => onChange(v as LeaderboardFilter, undefined)}
        className="bg-ds-surface-elevated"
      />
      {value === "individual" && (
        <Select
          allowClear
          placeholder="All campaigns"
          style={{ minWidth: 180 }}
          value={campaignId}
          onChange={(val) => onChange(value, val)}
          options={campaigns.map((c) => ({ value: c.id, label: c.title }))}
        />
      )}
    </div>
  );
}
