"use client";

import React from "react";
import { ConfigProvider, App, theme as antdTheme } from "antd";
import { useTheme } from "next-themes";

function getCSSVar(name: string): string {
  if (typeof window === "undefined") return "";
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

export function AntdProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  const { resolvedTheme } = useTheme();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";

  const themeConfig = React.useMemo(() => {
    if (!mounted) return {};
    return {
      algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      token: {
        colorPrimary: getCSSVar("--ds-brand-accent") || "#7c3aed",
        colorSuccess: getCSSVar("--ds-brand-success") || "#10b981",
        colorError: getCSSVar("--ds-status-error") || "#ef4444",
        colorWarning: getCSSVar("--ds-status-warning") || "#f59e0b",
        colorInfo: getCSSVar("--ds-status-info") || "#3b82f6",
        colorBgBase:
          getCSSVar("--ds-surface-base") || (isDark ? "#080910" : "#f8f9fb"),
        colorBgContainer:
          getCSSVar("--ds-surface-elevated") ||
          (isDark ? "#0f1117" : "#ffffff"),
        colorBorder: getCSSVar("--ds-border-base") || "#e5e7eb",
        colorText:
          getCSSVar("--ds-text-primary") || (isDark ? "#f0f0fa" : "#111827"),
        colorTextSecondary:
          getCSSVar("--ds-text-secondary") || (isDark ? "#c5c5d8" : "#374151"),
        borderRadius: 8,
        borderRadiusLG: 12,
        borderRadiusSM: 6,
        fontFamily: getCSSVar("--ds-font-sans") || "Inter, sans-serif",
      },
    };
  }, [mounted, resolvedTheme, isDark]);

  return (
    <ConfigProvider theme={themeConfig}>
      <App>{children}</App>
    </ConfigProvider>
  );
}
