"use client";

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

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { campaign, loading, error, refetch } = useCampaign(id);

  const handleJoin = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/campaigns/${id}/participants`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to join");
      message.success("Joined campaign!");
      refetch();
    } catch (e: unknown) {
      message.error(e instanceof Error ? e.message : "Failed to join");
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard
      .writeText(url)
      .then(() => message.success("Link copied!"));
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
      <CampaignBanner campaign={campaign} showActions onShare={handleShare} />

      {/* Actions */}
      <div className="flex items-center justify-between">
        {isActive && !isAdmin && (
          <Button
            variant="primary"
            icon={<ICONS.rocket />}
            onClick={handleJoin}>
            Join Campaign
          </Button>
        )}
        {isAdmin && (
          <Button
            variant="secondary"
            icon={<ICONS.edit />}
            onClick={() => router.push(ROUTES.CAMPAIGN_EDIT(campaign.id))}>
            Edit Campaign
          </Button>
        )}
      </div>

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
    </div>
  );
}
