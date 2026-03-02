"use client";

import { useState } from "react";
import { Image, Popconfirm, Input, Tooltip } from "antd";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import { PROOF_STATUS_CONFIG, PROOFS_PAGE_CONTENT } from "../config";
import { useReviewProof } from "../hooks/useProofs";

interface Props {
  proof: ViewProof;
  canReview?: boolean;
  onReviewed?: () => void;
  /** Display name of the submitting user (enriched by parent) */
  userName?: string;
  campaignTitle?: string;
}

export default function ProofCard({
  proof,
  canReview = false,
  onReviewed,
  userName,
  campaignTitle,
}: Props) {
  const [notes, setNotes] = useState("");
  const { review, loading } = useReviewProof(onReviewed);

  const statusCfg =
    PROOF_STATUS_CONFIG[proof.status as string] ?? PROOF_STATUS_CONFIG.PENDING;

  const platformLabel = proof.platform as string;

  return (
    <GlassCard padding="md" className="flex flex-col gap-3">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div>
          {userName && (
            <p className="text-xs text-ds-text-subtle font-medium mb-0.5">
              {userName}
            </p>
          )}
          {campaignTitle && (
            <p className="text-xs text-ds-text-muted truncate max-w-[16rem]">
              {campaignTitle}
            </p>
          )}
        </div>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${statusCfg.bgToken} text-dynamic`}
          style={{ "--_dc": statusCfg.color } as React.CSSProperties}>
          {statusCfg.label}
        </span>
      </div>

      {/* Platform + date */}
      <div className="flex items-center justify-between text-xs text-ds-text-subtle">
        <span className="font-medium">{platformLabel.replace("_", " ")}</span>
        <span>{new Date(proof.createdAt).toLocaleDateString()}</span>
      </div>

      {/* Screenshot */}
      <div className="rounded-ds-md overflow-hidden border border-ds-border bg-ds-surface">
        <Image
          src={proof.screenshotUrl}
          alt={`Proof on ${platformLabel}`}
          className="w-full object-cover max-h-48"
          fallback="https://placehold.co/400x300?text=Screenshot"
          preview={{ mask: "View Screenshot" }}
        />
      </div>

      {/* Review notes (if any) */}
      {proof.notes && (
        <p className="text-xs italic text-ds-text-subtle border-l-2 border-ds-border pl-2">
          {proof.notes}
        </p>
      )}

      {/* Review actions — team lead / admin / super admin only, pending proofs only */}
      {canReview && (proof.status as string) === "PENDING" && (
        <div className="flex flex-col gap-2 pt-1 border-t border-ds-border">
          <Input.TextArea
            rows={2}
            placeholder={PROOFS_PAGE_CONTENT.reviewNotesPlaceholder}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="text-xs"
          />
          <div className="flex gap-2">
            <Tooltip title="Approve this proof">
              <Popconfirm
                title="Approve this proof?"
                onConfirm={() =>
                  review(proof.id, {
                    status: "APPROVED",
                    notes: notes || undefined,
                  })
                }
                okText="Yes"
                cancelText="No">
                <Button
                  variant="primary"
                  size="small"
                  loading={loading}
                  className="flex-1">
                  {PROOFS_PAGE_CONTENT.approveBtn}
                </Button>
              </Popconfirm>
            </Tooltip>
            <Tooltip title="Reject this proof">
              <Popconfirm
                title="Reject this proof?"
                onConfirm={() =>
                  review(proof.id, {
                    status: "REJECTED",
                    notes: notes || undefined,
                  })
                }
                okText="Yes"
                cancelText="No">
                <Button
                  variant="ghost"
                  size="small"
                  loading={loading}
                  className="flex-1 text-red-400">
                  {PROOFS_PAGE_CONTENT.rejectBtn}
                </Button>
              </Popconfirm>
            </Tooltip>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
