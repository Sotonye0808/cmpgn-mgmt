"use client";

import { useState } from "react";
import { Divider } from "antd";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { TEAM_PAGE_CONTENT } from "@/config/content";
import { UserManagementPanel } from "@/modules/users";
import { useLeaderboard } from "@/modules/leaderboard/hooks/useLeaderboard";
import LeaderboardTable from "@/modules/leaderboard/components/LeaderboardTable";
import LeaderboardFilters from "@/modules/leaderboard/components/LeaderboardFilters";
import Spinner from "@/components/ui/Spinner";

export default function TeamPage() {
  const { user } = useAuth();
  const { isAdmin } = useRole();
  const [filter, setFilter] = useState<LeaderboardFilter>("global");
  const [page, setPage] = useState(1);

  const { entries, myRank, total, loading } = useLeaderboard({
    filter,
    page,
    pageSize: 20,
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-ds-text-primary">
          {TEAM_PAGE_CONTENT.title}
        </h1>
        <p className="text-sm text-ds-text-secondary mt-1">
          {TEAM_PAGE_CONTENT.subtitle}
        </p>
      </div>

      {isAdmin ? (
        /* Admin & Super Admin: full user management */
        <UserManagementPanel />
      ) : (
        /* Team Lead: team performance overview */
        <div className="space-y-4">
          {/* My rank card (brief) */}
          {myRank && (
            <div className="glass-surface rounded-ds-xl p-4 flex items-center gap-4">
              <div className="text-4xl font-bold font-ds-mono text-ds-brand-accent">
                #{myRank.position}
              </div>
              <div>
                <p className="text-sm font-semibold text-ds-text-primary">
                  Your current rank
                </p>
                <p className="text-xs text-ds-text-subtle">
                  {myRank.score} pts · {total} total participants
                </p>
              </div>
            </div>
          )}

          <Divider className="my-0" />

          {/* Filters */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ds-text-primary">
              {TEAM_PAGE_CONTENT.performanceTitle}
            </h2>
            <LeaderboardFilters
              value={filter}
              onChange={(f) => {
                setFilter(f);
                setPage(1);
              }}
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Spinner />
            </div>
          ) : (
            <LeaderboardTable
              entries={entries}
              total={total}
              page={page}
              pageSize={20}
              loading={loading}
              currentUserId={user?.id}
              onPageChange={setPage}
            />
          )}
        </div>
      )}
    </div>
  );
}
