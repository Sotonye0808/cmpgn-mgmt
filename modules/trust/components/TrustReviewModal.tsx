"use client";

import { useState } from "react";
import { Modal, Button, Space, Popconfirm, App } from "antd";
import { TRUST_PAGE_CONTENT } from "@/config/content";
import { ROUTES } from "@/config/routes";

interface Props {
  open: boolean;
  userId: string;
  userName: string;
  onClose: () => void;
  onResolved: () => void;
}

type Resolution = "CLEAR" | "PENALIZE" | "ESCALATE";

export default function TrustReviewModal({
  open,
  userId,
  userName,
  onClose,
  onResolved,
}: Props) {
  const [loading, setLoading] = useState<Resolution | null>(null);
  const { message: msgApi } = App.useApp();

  const resolve = async (resolution: Resolution) => {
    setLoading(resolution);
    try {
      const res = await fetch(ROUTES.API.TRUST.REVIEW(userId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolution }),
      });
      if (!res.ok) throw new Error("Review failed");
      msgApi.success(`Flag resolved: ${resolution}`);
      onResolved();
      onClose();
    } catch (e) {
      msgApi.error(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <Modal
        open={open}
        onCancel={onClose}
        title={`Review: ${userName}`}
        footer={null}
        width={460}>
        <p className="text-ds-text-secondary mb-6">
          Choose an action for this user&#39;s flagged activity:
        </p>
        <Space direction="vertical" className="w-full">
          <Popconfirm
            title="Clear all flags?"
            description="This will restore the user's trust score."
            onConfirm={() => resolve("CLEAR")}
            okText="Confirm"
            cancelText="Cancel">
            <Button
              block
              type="primary"
              loading={loading === "CLEAR"}
              className="bg-ds-brand-success hover:bg-ds-brand-success-hover">
              {TRUST_PAGE_CONTENT.resolveButton} — Clear all flags &amp; restore
              score
            </Button>
          </Popconfirm>
          <Popconfirm
            title="Penalize this user?"
            description="This will apply an additional score penalty. This action cannot be undone."
            onConfirm={() => resolve("PENALIZE")}
            okText="Penalize"
            okButtonProps={{ danger: true }}
            cancelText="Cancel">
            <Button block danger loading={loading === "PENALIZE"}>
              {TRUST_PAGE_CONTENT.penalizeButton} — Apply additional score
              penalty
            </Button>
          </Popconfirm>
          <Popconfirm
            title="Escalate this user?"
            description="This will mark the user as reviewed and escalate for further action."
            onConfirm={() => resolve("ESCALATE")}
            okText="Escalate"
            cancelText="Cancel">
            <Button block loading={loading === "ESCALATE"}>
              {TRUST_PAGE_CONTENT.escalateButton} — Mark as reviewed &amp;
              escalate
            </Button>
          </Popconfirm>
        </Space>
      </Modal>
    </>
  );
}
