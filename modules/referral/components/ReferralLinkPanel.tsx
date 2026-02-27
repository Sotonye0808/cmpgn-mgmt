"use client";

import { useState } from "react";
import { Tooltip, message } from "antd";
import { ICONS } from "@/config/icons";
import { formatNumber } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import Spinner from "@/components/ui/Spinner";

interface ReferralLinkPanelProps {
  slug: string;
  stats: ReferralStats | null;
  loading?: boolean;
  className?: string;
}

export default function ReferralLinkPanel({
  slug,
  stats,
  loading,
  className,
}: ReferralLinkPanelProps) {
  const [copied, setCopied] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const referralUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/c/${slug}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      messageApi.success("Referral link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      messageApi.error("Failed to copy link");
    }
  };

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center py-6", className)}>
        <Spinner size="small" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {contextHolder}

      {/* Link display */}
      <div className="flex items-center gap-2 p-3 bg-ds-surface-base border border-ds-border-base rounded-ds-lg">
        <ICONS.links className="text-ds-brand-accent flex-shrink-0" />
        <span className="flex-1 text-sm font-ds-mono text-ds-text-secondary truncate">
          {referralUrl}
        </span>
        <Tooltip title={copied ? "Copied!" : "Copy link"}>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-ds-md hover:bg-ds-surface-elevated transition-colors text-ds-text-subtle hover:text-ds-brand-accent">
            {copied ? (
              <ICONS.check className="text-ds-status-success" />
            ) : (
              <ICONS.copy />
            )}
          </button>
        </Tooltip>
      </div>

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: "Total Referrals",
              value: stats.totalReferrals,
              icon: <ICONS.users className="text-amber-500" />,
            },
            {
              label: "Active",
              value: stats.activeReferrals,
              icon: <ICONS.check className="text-green-500" />,
            },
            {
              label: "Conv. Rate",
              value: `${Math.round(stats.conversionRate * 100)}%`,
              icon: <ICONS.trend className="text-blue-500" />,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center gap-1 p-3 bg-ds-surface-elevated border border-ds-border-base rounded-ds-lg text-center">
              {item.icon}
              <span className="text-lg font-bold text-ds-text-primary font-ds-mono">
                {typeof item.value === "number"
                  ? formatNumber(item.value)
                  : item.value}
              </span>
              <span className="text-xs text-ds-text-subtle">{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
