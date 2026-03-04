"use client";

import { Empty } from "antd";
import { useAuth } from "@/hooks/useAuth";
import {
  useReferral,
  ReferralLinkPanel,
  ReferralStats,
} from "@/modules/referral";
import { REFERRAL_PAGE_CONTENT } from "@/config/content";
import { ICONS } from "@/config/icons";
import PageHeader from "@/components/ui/PageHeader";
import Spinner from "@/components/ui/Spinner";
import GlassCard from "@/components/ui/GlassCard";

const c = REFERRAL_PAGE_CONTENT;

export default function ReferralsPage() {
  const { user } = useAuth();
  const { stats, loading } = useReferral();

  // Build the platform invite URL using the user's ID
  const inviteUrl =
    typeof window !== "undefined" && user
      ? `${window.location.origin}/register?ref=${user.id}`
      : "";

  if (!user) {
    return <Spinner fullPage tip="Loading..." />;
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      <PageHeader title={c.title} subtitle={c.subtitle} />

      {/* Invite Link Section */}
      <GlassCard>
        <h2 className="text-lg font-semibold text-ds-text-primary mb-1">
          {c.linkPanelTitle}
        </h2>
        <p className="text-sm text-ds-text-secondary mb-4">
          {c.linkPanelDescription}
        </p>
        <ReferralLinkPanel url={inviteUrl} stats={stats} loading={loading} />
      </GlassCard>

      {/* Stats Section */}
      {stats && stats.totalReferrals > 0 ? (
        <GlassCard>
          <h2 className="text-lg font-semibold text-ds-text-primary mb-4">
            {c.statsTitle}
          </h2>
          <ReferralStats stats={stats} />
        </GlassCard>
      ) : !loading ? (
        <GlassCard>
          <Empty
            image={
              <ICONS.users
                style={{ fontSize: 48 }}
                className="text-ds-text-muted"
              />
            }
            description={
              <span className="text-ds-text-secondary">{c.emptyState}</span>
            }
          />
        </GlassCard>
      ) : null}

      {/* How it works */}
      <GlassCard>
        <h2 className="text-lg font-semibold text-ds-text-primary mb-4">
          {c.howItWorksTitle}
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {c.howItWorksSteps.map((step, i) => (
            <div
              key={step.title}
              className="flex flex-col items-center text-center p-4 rounded-ds-lg bg-ds-surface-elevated border border-ds-border-base">
              <div className="w-8 h-8 rounded-full bg-ds-brand-accent/20 text-ds-brand-accent flex items-center justify-center font-bold text-sm mb-3">
                {i + 1}
              </div>
              <h3 className="text-sm font-semibold text-ds-text-primary mb-1">
                {step.title}
              </h3>
              <p className="text-xs text-ds-text-secondary">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
