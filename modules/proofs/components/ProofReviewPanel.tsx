"use client";

import { useState, useMemo } from "react";
import { Select, Popconfirm, Input, App, Pagination } from "antd";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import ProofList, { ProofStatusFilter } from "./ProofList";
import { useProofs, useBatchReviewProof } from "../hooks/useProofs";
import { PROOFS_PAGE_CONTENT } from "../config";

interface Props {
  /** Campaigns the reviewer manages — used for campaign filter drop-down */
  campaigns: Campaign[];
  /** Map of userId → displayName for enrichment */
  userMap?: Record<string, string>;
}

export default function ProofReviewPanel({ campaigns, userMap }: Props) {
  const { message: msgApi } = App.useApp();
  const [filterCampaignId, setFilterCampaignId] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchNotes, setBatchNotes] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 6;

  const { proofs, loading, refresh } = useProofs(
    filterCampaignId || undefined,
    "team",
  );
  const { batchReview, loading: batchLoading } = useBatchReviewProof(() => {
    setSelectedIds(new Set());
    setBatchNotes("");
    refresh();
  });

  const campaignMap = useMemo(
    () => Object.fromEntries(campaigns.map((c) => [c.id, c.title])),
    [campaigns],
  );

  const campaignOptions = [
    { value: "", label: PROOFS_PAGE_CONTENT.allCampaigns },
    ...campaigns.map((c) => ({ value: c.id, label: c.title })),
  ];

  const filtered = useMemo(() => {
    const list = filterStatus
      ? proofs.filter((p) => (p.status as string) === filterStatus)
      : proofs;
    return list;
  }, [proofs, filterStatus]);

  // Reset to page 1 whenever the filter changes
  const handleFilterChange = (setter: (v: string) => void) => (val: string) => {
    setter(val);
    setCurrentPage(1);
  };

  const paginatedProofs = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const pendingCount = proofs.filter(
    (p) => (p.status as string) === "PENDING",
  ).length;

  const selectedCount = selectedIds.size;

  const handleBatchAction = async (status: "APPROVED" | "REJECTED") => {
    if (selectedIds.size === 0) return;
    const result = await batchReview({
      ids: Array.from(selectedIds),
      status,
      notes: batchNotes || undefined,
    });
    if (result) {
      msgApi.success(
        `${result.updated} proof${result.updated !== 1 ? "s" : ""} ${status === "APPROVED" ? "approved" : "rejected"}${result.skipped > 0 ? ` (${result.skipped} skipped)` : ""}`,
      );
    } else {
      msgApi.error("Batch review failed. Please try again.");
    }
  };

  return (
    <GlassCard padding="lg">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-ds-text-primary">
            {PROOFS_PAGE_CONTENT.teamProofsTitle}
          </h2>
          {pendingCount > 0 && (
            <p className="text-xs text-amber-400 mt-0.5">
              {pendingCount} proof{pendingCount > 1 ? "s" : ""} awaiting review
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Select
            value={filterCampaignId}
            onChange={handleFilterChange(setFilterCampaignId)}
            options={campaignOptions}
            placeholder={PROOFS_PAGE_CONTENT.campaignFilterLabel}
            className="w-56"
            showSearch
            filterOption={(input, option) =>
              (option?.label as string)
                ?.toLowerCase()
                .includes(input.toLowerCase())
            }
          />
          <ProofStatusFilter value={filterStatus} onChange={handleFilterChange(setFilterStatus)} />
        </div>
      </div>

      {/* Batch action bar — shown when proofs are selected */}
      {selectedCount > 0 && (
        <div className="flex flex-wrap items-center gap-3 mb-4 p-3 rounded-ds-md bg-ds-surface-glass border border-ds-border">
          <span className="text-sm text-ds-text-primary font-medium">
            {selectedCount} proof{selectedCount !== 1 ? "s" : ""} selected
          </span>
          <Input.TextArea
            rows={1}
            placeholder="Optional batch notes..."
            value={batchNotes}
            onChange={(e) => setBatchNotes(e.target.value)}
            className="flex-1 min-w-[200px] text-xs"
          />
          <Popconfirm
            title={`Approve ${selectedCount} proof${selectedCount !== 1 ? "s" : ""}?`}
            onConfirm={() => handleBatchAction("APPROVED")}
            okText="Yes"
            cancelText="No">
            <Button variant="primary" size="small" loading={batchLoading}>
              Approve Selected
            </Button>
          </Popconfirm>
          <Popconfirm
            title={`Reject ${selectedCount} proof${selectedCount !== 1 ? "s" : ""}?`}
            onConfirm={() => handleBatchAction("REJECTED")}
            okText="Yes"
            cancelText="No">
            <Button
              variant="ghost"
              size="small"
              loading={batchLoading}
              className="text-red-400">
              Reject Selected
            </Button>
          </Popconfirm>
        </div>
      )}

      <ProofList
        proofs={paginatedProofs}
        loading={loading}
        canReview
        onReviewed={refresh}
        campaignMap={campaignMap}
        userMap={userMap}
        emptyText={PROOFS_PAGE_CONTENT.teamProofsEmpty}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />

      {/* Pagination — only shown when there are more proofs than one page */}
      {filtered.length > PAGE_SIZE && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-ds-border-subtle">
          <p className="text-xs text-ds-text-subtle">
            Showing {(currentPage - 1) * PAGE_SIZE + 1}–
            {Math.min(currentPage * PAGE_SIZE, filtered.length)} of{" "}
            {filtered.length} proofs
          </p>
          <Pagination
            current={currentPage}
            pageSize={PAGE_SIZE}
            total={filtered.length}
            onChange={setCurrentPage}
            size="small"
            showSizeChanger={false}
          />
        </div>
      )}
    </GlassCard>
  );
}
