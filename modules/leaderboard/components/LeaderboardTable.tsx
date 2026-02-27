"use client";

import { Table, Avatar, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { formatNumber } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { RANK_LEVELS } from "@/config/ranks";

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  total: number;
  page: number;
  pageSize: number;
  loading?: boolean;
  currentUserId?: string;
  onPageChange?: (page: number) => void;
  className?: string;
}

const RANK_MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

const getRankLevel = (score: number): RankLevel =>
  [...RANK_LEVELS]
    .sort((a, b) => b.minScore - a.minScore)
    .find((r) => score >= r.minScore) ?? RANK_LEVELS[0];

export default function LeaderboardTable({
  entries,
  total,
  page,
  pageSize,
  loading,
  currentUserId,
  onPageChange,
  className,
}: LeaderboardTableProps) {
  const COLUMNS: ColumnsType<LeaderboardEntry> = [
    {
      title: "#",
      dataIndex: "rank",
      key: "rank",
      width: 56,
      render: (rank: number) => (
        <span className="font-ds-mono font-bold text-ds-text-subtle">
          {RANK_MEDAL[rank] ?? rank}
        </span>
      ),
    },
    {
      title: "Participant",
      key: "participant",
      render: (_, entry) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={entry.profilePicture}
            size={36}
            className="flex-shrink-0">
            {entry.firstName[0]}
          </Avatar>
          <div>
            <p className="text-sm font-medium text-ds-text-primary leading-tight">
              {entry.firstName} {entry.lastName}
              {entry.userId === currentUserId && (
                <span className="ml-1.5 text-xs text-ds-brand-accent">
                  (You)
                </span>
              )}
            </p>
            <p className="text-xs text-ds-text-subtle">
              {getRankLevel(entry.score).badge} {getRankLevel(entry.score).name}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Score",
      dataIndex: "score",
      key: "score",
      width: 90,
      render: (score: number) => (
        <span className="font-ds-mono font-bold text-ds-brand-accent">
          {formatNumber(score)}
        </span>
      ),
    },
    {
      title: () => (
        <Tooltip title="Impact Points">
          <span>IP</span>
        </Tooltip>
      ),
      dataIndex: "impact",
      key: "impact",
      width: 64,
      render: (v: number) => (
        <span className="font-ds-mono text-ds-chart-3 text-xs">
          {formatNumber(v)}
        </span>
      ),
      responsive: ["md"],
    },
    {
      title: () => (
        <Tooltip title="Consistency Points">
          <span>CP</span>
        </Tooltip>
      ),
      dataIndex: "consistency",
      key: "consistency",
      width: 64,
      render: (v: number) => (
        <span className="font-ds-mono text-ds-brand-success text-xs">
          {formatNumber(v)}
        </span>
      ),
      responsive: ["md"],
    },
    {
      title: () => (
        <Tooltip title="Leadership Points">
          <span>LP</span>
        </Tooltip>
      ),
      dataIndex: "leadership",
      key: "leadership",
      width: 64,
      render: (v: number) => (
        <span className="font-ds-mono text-ds-chart-4 text-xs">
          {formatNumber(v)}
        </span>
      ),
      responsive: ["lg"],
    },
    {
      title: () => (
        <Tooltip title="Reliability Points">
          <span>RP</span>
        </Tooltip>
      ),
      dataIndex: "reliability",
      key: "reliability",
      width: 64,
      render: (v: number) => (
        <span className="font-ds-mono text-ds-brand-accent text-xs">
          {formatNumber(v)}
        </span>
      ),
      responsive: ["lg"],
    },
  ];

  return (
    <Table<LeaderboardEntry>
      rowKey="userId"
      dataSource={entries}
      columns={COLUMNS}
      loading={loading}
      pagination={{
        current: page,
        pageSize,
        total,
        onChange: onPageChange,
        showSizeChanger: false,
        showTotal: (t) => `${t} participants`,
      }}
      rowClassName={(entry) =>
        cn(
          "transition-colors",
          entry.userId === currentUserId
            ? "bg-ds-brand-accent-subtle hover:bg-ds-brand-accent-subtle"
            : "",
        )
      }
      className={cn("leaderboard-table", className)}
      size="small"
    />
  );
}
