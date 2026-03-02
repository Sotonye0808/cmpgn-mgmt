"use client";

import { useState, useEffect, useCallback } from "react";
import { Skeleton, Tag, Progress } from "antd";
import Link from "next/link";
import GlassCard from "@/components/ui/GlassCard";
import { ICONS } from "@/config/icons";
import { ROUTES } from "@/config/routes";
import { DONATION_STATUS_CONFIG } from "@/config/bankAccounts";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function DonationAnalyticsSection() {
  const [analytics, setAnalytics] = useState<DonationAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch(ROUTES.API.DONATIONS.ANALYTICS);
      if (!res.ok) return;
      const json = await res.json();
      setAnalytics(json.data ?? null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  useAutoRefresh("donations", fetchAnalytics);

  if (loading) return <Skeleton active paragraph={{ rows: 6 }} />;
  if (!analytics)
    return <p className="text-ds-text-subtle">No donation data.</p>;

  return (
    <GlassCard padding="lg">
      <div className="flex items-center gap-2 mb-6">
        <ICONS.dollar className="text-ds-brand-accent text-lg" />
        <h2 className="text-lg font-semibold text-ds-text-primary">
          Donation Analytics
        </h2>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Total Raised",
            value: formatCurrency(analytics.totalRaised),
          },
          {
            label: "Total Donations",
            value: analytics.totalCount.toLocaleString(),
          },
          {
            label: "Average Amount",
            value: formatCurrency(analytics.averageAmount),
          },
          {
            label: "Top Donors",
            value: analytics.topDonors.length,
          },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-ds-surface-elevated rounded-ds-lg p-3">
            <div className="text-xs text-ds-text-subtle mb-1">{item.label}</div>
            <div className="text-xl font-bold text-ds-text-primary font-ds-mono">
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* Status breakdown */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-ds-text-subtle uppercase tracking-wide mb-3">
          By Status
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(analytics.byStatus).map(([status, data]) => {
            const cfg = DONATION_STATUS_CONFIG[status];
            return (
              <div
                key={status}
                className="bg-ds-surface-elevated rounded-ds-lg p-3">
                <Tag color={cfg?.color ?? "default"} className="mb-1">
                  {cfg?.label ?? status}
                </Tag>
                <div className="text-sm font-semibold text-ds-text-primary">
                  {data.count} donations
                </div>
                <div className="text-xs text-ds-text-subtle">
                  {formatCurrency(data.amount)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Currency breakdown */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-ds-text-subtle uppercase tracking-wide mb-3">
          By Currency
        </h3>
        <div className="space-y-2">
          {Object.entries(analytics.byCurrency).map(([currency, data]) => {
            const percent =
              analytics.totalCount > 0
                ? Math.round((data.count / analytics.totalCount) * 100)
                : 0;
            return (
              <div key={currency} className="flex items-center gap-3">
                <span className="w-10 text-sm font-bold text-ds-text-primary">
                  {currency}
                </span>
                <Progress
                  percent={percent}
                  size="small"
                  strokeColor="var(--ds-brand-accent)"
                  className="flex-1"
                />
                <span className="text-xs text-ds-text-subtle w-28 text-right">
                  {data.count} ({formatCurrency(data.amount)})
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top donors */}
      {analytics.topDonors.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-ds-text-subtle uppercase tracking-wide mb-3">
            Top Donors
          </h3>
          <div className="space-y-2">
            {analytics.topDonors.slice(0, 5).map((donor, idx) => (
              <div
                key={donor.userId}
                className="flex items-center gap-3 bg-ds-surface-elevated rounded-ds-lg p-2">
                <span className="text-sm font-bold text-ds-brand-accent w-6 text-center">
                  #{idx + 1}
                </span>
                <Link
                  href={ROUTES.USER_DETAIL(donor.userId)}
                  className="flex-1 text-sm text-ds-text-primary hover:text-ds-brand-accent transition-colors">
                  {donor.firstName} {donor.lastName}
                </Link>
                <span className="font-semibold text-ds-brand-accent font-ds-mono text-sm">
                  {formatCurrency(donor.total)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </GlassCard>
  );
}
