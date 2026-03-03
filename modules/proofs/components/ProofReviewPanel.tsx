"use client";

import { useState, useMemo } from "react";
import { Select } from "antd";
import GlassCard from "@/components/ui/GlassCard";
import ProofList, { ProofStatusFilter } from "./ProofList";
import { useProofs } from "../hooks/useProofs";
import { PROOFS_PAGE_CONTENT } from "../config";

interface Props {
  /** Campaigns the reviewer manages — used for campaign filter drop-down */
  campaigns: Campaign[];
  /** Map of userId → displayName for enrichment */
  userMap?: Record<string, string>;
}

export default function ProofReviewPanel({ campaigns, userMap }: Props) {
  const [filterCampaignId, setFilterCampaignId] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");

  const { proofs, loading, refresh } = useProofs(filterCampaignId || undefined);

  const campaignMap = useMemo(
    () => Object.fromEntries(campaigns.map((c) => [c.id, c.title])),
    [campaigns],
  );

  const campaignOptions = [
    { value: "", label: PROOFS_PAGE_CONTENT.allCampaigns },
    ...campaigns.map((c) => ({ value: c.id, label: c.title })),
  ];

  const filtered = useMemo(
    () =>
      filterStatus
        ? proofs.filter((p) => (p.status as string) === filterStatus)
        : proofs,
    [proofs, filterStatus],
  );

  const pendingCount = proofs.filter(
    (p) => (p.status as string) === "PENDING",
  ).length;

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
            onChange={setFilterCampaignId}
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
          <ProofStatusFilter value={filterStatus} onChange={setFilterStatus} />
        </div>
      </div>

      <ProofList
        proofs={filtered}
        loading={loading}
        canReview
        onReviewed={refresh}
        campaignMap={campaignMap}
        userMap={userMap}
        emptyText={PROOFS_PAGE_CONTENT.teamProofsEmpty}
      />
    </GlassCard>
  );
}
