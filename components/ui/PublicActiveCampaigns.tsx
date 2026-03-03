"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/config/routes";
import { ICONS } from "@/config/icons";
import { formatNumber } from "@/lib/utils/format";
import Image from "next/image";

interface PublicActiveCampaignsProps {
  campaigns: Array<{
    id: string;
    title: string;
    description: string;
    thumbnailUrl?: string;
    mediaUrl?: string;
    participantCount?: number;
    goalTarget?: number;
    goalCurrent?: number;
    isMegaCampaign?: boolean;
  }>;
}

export default function PublicActiveCampaigns({ campaigns }: PublicActiveCampaignsProps) {
  const { user } = useAuth();
  const router = useRouter();

  if (campaigns.length === 0) return null;

  const handleJoin = (campaignId: string) => {
    if (user) {
      router.push(ROUTES.CAMPAIGN_DETAIL(campaignId));
    } else {
      router.push(`${ROUTES.REGISTER}?redirect=${ROUTES.CAMPAIGN_DETAIL(campaignId)}`);
    }
  };

  return (
    <section className="border-t border-ds-border-base py-14">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-ds-text-primary mb-1">
              Active Missions
            </h2>
            <p className="text-ds-text-secondary text-sm">
              Live campaigns you can join right now.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push(user ? ROUTES.CAMPAIGNS : ROUTES.REGISTER)}
            className="text-sm font-medium text-ds-brand-accent hover:underline flex items-center gap-1">
            View all
            <ICONS.right className="text-xs" />
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => {
            const goalPercent =
              campaign.goalTarget && campaign.goalCurrent != null
                ? Math.min(
                    100,
                    Math.round((campaign.goalCurrent / campaign.goalTarget) * 100),
                  )
                : null;

            return (
              <div
                key={campaign.id}
                className="glass-surface rounded-ds-xl overflow-hidden hover:glow-border transition-all duration-200 flex flex-col">
                {/* Thumbnail */}
                <div className="relative w-full h-36 bg-gradient-to-br from-ds-brand-accent via-ds-chart-1 to-ds-chart-5">
                  {(campaign.thumbnailUrl || campaign.mediaUrl) && (
                    <Image
                      src={campaign.thumbnailUrl || campaign.mediaUrl || ""}
                      alt={campaign.title}
                      fill
                      className="object-cover"
                    />
                  )}
                  {campaign.isMegaCampaign && (
                    <span className="absolute top-3 left-3 px-2 py-0.5 bg-ds-brand-accent text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                      MEGA
                    </span>
                  )}
                  <span className="absolute top-3 right-3 px-2 py-0.5 bg-ds-brand-success text-white text-[10px] font-bold rounded-full">
                    LIVE
                  </span>
                </div>

                {/* Body */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-semibold text-ds-text-primary mb-1 line-clamp-1">
                    {campaign.title}
                  </h3>
                  <p className="text-sm text-ds-text-secondary line-clamp-2 mb-3 flex-1">
                    {campaign.description}
                  </p>

                  {goalPercent !== null && (
                    <div className="mb-3">
                      <div className="w-full bg-ds-surface-elevated rounded-full h-1.5">
                        <div
                          className="bg-ds-brand-accent h-1.5 rounded-full transition-all bar-dynamic"
                          style={{ '--_bar-w': `${goalPercent}%` } as React.CSSProperties}
                        />
                      </div>
                      <p className="text-[11px] text-ds-text-subtle mt-1">
                        {goalPercent}% of goal reached
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    {campaign.participantCount !== undefined && (
                      <div className="flex items-center gap-1 text-xs text-ds-text-subtle">
                        <ICONS.users className="text-xs" />
                        <span>{formatNumber(campaign.participantCount)} joined</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => handleJoin(campaign.id)}
                      className="ml-auto px-4 py-1.5 bg-ds-brand-accent text-white text-sm font-semibold rounded-ds-lg hover:bg-ds-brand-accent-hover transition-colors flex items-center gap-1.5">
                      <ICONS.rocket className="text-xs" />
                      Join Mission
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
