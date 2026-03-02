"use client";

import { useEffect } from "react";
import { Form, Input, Select, DatePicker, InputNumber, Row, Col } from "antd";
import dayjs from "dayjs";
import Button from "@/components/ui/Button";
import { ICONS } from "@/config/icons";
import {
  CAMPAIGN_GOAL_OPTIONS,
  CAMPAIGN_MEDIA_OPTIONS,
  CAMPAIGN_AUDIENCE_TAGS,
  CAMPAIGN_STATUS_OPTIONS,
} from "@/modules/campaign/config";
import { CAMPAIGN_CONTENT } from "@/config/content";

interface CampaignFormProps {
  mode: "create" | "edit";
  initialValues?: Partial<Campaign>;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

export default function CampaignForm({
  mode,
  initialValues,
  onSubmit,
  onCancel,
  loading,
}: CampaignFormProps) {
  const [form] = Form.useForm();
  const isEdit = mode === "edit";

  useEffect(() => {
    if (!initialValues) return;
    form.setFieldsValue({
      ...initialValues,
      startDate: initialValues.startDate
        ? dayjs(initialValues.startDate)
        : null,
      endDate: initialValues.endDate ? dayjs(initialValues.endDate) : null,
    });
  }, [initialValues, form]);

  const handleFinish = async (rawValues: Record<string, unknown>) => {
    const values = {
      ...rawValues,
      startDate: rawValues.startDate
        ? (rawValues.startDate as ReturnType<typeof dayjs>).toISOString()
        : undefined,
      endDate: rawValues.endDate
        ? (rawValues.endDate as ReturnType<typeof dayjs>).toISOString()
        : undefined,
    };
    await onSubmit(values);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={{ status: "DRAFT", mediaType: "NONE" }}
      requiredMark={false}>
      {/* Title */}
      <Form.Item
        label={CAMPAIGN_CONTENT.form.titleLabel}
        name="title"
        rules={[
          {
            required: true,
            min: 3,
            message: "Title must be at least 3 characters",
          },
        ]}>
        <Input placeholder={CAMPAIGN_CONTENT.form.titlePlaceholder} />
      </Form.Item>

      {/* Description */}
      <Form.Item
        label={CAMPAIGN_CONTENT.form.descriptionLabel}
        name="description"
        rules={[
          {
            required: true,
            min: 10,
            message: "Description must be at least 10 characters",
          },
        ]}>
        <Input.TextArea
          rows={3}
          placeholder={CAMPAIGN_CONTENT.form.descriptionPlaceholder}
        />
      </Form.Item>

      {/* Content */}
      <Form.Item label={CAMPAIGN_CONTENT.form.contentLabel} name="content">
        <Input.TextArea rows={4} placeholder="Campaign body content..." />
      </Form.Item>

      {/* CTA */}
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item label={CAMPAIGN_CONTENT.form.ctaTextLabel} name="ctaText">
            <Input placeholder={CAMPAIGN_CONTENT.form.ctaTextPlaceholder} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item label={CAMPAIGN_CONTENT.form.ctaUrlLabel} name="ctaUrl">
            <Input placeholder="https://..." />
          </Form.Item>
        </Col>
      </Row>

      {/* Status + Media Type */}
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item label="Status" name="status">
            <Select options={[...CAMPAIGN_STATUS_OPTIONS]} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            label={CAMPAIGN_CONTENT.form.mediaTypeLabel}
            name="mediaType">
            <Select options={[...CAMPAIGN_MEDIA_OPTIONS]} />
          </Form.Item>
        </Col>
      </Row>

      {/* Goal Type + Target */}
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            label={CAMPAIGN_CONTENT.form.goalTypeLabel}
            name="goalType"
            rules={[{ required: true, message: "Goal type is required" }]}>
            <Select
              options={[...CAMPAIGN_GOAL_OPTIONS]}
              placeholder="Select goal type"
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            label={CAMPAIGN_CONTENT.form.goalTargetLabel}
            name="goalTarget">
            <InputNumber min={1} className="w-full" placeholder="e.g. 1000" />
          </Form.Item>
        </Col>
      </Row>

      {/* Dates */}
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            label={CAMPAIGN_CONTENT.form.startDateLabel}
            name="startDate">
            <DatePicker className="w-full" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item label={CAMPAIGN_CONTENT.form.endDateLabel} name="endDate">
            <DatePicker className="w-full" />
          </Form.Item>
        </Col>
      </Row>

      {/* Media URL */}
      <Form.Item label={CAMPAIGN_CONTENT.form.mediaUrlLabel} name="mediaUrl">
        <Input placeholder="https://..." />
      </Form.Item>

      {/* Target Audience */}
      <Form.Item label="Target Audience" name="targetAudience">
        <Select
          mode="tags"
          placeholder="Select or type audience segments..."
          options={[...CAMPAIGN_AUDIENCE_TAGS]}
        />
      </Form.Item>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
        {onCancel && (
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          variant="primary"
          htmlType="submit"
          loading={loading}
          icon={isEdit ? <ICONS.check /> : <ICONS.add />}>
          {isEdit
            ? CAMPAIGN_CONTENT.form.submitEdit
            : CAMPAIGN_CONTENT.form.submitCreate}
        </Button>
      </div>
    </Form>
  );
}
