"use client";

import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

interface SpinnerProps {
  size?: "small" | "default" | "large";
  fullPage?: boolean;
  tip?: string;
}

export default function Spinner({
  size = "default",
  fullPage = false,
  tip,
}: SpinnerProps) {
  const icon = (
    <LoadingOutlined
      style={{ fontSize: size === "large" ? 32 : size === "small" ? 16 : 24 }}
      spin
    />
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-ds-surface-base/80 backdrop-blur-sm z-50">
        <Spin indicator={icon} tip={tip} size={size} />
      </div>
    );
  }

  return <Spin indicator={icon} tip={tip} size={size} />;
}
