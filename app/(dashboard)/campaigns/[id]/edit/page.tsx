"use client";

import { use, useState, useRef, useCallback } from "react";
import { Spin, Alert, App } from "antd";
import { useRouter } from "next/navigation";
import { useCampaign } from "@/modules/campaign/hooks/useCampaign";
import CampaignForm from "@/modules/campaign/components/CampaignForm";
import { CAMPAIGN_CONTENT } from "@/config/content";
import { ROUTES } from "@/config/routes";
import { ICONS } from "@/config/icons";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import {
  type TrackedAsset,
  deleteCloudinaryAssets,
  computeObsoleteAssets,
} from "@/lib/utils/cloudinaryCleanup";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CampaignEditPage({ params }: PageProps) {
  const { id } = use(params);
  const { campaign, loading, error } = useCampaign(id);
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const { message: msgApi } = App.useApp();
  /** New uploads during this edit session — cleaned up if user cancels. */
  const uploadTracker = useRef<TrackedAsset[]>([]);

  const handleSave = async (values: Record<string, unknown>) => {
    setSaving(true);
    try {
      const res = await fetch(ROUTES.API.CAMPAIGNS.DETAIL(id), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to save changes");
      // Delete old assets whose URLs were replaced during this edit
      if (campaign) {
        const obsolete = computeObsoleteAssets(campaign, values);
        await deleteCloudinaryAssets(obsolete);
      }
      uploadTracker.current = [];
      msgApi.success("Campaign updated!");
      router.push(ROUTES.CAMPAIGN_DETAIL(id));
    } catch (e: unknown) {
      msgApi.error(e instanceof Error ? e.message : "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  /** Cancel: clean up any assets uploaded-but-not-saved this session. */
  const handleCancel = useCallback(async () => {
    await deleteCloudinaryAssets(uploadTracker.current);
    uploadTracker.current = [];
    router.back();
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <Alert
        type="error"
        message={error ?? "Campaign not found"}
        className="rounded-ds-lg"
      />
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="small"
          icon={<ICONS.left />}
          onClick={handleCancel}>
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-ds-text-primary">
            {CAMPAIGN_CONTENT.form.editTitle}
          </h1>
          <p className="text-sm text-ds-text-secondary mt-0.5">
            {campaign.title}
          </p>
        </div>
      </div>

      {/* Unified Edit Form */}
      <Card>
        <CampaignForm
          mode="edit"
          initialValues={campaign}
          onSubmit={handleSave}
          loading={saving}
          onCancel={handleCancel}
          onMediaUploaded={(info) => uploadTracker.current.push(info)}
        />
      </Card>
    </div>
  );
}
