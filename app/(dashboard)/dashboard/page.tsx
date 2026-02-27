"use client";

import { Row, Col } from "antd";
import { useAuth } from "@/hooks/useAuth";
import Card from "@/components/ui/Card";
import { ICONS } from "@/config/icons";
import { useCampaigns } from "@/modules/campaign/hooks/useCampaigns";
import CampaignCard from "@/modules/campaign/components/CampaignCard";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/config/routes";
import { DASHBOARD_CONTENT } from "@/config/content";
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
    color: "text-ds-brand-secondary",
    bgColor: "bg-ds-brand-secondary/10",
  },
  {
    key: "members",
    label: "Participants",
    icon: "users",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const { campaigns: activeCampaigns, loading } = useCampaigns({
    filters: { status: "ACTIVE" as CampaignStatus },
    page: 1,
    pageSize: 3,
  });

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
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-ds-text-primary">
          {DASHBOARD_CONTENT.greeting.replace(
            "{name}",
            user?.firstName ?? "there",
          )}
        </h1>
        <p className="text-ds-text-secondary mt-1">
          {DASHBOARD_CONTENT.subtitle}
        </p>
      </div>

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
