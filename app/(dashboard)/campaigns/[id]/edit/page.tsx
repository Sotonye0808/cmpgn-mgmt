"use client";

import { use, useEffect } from "react";
import {
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Spin,
  Alert,
  Row,
  Col,
} from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useCampaign } from "@/modules/campaign/hooks/useCampaign";
import { CAMPAIGN_CONTENT } from "@/config/content";
import { ROUTES } from "@/config/routes";
import { ICONS } from "@/config/icons";
import Button from "@/components/ui/Button";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CampaignEditPage({ params }: PageProps) {
  const { id } = use(params);
  const { campaign, loading, error } = useCampaign(id);
  const router = useRouter();
  const [form] = Form.useForm();

  // Populate form once campaign loads
  useEffect(() => {
    if (!campaign) return;
    form.setFieldsValue({
      title: campaign.title,
      description: campaign.description,
      content: campaign.content,
      ctaText: campaign.ctaText,
      ctaUrl: campaign.ctaUrl,
      status: campaign.status as string,
      goalType: campaign.goalType as string,
      goalTarget: campaign.goalTarget,
      mediaType: campaign.mediaType as string,
      mediaUrl: campaign.mediaUrl,
      startDate: campaign.startDate ? dayjs(campaign.startDate) : null,
      endDate: campaign.endDate ? dayjs(campaign.endDate) : null,
    });
  }, [campaign, form]);

  const handleSave = async (values: Record<string, unknown>) => {
    const body = {
      ...values,
      startDate: values.startDate
        ? (values.startDate as ReturnType<typeof dayjs>).toISOString()
        : undefined,
      endDate: values.endDate
        ? (values.endDate as ReturnType<typeof dayjs>).toISOString()
        : undefined,
    };

    const res = await fetch(ROUTES.API.CAMPAIGNS.DETAIL(id), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      router.push(ROUTES.CAMPAIGN_DETAIL(id));
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
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="text-ds-text-subtle hover:text-ds-brand-accent transition-colors">
          <ICONS.left className="text-lg" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-ds-text-primary">
            {CAMPAIGN_CONTENT.form.editTitle}
          </h1>
          <p className="text-sm text-ds-text-secondary mt-0.5">
            {campaign.title}
          </p>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-ds-surface-elevated border border-ds-border-base rounded-ds-xl p-6">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          requiredMark={false}>
          {/* Title */}
          <Form.Item
            label={
              <span className="text-ds-text-secondary text-sm">
                {CAMPAIGN_CONTENT.form.titleLabel}
              </span>
            }
            name="title"
            rules={[{ required: true, message: "Title is required" }]}>
            <Input
              placeholder={CAMPAIGN_CONTENT.form.titlePlaceholder}
              className="rounded-ds-lg"
            />
          </Form.Item>

          {/* Description */}
          <Form.Item
            label={
              <span className="text-ds-text-secondary text-sm">
                {CAMPAIGN_CONTENT.form.descriptionLabel}
              </span>
            }
            name="description">
            <Input.TextArea
              placeholder={CAMPAIGN_CONTENT.form.descriptionPlaceholder}
              rows={3}
              className="rounded-ds-lg"
            />
          </Form.Item>

          {/* Content */}
          <Form.Item
            label={
              <span className="text-ds-text-secondary text-sm">
                {CAMPAIGN_CONTENT.form.contentLabel}
              </span>
            }
            name="content">
            <Input.TextArea rows={4} className="rounded-ds-lg" />
          </Form.Item>

          {/* CTA */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={
                  <span className="text-ds-text-secondary text-sm">
                    {CAMPAIGN_CONTENT.form.ctaTextLabel}
                  </span>
                }
                name="ctaText">
                <Input
                  placeholder={CAMPAIGN_CONTENT.form.ctaTextPlaceholder}
                  className="rounded-ds-lg"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <span className="text-ds-text-secondary text-sm">
                    {CAMPAIGN_CONTENT.form.ctaUrlLabel}
                  </span>
                }
                name="ctaUrl">
                <Input placeholder="https://..." className="rounded-ds-lg" />
              </Form.Item>
            </Col>
          </Row>

          {/* Status + Media Type */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={
                  <span className="text-ds-text-secondary text-sm">Status</span>
                }
                name="status">
                <Select className="rounded-ds-lg">
                  {Object.entries(CAMPAIGN_CONTENT.status).map(
                    ([key, label]) => (
                      <Select.Option key={key} value={key}>
                        {label}
                      </Select.Option>
                    ),
                  )}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <span className="text-ds-text-secondary text-sm">
                    {CAMPAIGN_CONTENT.form.mediaTypeLabel}
                  </span>
                }
                name="mediaType">
                <Select className="rounded-ds-lg">
                  {["IMAGE", "VIDEO", "TEXT"].map((t) => (
                    <Select.Option key={t} value={t}>
                      {t}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Goal type + target */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={
                  <span className="text-ds-text-secondary text-sm">
                    {CAMPAIGN_CONTENT.form.goalTypeLabel}
                  </span>
                }
                name="goalType">
                <Select className="rounded-ds-lg">
                  {Object.entries(CAMPAIGN_CONTENT.goalType).map(
                    ([key, label]) => (
                      <Select.Option key={key} value={key}>
                        {label}
                      </Select.Option>
                    ),
                  )}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <span className="text-ds-text-secondary text-sm">
                    {CAMPAIGN_CONTENT.form.goalTargetLabel}
                  </span>
                }
                name="goalTarget">
                <InputNumber min={1} className="w-full rounded-ds-lg" />
              </Form.Item>
            </Col>
          </Row>

          {/* Dates */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={
                  <span className="text-ds-text-secondary text-sm">
                    {CAMPAIGN_CONTENT.form.startDateLabel}
                  </span>
                }
                name="startDate">
                <DatePicker className="w-full rounded-ds-lg" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <span className="text-ds-text-secondary text-sm">
                    {CAMPAIGN_CONTENT.form.endDateLabel}
                  </span>
                }
                name="endDate">
                <DatePicker className="w-full rounded-ds-lg" />
              </Form.Item>
            </Col>
          </Row>

          {/* Media URL */}
          <Form.Item
            label={
              <span className="text-ds-text-secondary text-sm">
                {CAMPAIGN_CONTENT.form.mediaUrlLabel}
              </span>
            }
            name="mediaUrl">
            <Input placeholder="https://..." className="rounded-ds-lg" />
          </Form.Item>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button variant="primary" htmlType="submit">
              {CAMPAIGN_CONTENT.form.submitEdit}
            </Button>
            <Button variant="secondary" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
