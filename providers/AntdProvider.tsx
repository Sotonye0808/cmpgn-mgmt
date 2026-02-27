"use client";

import React from "react";
import { ConfigProvider, App, theme as antdTheme } from "antd";
import { useTheme } from "next-themes";

/**
 * SSR-safe layout effect.
 * useLayoutEffect runs synchronously before the browser paints on the client,
 * preventing a flash of the wrong theme. On the server it falls back to
 * useEffect (harmless — server renders no visual output).
 */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

/**
 * Read the theme class injected by next-themes' blocking <script> tag.
 * This runs before React's first useEffect/useLayoutEffect fires, so it gives
 * us the correct initial dark/light value without waiting for a render cycle.
 * Returns true (dark) on the server as a safe default matching defaultTheme.
 */
function readDomIsDark(): boolean {
  if (typeof document === "undefined") return true; // SSR fallback — matches defaultTheme="dark"
  return document.documentElement.classList.contains("dark");
}

/** Build the AntD ConfigProvider theme from a single isDark boolean.
 *  All values are hardcoded from globals.css DS tokens — no DOM reads.
 *  This makes the config purely React-state-driven with zero timing hazards. */
function buildThemeConfig(isDark: boolean) {
  return {
    algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      // Brand
      colorPrimary: "#7c3aed",
      colorSuccess: "#10b981",
      colorError: "#ef4444",
      colorWarning: "#f59e0b",
      colorInfo: "#3b82f6",
      // Surfaces — mirrored from globals.css :root / .dark
      colorBgBase: isDark ? "#080910" : "#f8f9fb",
      colorBgContainer: isDark ? "#0f1117" : "#ffffff",
      // colorBgElevated drives portal content: Dropdown, Select, DatePicker, Modal
      colorBgElevated: isDark ? "#181b25" : "#ffffff",
      colorBgSpotlight: isDark ? "#0f1117" : "#ffffff",
      // Borders
      colorBorder: isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb",
      colorBorderSecondary: isDark ? "rgba(255,255,255,0.04)" : "#f3f4f6",
      // Text
      colorText: isDark ? "#f0f0fa" : "#111827",
      colorTextSecondary: isDark ? "#c5c5d8" : "#374151",
      colorTextTertiary: isDark ? "#8888a0" : "#6b7280",
      colorTextDisabled: isDark ? "#555568" : "#9ca3af",
      // Shape
      borderRadius: 8,
      borderRadiusLG: 12,
      borderRadiusSM: 6,
      // Font — matches --ds-font-sans
      fontFamily:
        "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },
  };
}

export function AntdProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // useLayoutEffect fires synchronously before paint on the client, so the
  // second render (with correct theme) happens before the user sees anything.
  useIsomorphicLayoutEffect(() => {
    setMounted(true);
  }, []);

  /**
   * isDark resolution order:
   * 1. After mount: use resolvedTheme from next-themes (the authoritative source).
   *    Fall back to "dark" if resolvedTheme is undefined during a transition.
   * 2. Before mount (first client render): read the DOM class that next-themes'
   *    blocking script has already injected — avoids the flash.
   * 3. SSR: returns true (dark) to match defaultTheme="dark" in ThemeProvider.
   */
  const isDark = mounted
    ? (resolvedTheme ?? "dark") === "dark"
    : readDomIsDark();

  // useMemo depends only on isDark — a simple boolean derived purely from
  // React state (after mount) or a synchronous DOM read (before mount).
  // No getCSSVar calls = no DOM-read timing hazards during theme transitions.
  const themeConfig = React.useMemo(() => buildThemeConfig(isDark), [isDark]);

  return (
    <ConfigProvider theme={themeConfig}>
      <App>{children}</App>
    </ConfigProvider>
  );
}
