"use client";

import { Avatar } from "antd";
import { ICONS } from "@/config/icons";
import { formatRelative } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

interface CampaignStoryProps {
  campaign: Campaign;
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  onClick?: (campaign: Campaign) => void;
  size?: "small" | "default" | "large";
}

const SIZE_CONFIG = {
  small: { avatarSize: 64, containerClass: "w-20", nameClass: "text-xs" },
  default: { avatarSize: 80, containerClass: "w-24", nameClass: "text-sm" },
  large: { avatarSize: 100, containerClass: "w-28", nameClass: "text-base" },
};

export default function CampaignStory({
  campaign,
  createdBy,
  onClick,
  size = "default",
}: CampaignStoryProps) {
  const isExpired =
    campaign.status === "ARCHIVED" || campaign.status === "COMPLETED";

  const createdAt = new Date(campaign.createdAt);
  const endDate = campaign.endDate ? new Date(campaign.endDate) : null;
  const now = new Date();
  const totalMs = endDate ? endDate.getTime() - createdAt.getTime() : 1;
  const elapsedMs = now.getTime() - createdAt.getTime();
  const progressPercent = Math.min((elapsedMs / totalMs) * 100, 100);

  const config = SIZE_CONFIG[size];

  /**
   * Derive a still-image URL to feed into <Avatar src>.
   * Priority: explicit thumbnailUrl → IMAGE mediaUrl → Cloudinary video thumbnail.
   * LINK/TEXT mediaUrls are web URLs (not images) and are skipped.
   */
  const getAvatarSrc = (): string | undefined => {
    if (campaign.thumbnailUrl) return campaign.thumbnailUrl;
    if (campaign.mediaType === "IMAGE" && campaign.mediaUrl)
      return campaign.mediaUrl;
    if (
      campaign.mediaType === "VIDEO" &&
      campaign.mediaUrl?.includes("res.cloudinary.com")
    ) {
      // Rewrite Cloudinary video URL → JPEG thumbnail at frame 0, cropped to a square
      return campaign.mediaUrl
        .replace("/video/upload/", "/video/upload/so_0,w_200,h_200,c_fill/")
        .replace(/\.(mp4|webm|mov|avi)(\?.*)?$/i, ".jpg");
    }
    return undefined;
  };

  const avatarSrc = getAvatarSrc();
  const isVideo = campaign.mediaType === "VIDEO";

  const ringGradient = isExpired
    ? undefined
    : `conic-gradient(
        from 0deg,
        rgb(124, 58, 237) 0%,
        rgb(168, 85, 247) ${progressPercent}%,
        rgb(209, 213, 219) ${progressPercent}%,
        rgb(209, 213, 219) 100%
      )`;

  const staticRingClass = isExpired
    ? "bg-gradient-to-tr from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700"
    : campaign.status === "PAUSED"
      ? "bg-gradient-to-tr from-yellow-400 to-orange-500"
      : "";

  return (
    <div
      className={cn(config.containerClass, "cursor-pointer group")}
      onClick={() => onClick?.(campaign)}>
      <div className="flex flex-col items-center gap-2">
        <div className="relative">
          {/* Gradient / Progress Ring */}
          <div
            className={cn(
              "absolute -inset-1 rounded-full p-0.5 transition-all duration-300 group-hover:scale-110",
              staticRingClass,
              ringGradient && "ring-dynamic",
            )}
            style={
              ringGradient
                ? ({ "--_dc-ring": ringGradient } as React.CSSProperties)
                : undefined
            }
          />

          {/* Avatar */}
          <div className="relative bg-ds-surface-elevated rounded-full p-1">
            <Avatar
              size={config.avatarSize}
              src={avatarSrc}
              style={
                !avatarSrc
                  ? {
                      background:
                        "linear-gradient(135deg, var(--ds-brand-accent), #a855f7, #ec4899)",
                    }
                  : undefined
              }
              className="border-2 border-ds-surface-elevated">
              {!avatarSrc && (
                <span className="font-bold text-white text-xl">
                  {campaign.title.charAt(0)}
                </span>
              )}
            </Avatar>
            {/* Play icon overlay for video campaigns */}
            {isVideo && avatarSrc && (
              <div className="absolute inset-1 rounded-full flex items-center justify-center bg-black/25 pointer-events-none">
                <ICONS.play className="text-lg text-white drop-shadow-lg" />
              </div>
            )}
          </div>

          {/* "LIVE" chip — overlays the bottom-center of the circle like a notification badge */}
          {!isExpired && campaign.status === "ACTIVE" && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/3 px-2 py-0.5 bg-ds-brand-success text-white text-[9px] font-bold rounded-full border-2 border-ds-surface-elevated whitespace-nowrap z-10 leading-none pointer-events-none">
              LIVE
            </span>
          )}
          {isExpired && (
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-ds-text-subtle rounded-full flex items-center justify-center border-2 border-ds-surface-elevated">
              <ICONS.clock className="text-xs text-white" />
            </div>
          )}
        </div>

        {/* Title */}
        <div className="text-center max-w-full">
          <p
            className={cn(
              config.nameClass,
              "font-medium truncate text-ds-text-secondary group-hover:text-ds-brand-accent transition-colors",
            )}>
            {createdBy
              ? `${createdBy.firstName} ${createdBy.lastName}`
              : campaign.title}
          </p>
          {!isExpired && (
            <p className="text-xs text-ds-text-subtle">
              {formatRelative(campaign.createdAt)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
