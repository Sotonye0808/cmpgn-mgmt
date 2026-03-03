"use client";

import { useState, useEffect } from "react";
import { Pagination, Segmented, Empty, message } from "antd";
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
import { useAuth } from "@/hooks/useAuth";

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
  const { user } = useAuth();
  const [view, setView] = useState<ViewMode>(defaultView);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStartIndex, setModalStartIndex] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<CampaignFilters>({});
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());
  const [joiningId, setJoiningId] = useState<string | null>(null);

  // Seed joinedIds from server on mount (persisted participations)
  useEffect(() => {
    if (!user) return;
    fetch(ROUTES.API.CAMPAIGNS.JOINED)
      .then((r) => r.json())
      .then((json) => {
        if (json?.data?.campaignIds && Array.isArray(json.data.campaignIds)) {
          setJoinedIds(new Set<string>(json.data.campaignIds));
        }
      })
      .catch(() => {
        /* silent — fall through to empty */
      });
  }, [user]);

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

  const handleJoin = async (campaign: Campaign) => {
    if (!user) {
      message.warning("Please log in to join a campaign.");
      return;
    }
    if (joinedIds.has(campaign.id)) return;
    setJoiningId(campaign.id);
    try {
      const res = await fetch(`/api/campaigns/${campaign.id}/participants`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to join");
      setJoinedIds((prev) => new Set(prev).add(campaign.id));

      // Generate smart link and copy to clipboard
      let copiedLink = false;
      try {
        const linkRes = await fetch(ROUTES.API.SMART_LINKS.BASE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ campaignId: campaign.id }),
        });
        if (linkRes.ok) {
          const linkJson = await linkRes.json();
          const slug = linkJson.data?.slug;
          if (slug) {
            await navigator.clipboard.writeText(
              `${window.location.origin}/c/${slug}`,
            );
            copiedLink = true;
          }
        }
      } catch {
        /* silent — clipboard failure shouldn't block join */
      }

      message.success(
        copiedLink
          ? `Joined "${campaign.title}"! Tracking link copied.`
          : `Joined "${campaign.title}"!`,
      );
    } catch (e: unknown) {
      message.error(
        e instanceof Error ? e.message : "Could not join campaign.",
      );
    } finally {
      setJoiningId(null);
    }
  };

  const handleShare = async (campaign: Campaign) => {
    // Always resolve to user's smart link first; fall back to plain campaign URL
    let shareUrl = `${window.location.origin}${ROUTES.CAMPAIGN_DETAIL(campaign.id)}`;
    try {
      const linkRes = await fetch(ROUTES.API.SMART_LINKS.BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId: campaign.id }),
      });
      if (linkRes.ok) {
        const linkJson = await linkRes.json();
        const slug = linkJson.data?.slug;
        if (slug) shareUrl = `${window.location.origin}/c/${slug}`;
      }
    } catch {
      /* fall through to plain URL */
    }

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: campaign.title, url: shareUrl });
        return;
      } catch {
        // fell through to clipboard fallback
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      message.success("Tracking link copied to clipboard!");
    } catch {
      message.error("Could not copy link.");
    }
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
        <div className="text-ds-status-error text-sm p-4 bg-ds-status-error/10 rounded-ds-lg">
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

      {/* Grid — horizontal scroll */}
      {!loading && view === "grid" && campaigns.length > 0 && (
        <div className="flex gap-4 overflow-x-auto pb-3 -mx-1 px-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-ds-border-base">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="shrink-0 w-72">
              <CampaignCard
                campaign={campaign}
                onView={navigateToCampaign}
                onJoin={handleJoin}
                onShare={handleShare}
                isJoined={joinedIds.has(campaign.id)}
                isJoining={joiningId === campaign.id}
              />
            </div>
          ))}
        </div>
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
        onShare={handleShare}
        onJoin={handleJoin}
        joinedIds={joinedIds}
        joiningId={joiningId}
      />
    </div>
  );
}
