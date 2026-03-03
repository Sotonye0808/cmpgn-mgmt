"use client";

import { useState } from "react";
import { Button as AntButton } from "antd";
import { useAuth } from "@/hooks/useAuth";
import { useCampaigns } from "@/modules/campaign/hooks/useCampaigns";
import { useProofs } from "@/modules/proofs/hooks/useProofs";
import { filterByRole } from "@/lib/utils/roleGuard";
import PageHeader from "@/components/ui/PageHeader";
import GlassCard from "@/components/ui/GlassCard";
import { ICONS } from "@/config/icons";
import ProofList, {
  ProofStatusFilter,
} from "@/modules/proofs/components/ProofList";
import SubmitProofModal from "@/modules/proofs/components/SubmitProofModal";
import ProofReviewPanel from "@/modules/proofs/components/ProofReviewPanel";
import {
  PROOFS_PAGE_SECTIONS,
  PROOFS_PAGE_CONTENT,
} from "@/modules/proofs/config";

export default function ProofsPage() {
  const { user } = useAuth();
  const [submitOpen, setSubmitOpen] = useState(false);
  const [myStatusFilter, setMyStatusFilter] = useState<string>("");

  const {
    proofs: myProofs,
    loading: myProofsLoading,
    refresh: refreshMyProofs,
  } = useProofs();
  const { campaigns } = useCampaigns({
    pageSize: 100,
  });

  if (!user) return null;

  const userRole = user.role as string;

  const visibleSections = filterByRole(PROOFS_PAGE_SECTIONS, userRole);

  const filteredMyProofs = myStatusFilter
    ? myProofs.filter((p) => (p.status as string) === myStatusFilter)
    : myProofs;

  const renderSection = (key: string) => {
    switch (key) {
      case "my-proofs":
        return (
          <GlassCard key="my-proofs" padding="lg">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="text-lg font-semibold text-ds-text-primary">
                  {PROOFS_PAGE_CONTENT.myProofsTitle}
                </h2>
                <p className="text-xs text-ds-text-subtle mt-0.5">
                  {myProofs.length} proof{myProofs.length !== 1 ? "s" : ""}{" "}
                  submitted
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <ProofStatusFilter
                  value={myStatusFilter}
                  onChange={setMyStatusFilter}
                />
                <AntButton
                  type="primary"
                  icon={<ICONS.camera />}
                  onClick={() => setSubmitOpen(true)}>
                  {PROOFS_PAGE_CONTENT.submitBtn}
                </AntButton>
              </div>
            </div>
            <ProofList
              proofs={filteredMyProofs}
              loading={myProofsLoading}
              emptyText={PROOFS_PAGE_CONTENT.myProofsEmpty}
            />
          </GlassCard>
        );

      case "team-proofs":
        return (
          <ProofReviewPanel
            key="team-proofs"
            campaigns={campaigns ?? []}
            userMap={{}}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={PROOFS_PAGE_CONTENT.title}
        subtitle={PROOFS_PAGE_CONTENT.subtitle}
      />

      {visibleSections.map((section) => renderSection(section.key))}

      <SubmitProofModal
        open={submitOpen}
        onClose={() => {
          setSubmitOpen(false);
          refreshMyProofs();
        }}
      />
    </div>
  );
}
