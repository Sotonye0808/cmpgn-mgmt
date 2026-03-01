"use client";

import { Skeleton, Select } from "antd";
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
}

export default function ProofList({
  proofs,
  loading = false,
  canReview = false,
  onReviewed,
  campaignMap,
  userMap,
  emptyText,
}: Props) {
  if (loading) return <Skeleton active paragraph={{ rows: 4 }} />;
  if (proofs.length === 0) {
    return (
      <Empty description={emptyText ?? PROOFS_PAGE_CONTENT.myProofsEmpty} />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {proofs.map((proof) => (
        <ProofCard
          key={proof.id}
          proof={proof}
          canReview={canReview}
          onReviewed={onReviewed}
          campaignTitle={campaignMap?.[proof.campaignId]}
          userName={userMap?.[proof.userId]}
        />
      ))}
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
