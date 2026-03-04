"use client";

import { useState, useEffect, useCallback } from "react";
import { Row, Col, App } from "antd";
import { useAuth } from "@/hooks/useAuth";
import Card from "@/components/ui/Card";
import { ICONS } from "@/config/icons";
import { useCampaigns } from "@/modules/campaign/hooks/useCampaigns";
import CampaignCard from "@/modules/campaign/components/CampaignCard";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/config/routes";
import { DASHBOARD_CONTENT } from "@/config/content";
import PageHeader from "@/components/ui/PageHeader";
import { formatNumber } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

const KPI_STATS = [
  {
    key: "campaigns",
    label: "Active Campaigns",
    icon: "rocket",
    color: "text-ds-brand-accent",
    bgColor: "bg-ds-brand-accent/10",
  },
  {
    key: "clicks",
    label: "Total Clicks",
    icon: "links",
    color: "text-ds-status-success",
    bgColor: "bg-ds-status-success/10",
  },
  {
    key: "shares",
    label: "Total Shares",
    icon: "share",
    color: "text-ds-chart-3",
    bgColor: "bg-ds-chart-3/10",
  },
  {
    key: "members",
    label: "Participants",
    icon: "users",
    color: "text-ds-chart-4",
    bgColor: "bg-ds-chart-4/10",
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { message: msgApi } = App.useApp();
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const { campaigns: activeCampaigns, loading } = useCampaigns({
    filters: { status: "ACTIVE" as CampaignStatus },
    page: 1,
    pageSize: 3,
  });

  // Sync joined state after campaigns load
  useEffect(() => {
    if (!user) return;
    fetch(ROUTES.API.CAMPAIGNS.JOINED)
      .then((r) => r.json())
      .then((json) => {
        if (Array.isArray(json.data?.campaignIds)) {
          setJoinedIds(new Set(json.data.campaignIds as string[]));
        }
      })
      .catch(() => {
        /* silent */
      });
  }, [user]);

  const handleJoin = useCallback(
    async (campaign: Campaign) => {
      if (!user || joinedIds.has(campaign.id) || joiningId) return;
      setJoiningId(campaign.id);
      try {
        const res = await fetch(`/api/campaigns/${campaign.id}/participants`, {
          method: "POST",
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Failed to join");
        setJoinedIds((prev) => new Set([...prev, campaign.id]));
        // Generate tracking link
        try {
          const linkRes = await fetch("/api/smart-links", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ campaignId: campaign.id }),
          });
          if (linkRes.ok) {
            const linkJson = await linkRes.json();
            const slug = linkJson.data?.slug;
            if (slug) {
              await navigator.clipboard.writeText(
                `${window.location.origin}/c/${slug}`,
              );
              msgApi.success("Joined! Your tracking link has been copied.");
              return;
            }
          }
        } catch {
          /* clipboard is best-effort */
        }
        msgApi.success("Successfully joined campaign!");
      } catch (e) {
        msgApi.error(e instanceof Error ? e.message : "Failed to join");
      } finally {
        setJoiningId(null);
      }
    },
    [user, joinedIds, joiningId, msgApi],
  );

  // Aggregate quick stats from active campaigns
  const totalClicks = activeCampaigns.reduce((s, c) => s + c.clickCount, 0);
  const totalShares = activeCampaigns.reduce((s, c) => s + c.shareCount, 0);
  const totalParticipants = activeCampaigns.reduce(
    (s, c) => s + (c.participantCount ?? 0),
    0,
  );

  const kpiValues: Record<string, number> = {
    campaigns: activeCampaigns.length,
    clicks: totalClicks,
    shares: totalShares,
    members: totalParticipants,
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title={DASHBOARD_CONTENT.greeting.replace(
          "{name}",
          user?.firstName ?? "there",
        )}
        subtitle={DASHBOARD_CONTENT.subtitle}
      />

      {/* KPI Bento Grid */}
      <Row gutter={[16, 16]}>
        {KPI_STATS.map((stat) => {
          const IconComponent = ICONS[stat.icon as keyof typeof ICONS];
          return (
            <Col key={stat.key} xs={12} lg={6}>
              <Card variant="glass" className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-ds-text-subtle mb-1">
                      {stat.label}
                    </p>
                    <p
                      className={cn(
                        "text-2xl font-bold font-ds-mono",
                        stat.color,
                      )}>
                      {loading ? "—" : formatNumber(kpiValues[stat.key])}
                    </p>
                  </div>
                  <div className={cn("p-2 rounded-ds-lg", stat.bgColor)}>
                    <IconComponent className={cn("text-xl", stat.color)} />
                  </div>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Active Campaigns Preview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-ds-text-primary">
            {DASHBOARD_CONTENT.sections.activeCampaigns}
          </h2>
          <button
            onClick={() => router.push(ROUTES.CAMPAIGNS)}
            className="text-xs text-ds-brand-accent hover:underline">
            View all
          </button>
        </div>
        {loading ? (
          <p className="text-ds-text-subtle text-sm">Loading...</p>
        ) : activeCampaigns.length > 0 ? (
          <Row gutter={[16, 16]}>
            {activeCampaigns.map((campaign) => (
              <Col key={campaign.id} xs={24} sm={12} lg={8}>
                <CampaignCard
                  campaign={campaign}
                  onView={(c) => router.push(ROUTES.CAMPAIGN_DETAIL(c.id))}
                  onJoin={handleJoin}
                  isJoined={joinedIds.has(campaign.id)}
                  isJoining={joiningId === campaign.id}
                />
              </Col>
            ))}
          </Row>
        ) : (
          <p className="text-ds-text-subtle text-sm">No active campaigns.</p>
        )}
      </div>
    </div>
  );
}
