"use client";

import { useState, useMemo } from "react";
import {
  Form,
  InputNumber,
  Select,
  Input,
  Button,
  message,
  Card,
  Typography,
} from "antd";
import { DONATION_PAGE_CONTENT } from "@/config/content";
import { ROUTES } from "@/config/routes";
import {
  ACTIVE_BANK_ACCOUNTS,
  getBankAccountsByCurrency,
  formatBankAccountLabel,
} from "@/config/bankAccounts";
import MediaUpload from "@/components/ui/MediaUpload";
import { ICONS } from "@/config/icons";

const { Text } = Typography;

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
  bankAccountId?: string;
  proofScreenshotUrl?: string;
}

export default function DonationForm({
  campaigns,
  onSuccess,
  defaultCampaignId,
}: Props) {
  const [form] = Form.useForm<FormValues>();
  const [submitting, setSubmitting] = useState(false);
  const [msgApi, contextHolder] = message.useMessage();
  const selectedCurrency = Form.useWatch("currency", form) ?? "NGN";

  const bankOptions = useMemo(() => {
    return getBankAccountsByCurrency(selectedCurrency).map((a) => ({
      value: a.id,
      label: formatBankAccountLabel(a),
    }));
  }, [selectedCurrency]);

  const selectedBankId = Form.useWatch("bankAccountId", form);
  const selectedBank = ACTIVE_BANK_ACCOUNTS.find(
    (a) => a.id === selectedBankId,
  );

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
      <div className="bg-ds-surface-elevated border border-ds-border-base rounded-ds-xl p-6">
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

          {/* Bank Account Selection */}
          <Form.Item
            name="bankAccountId"
            label="Bank Account (for offline payment)"
            tooltip="Select the bank account you transferred to">
            <Select
              placeholder="Select bank account"
              allowClear
              options={bankOptions}
              notFoundContent="No accounts for this currency"
            />
          </Form.Item>

          {/* Bank details display */}
          {selectedBank && (
            <Card
              size="small"
              className="mb-4 bg-ds-surface-base border-ds-border-subtle">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ICONS.bank className="text-ds-brand-accent" />
                  <Text strong className="text-ds-text-primary">
                    {selectedBank.bankName}
                  </Text>
                </div>
                <Text className="text-ds-text-secondary block">
                  Account: {selectedBank.accountNumber}
                </Text>
                <Text className="text-ds-text-secondary block">
                  Name: {selectedBank.accountName}
                </Text>
              </div>
            </Card>
          )}

          {/* Proof of Payment Upload */}
          {selectedBankId && (
            <Form.Item
              name="proofScreenshotUrl"
              label="Proof of Payment"
              tooltip="Upload a screenshot of your transfer receipt">
              <MediaUpload
                accept="image/*"
                maxSizeMb={5}
                onChange={(url) =>
                  form.setFieldValue("proofScreenshotUrl", url)
                }
              />
            </Form.Item>
          )}

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
