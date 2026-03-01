"use client";

import { Tag, Skeleton, Empty } from "antd";
import type { ColumnsType } from "antd/es/table";
import DataTable from "@/components/ui/DataTable";
import { DONATION_PAGE_CONTENT } from "@/config/content";

interface Props {
  donations: Donation[];
  total: number;
  page: number;
  onPageChange: (p: number) => void;
  loading?: boolean;
  currency?: string;
}

function formatCurrency(amount: number, currency = "NGN"): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function statusColor(status: string): string {
  const map: Record<string, string> = {
    COMPLETED: "green",
    VERIFIED: "green",
    PENDING: "orange",
    RECEIVED: "blue",
    REJECTED: "red",
    FAILED: "red",
    REFUNDED: "purple",
  };
  return map[status] ?? "default";
}

const COLUMNS: ColumnsType<Donation> = [
  {
    title: "Reference",
    dataIndex: "reference",
    key: "reference",
    render: (ref: string) => (
      <span className="font-ds-mono text-xs text-ds-text-subtle">{ref}</span>
    ),
  },
  {
    title: "Amount",
    key: "amount",
    render: (_, rec) => (
      <span className="font-semibold text-ds-text-primary">
        {formatCurrency(rec.amount, rec.currency)}
      </span>
    ),
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (status: string) => <Tag color={statusColor(status)}>{status}</Tag>,
  },
  {
    title: "Date",
    dataIndex: "createdAt",
    key: "createdAt",
    render: (d: string) =>
      new Date(d).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
  },
];

export default function DonationHistory({
  donations,
  total,
  page,
  onPageChange,
  loading = false,
  currency = "NGN",
}: Props) {
  if (loading) return <Skeleton active paragraph={{ rows: 5 }} />;

  if (!donations.length) {
    return (
      <Empty
        description={DONATION_PAGE_CONTENT.emptyHistory}
        className="py-12"
      />
    );
  }

  void currency; // used via the render fn above; suppress unused warning

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-ds-text-primary text-lg">
        {DONATION_PAGE_CONTENT.historyTitle}
      </h3>
      <DataTable<Donation>
        columns={COLUMNS}
        dataSource={donations}
        rowKey="id"
        size="small"
        pagination={{
          current: page,
          total,
          pageSize: 10,
          onChange: onPageChange,
          showTotal: (t) => `${t} donations`,
        }}
      />
    </div>
  );
}
