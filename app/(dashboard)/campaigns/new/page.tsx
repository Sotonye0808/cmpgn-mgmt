"use client";

import { useState } from "react";
import { Form, Input, Select, DatePicker, InputNumber, message } from "antd";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { ICONS } from "@/config/icons";
import {
  CAMPAIGN_GOAL_OPTIONS,
  CAMPAIGN_MEDIA_OPTIONS,
  CAMPAIGN_AUDIENCE_TAGS
} from "@/modules/campaign/config";
import { CAMPAIGN_CONTENT } from "@/config/content";
import { ROUTES } from "@/config/routes";
import { useAuth } from "@/hooks/useAuth";

const CAMPAIGN_STATUS_OPTIONS = [
  { label: "Draft", value: "DRAFT" },
  { label: "Active", value: "ACTIVE" },
  { label: "Paused", value: "PAUSED" },
];

export default function NewCampaignPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Role guard (admin/super_admin only)
  if (user && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    router.replace(ROUTES.CAMPAIGNS);
    return null;
  }

  const handleSubmit = async (values: Record<string, unknown>) => {
    setLoading(true);
    try {
      const body = {
        ...values,
        startDate: values.startDate
          ? (values.startDate as { toISOString: () => string }).toISOString()
          : undefined,
        endDate: values.endDate
          ? (values.endDate as { toISOString: () => string }).toISOString()
          : undefined,
      };
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, min: 3 }]}>
            <Input placeholder="Campaign title" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, min: 10 }]}>
            <Input.TextArea rows={3} placeholder="Describe the campaign..." />
          </Form.Item>

          <Form.Item label="Status" name="status" initialValue="DRAFT">
            <Select options={CAMPAIGN_STATUS_OPTIONS} />
          </Form.Item>

          <Form.Item
            label="Goal Type"
            name="goalType"
            rules={[{ required: true }]}>
            <Select
              options={[...CAMPAIGN_GOAL_OPTIONS]}
              placeholder="Select goal type"
            />
          </Form.Item>

          <Form.Item label="Goal Target" name="goalTarget">
            <InputNumber min={1} className="w-full" placeholder="e.g. 1000" />
          </Form.Item>

          <Form.Item label="Media Type" name="mediaType" initialValue="NONE">
            <Select options={[...CAMPAIGN_MEDIA_OPTIONS]} />
          </Form.Item>

          <Form.Item label="Media URL" name="mediaUrl">
            <Input placeholder="https://..." />
          </Form.Item>

          <Form.Item label="CTA Text" name="ctaText">
            <Input placeholder="e.g. Register Now" />
          </Form.Item>

          <Form.Item label="CTA URL" name="ctaUrl">
            <Input placeholder="https://..." />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Start Date" name="startDate">
              <DatePicker className="w-full" />
            </Form.Item>
            <Form.Item label="End Date" name="endDate">
              <DatePicker className="w-full" />
            </Form.Item>
          </div>

          <Form.Item label="Target Audience" name="targetAudience">
            <Select mode="tags" placeholder="Add audience tags..." options={[...CAMPAIGN_AUDIENCE_TAGS]} />
          </Form.Item>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button
              variant="primary"
              htmlType="submit"
              loading={loading}
              icon={<ICONS.add />}>
              Create Campaign
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
