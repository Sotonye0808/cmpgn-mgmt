"use client";

import { Progress, Skeleton } from "antd";
import { DONATION_PAGE_CONTENT } from "@/config/content";

interface Props {
  stats: DonationStats | null;
  goalTarget?: number;
  currency?: string;
  loading?: boolean;
}

function formatCurrency(amount: number, currency = "NGN"): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function FundraisingProgress({
  stats,
  goalTarget,
  currency = "NGN",
  loading = false,
}: Props) {
  if (loading) return <Skeleton active paragraph={{ rows: 3 }} />;
  if (!stats) return null;

  const percent = goalTarget
    ? Math.min(100, Math.round((stats.totalRaised / goalTarget) * 100))
    : null;

  return (
    <div className="glass-surface rounded-ds-xl p-6">
      <h3 className="font-semibold text-ds-text-primary text-lg mb-4">
        {DONATION_PAGE_CONTENT.progressTitle}
      </h3>

      <div className="text-3xl font-extrabold text-ds-brand-accent font-ds-mono mb-1">
        {formatCurrency(stats.totalRaised, currency)}
      </div>

      {goalTarget && (
        <>
          <div className="text-sm text-ds-text-subtle mb-3">
            of {formatCurrency(goalTarget, currency)} goal
          </div>
          <Progress
            percent={percent ?? 0}
            strokeColor="var(--ds-brand-accent)"
            trailColor="var(--ds-border-base)"
            format={(p) => `${p}%`}
          />
        </>
      )}

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-ds-surface-elevated rounded-ds-lg p-3">
          <div className="text-xs text-ds-text-subtle mb-1">Donors</div>
          <div className="text-xl font-bold text-ds-text-primary">
            {stats.donorCount}
          </div>
        </div>
        <div className="bg-ds-surface-elevated rounded-ds-lg p-3">
          <div className="text-xs text-ds-text-subtle mb-1">
            Conversion Rate
          </div>
          <div className="text-xl font-bold text-ds-text-primary">
            {(stats.conversionRate * 100).toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
}
