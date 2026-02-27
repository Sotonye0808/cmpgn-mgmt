"use client";

import { useState } from "react";
import { Divider } from "antd";
import { useAuth } from "@/hooks/useAuth";
import { useLeaderboard } from "@/modules/leaderboard/hooks/useLeaderboard";
import LeaderboardTable from "@/modules/leaderboard/components/LeaderboardTable";
import LeaderboardPodium from "@/modules/leaderboard/components/LeaderboardPodium";
import LeaderboardFilters from "@/modules/leaderboard/components/LeaderboardFilters";
import MyRankCard from "@/modules/leaderboard/components/MyRankCard";
import Spinner from "@/components/ui/Spinner";
import { LEADERBOARD_PAGE_CONTENT } from "@/config/content";

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<LeaderboardFilter>("global");
  const [page, setPage] = useState(1);

  const { entries, myRank, total, loading } = useLeaderboard({
    filter,
    page,
    pageSize: 20,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ds-text-primary">
            {LEADERBOARD_PAGE_CONTENT.title}
          </h1>
          <p className="text-sm text-ds-text-subtle mt-1">
            {LEADERBOARD_PAGE_CONTENT.subtitle}
          </p>
        </div>
        <LeaderboardFilters
          value={filter}
          onChange={(f) => {
            setFilter(f);
            setPage(1);
          }}
        />
      </div>

      {/* My Rank Card */}
      {myRank && user && (
        <MyRankCard
          rankInfo={myRank}
          firstName={user.firstName}
          totalParticipants={total}
        />
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <>
          {/* Podium (top 3) */}
          {entries.length >= 3 && (
            <>
              <LeaderboardPodium entries={entries} />
              <Divider className="my-0" />
            </>
          )}

          {/* Full table */}
          <LeaderboardTable
            entries={entries}
            total={total}
            page={page}
            pageSize={20}
            loading={loading}
            currentUserId={user?.id}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
