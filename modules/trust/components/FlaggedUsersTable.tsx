"use client";

import { Tag, Button, Empty, Skeleton } from "antd";
import type { ColumnsType } from "antd/es/table";
import DataTable from "@/components/ui/DataTable";
import { TRUST_PAGE_CONTENT } from "@/config/content";
import TrustScoreIndicator from "./TrustScoreIndicator";

interface Props {
  users: TrustFlagRecord[];
  loading?: boolean;
  onReview: (userId: string) => void;
}

export default function FlaggedUsersTable({
  users,
  loading = false,
  onReview,
}: Props) {
  if (loading) return <Skeleton active paragraph={{ rows: 5 }} />;

  if (!users.length) {
    return (
      <Empty description={TRUST_PAGE_CONTENT.emptyTable} className="py-12" />
    );
  }

  const columns: ColumnsType<TrustFlagRecord> = [
    {
      title: "User",
      key: "user",
      render: (_, rec) => (
        <div>
          <div className="font-medium text-ds-text-primary">
            {rec.firstName} {rec.lastName}
          </div>
          <div className="text-xs text-ds-text-subtle">{rec.email}</div>
        </div>
      ),
    },
    {
      title: "Score",
      key: "score",
      render: (_, rec) => <TrustScoreIndicator score={rec.score} compact />,
    },
    {
      title: "Flags",
      key: "flags",
      render: (_, rec) => (
        <div className="flex flex-wrap gap-1">
          {(rec.flags as unknown as string[]).map((f) => (
            <Tag key={f} color="red" className="text-xs">
              {f.replace(/_/g, " ")}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: "Last Reviewed",
      dataIndex: "lastReviewedAt",
      key: "lastReviewedAt",
      render: (d?: string) =>
        d ? (
          new Date(d).toLocaleDateString()
        ) : (
          <span className="text-ds-text-subtle text-xs">Never</span>
        ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, rec) => (
        <Button size="small" onClick={() => onReview(rec.userId)}>
          {TRUST_PAGE_CONTENT.reviewButton}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-ds-text-primary text-lg">
        {TRUST_PAGE_CONTENT.title}
      </h3>
      <DataTable<TrustFlagRecord>
        columns={columns}
        dataSource={users}
        rowKey="userId"
        size="small"
        pagination={{ pageSize: 10, showTotal: (t) => `${t} flagged` }}
      />
    </div>
  );
}
