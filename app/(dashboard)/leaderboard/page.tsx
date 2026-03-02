"use client";

import { useState } from "react";
import { Divider, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useAuth } from "@/hooks/useAuth";
import { useLeaderboard } from "@/modules/leaderboard/hooks/useLeaderboard";
import LeaderboardTable from "@/modules/leaderboard/components/LeaderboardTable";
import LeaderboardPodium from "@/modules/leaderboard/components/LeaderboardPodium";
import LeaderboardFilters from "@/modules/leaderboard/components/LeaderboardFilters";
import MyRankCard from "@/modules/leaderboard/components/MyRankCard";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import Spinner from "@/components/ui/Spinner";
import PeriodSelector, { type Period } from "@/components/ui/PeriodSelector";
import { LEADERBOARD_PAGE_CONTENT } from "@/config/content";
import { formatNumber } from "@/lib/utils/format";

// ─── Team leaderboard columns ────────────────────────────────────────────────
const TEAM_COLUMNS: ColumnsType<TeamLeaderboardEntry> = [
  {
    title: "#",
    dataIndex: "rank",
    key: "rank",
    width: 56,
    render: (r: number) => (
      <span className="font-ds-mono font-bold text-ds-text-subtle">{r}</span>
    ),
  },
  {
    title: "Team",
    dataIndex: "teamName",
    key: "teamName",
    render: (name: string) => (
      <span className="text-sm font-medium text-ds-text-primary">{name}</span>
    ),
  },
  {
    title: "Group",
    dataIndex: "groupName",
    key: "groupName",
    render: (name: string) => <Tag color="blue">{name}</Tag>,
  },
  {
    title: "Members",
    dataIndex: "memberCount",
    key: "memberCount",
    width: 90,
    render: (n: number) => (
      <span className="font-ds-mono text-ds-text-secondary">{n}</span>
    ),
  },
  {
    title: "Score",
    dataIndex: "score",
    key: "score",
    width: 100,
    render: (s: number) => (
      <span className="font-ds-mono font-bold text-ds-brand-accent">
        {formatNumber(s)}
      </span>
    ),
  },
];

// ─── Group leaderboard columns ───────────────────────────────────────────────
const GROUP_COLUMNS: ColumnsType<GroupLeaderboardEntry> = [
  {
    title: "#",
    dataIndex: "rank",
    key: "rank",
    width: 56,
    render: (r: number) => (
      <span className="font-ds-mono font-bold text-ds-text-subtle">{r}</span>
    ),
  },
  {
    title: "Group",
    dataIndex: "groupName",
    key: "groupName",
    render: (name: string) => (
      <span className="text-sm font-medium text-ds-text-primary">{name}</span>
    ),
  },
  {
    title: "Teams",
    dataIndex: "teamCount",
    key: "teamCount",
    width: 80,
    render: (n: number) => (
      <span className="font-ds-mono text-ds-text-secondary">{n}</span>
    ),
  },
  {
    title: "Members",
    dataIndex: "memberCount",
    key: "memberCount",
    width: 90,
    render: (n: number) => (
      <span className="font-ds-mono text-ds-text-secondary">{n}</span>
    ),
  },
  {
    title: "Score",
    dataIndex: "score",
    key: "score",
    width: 100,
    render: (s: number) => (
      <span className="font-ds-mono font-bold text-ds-brand-accent">
        {formatNumber(s)}
      </span>
    ),
  },
];

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<LeaderboardFilter>("global");
  const [campaignId, setCampaignId] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const [days, setDays] = useState<Period>(30);

  const { entries, myRank, total, loading } = useLeaderboard({
    filter,
    campaignId,
    page,
    pageSize: 20,
    days,
  });

  const isIndividualMode = filter === "individual" || filter === "global";

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={LEADERBOARD_PAGE_CONTENT.title}
        subtitle={LEADERBOARD_PAGE_CONTENT.subtitle}
      />

      {/* Controls row — separate from header so they wrap naturally */}
      <div className="flex flex-wrap items-center gap-3">
        <LeaderboardFilters
          value={filter}
          campaignId={campaignId}
          onChange={(f, cId) => {
            setFilter(f);
            setCampaignId(cId);
            setPage(1);
          }}
        />
        <PeriodSelector
          value={days}
          onChange={(v) => {
            setDays(v);
            setPage(1);
          }}
          label="Period:"
        />
      </div>

      {/* My Rank Card — only relevant in individual modes */}
      {myRank && user && isIndividualMode && (
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
          {/* Podium — individual/global only */}
          {isIndividualMode && entries.length >= 3 && (
            <>
              <LeaderboardPodium entries={entries} currentUserId={user?.id} />
              <Divider className="my-0" />
            </>
          )}

          {/* Team leaderboard table */}
          {filter === "team" && (
            <DataTable<TeamLeaderboardEntry>
              columns={TEAM_COLUMNS}
              dataSource={entries as unknown as TeamLeaderboardEntry[]}
              rowKey="teamId"
              size="middle"
              pagination={{
                current: page,
                pageSize: 20,
                total,
                onChange: setPage,
                showSizeChanger: false,
              }}
            />
          )}

          {/* Group leaderboard table */}
          {filter === "group" && (
            <DataTable<GroupLeaderboardEntry>
              columns={GROUP_COLUMNS}
              dataSource={entries as unknown as GroupLeaderboardEntry[]}
              rowKey="groupId"
              size="middle"
              pagination={{
                current: page,
                pageSize: 20,
                total,
                onChange: setPage,
                showSizeChanger: false,
              }}
            />
          )}

          {/* Individual / global leaderboard table */}
          {isIndividualMode && (
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
        </>
      )}
    </div>
  );
}
