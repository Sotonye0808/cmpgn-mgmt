"use client";

import { useAuth } from "@/hooks/useAuth";
import {
  useUserAnalytics,
  useOverviewAnalytics,
} from "@/modules/analytics/hooks/useAnalytics";
import KpiBentoGrid from "@/modules/analytics/components/KpiBentoGrid";
import EngagementTimelineChart from "@/modules/analytics/components/EngagementTimelineChart";
import TopPerformersTable from "@/modules/analytics/components/TopPerformersTable";
import AnalyticsSectionRenderer from "@/modules/analytics/components/AnalyticsSectionRenderer";
import { Skeleton } from "antd";
import { ANALYTICS_PAGE_CONTENT } from "@/config/content";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { analytics, loading: analyticsLoading } = useUserAnalytics();
  const { overview, loading: overviewLoading } = useOverviewAnalytics();

  if (!user) return null;

  const userRole = user.role as unknown as
    | "USER"
    | "TEAM_LEAD"
    | "ADMIN"
    | "SUPER_ADMIN";

  const loading = analyticsLoading || overviewLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ds-text-primary">
          {ANALYTICS_PAGE_CONTENT.title}
        </h1>
        <p className="text-sm text-ds-text-subtle mt-1">
          {ANALYTICS_PAGE_CONTENT.subtitle}
        </p>
      </div>

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
                <div className="glass-surface rounded-ds-xl p-6">
                  <h2 className="text-lg font-semibold text-ds-text-primary mb-4">
                    {ANALYTICS_PAGE_CONTENT.engagementTitle}
                  </h2>
                  {loading ? (
                    <Skeleton active paragraph={{ rows: 5 }} />
                  ) : (
                    <EngagementTimelineChart
                      data={
                        analytics?.engagement
                          ? [] // engagement stats don't carry timeline; provided separately
                          : []
                      }
                    />
                  )}
                </div>
              );

            case "top-performers":
              return (
                <TopPerformersTable
                  performers={[]}
                  userRole={userRole}
                  loading={loading}
                />
              );

            case "platform-overview":
              if (!overview) return null;
              return (
                <div className="glass-surface rounded-ds-xl p-6">
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
                </div>
              );

            default:
              return null;
          }
        }}
      />
    </div>
  );
}
