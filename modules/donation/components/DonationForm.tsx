"use client";

import { useState } from "react";
import { Form, InputNumber, Select, Input, Button, message } from "antd";
import { DONATION_PAGE_CONTENT } from "@/config/content";
import { ROUTES } from "@/config/routes";

interface Props {
  campaigns: { id: string; title: string }[];
  onSuccess?: () => void;
  defaultCampaignId?: string;
}

interface FormValues {
  campaignId: string;
  amount: number;
  currency: string;
  message?: string;
}

export default function DonationForm({
  campaigns,
  onSuccess,
  defaultCampaignId,
}: Props) {
  const [form] = Form.useForm<FormValues>();
  const [submitting, setSubmitting] = useState(false);
  const [msgApi, contextHolder] = message.useMessage();

  const handleSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const res = await fetch(ROUTES.API.DONATIONS.BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Donation failed");
      }
      msgApi.success("Donation recorded! Thank you.");
      form.resetFields();
      onSuccess?.();
    } catch (e) {
      msgApi.error(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {contextHolder}
      <div className="glass-surface rounded-ds-xl p-6">
        <h3 className="font-semibold text-ds-text-primary text-lg mb-4">
          {DONATION_PAGE_CONTENT.formTitle}
        </h3>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            campaignId: defaultCampaignId,
            currency: "NGN",
          }}>
          <Form.Item
            name="campaignId"
            label={DONATION_PAGE_CONTENT.campaignLabel}
            rules={[{ required: true, message: "Select a campaign" }]}>
            <Select
              placeholder="Choose a campaign"
              options={campaigns.map((c) => ({
                value: c.id,
                label: c.title,
              }))}
            />
          </Form.Item>

          <div className="flex gap-3">
            <Form.Item
              name="amount"
              label={DONATION_PAGE_CONTENT.amountLabel}
              className="flex-1"
              rules={[
                { required: true, message: "Enter an amount" },
                {
                  type: "number",
                  min: 1,
                  message: "Must be at least 1",
                },
              ]}>
              <InputNumber
                className="w-full"
                min={1}
                step={100}
                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              />
            </Form.Item>

            <Form.Item name="currency" label="Currency" className="w-28">
              <Select
                options={DONATION_PAGE_CONTENT.currencies.map((c) => ({
                  value: c,
                  label: c,
                }))}
              />
            </Form.Item>
          </div>

          <Form.Item name="message" label={DONATION_PAGE_CONTENT.messageLabel}>
            <Input.TextArea
              placeholder={DONATION_PAGE_CONTENT.messagePlaceholder}
              rows={3}
              maxLength={200}
              showCount
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={submitting}
            block
            size="large">
            {DONATION_PAGE_CONTENT.submitButton}
          </Button>
        </Form>
      </div>
    </>
  );
}
