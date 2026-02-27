"use client";

import { useState } from "react";
import { Modal, Button, Space, message } from "antd";
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
  const [msgApi, contextHolder] = message.useMessage();

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
      {contextHolder}
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
          <Button
            block
            type="primary"
            loading={loading === "CLEAR"}
            onClick={() => resolve("CLEAR")}
            className="bg-ds-brand-success hover:bg-ds-brand-success-hover">
            {TRUST_PAGE_CONTENT.resolveButton} — Clear all flags &amp; restore
            score
          </Button>
          <Button
            block
            danger
            loading={loading === "PENALIZE"}
            onClick={() => resolve("PENALIZE")}>
            {TRUST_PAGE_CONTENT.penalizeButton} — Apply additional score penalty
          </Button>
          <Button
            block
            loading={loading === "ESCALATE"}
            onClick={() => resolve("ESCALATE")}>
            {TRUST_PAGE_CONTENT.escalateButton} — Mark as reviewed &amp;
            escalate
          </Button>
        </Space>
      </Modal>
    </>
  );
}
