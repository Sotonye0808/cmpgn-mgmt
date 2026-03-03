"use client";

import { useState, useEffect } from "react";
import { Form, Select, Alert } from "antd";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { PROOF_PLATFORM_OPTIONS, PROOFS_PAGE_CONTENT } from "../config";
import { useSubmitProof } from "../hooks/useProofs";
import { useSmartLink } from "@/modules/links/hooks/useSmartLink";
import { useCampaigns } from "@/modules/campaign/hooks/useCampaigns";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Pre-select a specific campaign (e.g. when launched from campaign detail page) */
  initialCampaignId?: string;
}

interface FormValues {
  campaignId: string;
  platform: string;
  screenshotUrl: string;
}

export default function SubmitProofModal({
  open,
  onClose,
  initialCampaignId,
}: Props) {
  const [form] = Form.useForm<FormValues>();
  const [selectedCampaignId, setSelectedCampaignId] = useState(
    initialCampaignId ?? "",
  );

  // Sync prop changes (e.g. modal re-opened from a different campaign)
  useEffect(() => {
    setSelectedCampaignId(initialCampaignId ?? "");
    if (initialCampaignId) form.setFieldValue("campaignId", initialCampaignId);
  }, [initialCampaignId, form]);

  // Active campaigns the user can submit proof for
  const { campaigns, loading: campaignsLoading } = useCampaigns({
    filters: { status: "ACTIVE" as unknown as CampaignStatus },
    pageSize: 50,
  });

  // User's smart link for the currently selected campaign
  const { link: smartLink, loading: linkLoading } = useSmartLink({
    campaignId: selectedCampaignId,
    enabled: !!selectedCampaignId,
  });

  const { submit, loading, error, success, reset } = useSubmitProof(() => {
    form.resetFields();
    setSelectedCampaignId(initialCampaignId ?? "");
    onClose();
  });

  const handleClose = () => {
    form.resetFields();
    setSelectedCampaignId(initialCampaignId ?? "");
    reset();
    onClose();
  };

  const onFinish = async (values: FormValues) => {
    if (!smartLink) return;
    await submit({
      campaignId: values.campaignId,
      smartLinkId: smartLink.id,
      platform: values.platform as SocialPlatform,
      screenshotUrl: values.screenshotUrl,
    });
  };

  const campaignOptions = (campaigns ?? []).map((c) => ({
    value: c.id,
    label: c.title,
  }));

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      title={PROOFS_PAGE_CONTENT.submitModalTitle}
      footer={null}
      width={520}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ campaignId: initialCampaignId }}
        className="mt-2">
        {/* Campaign */}
        <Form.Item
          name="campaignId"
          label="Campaign"
          rules={[{ required: true, message: "Select a campaign" }]}>
          <Select
            options={campaignOptions}
            loading={campaignsLoading}
            placeholder="Select the campaign you deployed for"
            onChange={(val: string) => {
              setSelectedCampaignId(val);
              form.setFieldValue("campaignId", val);
            }}
            showSearch
            filterOption={(input, option) =>
              (option?.label as string)
                ?.toLowerCase()
                .includes(input.toLowerCase())
            }
          />
        </Form.Item>

        {/* Smart link status feedback */}
        {selectedCampaignId && !linkLoading && !smartLink && (
          <Alert
            type="warning"
            showIcon
            message="You don't have a smart link for this campaign yet. Generate one from the campaign page first."
            className="mb-4"
          />
        )}

        {/* Platform */}
        <Form.Item
          name="platform"
          label="Platform"
          rules={[{ required: true, message: "Select the platform" }]}>
          <Select
            options={PROOF_PLATFORM_OPTIONS}
            placeholder="Where did you deploy your ammunition?"
          />
        </Form.Item>

        {/* Screenshot URL */}
        <Form.Item
          name="screenshotUrl"
          label="Screenshot URL"
          rules={[
            { required: true, message: "Provide a screenshot URL" },
            { type: "url", message: "Must be a valid URL" },
          ]}
          extra="Upload your screenshot to any image host and paste the direct link here.">
          <input
            className="w-full px-3 py-2 rounded-ds-md border border-ds-border bg-ds-surface text-ds-text-primary text-sm focus:outline-none focus:border-ds-brand-accent"
            placeholder="https://i.imgur.com/example.png"
            onChange={(e) =>
              form.setFieldValue("screenshotUrl", e.target.value)
            }
          />
        </Form.Item>

        {error && (
          <Alert type="error" showIcon message={error} className="mb-4" />
        )}
        {success && (
          <Alert
            type="success"
            showIcon
            message={PROOFS_PAGE_CONTENT.submitSuccess}
            className="mb-4"
          />
        )}

        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            htmlType="submit"
            loading={loading}
            disabled={!!selectedCampaignId && !smartLink}>
            {PROOFS_PAGE_CONTENT.submitBtn}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
