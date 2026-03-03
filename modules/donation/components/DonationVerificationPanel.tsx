"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Tag,
  Button,
  Select,
  Input,
  Modal,
  Image,
  Descriptions,
  message,
  Space,
  Popconfirm,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { TableRowSelection } from "antd/es/table/interface";
import Link from "next/link";
import DataTable from "@/components/ui/DataTable";
import { ICONS } from "@/config/icons";
import { ROUTES } from "@/config/routes";
import { DONATION_STATUS_CONFIG } from "@/config/bankAccounts";
import { getBankAccountById } from "@/config/bankAccounts";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { formatDate } from "@/lib/utils/format";

interface EnrichedDonation extends Donation {
  userName?: string;
  campaignTitle?: string;
}

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "All Statuses" },
  ...Object.entries(DONATION_STATUS_CONFIG).map(([value, { label }]) => ({
    value,
    label,
  })),
];

export default function DonationVerificationPanel() {
  const [donations, setDonations] = useState<EnrichedDonation[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDonation, setSelectedDonation] =
    useState<EnrichedDonation | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [batchVerifying, setBatchVerifying] = useState(false);

  const fetchDonations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (statusFilter) params.set("status", statusFilter);
      if (searchTerm) params.set("search", searchTerm);

      const res = await fetch(
        `${ROUTES.API.DONATIONS.BASE}/admin?${params.toString()}`,
      );
      if (!res.ok) throw new Error("Failed to load donations");
      const json = await res.json();
      setDonations(json.data ?? []);
      setTotal(json.pagination?.total ?? 0);
    } catch {
      message.error("Failed to load donations");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, searchTerm]);

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  useAutoRefresh("donations", fetchDonations);

  const handleVerify = async (action: "VERIFIED" | "REJECTED") => {
    if (!selectedDonation) return;
    setVerifying(true);
    try {
      const res = await fetch(
        ROUTES.API.DONATIONS.DETAIL(selectedDonation.id) + "/verify",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        },
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Verification failed");
      }
      message.success(
        `Donation ${action === "VERIFIED" ? "verified" : "rejected"}`,
      );
      setSelectedDonation(null);
      fetchDonations();
    } catch (e) {
      message.error(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setVerifying(false);
    }
  };

  // ─── Batch verify / reject ─────────────────────────────────────────────────

  const handleBatchVerify = async (action: "VERIFIED" | "REJECTED") => {
    if (selectedRowKeys.length === 0) return;
    setBatchVerifying(true);
    try {
      const res = await fetch(ROUTES.API.DONATIONS.BATCH_VERIFY, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedRowKeys as string[], action }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? `Batch ${action.toLowerCase()} failed`);
      }
      const json = await res.json();
      const result = json.data as { updated: number; skipped: number };
      message.success(
        `${result.updated} donation${result.updated !== 1 ? "s" : ""} ${action === "VERIFIED" ? "verified" : "rejected"}${result.skipped > 0 ? ` (${result.skipped} skipped)` : ""}`,
      );
      setSelectedRowKeys([]);
      fetchDonations();
    } catch (e) {
      message.error(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setBatchVerifying(false);
    }
  };

  // Only allow selecting donations in verifiable states
  const rowSelection: TableRowSelection<EnrichedDonation> = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
    getCheckboxProps: (record) => ({
      disabled:
        record.status !== "RECEIVED" && record.status !== "PENDING",
    }),
  };

  const columns: ColumnsType<EnrichedDonation> = [
    {
      title: "Reference",
      dataIndex: "reference",
      key: "reference",
      render: (ref: string) => (
        <span className="font-ds-mono text-xs text-ds-text-subtle">{ref}</span>
      ),
    },
    {
      title: "Donor",
      key: "donor",
      render: (_: unknown, rec: EnrichedDonation) => (
        <Link
          href={ROUTES.USER_DETAIL(rec.userId)}
          className="text-ds-text-primary font-medium hover:text-ds-brand-accent transition-colors">
          {rec.userName}
        </Link>
      ),
    },
    {
      title: "Campaign",
      dataIndex: "campaignTitle",
      key: "campaignTitle",
      ellipsis: true,
    },
    {
      title: "Amount",
      key: "amount",
      render: (_, rec) => (
        <span className="font-semibold text-ds-text-primary font-ds-mono">
          {new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: rec.currency,
            maximumFractionDigits: 0,
          }).format(rec.amount)}
        </span>
      ),
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const cfg = DONATION_STATUS_CONFIG[status];
        return (
          <Tag color={cfg?.color ?? "default"}>{cfg?.label ?? status}</Tag>
        );
      },
    },
    {
      title: "Proof",
      key: "proof",
      render: (_, rec) =>
        rec.proofScreenshotUrl ? (
          <Tag color="blue" className="cursor-pointer">
            Uploaded
          </Tag>
        ) : (
          <Tag>None</Tag>
        ),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (d: string) => formatDate(d),
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, rec) => (
        <Button
          type="link"
          size="small"
          icon={<ICONS.view />}
          onClick={() => setSelectedDonation(rec)}>
          View
        </Button>
      ),
    },
  ];

  const bankInfo = selectedDonation?.bankAccountId
    ? getBankAccountById(selectedDonation.bankAccountId)
    : null;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          options={STATUS_FILTER_OPTIONS}
          className="w-48"
          placeholder="Filter by status"
        />
        <Input.Search
          placeholder="Search by reference or donor name"
          allowClear
          onSearch={setSearchTerm}
          className="w-72"
        />
      </div>

      {/* Batch action bar */}
      {selectedRowKeys.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg bg-ds-surface-glass border border-ds-border">
          <span className="text-sm text-ds-text-primary font-medium">
            {selectedRowKeys.length} donation{selectedRowKeys.length !== 1 ? "s" : ""} selected
          </span>
          <div className="flex-1" />
          <Popconfirm
            title={`Verify ${selectedRowKeys.length} donation${selectedRowKeys.length !== 1 ? "s" : ""}?`}
            onConfirm={() => handleBatchVerify("VERIFIED")}
            okText="Yes"
            cancelText="No">
            <Button
              type="primary"
              size="small"
              loading={batchVerifying}
              icon={<ICONS.check />}>
              Verify Selected
            </Button>
          </Popconfirm>
          <Popconfirm
            title={`Reject ${selectedRowKeys.length} donation${selectedRowKeys.length !== 1 ? "s" : ""}?`}
            onConfirm={() => handleBatchVerify("REJECTED")}
            okText="Yes"
            cancelText="No">
            <Button
              danger
              size="small"
              loading={batchVerifying}
              icon={<ICONS.close />}>
              Reject Selected
            </Button>
          </Popconfirm>
        </div>
      )}

      {/* Table */}
      <DataTable<EnrichedDonation>
        columns={columns}
        dataSource={donations}
        rowKey="id"
        loading={loading}
        rowSelection={rowSelection}
        pagination={{
          current: page,
          total,
          pageSize: 10,
          onChange: (p) => setPage(p),
        }}
      />

      {/* Detail / Verify Modal */}
      <Modal
        open={!!selectedDonation}
        onCancel={() => setSelectedDonation(null)}
        title="Donation Details"
        width={640}
        footer={
          selectedDonation &&
          (selectedDonation.status === "RECEIVED" ||
            selectedDonation.status === "PENDING") ? (
            <Space>
              <Button
                danger
                loading={verifying}
                icon={<ICONS.close />}
                onClick={() => handleVerify("REJECTED")}>
                Reject
              </Button>
              <Button
                type="primary"
                loading={verifying}
                icon={<ICONS.check />}
                onClick={() => handleVerify("VERIFIED")}>
                Verify
              </Button>
            </Space>
          ) : null
        }>
        {selectedDonation && (
          <div className="space-y-4">
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="Reference">
                {selectedDonation.reference}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag
                  color={
                    DONATION_STATUS_CONFIG[String(selectedDonation.status)]
                      ?.color
                  }>
                  {DONATION_STATUS_CONFIG[String(selectedDonation.status)]
                    ?.label ?? String(selectedDonation.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Donor">
                {selectedDonation.userName}
              </Descriptions.Item>
              <Descriptions.Item label="Campaign">
                {selectedDonation.campaignTitle}
              </Descriptions.Item>
              <Descriptions.Item label="Amount">
                {new Intl.NumberFormat("en-NG", {
                  style: "currency",
                  currency: selectedDonation.currency,
                  maximumFractionDigits: 0,
                }).format(selectedDonation.amount)}
              </Descriptions.Item>
              <Descriptions.Item label="Date">
                {formatDate(selectedDonation.createdAt)}
              </Descriptions.Item>
              {bankInfo && (
                <>
                  <Descriptions.Item label="Bank" span={2}>
                    {bankInfo.bankName} — {bankInfo.accountNumber} (
                    {bankInfo.accountName})
                  </Descriptions.Item>
                </>
              )}
              {selectedDonation.notes && (
                <Descriptions.Item label="Notes" span={2}>
                  {selectedDonation.notes}
                </Descriptions.Item>
              )}
              {selectedDonation.verifiedById && (
                <Descriptions.Item label="Verified By" span={2}>
                  {selectedDonation.verifiedById} at{" "}
                  {selectedDonation.verifiedAt
                    ? new Date(selectedDonation.verifiedAt).toLocaleString()
                    : "N/A"}
                </Descriptions.Item>
              )}
            </Descriptions>

            {selectedDonation.proofScreenshotUrl && (
              <div>
                <p className="text-sm font-medium text-ds-text-primary mb-2">
                  Proof of Payment
                </p>
                <Image
                  src={selectedDonation.proofScreenshotUrl}
                  alt="Proof of payment"
                  className="rounded-ds-lg max-h-64"
                  fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMyMjIiLz48dGV4dCB4PSIxMDAiIHk9IjEwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzk5OSIgZm9udC1zaXplPSIxNCI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+"
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
