"use client";

import { useState } from "react";
import { Tooltip, message } from "antd";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { ICONS } from "@/config/icons";
import {
  formatRelative,
  formatNumber,
  formatLinkTitle,
} from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

interface SmartLinkCardProps {
  link: SmartLink & { campaignTitle?: string };
  onGenerate?: () => Promise<void>;
  className?: string;
}

export default function SmartLinkCard({
  link,
  onGenerate: _onGenerate,
  className,
}: SmartLinkCardProps) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_BASE_URL ?? "");

  const fullUrl = `${baseUrl}/c/${link.slug}`;
  const title = formatLinkTitle(link.campaignTitle, link.slug);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      message.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      message.error("Failed to copy");
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url: fullUrl });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
        return;
      } catch {
        /* fall through to clipboard */
      }
    }
    await navigator.clipboard.writeText(fullUrl);
    setShared(true);
    message.success("Link copied to clipboard!");
    setTimeout(() => setShared(false), 2000);
  };

  const isExpired = link.expiresAt && new Date(link.expiresAt) < new Date();

  return (
    <Card
      className={cn(
        "p-4 border border-ds-border-base bg-ds-surface-elevated",
        className,
      )}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ICONS.links className="text-ds-brand-accent" />
            <span className="text-sm font-semibold text-ds-text-primary">
              {title}
            </span>
          </div>
          <span
            className={cn(
              "text-xs px-2 py-0.5 rounded-full font-medium",
              link.isActive && !isExpired
                ? "bg-ds-status-success/10 text-ds-status-success"
                : "bg-ds-status-error/10 text-ds-status-error",
            )}>
            {link.isActive && !isExpired ? "Active" : "Expired"}
          </span>
        </div>

        {/* URL */}
        <div className="flex items-center gap-2 bg-ds-surface-base rounded-ds-lg px-3 py-2">
          <span className="text-sm font-ds-mono text-ds-text-secondary truncate flex-1">
            {fullUrl}
          </span>
          <Tooltip title={copied ? "Copied!" : "Copy link"}>
            <button
              onClick={handleCopy}
              className="text-ds-brand-accent hover:text-ds-brand-accent-hover shrink-0">
              {copied ? <ICONS.success /> : <ICONS.copy />}
            </button>
          </Tooltip>
          <Tooltip title={shared ? "Shared!" : "Share link"}>
            <button
              onClick={handleShare}
              aria-label="Share link"
              className="text-ds-brand-accent hover:text-ds-brand-accent-hover shrink-0">
              <ICONS.share />
            </button>
          </Tooltip>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-5 text-xs text-ds-text-subtle">
          <div className="flex items-center gap-1">
            <ICONS.links className="text-xs" />
            <span className="font-ds-mono">
              {formatNumber(link.clickCount)}
            </span>
            <span>clicks</span>
          </div>
          <div className="flex items-center gap-1">
            <ICONS.users className="text-xs" />
            <span className="font-ds-mono">
              {formatNumber(link.uniqueClickCount)}
            </span>
            <span>unique</span>
          </div>
          {link.expiresAt && (
            <div className="flex items-center gap-1 ml-auto">
              <ICONS.clock className="text-xs" />
              <span>
                {isExpired ? "Expired" : formatRelative(link.expiresAt)}
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

// ─── Empty state variant ────────────────────────────────────────────────────────
interface SmartLinkEmptyProps {
  onGenerate: () => Promise<void>;
  loading?: boolean;
  className?: string;
}

export function SmartLinkEmpty({
  onGenerate,
  loading,
  className,
}: SmartLinkEmptyProps) {
  return (
    <Card
      className={cn(
        "p-6 border border-dashed border-ds-border-base bg-ds-surface-elevated text-center",
        className,
      )}>
      <ICONS.links className="text-3xl text-ds-text-subtle mb-3" />
      <p className="text-ds-text-secondary text-sm mb-3">
        Generate your personal smart link to track your campaign impact.
      </p>
      <Button
        variant="primary"
        onClick={onGenerate}
        loading={loading}
        icon={<ICONS.rocket />}>
        Generate My Link
      </Button>
    </Card>
  );
}
