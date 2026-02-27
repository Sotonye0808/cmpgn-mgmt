"use client";

import React from "react";
import { ConfigProvider, App } from "antd";

function getCSSVar(name: string): string {
  if (typeof window === "undefined") return "";
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

export function AntdProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const theme = React.useMemo(() => {
    if (!mounted) return {};
    return {
      token: {
        colorPrimary: getCSSVar("--ds-brand-accent") || "#7c3aed",
        colorSuccess: getCSSVar("--ds-brand-success") || "#10b981",
        colorError: getCSSVar("--ds-status-error") || "#ef4444",
        colorWarning: getCSSVar("--ds-status-warning") || "#f59e0b",
        colorInfo: getCSSVar("--ds-status-info") || "#3b82f6",
        colorBgBase: getCSSVar("--ds-surface-base") || "#f8f9fb",
        colorBgContainer: getCSSVar("--ds-surface-elevated") || "#ffffff",
        colorBorder: getCSSVar("--ds-border-base") || "#e5e7eb",
        colorText: getCSSVar("--ds-text-primary") || "#111827",
        colorTextSecondary: getCSSVar("--ds-text-secondary") || "#374151",
        borderRadius: 8,
        borderRadiusLG: 12,
        borderRadiusSM: 6,
        fontFamily: getCSSVar("--ds-font-sans") || "Inter, sans-serif",
      },
    };
  }, [mounted]);

  return (
    <ConfigProvider theme={theme}>
      <App>{children}</App>
    </ConfigProvider>
  );
}
