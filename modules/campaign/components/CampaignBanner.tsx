"use client";

import { useState } from "react";
import { Avatar, Tooltip, Progress, Tag, App } from "antd";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import { ICONS } from "@/config/icons";
import Image from "next/image";
import { formatDate, formatRelative, formatNumber } from "@/lib/utils/format";
import { CAMPAIGN_CONTENT } from "@/config/content";
import { cn } from "@/lib/utils/cn";

interface CampaignBannerProps {
  campaign: Campaign;
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    role?: string;
  };
  showActions?: boolean;
  onShare?: () => void;
  onJoin?: () => void;
  isJoined?: boolean;
  joiningLoading?: boolean;
  className?: string;
}

export default function CampaignBanner({
  campaign,
  createdBy,
  showActions = true,
  onShare,
  onJoin,
  isJoined,
  joiningLoading,
  className,
}: CampaignBannerProps) {
  const { message: msgApi } = App.useApp();
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!campaign.mediaUrl) return;
    setDownloading(true);
    try {
      const res = await fetch(campaign.mediaUrl);
      if (!res.ok) throw new Error("Failed to fetch media");
      const blob = await res.blob();
      const ext = blob.type.split("/")[1]?.split(";")[0] ?? "bin";
      const filename = `${campaign.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.${ext}`;
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    } catch {
      msgApi.error("Download failed — try right-clicking the media to save it.");
    } finally {
      setDownloading(false);
    }
  };

  const goalPercent =
    campaign.goalTarget && campaign.goalCurrent !== undefined
      ? Math.min(
          Math.round((campaign.goalCurrent / campaign.goalTarget) * 100),
          100,
        )
      : null;

  const isActive = campaign.status === ("ACTIVE" as string);

  const renderMedia = () => {
    // ── IMAGE ──────────────────────────────────────────────────────────────────
    if (campaign.mediaType === "IMAGE") {
      const url = campaign.mediaUrl ?? campaign.thumbnailUrl;
      if (url) {
        return (
          <div className="relative w-full h-72 lg:h-96">
            <Image
              src={url}
              alt={campaign.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        );
      }
      return (
        <div className="w-full h-40 lg:h-56 bg-ds-surface-sunken flex flex-col items-center justify-center gap-3 text-ds-text-subtle">
          <ICONS.image className="text-4xl opacity-50" />
          <span className="text-sm">No image provided</span>
        </div>
      );
    }

    // ── VIDEO ──────────────────────────────────────────────────────────────────
    if (campaign.mediaType === "VIDEO") {
      if (campaign.mediaUrl) {
        return (
          <div className="relative w-full h-72 lg:h-96 bg-black">
            <video
              src={campaign.mediaUrl}
              controls
              className="w-full h-full object-contain"
              poster={campaign.thumbnailUrl ?? undefined}
            />
          </div>
        );
      }
      if (campaign.thumbnailUrl) {
        return (
          <div className="relative w-full h-72 lg:h-96">
            <Image
              src={campaign.thumbnailUrl}
              alt={campaign.title}
              fill
              className="object-cover opacity-70"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <ICONS.play className="text-5xl text-white drop-shadow-lg" />
            </div>
          </div>
        );
      }
      return (
        <div className="w-full h-40 lg:h-56 bg-ds-surface-sunken flex flex-col items-center justify-center gap-3 text-ds-text-subtle">
          <ICONS.play className="text-4xl opacity-50" />
          <span className="text-sm">No video provided</span>
        </div>
      );
    }

    // ── TEXT ───────────────────────────────────────────────────────────────────
    // Decorative gradient hero — full content is rendered in the prose section below
    if (campaign.mediaType === "TEXT") {
      return (
        <div className="w-full bg-gradient-to-br from-ds-brand-accent via-ds-chart-1 to-ds-chart-5 px-6 py-8 lg:px-10 lg:py-12">
          <div className="max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
              <ICONS.message className="text-xs" />
              Article
            </span>
            <h1 className="text-2xl lg:text-3xl font-bold text-white break-words leading-snug">
              {campaign.title}
            </h1>
            {campaign.description && (
              <p className="mt-2 text-white/80 text-sm line-clamp-2 break-words">
                {campaign.description}
              </p>
            )}
          </div>
        </div>
      );
    }

    // ── Fallback (no mediaType) ─────────────────────────────────────────────────
    return (
      <div className="w-full bg-gradient-to-br from-ds-brand-accent via-ds-chart-1 to-ds-chart-5 px-6 py-8 lg:px-10 lg:py-12 flex items-center justify-center">
        <div className="text-center max-w-lg">
          <h1 className="text-2xl lg:text-3xl font-bold text-white break-words leading-snug mb-2">
            {campaign.title}
          </h1>
          {campaign.description && (
            <p className="text-white/80 text-sm line-clamp-3 break-words">
              {campaign.description}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className={cn(
        "bg-ds-surface-elevated rounded-ds-xl overflow-hidden border border-ds-border-base",
        className,
      )}>
      {/* Header */}
      <div className="p-4 border-b border-ds-border-base">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {createdBy && (
              <Avatar
                size={44}
                src={createdBy.profilePicture}
                className="bg-ds-brand-accent shrink-0">
                {createdBy.firstName.charAt(0)}
                {createdBy.lastName.charAt(0)}
              </Avatar>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-ds-text-primary text-sm">
                  {createdBy
                    ? `${createdBy.firstName} ${createdBy.lastName}`
                    : "Campaign"}
                </span>
                <StatusBadge status={campaign.status as string} />
              </div>
              <div className="flex items-center gap-2 text-xs text-ds-text-subtle mt-0.5">
                <span>{formatRelative(campaign.createdAt)}</span>
                {campaign.startDate && (
                  <>
                    <span>·</span>
                    <span>Started {formatDate(campaign.startDate)}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Goal Progress */}
        {goalPercent !== null && isActive && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1 text-xs text-ds-text-subtle">
              <span className="flex items-center gap-1">
                <ICONS.rocket className="text-xs text-ds-brand-accent" />
                {
                  CAMPAIGN_CONTENT.goalType[
                    campaign.goalType as keyof typeof CAMPAIGN_CONTENT.goalType
                  ]
                }{" "}
                Goal: {formatNumber(campaign.goalCurrent ?? 0)} /{" "}
                {formatNumber(campaign.goalTarget ?? 0)}
              </span>
              <span className="text-ds-brand-accent font-medium font-ds-mono">
                {goalPercent}%
              </span>
            </div>
            <Progress
              percent={goalPercent}
              strokeColor={{
                "0%": "#7c3aed",
                "50%": "#a855f7",
                "100%": "#ec4899",
              }}
              showInfo={false}
              size="small"
            />
          </div>
        )}
      </div>

      {/* Media */}
      {renderMedia()}

      {/* Content */}
      <div className="p-5 overflow-hidden">
        <h2 className="text-xl lg:text-2xl font-bold text-ds-text-primary mb-2 break-words">
          {campaign.title}
        </h2>
        <p className="text-ds-text-secondary mb-4 break-words whitespace-pre-wrap">{campaign.description}</p>

        {/* Long-form content — only displayed for TEXT media type */}
        {campaign.mediaType === "TEXT" && campaign.content && (
          <div className="prose prose-sm text-ds-text-secondary mb-4 break-words whitespace-pre-wrap overflow-wrap-anywhere">
            {campaign.content}
          </div>
        )}

        {/* Target Audience */}
        {campaign.targetAudience && campaign.targetAudience.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {campaign.targetAudience.map((a) => (
              <Tag key={a} color="blue">
                {a}
              </Tag>
            ))}
          </div>
        )}

        {/* CTA Button */}
        {campaign.ctaText && campaign.ctaUrl && (
          <Button
            variant="primary"
            size="large"
            href={campaign.ctaUrl}
            target="_blank"
            className="mb-4">
            {campaign.ctaText}
          </Button>
        )}

        {/* Stats Footer */}
        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-ds-border-base">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Tooltip title="Views">
              <div className="flex items-center gap-1.5 text-ds-text-secondary text-sm">
                <ICONS.view className="text-base" />
                <span className="font-ds-mono">
                  {formatNumber(campaign.viewCount)}
                </span>
              </div>
            </Tooltip>
            <Tooltip title="Clicks">
              <div className="flex items-center gap-1.5 text-ds-text-secondary text-sm">
                <ICONS.links className="text-base" />
                <span className="font-ds-mono">
                  {formatNumber(campaign.clickCount)}
                </span>
              </div>
            </Tooltip>
            <Tooltip title="Shares">
              <div className="flex items-center gap-1.5 text-ds-text-secondary text-sm">
                <ICONS.share className="text-base" />
                <span className="font-ds-mono">
                  {formatNumber(campaign.shareCount)}
                </span>
              </div>
            </Tooltip>
            {campaign.participantCount !== undefined && (
              <Tooltip title="Participants">
                <div className="flex items-center gap-1.5 text-ds-text-secondary text-sm">
                  <ICONS.users className="text-base" />
                  <span className="font-ds-mono">
                    {formatNumber(campaign.participantCount)}
                  </span>
                </div>
              </Tooltip>
            )}
          </div>

          {showActions && (
            <div className="flex flex-wrap items-center gap-2 ml-auto">
              {(campaign.mediaType === "IMAGE" || campaign.mediaType === "VIDEO") && campaign.mediaUrl && (
                <Tooltip title="Download media">
                  <Button
                    variant="ghost"
                    size="small"
                    icon={<ICONS.download />}
                    loading={downloading}
                    onClick={handleDownload}>
                    Download
                  </Button>
                </Tooltip>
              )}
              <Button
                variant="secondary"
                icon={<ICONS.share />}
                onClick={onShare}
                size="small">
                Share
              </Button>
              {onJoin && isActive && (
                <Button
                  variant={isJoined ? "ghost" : "primary"}
                  icon={isJoined ? <ICONS.check /> : <ICONS.rocket />}
                  onClick={onJoin}
                  size="small"
                  disabled={isJoined || joiningLoading}
                  loading={joiningLoading}>
                  {isJoined ? "Joined" : "Join Campaign"}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
