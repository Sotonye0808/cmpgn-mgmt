"use client";

import { useState } from "react";
import { Select, Skeleton } from "antd";
import { useAuth } from "@/hooks/useAuth";
import {
  useUserAnalytics,
  useOverviewAnalytics,
  useCampaignAnalytics,
} from "@/modules/analytics/hooks/useAnalytics";
import { useLeaderboard } from "@/modules/leaderboard/hooks/useLeaderboard";
import { useCampaigns } from "@/modules/campaign/hooks/useCampaigns";
import KpiBentoGrid from "@/modules/analytics/components/KpiBentoGrid";
import EngagementTimelineChart from "@/modules/analytics/components/EngagementTimelineChart";
import CampaignGrowthChart from "@/modules/analytics/components/CampaignGrowthChart";
import TopPerformersTable from "@/modules/analytics/components/TopPerformersTable";
import AnalyticsSectionRenderer from "@/modules/analytics/components/AnalyticsSectionRenderer";
import PageHeader from "@/components/ui/PageHeader";
import GlassCard from "@/components/ui/GlassCard";
import { ANALYTICS_PAGE_CONTENT } from "@/config/content";
import { useEngagementTimeline } from "@/modules/engagement/hooks/useEngagement";
import PeriodSelector, { type Period } from "@/components/ui/PeriodSelector";
import ProofReviewPanel from "@/modules/proofs/components/ProofReviewPanel";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { analytics, loading: analyticsLoading } = useUserAnalytics();
  const { overview, loading: overviewLoading } = useOverviewAnalytics();
  const [timelineDays, setTimelineDays] = useState<Period>(14);
  const { timeline, loading: timelineLoading } =
    useEngagementTimeline(timelineDays);

  // Top performers — live global leaderboard (top 10)
  const { entries: topPerformers, loading: leaderboardLoading } =
    useLeaderboard({
      filter: "global",
      pageSize: 10,
    });

  // Campaign analytics section
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const { campaigns, loading: campaignsLoading } = useCampaigns({
    pageSize: 50,
  });
  const { analytics: campaignAnalytics, loading: campaignAnalyticsLoading } =
    useCampaignAnalytics(selectedCampaignId);

  if (!user) return null;

  const userRole = user.role as unknown as
    | "USER"
    | "TEAM_LEAD"
    | "ADMIN"
    | "SUPER_ADMIN";

  const loading = analyticsLoading || overviewLoading;

  const campaignOptions = (campaigns ?? []).map((c) => ({
    value: c.id,
    label: c.title,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title={ANALYTICS_PAGE_CONTENT.title}
        subtitle={ANALYTICS_PAGE_CONTENT.subtitle}
      />

      <AnalyticsSectionRenderer
        userRole={userRole}
        renderSection={(key) => {
          switch (key) {
            case "personal-kpis":
              return (
                <div>
                  <h2 className="text-lg font-semibold text-ds-text-primary mb-4">
                    {ANALYTICS_PAGE_CONTENT.kpiTitle}
                  </h2>
                  <KpiBentoGrid
                    userRole={userRole}
                    analytics={analytics}
                    overview={overview}
                    loading={loading}
                  />
                </div>
              );

            case "engagement-timeline":
              return (
                <GlassCard padding="lg">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-ds-text-primary">
                      {ANALYTICS_PAGE_CONTENT.engagementTitle}
                    </h2>
                    <PeriodSelector
                      value={timelineDays}
                      onChange={setTimelineDays}
                    />
                  </div>
                  {loading || timelineLoading ? (
                    <Skeleton active paragraph={{ rows: 5 }} />
                  ) : (
                    <EngagementTimelineChart data={timeline} />
                  )}
                </GlassCard>
              );

            case "top-performers":
              return (
                <TopPerformersTable
                  performers={topPerformers}
                  userRole={userRole}
                  loading={leaderboardLoading}
                />
              );

            case "campaign-analytics":
              return (
                <GlassCard padding="lg">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-ds-text-primary">
                      {ANALYTICS_PAGE_CONTENT.campaignAnalyticsTitle}
                    </h2>
                    <Select
                      placeholder="Select a campaign"
                      options={campaignOptions}
                      loading={campaignsLoading}
                      value={selectedCampaignId || undefined}
                      onChange={setSelectedCampaignId}
                      className="w-64"
                      allowClear
                    />
                  </div>
                  {!selectedCampaignId ? (
                    <p className="text-ds-text-subtle text-sm">
                      {ANALYTICS_PAGE_CONTENT.campaignAnalyticsPlaceholder}
                    </p>
                  ) : campaignAnalyticsLoading ? (
                    <Skeleton active paragraph={{ rows: 6 }} />
                  ) : campaignAnalytics ? (
                    <div className="space-y-6">
                      {/* Summary stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          {
                            label: "Participants",
                            value: campaignAnalytics.participants,
                          },
                          {
                            label: "Total Clicks",
                            value: campaignAnalytics.engagementTrend.reduce(
                              (s, p) => s + p.clicks,
                              0,
                            ),
                          },
                          {
                            label: "Total Shares",
                            value: campaignAnalytics.engagementTrend.reduce(
                              (s, p) => s + p.shares,
                              0,
                            ),
                          },
                          {
                            label: "Conversions",
                            value: campaignAnalytics.engagementTrend.reduce(
                              (s, p) => s + p.conversions,
                              0,
                            ),
                          },
                          {
                            label: "Total Raised",
                            value: new Intl.NumberFormat("en-NG", {
                              style: "currency",
                              currency: "NGN",
                              maximumFractionDigits: 0,
                            }).format(
                              campaignAnalytics.fundraising.totalRaised,
                            ),
                          },
                          {
                            label: "Donors",
                            value: campaignAnalytics.fundraising.donorCount,
                          },
                          {
                            label: "Conversion Rate",
                            value: `${(campaignAnalytics.fundraising.conversionRate * 100).toFixed(1)}%`,
                          },
                          {
                            label: "Top Performers",
                            value: campaignAnalytics.topPerformers.length,
                          },
                        ].map((item) => (
                          <div
                            key={item.label}
                            className="bg-ds-surface-elevated rounded-ds-lg p-3">
                            <div className="text-xs text-ds-text-subtle mb-1">
                              {item.label}
                            </div>
                            <div className="text-xl font-bold text-ds-text-primary font-ds-mono">
                              {item.value}
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* Engagement timeline for this campaign */}
                      <div>
                        <h3 className="text-sm font-semibold text-ds-text-subtle uppercase tracking-wide mb-3">
                          {
                            ANALYTICS_PAGE_CONTENT.campaignAnalyticsEngagementLabel
                          }
                        </h3>
                        <EngagementTimelineChart
                          data={campaignAnalytics.engagementTrend}
                        />
                      </div>
                      {/* Top performers for this campaign */}
                      {campaignAnalytics.topPerformers.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-ds-text-subtle uppercase tracking-wide mb-3">
                            {
                              ANALYTICS_PAGE_CONTENT.campaignAnalyticsTopSoldiersLabel
                            }
                          </h3>
                          <TopPerformersTable
                            performers={campaignAnalytics.topPerformers}
                            userRole={userRole}
                            loading={false}
                          />
                        </div>
                      )}
                    </div>
                  ) : null}
                </GlassCard>
              );

            case "campaign-growth":
              return selectedCampaignId && campaignAnalytics ? (
                <CampaignGrowthChart
                  data={campaignAnalytics.growth}
                  loading={campaignAnalyticsLoading}
                />
              ) : null;

            case "platform-overview":
              if (!overview) return null;
              return (
                <GlassCard padding="lg">
                  <h2 className="text-lg font-semibold text-ds-text-primary mb-4">
                    {ANALYTICS_PAGE_CONTENT.overviewTitle}
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Total Users", value: overview.totalUsers },
                      {
                        label: "Active Campaigns",
                        value: overview.activeCampaigns,
                      },
                      {
                        label: "Total Donations",
                        value: new Intl.NumberFormat("en-NG", {
                          style: "currency",
                          currency: "NGN",
                          maximumFractionDigits: 0,
                        }).format(overview.totalDonations),
                      },
                      {
                        label: "Total Points Awarded",
                        value: overview.totalPoints.toLocaleString(),
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="bg-ds-surface-elevated rounded-ds-lg p-3">
                        <div className="text-xs text-ds-text-subtle mb-1">
                          {item.label}
                        </div>
                        <div className="text-xl font-bold text-ds-text-primary font-ds-mono">
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              );

            case "proofs-overview":
              return <ProofReviewPanel campaigns={campaigns ?? []} />;

            default:
              return null;
          }
        }}
      />
    </div>
  );
}
