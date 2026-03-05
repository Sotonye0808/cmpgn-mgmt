"use client";

import { useState, useEffect, useCallback } from "react";
import { Segmented, Skeleton, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import Link from "next/link";
import GlassCard from "@/components/ui/GlassCard";
import DataTable from "@/components/ui/DataTable";
import { ICONS } from "@/config/icons";
import { ROUTES } from "@/config/routes";
import { formatDate, formatNumber } from "@/lib/utils/format";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_OPTIONS: Array<{ label: string; value: string }> = [
  { label: "All", value: "" },
  { label: "Active", value: "ACTIVE" },
  { label: "Draft", value: "DRAFT" },
  { label: "Paused", value: "PAUSED" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Archived", value: "ARCHIVED" },
];

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: "success",
  DRAFT: "default",
  PAUSED: "warning",
  COMPLETED: "processing",
  ARCHIVED: "error",
};

const PAGE_SIZE = 8;

// ─── Types ────────────────────────────────────────────────────────────────────

interface CampaignRow {
  id: string;
  title: string;
  status: string;
  participantCount: number;
  viewCount: number;
  createdAt: string;
  goalType?: string;
  goalTarget?: number;
  goalCurrent?: number;
}

// ─── Columns ──────────────────────────────────────────────────────────────────

const COLUMNS: ColumnsType<CampaignRow> = [
  {
    title: "Campaign",
    key: "title",
    width: 220,
    ellipsis: true,
    render: (_, rec) => (
      <Link
        href={ROUTES.CAMPAIGN_DETAIL(rec.id)}
        className="text-ds-text-primary font-medium hover:text-ds-brand-accent transition-colors">
        {rec.title}
      </Link>
    ),
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    width: 110,
    render: (s: string) => <Tag color={STATUS_COLOR[s] ?? "default"}>{s}</Tag>,
  },
  {
    title: "Participants",
    dataIndex: "participantCount",
    key: "participantCount",
    width: 110,
    render: (n: number) => (
      <span className="font-ds-mono text-ds-text-primary">
        {formatNumber(n)}
      </span>
    ),
    sorter: (a, b) => a.participantCount - b.participantCount,
  },
  {
    title: "Views",
    dataIndex: "viewCount",
    key: "viewCount",
    width: 90,
    render: (n: number) => (
      <span className="font-ds-mono text-ds-text-subtle">
        {formatNumber(n)}
      </span>
    ),
    sorter: (a, b) => a.viewCount - b.viewCount,
    responsive: ["md"],
  },
  {
    title: "Goal",
    key: "goal",
    width: 110,
    responsive: ["lg"],
    render: (_, rec) => {
      if (!rec.goalTarget || !rec.goalType)
        return <span className="text-ds-text-muted">—</span>;
      const pct = Math.min(
        100,
        Math.round(((rec.goalCurrent ?? 0) / rec.goalTarget) * 100),
      );
      return (
        <span className="text-xs text-ds-text-subtle font-ds-mono">
          {rec.goalCurrent ?? 0}/{rec.goalTarget} ({pct}%)
        </span>
      );
    },
  },
  {
    title: "Created",
    dataIndex: "createdAt",
    key: "createdAt",
    width: 110,
    render: (d: string) => formatDate(d),
    responsive: ["lg"],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function CampaignStatusSection() {
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
      });
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`${ROUTES.API.CAMPAIGNS.BASE}?${params}`);
      if (!res.ok) return;
      const json = await res.json();
      setCampaigns(json.data ?? []);
      setTotal(json.pagination?.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  useAutoRefresh("campaigns", fetchCampaigns);

  const handleStatusChange = (val: string) => {
    setStatusFilter(val);
    setPage(1);
  };

  return (
    <GlassCard padding="lg">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <ICONS.campaigns className="text-ds-brand-accent text-lg" />
          <h2 className="text-lg font-semibold text-ds-text-primary">
            Campaign Status Views
          </h2>
          {!loading && (
            <span className="text-xs text-ds-text-subtle ml-1">
              ({total} total)
            </span>
          )}
        </div>

        {/* Status filter */}
        <Segmented
          size="small"
          options={STATUS_OPTIONS}
          value={statusFilter}
          onChange={(v) => handleStatusChange(v as string)}
          className="bg-ds-surface-elevated"
        />
      </div>

      {/* Table */}
      {loading ? (
        <Skeleton active paragraph={{ rows: 5 }} />
      ) : (
        <DataTable<CampaignRow>
          rowKey="id"
          columns={COLUMNS}
          dataSource={campaigns}
          loading={loading}
          size="small"
          maxBodyHeight={false}
          pagination={{
            current: page,
            total,
            pageSize: PAGE_SIZE,
            onChange: (p) => setPage(p),
            showSizeChanger: false,
            showTotal: (t) => `${t} campaigns`,
          }}
          scroll={{ x: "max-content" }}
        />
      )}
    </GlassCard>
  );
}
