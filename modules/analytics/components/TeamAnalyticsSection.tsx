"use client";

import { useState, useEffect, useCallback } from "react";
import { Skeleton, Progress, Avatar } from "antd";
import GlassCard from "@/components/ui/GlassCard";
import { ICONS } from "@/config/icons";
import { ROUTES } from "@/config/routes";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";

interface TeamAnalyticsData {
  teamId: string;
  teamName: string;
  memberCount: number;
  totalPoints: number;
  totalDonations: number;
  averagePointsPerMember: number;
  topMembers: {
    userId: string;
    firstName: string;
    lastName: string;
    score: number;
  }[];
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function TeamAnalyticsSection() {
  const [teams, setTeams] = useState<TeamAnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTeams = useCallback(async () => {
    try {
      const res = await fetch(
        `${ROUTES.API.ANALYTICS.OVERVIEW.replace("/overview", "/teams")}`,
      );
      if (!res.ok) return;
      const json = await res.json();
      setTeams(json.data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  useAutoRefresh("teams", fetchTeams);

  if (loading) return <Skeleton active paragraph={{ rows: 6 }} />;
  if (!teams.length)
    return <p className="text-ds-text-subtle">No teams yet.</p>;

  const maxPoints = Math.max(...teams.map((t) => t.totalPoints), 1);

  return (
    <GlassCard padding="lg">
      <div className="flex items-center gap-2 mb-6">
        <ICONS.team className="text-ds-brand-accent text-lg" />
        <h2 className="text-lg font-semibold text-ds-text-primary">
          Team Performance
        </h2>
      </div>

      <div className="space-y-4">
        {teams.map((team, idx) => (
          <div
            key={team.teamId}
            className="bg-ds-surface-elevated rounded-ds-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-ds-brand-accent w-8 text-center">
                  #{idx + 1}
                </span>
                <div>
                  <p className="font-semibold text-ds-text-primary">
                    {team.teamName}
                  </p>
                  <p className="text-xs text-ds-text-subtle">
                    {team.memberCount} members
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-ds-text-primary font-ds-mono">
                  {team.totalPoints.toLocaleString()} pts
                </p>
                <p className="text-xs text-ds-text-subtle">
                  {formatCurrency(team.totalDonations)} raised
                </p>
              </div>
            </div>

            <Progress
              percent={Math.round((team.totalPoints / maxPoints) * 100)}
              showInfo={false}
              strokeColor="var(--ds-brand-accent)"
              trailColor="var(--ds-border-base)"
              size="small"
            />

            {/* Top members */}
            {team.topMembers.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {team.topMembers.slice(0, 3).map((m) => (
                  <div
                    key={m.userId}
                    className="flex items-center gap-1.5 bg-ds-surface-base rounded-full px-2 py-1 text-xs">
                    <Avatar
                      size={18}
                      className="bg-ds-brand-accent text-white text-[10px]">
                      {m.firstName.charAt(0)}
                    </Avatar>
                    <span className="text-ds-text-secondary">
                      {m.firstName} {m.lastName.charAt(0)}.
                    </span>
                    <span className="text-ds-brand-accent font-ds-mono font-semibold">
                      {m.score}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
