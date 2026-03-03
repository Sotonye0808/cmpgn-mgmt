"use client";

import { useEffect } from "react";
import { Form, Input, Select, DatePicker, InputNumber, Row, Col } from "antd";
import dayjs from "dayjs";
import Button from "@/components/ui/Button";
import MediaUpload from "@/components/ui/MediaUpload";
import { ICONS } from "@/config/icons";
import {
  CAMPAIGN_GOAL_OPTIONS,
  CAMPAIGN_MEDIA_OPTIONS,
  CAMPAIGN_AUDIENCE_TAGS,
  CAMPAIGN_STATUS_OPTIONS,
  MEDIA_TYPE_FIELDS,
} from "@/modules/campaign/config";
import { CAMPAIGN_CONTENT } from "@/config/content";

interface CampaignFormProps {
  mode: "create" | "edit";
  initialValues?: Partial<Campaign>;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

type MediaTypeKey = keyof typeof MEDIA_TYPE_FIELDS;

export default function CampaignForm({
  mode,
  initialValues,
  onSubmit,
  onCancel,
  loading,
}: CampaignFormProps) {
  const [form] = Form.useForm();
  const isEdit = mode === "edit";
  const watchedMediaType = Form.useWatch("mediaType", form) as string | undefined;

  // Resolve field visibility from the MEDIA_TYPE_FIELDS config
  const fieldConfig = watchedMediaType && watchedMediaType in MEDIA_TYPE_FIELDS
    ? MEDIA_TYPE_FIELDS[watchedMediaType as MediaTypeKey]
    : null;

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
      initialValues={{ status: "DRAFT" }}
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
            <Select
              options={[...CAMPAIGN_MEDIA_OPTIONS]}
              placeholder="Select media type"
            />
          </Form.Item>
        </Col>
      </Row>

      {/* ─── Media-type-conditional fields ──────────────────────────────── */}

      {/* Content — only for TEXT */}
      {fieldConfig?.showContent && (
        <Form.Item
          label={CAMPAIGN_CONTENT.form.contentLabel}
          name="content"
          extra={CAMPAIGN_CONTENT.form.contentHint}>
          <Input.TextArea rows={5} placeholder="Campaign body content..." />
        </Form.Item>
      )}

      {/* Media URL — only for LINK */}
      {fieldConfig?.showMediaUrl && (
        <Form.Item label={CAMPAIGN_CONTENT.form.mediaUrlLabel} name="mediaUrl">
          <Input placeholder="https://..." />
        </Form.Item>
      )}

      {/* Media Upload — for IMAGE or VIDEO */}
      {fieldConfig?.showUpload && (
        <Form.Item
          label={CAMPAIGN_CONTENT.form.uploadLabel}
          name="mediaUrl"
          extra={CAMPAIGN_CONTENT.form.uploadHint}>
          <MediaUpload
            accept={watchedMediaType === "VIDEO" ? "video/mp4,video/webm" : "image/*"}
            maxSizeMb={watchedMediaType === "VIDEO" ? 50 : 10}
            showPreview
            onUploadComplete={(media) => {
              form.setFieldValue("mediaUrl", media.url);
              // Auto-set thumbnail from uploaded media
              if (media.thumbnailUrl) {
                form.setFieldValue("thumbnailUrl", media.thumbnailUrl);
              }
            }}
          />
        </Form.Item>
      )}

      {/* Thumbnail Upload — required for TEXT and LINK (social preview) */}
      {fieldConfig?.showThumbnailUpload && (
        <Form.Item
          label={CAMPAIGN_CONTENT.form.thumbnailLabel}
          name="thumbnailUrl"
          extra={CAMPAIGN_CONTENT.form.thumbnailHint}>
          <MediaUpload
            accept="image/*"
            maxSizeMb={5}
            showPreview
            onUploadComplete={(media) => {
              form.setFieldValue("thumbnailUrl", media.url);
            }}
          />
        </Form.Item>
      )}

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
