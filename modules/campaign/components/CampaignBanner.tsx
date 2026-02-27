"use client";

import { Avatar, Tooltip, Progress, Tag } from "antd";
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
  className?: string;
}

export default function CampaignBanner({
  campaign,
  createdBy,
  showActions = true,
  onShare,
  className,
}: CampaignBannerProps) {
  const goalPercent =
    campaign.goalTarget && campaign.goalCurrent !== undefined
      ? Math.min(
          Math.round((campaign.goalCurrent / campaign.goalTarget) * 100),
          100,
        )
      : null;

  const isActive = campaign.status === ("ACTIVE" as string);

  const renderMedia = () => {
    if (campaign.mediaType === "IMAGE" && campaign.mediaUrl) {
      return (
        <div className="relative w-full h-72 lg:h-96">
          <Image
            src={campaign.mediaUrl}
            alt={campaign.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      );
    }
    if (campaign.mediaType === "VIDEO" && campaign.mediaUrl) {
      return (
        <div className="relative w-full h-72 lg:h-96 bg-black">
          <video
            src={campaign.mediaUrl}
            controls
            className="w-full h-full object-contain"
            poster={campaign.thumbnailUrl}
          />
        </div>
      );
    }
    return (
      <div className="w-full h-72 lg:h-96 bg-gradient-to-br from-ds-brand-accent via-purple-500 to-pink-500 flex items-center justify-center text-white p-12">
        <div className="text-center">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">
            {campaign.title}
          </h1>
          <p className="text-lg opacity-90">{campaign.description}</p>
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
      <div className="p-5">
        <h2 className="text-xl lg:text-2xl font-bold text-ds-text-primary mb-2">
          {campaign.title}
        </h2>
        <p className="text-ds-text-secondary mb-4">{campaign.description}</p>

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
        <div className="flex items-center justify-between pt-4 border-t border-ds-border-base">
          <div className="flex items-center gap-5">
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
            <Button
              variant="secondary"
              icon={<ICONS.share />}
              onClick={onShare}
              size="small">
              Share
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
