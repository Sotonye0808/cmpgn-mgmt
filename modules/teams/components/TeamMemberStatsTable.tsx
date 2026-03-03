"use client";

import { Avatar, Tag, Button } from "antd";
import Link from "next/link";
import type { ColumnsType } from "antd/es/table";
import DataTable from "@/components/ui/DataTable";
import { formatNumber } from "@/lib/utils/format";
import { ROUTES } from "@/config/routes";
import type { TeamMemberStat } from "@/modules/teams/services/teamService";

interface TeamMemberStatsTableProps {
  stats: TeamMemberStat[];
  loading?: boolean;
  currentUserId?: string;
  onRemove?: (userId: string) => void;
}

const ROLE_COLOR: Record<string, string> = {
  TEAM_LEAD: "gold",
  ADMIN: "red",
  SUPER_ADMIN: "purple",
  USER: "default",
};

export default function TeamMemberStatsTable({
  stats,
  loading,
  currentUserId,
  onRemove,
}: TeamMemberStatsTableProps) {
  const columns: ColumnsType<TeamMemberStat> = [
    {
      title: "#",
      key: "rank",
      width: 40,
      render: (_, __, idx) => (
        <span className="font-ds-mono text-xs text-ds-text-subtle">{idx + 1}</span>
      ),
    },
    {
      title: "Member",
      key: "member",
      render: (_, stat) => {
        const isSelf = stat.id === currentUserId;
        const href = isSelf ? ROUTES.SETTINGS : ROUTES.USER_DETAIL(stat.id);
        return (
          <Link href={href} className="group flex items-center gap-2 hover:no-underline">
            <Avatar src={stat.profilePicture} size={32} className="flex-shrink-0">
              {stat.firstName[0]}
            </Avatar>
            <div>
              <p className="text-sm font-medium text-ds-text-primary group-hover:text-ds-brand-accent transition-colors leading-tight">
                {stat.firstName} {stat.lastName}
                {isSelf && (
                  <span className="ml-1 text-xs text-ds-brand-accent">(You)</span>
                )}
              </p>
              <Tag color={ROLE_COLOR[stat.role] ?? "default"} className="text-xs mt-0.5">
                {stat.role.replace("_", " ")}
              </Tag>
            </div>
          </Link>
        );
      },
    },
    {
      title: "Points",
      dataIndex: "totalPoints",
      key: "points",
      width: 90,
      render: (pts: number) => (
        <span className="font-ds-mono font-bold text-ds-brand-accent">
          {formatNumber(pts)}
        </span>
      ),
    },
    {
      title: "Rank",
      key: "rank",
      width: 120,
      render: (_, stat) => (
        <span className="text-xs text-ds-text-secondary">
          {stat.rankBadge} {stat.rankName}
        </span>
      ),
    },
    {
      title: "Donations",
      dataIndex: "donationCount",
      key: "donations",
      width: 90,
      render: (count: number) => (
        <span className="font-ds-mono text-ds-text-secondary text-sm">{count}</span>
      ),
      responsive: ["sm"],
    },
    ...(onRemove
      ? [
          {
            title: "",
            key: "actions",
            width: 70,
            render: (_: unknown, stat: TeamMemberStat) => (
              <Button
                type="link"
                danger
                size="small"
                onClick={() => onRemove(stat.id)}>
                Remove
              </Button>
            ),
          },
        ]
      : []),
  ];

  return (
    <DataTable<TeamMemberStat>
      rowKey="id"
      dataSource={stats}
      columns={columns}
      loading={loading}
      size="small"
      pagination={false}
    />
  );
}
