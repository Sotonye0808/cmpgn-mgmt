"use client";

import { useState } from "react";
import { Row, Col, Pagination, Segmented, Empty } from "antd";
import { ICONS } from "@/config/icons";
import Spinner from "@/components/ui/Spinner";
import CampaignCard from "./CampaignCard";
import CampaignStory from "./CampaignStory";
import CampaignModal from "./CampaignModal";
import CampaignFilters from "./CampaignFilters";
import CampaignAdminActions from "./CampaignAdminActions";
import { useCampaigns } from "../hooks/useCampaigns";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/config/routes";

type ViewMode = "grid" | "stories";

interface CampaignListProps {
  defaultView?: ViewMode;
  showFilters?: boolean;
  showAdminActions?: boolean;
}

export default function CampaignList({
  defaultView = "stories",
  showFilters = true,
  showAdminActions = true,
}: CampaignListProps) {
  const router = useRouter();
  const [view, setView] = useState<ViewMode>(defaultView);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStartIndex, setModalStartIndex] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<CampaignFilters>({});

  const { campaigns, pagination, loading, error, refetch } = useCampaigns({
    filters,
    page,
    pageSize: view === "stories" ? 12 : 9,
  });

  const handleFilterChange = (partial: Partial<CampaignFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
    setPage(1);
  };

  const openModal = (index: number) => {
    setModalStartIndex(index);
    setModalOpen(true);
  };

  const navigateToCampaign = (campaign: Campaign) => {
    router.push(ROUTES.CAMPAIGN_DETAIL(campaign.id));
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Segmented
            value={view}
            onChange={(v) => setView(v as ViewMode)}
            options={[
              { label: "", value: "stories", icon: <ICONS.view /> },
              { label: "", value: "grid", icon: <ICONS.dashboard /> },
            ]}
          />
          {pagination && (
            <span className="text-xs text-ds-text-subtle">
              {pagination.total} campaign{pagination.total !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        {showAdminActions && (
          <CampaignAdminActions
            onCreateNew={() => router.push(ROUTES.CAMPAIGN_NEW)}
            onRefresh={refetch}
          />
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <CampaignFilters filters={filters} onChange={handleFilterChange} />
      )}

      {/* Loading */}
      {loading && <Spinner fullPage={false} />}

      {/* Error */}
      {error && (
        <div className="text-ds-status-error text-sm p-4 bg-red-50 dark:bg-red-900/20 rounded-ds-lg">
          {error}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && campaigns.length === 0 && (
        <Empty description="No campaigns found" />
      )}

      {/* Stories (horizontal scroll) */}
      {!loading && view === "stories" && campaigns.length > 0 && (
        <div className="flex gap-4 overflow-x-auto pb-3 -mx-1 px-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-ds-border-base">
          {campaigns.map((campaign, idx) => (
            <div key={campaign.id} className="shrink-0">
              <CampaignStory
                campaign={campaign}
                onClick={() => openModal(idx)}
                size="default"
              />
            </div>
          ))}
        </div>
      )}

      {/* Grid */}
      {!loading && view === "grid" && campaigns.length > 0 && (
        <Row gutter={[16, 16]}>
          {campaigns.map((campaign) => (
            <Col key={campaign.id} xs={24} sm={12} lg={8}>
              <CampaignCard campaign={campaign} onView={navigateToCampaign} />
            </Col>
          ))}
        </Row>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center pt-2">
          <Pagination
            current={page}
            total={pagination.total}
            pageSize={pagination.pageSize}
            onChange={(p) => setPage(p)}
            showSizeChanger={false}
            showQuickJumper
          />
        </div>
      )}

      {/* Campaign Modal (story viewer) */}
      <CampaignModal
        campaigns={campaigns}
        initialIndex={modalStartIndex}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onShare={(c) => {
          setModalOpen(false);
          navigateToCampaign(c);
        }}
        onJoin={(c) => {
          setModalOpen(false);
          navigateToCampaign(c);
        }}
      />
    </div>
  );
}
