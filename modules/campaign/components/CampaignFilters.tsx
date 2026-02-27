"use client";

import { Input, Select, Row, Col } from "antd";
import { ICONS } from "@/config/icons";
import { CAMPAIGN_FILTER_OPTIONS, CAMPAIGN_GOAL_OPTIONS } from "../config";
import { cn } from "@/lib/utils/cn";

interface CampaignFiltersProps {
  filters: CampaignFilters;
  onChange: (filters: Partial<CampaignFilters>) => void;
  className?: string;
}

export default function CampaignFilters({
  filters,
  onChange,
  className,
}: CampaignFiltersProps) {
  return (
    <div
      className={cn(
        "bg-ds-surface-elevated border border-ds-border-base rounded-ds-lg p-4",
        className,
      )}>
      <Row gutter={[12, 12]} align="middle">
        <Col xs={24} sm={12} lg={8}>
          <Input
            placeholder="Search campaigns..."
            prefix={<ICONS.search className="text-ds-text-subtle" />}
            value={filters.search ?? ""}
            onChange={(e) => onChange({ search: e.target.value || undefined })}
            allowClear
            className="bg-ds-surface-base"
          />
        </Col>
        <Col xs={12} sm={6} lg={4}>
          <Select
            placeholder="Status"
            value={filters.status ?? undefined}
            onChange={(val) => onChange({ status: val })}
            allowClear
            className="w-full"
            options={[...CAMPAIGN_FILTER_OPTIONS]}
          />
        </Col>
        <Col xs={12} sm={6} lg={4}>
          <Select
            placeholder="Goal Type"
            value={filters.goalType ?? undefined}
            onChange={(val) => onChange({ goalType: val })}
            allowClear
            className="w-full"
            options={[...CAMPAIGN_GOAL_OPTIONS]}
          />
        </Col>
      </Row>
    </div>
  );
}
