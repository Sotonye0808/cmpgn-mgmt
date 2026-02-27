"use client";

import { CAMPAIGN_CONTENT } from "@/config/content";
import Tag from "./Tag";
import { cn } from "@/lib/utils/cn";

interface StatusBadgeProps {
  status: string;
  category?: "campaign";
  className?: string;
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "default",
  ACTIVE: "green",
  PAUSED: "orange",
  COMPLETED: "blue",
  ARCHIVED: "default",
  PENDING: "orange",
  COMPLETED_DONATION: "green",
  FAILED: "red",
  REFUNDED: "purple",
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const label =
    CAMPAIGN_CONTENT.status[status as keyof typeof CAMPAIGN_CONTENT.status] ??
    status;
  const color = STATUS_COLORS[status] ?? "default";

  return (
    <Tag color={color} className={cn("capitalize", className)}>
      {label}
    </Tag>
  );
}
