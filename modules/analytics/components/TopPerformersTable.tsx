"use client";

import { Avatar, Skeleton } from "antd";
import type { ColumnsType } from "antd/es/table";
import DataTable from "@/components/ui/DataTable";
import { RANK_LEVELS } from "@/config/ranks";
import { ANALYTICS_PAGE_CONTENT } from "@/config/content";

interface Props {
  performers: LeaderboardEntry[];
  userRole: string;
  loading?: boolean;
}

function getRankName(score: number): string {
  const rank = [...RANK_LEVELS].reverse().find((r) => score >= r.minScore);
  return rank ? `${rank.badge} ${rank.name}` : "🌱 Seed";
}

export default function TopPerformersTable({
  performers,
  userRole,
  loading = false,
}: Props) {
  if (loading) return <Skeleton active paragraph={{ rows: 5 }} />;

  const isAdmin =
    userRole === "ADMIN" ||
    userRole === "SUPER_ADMIN" ||
    userRole === "TEAM_LEAD";

  const columns: ColumnsType<LeaderboardEntry> = [
    {
      title: "#",
      dataIndex: "rank",
      key: "rank",
      width: 48,
      render: (r: number) => (
        <span className="font-bold text-ds-text-subtle text-sm">{r}</span>
      ),
    },
    {
      title: "Participant",
      key: "name",
      render: (_, rec) => (
        <div className="flex items-center gap-2">
          <Avatar
            size="small"
            src={rec.profilePicture}
            className="bg-ds-brand-accent text-white shrink-0">
            {rec.firstName.charAt(0)}
          </Avatar>
          <div>
            <div className="text-sm font-medium text-ds-text-primary">
              {rec.firstName} {rec.lastName}
            </div>
            <div className="text-xs text-ds-text-subtle">
              {getRankName(rec.score)}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Score",
      dataIndex: "score",
      key: "score",
      render: (s: number) => (
        <span className="font-semibold text-ds-brand-accent font-ds-mono">
          {s.toLocaleString()}
        </span>
      ),
    },
    ...(isAdmin
      ? [
          {
            title: "Impact",
            dataIndex: "impact",
            key: "impact",
            render: (v: number) => v.toLocaleString(),
          },
          {
            title: "Leadership",
            dataIndex: "leadership",
            key: "leadership",
            render: (v: number) => v.toLocaleString(),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-ds-text-primary text-lg">
        {ANALYTICS_PAGE_CONTENT.performersTitle}
      </h3>
      <DataTable<LeaderboardEntry>
        columns={columns}
        dataSource={performers}
        rowKey="userId"
        size="small"
        pagination={false}
      />
    </div>
  );
}
