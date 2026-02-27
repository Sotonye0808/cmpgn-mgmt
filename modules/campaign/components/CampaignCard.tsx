"use client";

import { Tooltip, Progress, Card as AntCard } from "antd";
import Card from "@/components/ui/Card";
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
  className?: string;
}

export default function CampaignCard({
  campaign,
  showStats = true,
  onView,
  className,
}: CampaignCardProps) {
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
        <div className="relative w-full h-44 bg-gradient-to-br from-ds-brand-accent-subtle to-purple-100 dark:from-ds-brand-accent dark:to-purple-900">
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
    return (
      <div className="w-full h-44 bg-gradient-to-br from-ds-brand-accent via-purple-500 to-pink-500 flex items-center justify-center">
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
            <StatusBadge status={campaign.status as string} />
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
          </div>
        }
      />
    </Card>
  );
}
