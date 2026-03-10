"use client";

import StatCard from "@/components/ui/StatCard";
import { KPI_CARDS } from "@/modules/analytics/config";

interface Props {
  userRole: string;
  analytics: UserAnalytics | null;
  overview: OverviewAnalytics | null;
  loading?: boolean;
}

export default function KpiBentoGrid({
  userRole,
  analytics,
  overview,
  loading = false,
}: Props) {
  const permitted = KPI_CARDS.filter((card) =>
    card.allowedRoles.includes(
      userRole as "USER" | "TEAM_LEAD" | "ADMIN" | "SUPER_ADMIN",
    ),
  );

  // Map card keys to values
  const getValue = (key: string): string | number | null => {
    if (!analytics && !overview) return null;
    switch (key) {
      case "totalPoints":
        return analytics?.points.total ?? null;
      case "rank":
        return analytics?.rank.currentRank.name ?? null;
      case "linkClicks":
        return analytics?.engagement.clicks ?? null;
      case "referrals":
        return analytics?.referrals.totalReferrals ?? null;
      case "donations":
        return analytics?.donations.count ?? null;
      case "participants":
        return overview?.totalUsers ?? null;
      case "campaigns":
        return overview?.activeCampaigns ?? null;
      case "totalDonations":
        return overview?.totalDonationAmount != null
          ? new Intl.NumberFormat("en-NG", {
              style: "currency",
              currency: "NGN",
              maximumFractionDigits: 0,
            }).format(overview.totalDonationAmount)
          : null;
      case "totalClicks":
        return overview?.totalClicks ?? null;
      case "totalShares":
        return overview?.totalShares ?? null;
      case "totalSmartLinks":
        return overview?.totalSmartLinks ?? null;
      case "totalReferrals":
        return overview?.totalReferrals ?? null;
      case "conversions":
        return analytics?.engagement.conversions ?? null;
      case "conversionRate":
        return analytics?.referrals.conversionRate != null
          ? `${Math.round(analytics.referrals.conversionRate * 100)}%`
          : null;
      case "totalConversions":
        return overview?.totalConversions ?? null;
      case "engagementRate":
        return overview?.engagementRate != null
          ? `${overview.engagementRate}%`
          : null;
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {permitted.map((card) => (
        <StatCard
          key={card.key}
          label={card.label}
          value={getValue(card.key) ?? "—"}
          icon={card.icon}
          color={card.color}
          loading={loading}
        />
      ))}
    </div>
  );
}
