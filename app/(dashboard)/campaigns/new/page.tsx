"use client";

import { useState } from "react";
import { message } from "antd";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { ICONS } from "@/config/icons";
import { CampaignForm } from "@/modules/campaign";
import { CAMPAIGN_CONTENT } from "@/config/content";
import { ROUTES } from "@/config/routes";
import { useAuth } from "@/hooks/useAuth";

export default function NewCampaignPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Role guard (admin/super_admin only)
  if (user && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    router.replace(ROUTES.CAMPAIGNS);
    return null;
  }

  const handleSubmit = async (values: Record<string, unknown>) => {
    setLoading(true);
    try {
      const res = await fetch(ROUTES.API.CAMPAIGNS.BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to create campaign");
      message.success("Campaign created!");
      router.push(ROUTES.CAMPAIGN_DETAIL(json.data.id));
    } catch (e: unknown) {
      message.error(
        e instanceof Error ? e.message : "Failed to create campaign",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
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
            {CAMPAIGN_CONTENT.form.createTitle}
          </h1>
          <p className="text-ds-text-secondary text-sm">
            {CAMPAIGN_CONTENT.form.descriptionPlaceholder}
          </p>
        </div>
      </div>

      <Card>
        <CampaignForm
          mode="create"
          onSubmit={handleSubmit}
          loading={loading}
          onCancel={() => router.back()}
        />
      </Card>
    </div>
  );
}
