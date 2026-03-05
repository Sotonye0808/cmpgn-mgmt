"use client";

import { useState } from "react";
import { Tooltip, Progress, Card as AntCard, App } from "antd";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import { ICONS } from "@/config/icons";
import Image from "next/image";
import { formatRelative, formatNumber } from "@/lib/utils/format";
import { CAMPAIGN_CONTENT } from "@/config/content";
import Tag from "@/components/ui/Tag";
import { cn } from "@/lib/utils/cn";

interface CampaignCardProps {
  campaign: Campaign;
  showStats?: boolean;
  onView?: (campaign: Campaign) => void;
  onJoin?: (campaign: Campaign) => void;
  onShare?: (campaign: Campaign) => void;
  isJoined?: boolean;
  isJoining?: boolean;
  className?: string;
}

export default function CampaignCard({
  campaign,
  showStats = true,
  onView,
  onJoin,
  onShare,
  isJoined,
  isJoining,
  className,
}: CampaignCardProps) {
  const { message: msgApi } = App.useApp();
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!campaign.mediaUrl) return;
    setDownloading(true);
    try {
      const res = await fetch(campaign.mediaUrl);
      if (!res.ok) throw new Error("fetch failed");
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

  const isExpired = campaign.endDate && new Date(campaign.endDate) < new Date();
  const goalPercent =
    campaign.goalTarget && campaign.goalCurrent !== undefined
      ? Math.min(
          Math.round((campaign.goalCurrent / campaign.goalTarget) * 100),
          100,
        )
      : null;

  const renderThumbnail = () => {
    if (campaign.mediaType === "IMAGE" && campaign.mediaUrl) {
      return (
        <div className="relative w-full h-44 bg-gradient-to-br from-ds-brand-accent-subtle to-ds-surface-elevated">
          <Image
            src={campaign.mediaUrl}
            alt={campaign.title}
            fill
            className="object-cover"
          />
        </div>
      );
    }
    if (campaign.mediaType === "VIDEO" && campaign.thumbnailUrl) {
      return (
        <div className="relative w-full h-44">
          <Image
            src={campaign.thumbnailUrl}
            alt={campaign.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <ICONS.play className="text-6xl text-white drop-shadow-lg" />
          </div>
        </div>
      );
    }
    // TEXT / LINK types — show uploaded thumbnail if available
    if (campaign.thumbnailUrl) {
      return (
        <div className="relative w-full h-44 bg-gradient-to-br from-ds-brand-accent-subtle to-ds-surface-elevated">
          <Image
            src={campaign.thumbnailUrl}
            alt={campaign.title}
            fill
            className="object-cover"
          />
        </div>
      );
    }
    return (
      <div className="w-full h-44 bg-gradient-to-br from-ds-brand-accent via-ds-chart-1 to-ds-chart-5 flex items-center justify-center">
        <div className="text-center text-white p-6">
          <ICONS.share className="text-5xl mb-3" />
          <p className="text-sm font-semibold line-clamp-2">{campaign.title}</p>
        </div>
      </div>
    );
  };

  return (
    <Card
      hoverable
      className={cn(
        "overflow-hidden hover:shadow-ds-xl hover:-translate-y-0.5 transition-all duration-200 hover:glow-border cursor-pointer",
        className,
      )}
      cover={renderThumbnail()}
      onClick={() => onView?.(campaign)}
      actions={
        showStats
          ? [
              <Tooltip title="Views" key="views">
                <div className="flex items-center justify-center gap-1 text-ds-text-subtle text-xs">
                  <ICONS.view className="text-xs" />
                  <span className="font-ds-mono">
                    {formatNumber(campaign.viewCount)}
                  </span>
                </div>
              </Tooltip>,
              <Tooltip title="Clicks" key="clicks">
                <div className="flex items-center justify-center gap-1 text-ds-text-subtle text-xs">
                  <ICONS.links className="text-xs" />
                  <span className="font-ds-mono">
                    {formatNumber(campaign.clickCount)}
                  </span>
                </div>
              </Tooltip>,
              <Tooltip title="Shares" key="shares">
                <div className="flex items-center justify-center gap-1 text-ds-text-subtle text-xs">
                  <ICONS.share className="text-xs" />
                  <span className="font-ds-mono">
                    {formatNumber(campaign.shareCount)}
                  </span>
                </div>
              </Tooltip>,
            ]
          : undefined
      }>
      <AntCard.Meta
        title={
          <div className="flex items-start justify-between gap-2">
            <span className="line-clamp-1 text-ds-text-primary">
              {campaign.title}
            </span>
            <span className="shrink-0 self-start mt-0.5">
              <StatusBadge status={campaign.status as string} />
            </span>
          </div>
        }
        description={
          <div className="space-y-2 mt-1">
            <p className="line-clamp-2 text-ds-text-secondary text-sm">
              {campaign.description}
            </p>

            {/* Goal Progress */}
            {goalPercent !== null && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-ds-text-subtle">
                    {
                      CAMPAIGN_CONTENT.goalType[
                        campaign.goalType as keyof typeof CAMPAIGN_CONTENT.goalType
                      ]
                    }{" "}
                    Goal
                  </span>
                  <span className="text-xs font-medium text-ds-brand-accent font-ds-mono">
                    {goalPercent}%
                  </span>
                </div>
                <Progress
                  percent={goalPercent}
                  strokeColor={{ "0%": "#7c3aed", "100%": "#a855f7" }}
                  showInfo={false}
                  size="small"
                />
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-ds-text-subtle">
              <div className="flex items-center gap-1">
                <ICONS.clock className="text-xs" />
                <span className={isExpired ? "text-ds-status-error" : ""}>
                  {campaign.endDate
                    ? isExpired
                      ? "Expired"
                      : formatRelative(campaign.endDate)
                    : "Ongoing"}
                </span>
              </div>
              {campaign.participantCount !== undefined && (
                <div className="flex items-center gap-1">
                  <ICONS.users className="text-xs" />
                  <span className="font-ds-mono">
                    {formatNumber(campaign.participantCount)}
                  </span>
                </div>
              )}
            </div>

            {campaign.targetAudience && campaign.targetAudience.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {campaign.targetAudience.map((a) => (
                  <Tag key={a} color="blue" className="text-xs">
                    {a}
                  </Tag>
                ))}
              </div>
            )}

            {/* Action row — stopPropagation so card click doesn't also fire */}
            {(onJoin || onView || onShare) && (
              <div
                className="flex flex-wrap items-center gap-2 pt-2 mt-1 border-t border-ds-border-base"
                onClick={(e) => e.stopPropagation()}>
                {onView && (
                  <button
                    type="button"
                    onClick={() => onView(campaign)}
                    className="flex items-center gap-1 text-xs text-ds-text-subtle hover:text-ds-brand-accent transition-colors">
                    <ICONS.right className="text-[10px]" />
                    View Campaign
                  </button>
                )}
                <div className="flex items-center gap-1.5 ml-auto">
                  {(campaign.mediaType === "IMAGE" ||
                    campaign.mediaType === "VIDEO") &&
                    campaign.mediaUrl && (
                      <Tooltip title="Download media">
                        <button
                          type="button"
                          disabled={downloading}
                          aria-label="Download campaign media"
                          onClick={handleDownload}
                          className="flex items-center text-xs text-ds-text-subtle hover:text-ds-brand-accent transition-colors px-1.5 py-1 rounded disabled:opacity-50">
                          <ICONS.download className={`text-xs${downloading ? " animate-spin" : ""}`} />
                        </button>
                      </Tooltip>
                    )}
                  {onShare && (
                    <button
                      type="button"
                      onClick={() => onShare(campaign)}
                      aria-label="Share campaign"
                      className="flex items-center gap-1 text-xs text-ds-text-subtle hover:text-ds-brand-accent transition-colors px-1.5 py-1 rounded">
                      <ICONS.share className="text-xs" />
                    </button>
                  )}
                  {onJoin && campaign.status === ("ACTIVE" as string) && (
                    <Button
                      variant={isJoined ? "ghost" : "primary"}
                      size="small"
                      icon={isJoined ? <ICONS.check /> : <ICONS.rocket />}
                      onClick={() => {
                        if (!isJoined && !isJoining) onJoin(campaign);
                      }}
                      disabled={isJoined || isJoining}
                      loading={isJoining}
                      className="!py-0 !h-7 !text-xs !leading-none shrink-0">
                      {isJoined ? "Joined" : "Join"}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        }
      />
    </Card>
  );
}
