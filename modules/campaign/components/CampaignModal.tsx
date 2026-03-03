"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Progress } from "antd";
import UIModal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import { ICONS } from "@/config/icons";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import { ROUTES } from "@/config/routes";

interface CampaignModalProps {
  campaigns: Campaign[];
  initialIndex?: number;
  open: boolean;
  onClose: () => void;
  onShare?: (campaign: Campaign) => void;
  onJoin?: (campaign: Campaign) => void;
  joinedIds?: Set<string>;
  joiningId?: string | null;
}

export default function CampaignModal({
  campaigns,
  initialIndex = 0,
  open,
  onClose,
  onShare,
  onJoin,
  joinedIds,
  joiningId,
}: CampaignModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const campaign = campaigns[currentIndex];
  const router = useRouter();

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, open]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((i) => (i - 1 + campaigns.length) % campaigns.length);
  }, [campaigns.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % campaigns.length);
  }, [campaigns.length]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, handlePrev, handleNext, onClose]);

  if (!campaign) return null;

  const goalPercent =
    campaign.goalTarget && campaign.goalCurrent !== undefined
      ? Math.min(
          Math.round((campaign.goalCurrent / campaign.goalTarget) * 100),
          100,
        )
      : null;

  return (
    <UIModal
      open={open}
      onCancel={onClose}
      width={680}
      footer={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="small"
              icon={<ICONS.left />}
              onClick={handlePrev}
              disabled={campaigns.length <= 1}>
              Prev
            </Button>
            <Button
              variant="ghost"
              size="small"
              icon={<ICONS.right />}
              onClick={handleNext}
              disabled={campaigns.length <= 1}>
              Next
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {onShare && (
              <Button
                variant="secondary"
                size="small"
                icon={<ICONS.share />}
                onClick={() => onShare(campaign)}>
                Share
              </Button>
            )}
            <Button
              variant="ghost"
              size="small"
              icon={<ICONS.right />}
              onClick={() => { onClose(); router.push(ROUTES.CAMPAIGN_DETAIL(campaign.id)); }}>
              View Page
            </Button>
            {onJoin && campaign.status === ("ACTIVE" as string) && (
              <Button
                variant={joinedIds?.has(campaign.id) ? "ghost" : "primary"}
                size="small"
                icon={
                  joinedIds?.has(campaign.id) ? (
                    <ICONS.check />
                  ) : (
                    <ICONS.rocket />
                  )
                }
                onClick={() => !joinedIds?.has(campaign.id) && onJoin(campaign)}
                disabled={
                  !!joinedIds?.has(campaign.id) || joiningId === campaign.id
                }
                loading={joiningId === campaign.id}>
                {joinedIds?.has(campaign.id) ? "Joined" : "Join Campaign"}
              </Button>
            )}
          </div>
        </div>
      }>
      <div className="space-y-4">
        {/* Progress Dots */}
        {campaigns.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 pt-2">
            {campaigns.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-200",
                  idx === currentIndex
                    ? "w-6 bg-ds-brand-accent"
                    : "w-1.5 bg-ds-border-base hover:bg-ds-brand-accent-subtle",
                )}
                aria-label={`Go to campaign ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Campaign Thumbnail */}
        {(campaign.mediaUrl || campaign.thumbnailUrl) && (
          <div className="relative w-full h-52 rounded-ds-lg overflow-hidden bg-ds-surface-base">
            <Image
              src={campaign.thumbnailUrl || campaign.mediaUrl || ""}
              alt={campaign.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Info */}
        <div>
          <div className="flex items-start justify-between gap-2 mb-2">
            <h2 className="text-xl font-bold text-ds-text-primary">
              {campaign.title}
            </h2>
            <StatusBadge status={campaign.status as string} />
          </div>
          <p className="text-ds-text-secondary">{campaign.description}</p>
        </div>

        {/* Goal Progress */}
        {goalPercent !== null && (
          <div>
            <div className="flex items-center justify-between mb-1 text-xs text-ds-text-subtle">
              <span>Goal Progress</span>
              <span className="text-ds-brand-accent font-medium">
                {goalPercent}%
              </span>
            </div>
            <Progress
              percent={goalPercent}
              strokeColor={{ "0%": "#7c3aed", "100%": "#a855f7" }}
              showInfo={false}
            />
          </div>
        )}
      </div>
    </UIModal>
  );
}
