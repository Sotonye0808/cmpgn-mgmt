"use client";

import { useState } from "react";
import { Tooltip, App } from "antd";
import { ICONS } from "@/config/icons";
import { formatNumber } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import Spinner from "@/components/ui/Spinner";

interface ReferralLinkPanelProps {
  /** Smart-link slug (campaign referral) or undefined for platform invite link */
  slug?: string;
  /** Override the full URL (used for platform invite links) */
  url?: string;
  stats: ReferralStats | null;
  loading?: boolean;
  className?: string;
}

export default function ReferralLinkPanel({
  slug,
  url,
  stats,
  loading,
  className,
}: ReferralLinkPanelProps) {
  const [copied, setCopied] = useState(false);
  const { message: msgApi } = App.useApp();

  const referralUrl = url ?? `${typeof window !== "undefined" ? window.location.origin : ""}/c/${slug}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      msgApi.success("Referral link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      msgApi.error("Failed to copy link");
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Join me on this campaign",
          text: "Use my referral link to join this campaign:",
          url: referralUrl,
        });
      } catch {
        // User dismissed the native share sheet — no action needed
      }
    } else {
      // Fallback: copy to clipboard for browsers without Web Share API
      await handleCopy();
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

      {/* Link display */}
      <div className="flex items-center gap-2 p-3 bg-ds-surface-base border border-ds-border-base rounded-ds-lg">
        <ICONS.links className="text-ds-brand-accent flex-shrink-0" />
        <span className="flex-1 text-sm font-ds-mono text-ds-text-secondary truncate">
          {referralUrl}
        </span>
        {/* Copy */}
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
        {/* Share */}
        <Tooltip title="Share link">
          <button
            onClick={handleShare}
            className="p-1.5 rounded-ds-md hover:bg-ds-surface-elevated transition-colors text-ds-text-subtle hover:text-ds-brand-accent">
            <ICONS.share />
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
              icon: <ICONS.users className="text-ds-chart-4" />,
            },
            {
              label: "Active",
              value: stats.activeReferrals,
              icon: <ICONS.check className="text-ds-brand-success" />,
            },
            {
              label: "Conv. Rate",
              value: `${Math.round(stats.conversionRate * 100)}%`,
              icon: <ICONS.trend className="text-ds-chart-3" />,
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
