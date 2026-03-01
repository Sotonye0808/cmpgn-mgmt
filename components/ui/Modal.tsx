"use client";

import { Modal as AntModal } from "antd";
import type { ModalProps as AntModalProps } from "antd";
import { cn } from "@/lib/utils/cn";

type ModalProps = AntModalProps;

export default function Modal({ className, centered = true, ...props }: ModalProps) {
  return (
    <AntModal
      centered={centered}
      className={cn("rounded-ds-2xl overflow-hidden", className)}
      styles={{
        header: {
          background: "var(--ds-surface-glass)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--ds-border-strong)",
        },
        content: {
          background: "var(--ds-surface-elevated)",
          borderRadius: "var(--ds-radius-2xl)",
          padding: 0,
        },
        body: {
          padding: "24px",
        },
        footer: {
          padding: "12px 24px 20px",
          borderTop: "1px solid var(--ds-border-base)",
          background: "var(--ds-surface-elevated)",
          margin: 0,
        },
      }}
      {...props}
    />
  );
}
