"use client";

import { use, useState } from "react";
import { Spin, Alert } from "antd";
import { useRouter } from "next/navigation";
import { useCampaign } from "@/modules/campaign/hooks/useCampaign";
import { CampaignForm } from "@/modules/campaign";
import { CAMPAIGN_CONTENT } from "@/config/content";
import { ROUTES } from "@/config/routes";
import { ICONS } from "@/config/icons";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CampaignEditPage({ params }: PageProps) {
  const { id } = use(params);
  const { campaign, loading, error } = useCampaign(id);
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleSave = async (values: Record<string, unknown>) => {
    setSaving(true);
    try {
      const res = await fetch(ROUTES.API.CAMPAIGNS.DETAIL(id), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (res.ok) {
        router.push(ROUTES.CAMPAIGN_DETAIL(id));
      }
    } finally {
      setSaving(false);
    }
  };

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
          onClick={() => router.back()}>
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
          onCancel={() => router.back()}
        />
      </Card>
    </div>
  );
}
