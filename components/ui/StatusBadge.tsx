"use client";

import { CAMPAIGN_CONTENT } from "@/config/content";
import { cn } from "@/lib/utils/cn";

interface StatusBadgeProps {
  status: string;
  category?: "campaign";
  className?: string;
}

// bg + text colour maps use CSS tokens — no raw Tailwind palette classes
const BG_CLASSES: Record<string, string> = {
  DRAFT: "bg-ds-text-subtle/10",
  ACTIVE: "bg-ds-status-success/10",
  PAUSED: "bg-ds-status-warning/10",
  COMPLETED: "bg-ds-status-info/10",
  ARCHIVED: "bg-ds-text-subtle/10",
  PENDING: "bg-ds-status-warning/10",
  COMPLETED_DONATION: "bg-ds-status-success/10",
  FAILED: "bg-ds-status-error/10",
  REFUNDED: "bg-ds-brand-accent/10",
};

const TEXT_CLASSES: Record<string, string> = {
  DRAFT: "text-ds-text-subtle",
  ACTIVE: "text-ds-status-success",
  PAUSED: "text-ds-status-warning",
  COMPLETED: "text-ds-status-info",
  ARCHIVED: "text-ds-text-subtle",
  PENDING: "text-ds-status-warning",
  COMPLETED_DONATION: "text-ds-status-success",
  FAILED: "text-ds-status-error",
  REFUNDED: "text-ds-brand-accent",
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const label =
    CAMPAIGN_CONTENT.status[status as keyof typeof CAMPAIGN_CONTENT.status] ??
    status;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize whitespace-nowrap",
        BG_CLASSES[status] ?? "bg-ds-text-subtle/10",
        TEXT_CLASSES[status] ?? "text-ds-text-subtle",
        className,
      )}>
      {label}
    </span>
  );
}
