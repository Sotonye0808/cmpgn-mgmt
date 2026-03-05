"use client";

import { useState, useEffect, useCallback } from "react";
import { Row, Col, App, Modal } from "antd";
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
import { RANK_LEVELS } from "@/config/ranks";

const KPI_STATS = [
  {
    key: "points",
    label: "My Points",
    icon: "star",
    color: "text-ds-brand-accent",
    bgColor: "bg-ds-brand-accent/10",
    isText: false,
  },
  {
    key: "rank",
    label: "My Rank",
    icon: "trophy",
    color: "text-ds-chart-4",
    bgColor: "bg-ds-chart-4/10",
    isText: true, // value is a string, not a number
  },
  {
    key: "campaigns",
    label: "Campaigns Joined",
    icon: "rocket",
    color: "text-ds-status-success",
    bgColor: "bg-ds-status-success/10",
    isText: false,
  },
  {
    key: "clicks",
    label: "My Link Clicks",
    icon: "links",
    color: "text-ds-chart-3",
    bgColor: "bg-ds-chart-3/10",
    isText: false,
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { message: msgApi } = App.useApp();
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [showRankInfo, setShowRankInfo] = useState(false);

  // Personal stats
  const [totalPoints, setTotalPoints] = useState(0);
  const [rankName, setRankName] = useState("—");
  const [totalLinkClicks, setTotalLinkClicks] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);

  const { campaigns: activeCampaigns, loading } = useCampaigns({
    filters: { status: "ACTIVE" as CampaignStatus },
    page: 1,
    pageSize: 3,
  });

  // Sync joined campaigns + personal stats
  useEffect(() => {
    if (!user) return;
    // Joined campaign IDs
    fetch(ROUTES.API.CAMPAIGNS.JOINED)
      .then((r) => r.json())
      .then((json) => {
        if (Array.isArray(json.data?.campaignIds)) {
          setJoinedIds(new Set(json.data.campaignIds as string[]));
        }
      })
      .catch(() => { /* silent */ });
    // Personal points + rank + link clicks
    setStatsLoading(true);
    Promise.all([
      fetch(ROUTES.API.POINTS.ME).then((r) => r.json()),
      fetch(ROUTES.API.SMART_LINKS.BASE).then((r) => r.json()),
    ])
      .then(([pointsJson, linksJson]) => {
        setTotalPoints(pointsJson.data?.summary?.total ?? 0);
        setRankName(pointsJson.data?.progress?.currentRank?.name ?? "Recruit");
        const links: SmartLink[] = Array.isArray(linksJson.data) ? linksJson.data : [];
        setTotalLinkClicks(links.reduce((sum, l) => sum + (l.clickCount ?? 0), 0));
      })
      .catch(() => { /* silent */ })
      .finally(() => setStatsLoading(false));
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

  const kpiValues: Record<string, number> = {
    points: totalPoints,
    campaigns: joinedIds.size,
    clicks: totalLinkClicks,
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
                      {statsLoading
                        ? "—"
                        : stat.isText
                          ? rankName
                          : formatNumber(kpiValues[stat.key])}
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

      {/* Rank FAQ trigger */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowRankInfo(true)}
          className="inline-flex items-center gap-1.5 text-xs text-ds-text-subtle hover:text-ds-brand-accent transition-colors">
          <ICONS.info className="text-sm" />
          How do ranks work?
        </button>
      </div>

      {/* Rank Ladder Modal */}
      <Modal
        open={showRankInfo}
        onCancel={() => setShowRankInfo(false)}
        footer={null}
        title={
          <div className="flex items-center gap-2">
            <ICONS.trophy className="text-ds-brand-accent" />
            <span>Rank Ladder</span>
          </div>
        }
        width={560}>
        <p className="text-sm text-ds-text-subtle mb-5">
          Earn points by sharing campaigns and driving real engagement. Each point milestone unlocks the next rank and its perks.
        </p>
        <div className="space-y-3">
          {RANK_LEVELS.map((rank) => {
            const isCurrent = rank.name === rankName;
            return (
              <div
                key={rank.level}
                className={cn(
                  "flex gap-3 p-3 rounded-ds-lg border transition-all",
                  isCurrent
                    ? "border-ds-brand-accent bg-ds-brand-accent-subtle"
                    : "border-ds-border-subtle bg-ds-surface-elevated",
                )}>
                <div className="text-2xl shrink-0 w-10 text-center">{rank.badge}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="font-semibold text-sm"
                      style={{ color: rank.color }}>
                      {rank.name}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-ds-full bg-ds-brand-accent text-white">
                        You are here
                      </span>
                    )}
                    <span className="text-xs text-ds-text-disabled ml-auto shrink-0">
                      {rank.minScore.toLocaleString()}+ pts
                    </span>
                  </div>
                  <ul className="mt-1.5 space-y-0.5">
                    {rank.perks.map((perk) => (
                      <li key={perk} className="text-xs text-ds-text-subtle flex items-start gap-1.5">
                        <span className="text-ds-brand-accent mt-0.5">•</span>
                        {perk}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </Modal>

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
