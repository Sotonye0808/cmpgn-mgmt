"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Spin, message, Descriptions, Tag } from "antd";
import { useCampaign } from "@/modules/campaign/hooks/useCampaign";
import CampaignBanner from "@/modules/campaign/components/CampaignBanner";
import Button from "@/components/ui/Button";
import { ICONS } from "@/config/icons";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/config/routes";
import { formatDate } from "@/lib/utils/format";
import Card from "@/components/ui/Card";
import SubmitProofModal from "@/modules/proofs/components/SubmitProofModal";

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { campaign, loading, error, refetch } = useCampaign(id);
  const [joined, setJoined] = useState(false);
  const [joining, setJoining] = useState(false);
  const [submitProofOpen, setSubmitProofOpen] = useState(false);

  // Initialise `joined` from persisted participations once user is known
  useEffect(() => {
    if (!user || !id) return;
    fetch(ROUTES.API.CAMPAIGNS.JOINED)
      .then((r) => r.json())
      .then((json) => {
        if (json?.data?.campaignIds && Array.isArray(json.data.campaignIds)) {
          if ((json.data.campaignIds as string[]).includes(id)) setJoined(true);
        }
      })
      .catch(() => { /* silent */ });
  }, [user, id]);

  const handleJoin = async () => {
    if (!user || joined) return;
    setJoining(true);
    try {
      const res = await fetch(`/api/campaigns/${id}/participants`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to join");
      setJoined(true);
      refetch();

      // Generate smart link and copy to clipboard; stay on page
      let copiedLink = false;
      try {
        const linkRes = await fetch("/api/smart-links", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ campaignId: id }),
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
        /* silent */
      }

      message.success(
        copiedLink
          ? "Joined! Your tracking link has been copied to clipboard."
          : "Successfully joined campaign!",
      );
    } catch (e: unknown) {
      message.error(e instanceof Error ? e.message : "Failed to join");
    } finally {
      setJoining(false);
    }
  };

  const handleShare = async () => {
    // Get/create the user’s tracking link for this campaign first
    let trackingUrl = window.location.href;
    try {
      const linkRes = await fetch("/api/smart-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId: id }),
      });
      if (linkRes.ok) {
        const linkJson = await linkRes.json();
        const slug = linkJson.data?.slug;
        if (slug) trackingUrl = `${window.location.origin}/c/${slug}`;
      }
    } catch {
      /* fall through to plain URL */
    }

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: campaign?.title, url: trackingUrl });
        return;
      } catch {
        /* fall through */
      }
    }
    navigator.clipboard
      .writeText(trackingUrl)
      .then(() => message.success("Tracking link copied!"));
  };

  if (loading)
    return <Spin size="large" className="flex justify-center p-12" />;
  if (error) return <div className="text-ds-status-error p-8">{error}</div>;
  if (!campaign)
    return <div className="text-ds-text-subtle p-8">Campaign not found.</div>;

  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
  const isActive = campaign.status === "ACTIVE";

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <Button
        variant="ghost"
        size="small"
        icon={<ICONS.left />}
        onClick={() => router.push(ROUTES.CAMPAIGNS)}>
        Back to Campaigns
      </Button>

      {/* Banner */}
      <CampaignBanner
        campaign={campaign}
        showActions
        onShare={handleShare}
        onJoin={!isAdmin ? handleJoin : undefined}
        isJoined={joined}
        joiningLoading={joining}
      />

      {/* Admin Actions */}
      {isAdmin && (
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            icon={<ICONS.edit />}
            onClick={() => router.push(ROUTES.CAMPAIGN_EDIT(campaign.id))}>
            Edit Campaign
          </Button>
        </div>
      )}

      {/* Submit Proof — available to all users on active campaigns */}
      {isActive && (
        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            icon={<ICONS.camera />}
            onClick={() => setSubmitProofOpen(true)}>
            Submit Proof of Deployment
          </Button>
        </div>
      )}

      {/* Details Card */}
      <Card>
        <Descriptions
          title="Campaign Details"
          column={{ xs: 1, sm: 2 }}
          bordered>
          <Descriptions.Item label="Status">
            <Tag color={isActive ? "green" : "default"}>{campaign.status}</Tag>
          </Descriptions.Item>
          {campaign.startDate && (
            <Descriptions.Item label="Start Date">
              {formatDate(campaign.startDate)}
            </Descriptions.Item>
          )}
          {campaign.endDate && (
            <Descriptions.Item label="End Date">
              {formatDate(campaign.endDate)}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Goal Type">
            {campaign.goalType}
          </Descriptions.Item>
          {campaign.goalTarget && (
            <Descriptions.Item label="Goal Target">
              {campaign.goalTarget}
            </Descriptions.Item>
          )}
          {campaign.targetAudience && campaign.targetAudience.length > 0 && (
            <Descriptions.Item label="Audience" span={2}>
              <div className="flex flex-wrap gap-1">
                {campaign.targetAudience.map((a) => (
                  <Tag key={a}>{a}</Tag>
                ))}
              </div>
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      <SubmitProofModal
        open={submitProofOpen}
        onClose={() => setSubmitProofOpen(false)}
        initialCampaignId={id}
      />
    </div>
  );
}
