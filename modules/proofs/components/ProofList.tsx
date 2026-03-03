"use client";

import { Skeleton, Select, Checkbox } from "antd";
import Empty from "@/components/ui/Empty";
import ProofCard from "./ProofCard";
import { PROOFS_PAGE_CONTENT } from "../config";

interface Props {
  proofs: ViewProof[];
  loading?: boolean;
  canReview?: boolean;
  onReviewed?: () => void;
  /** Optional map of campaignId → title for enrichment */
  campaignMap?: Record<string, string>;
  /** Optional map of userId → displayName for enrichment */
  userMap?: Record<string, string>;
  emptyText?: string;
  /** Batch selection support */
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
}

export default function ProofList({
  proofs,
  loading = false,
  canReview = false,
  onReviewed,
  campaignMap,
  userMap,
  emptyText,
  selectedIds,
  onSelectionChange,
}: Props) {
  if (loading) return <Skeleton active paragraph={{ rows: 4 }} />;
  if (proofs.length === 0) {
    return (
      <Empty description={emptyText ?? PROOFS_PAGE_CONTENT.myProofsEmpty} />
    );
  }

  const pendingProofs = proofs.filter((p) => (p.status as string) === "PENDING");
  const allPendingSelected = pendingProofs.length > 0 && pendingProofs.every((p) => selectedIds?.has(p.id));
  const somePendingSelected = pendingProofs.some((p) => selectedIds?.has(p.id));

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;
    const next = new Set(selectedIds);
    for (const p of pendingProofs) {
      if (checked) next.add(p.id);
      else next.delete(p.id);
    }
    onSelectionChange(next);
  };

  const handleToggle = (proofId: string, checked: boolean) => {
    if (!onSelectionChange) return;
    const next = new Set(selectedIds);
    if (checked) next.add(proofId);
    else next.delete(proofId);
    onSelectionChange(next);
  };

  return (
    <div>
      {/* Select all row (only shown with batch support and pending proofs) */}
      {onSelectionChange && pendingProofs.length > 0 && (
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-ds-border">
          <Checkbox
            indeterminate={somePendingSelected && !allPendingSelected}
            checked={allPendingSelected}
            onChange={(e) => handleSelectAll(e.target.checked)}
          />
          <span className="text-xs text-ds-text-subtle">
            Select all pending ({pendingProofs.length})
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {proofs.map((proof) => {
          const isPending = (proof.status as string) === "PENDING";
          const isSelected = selectedIds?.has(proof.id) ?? false;

          return (
            <div key={proof.id} className="relative">
              {/* Checkbox overlay for pending proofs in batch mode */}
              {onSelectionChange && isPending && (
                <div className="absolute top-2 left-2 z-10">
                  <Checkbox
                    checked={isSelected}
                    onChange={(e) => handleToggle(proof.id, e.target.checked)}
                  />
                </div>
              )}
              <div className={isSelected ? "ring-2 ring-ds-brand-accent rounded-ds-lg" : ""}>
                <ProofCard
                  proof={proof}
                  canReview={canReview}
                  onReviewed={onReviewed}
                  campaignTitle={
                    proof.campaignTitle ?? campaignMap?.[proof.campaignId]
                  }
                  userName={proof.userName ?? userMap?.[proof.userId]}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── ProofStatusFilter — used to filter proofs by status ─────────────────────

interface ProofStatusFilterProps {
  value: string;
  onChange: (v: string) => void;
}

export function ProofStatusFilter({ value, onChange }: ProofStatusFilterProps) {
  return (
    <Select
      value={value}
      onChange={onChange}
      options={[
        { value: "", label: "All Statuses" },
        { value: "PENDING", label: "Pending Review" },
        { value: "APPROVED", label: "Approved" },
        { value: "REJECTED", label: "Rejected" },
      ]}
      className="w-44"
    />
  );
}
