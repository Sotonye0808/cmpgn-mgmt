"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Tooltip } from "antd";
import { ICONS } from "@/config/icons";

export default function FloatingActions() {
  const { setTheme, resolvedTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Avoid hydration mismatch — only render after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 200);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Cycle: system → dark → light → system
  const cycleTheme = () => {
    if (theme === "system") setTheme("dark");
    else if (theme === "dark") setTheme("light");
    else setTheme("system");
  };

  const ThemeIcon =
    theme === "system" ? ICONS.monitor : resolvedTheme === "dark" ? ICONS.sun : ICONS.moon;

  const themeTooltip =
    theme === "system"
      ? "System theme (auto) — click for Dark"
      : theme === "dark"
      ? "Dark mode — click for Light"
      : "Light mode — click for System (auto)";

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-center">
      {/* Scroll-to-top — appears after 200px scroll */}
      <div
        className={`transition-all duration-300 ${
          showScrollTop
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}>
        <Tooltip title="Back to top" placement="left">
          <button
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className="w-10 h-10 rounded-ds-xl border border-ds-border-base bg-ds-surface-elevated/80 backdrop-blur-sm text-ds-text-secondary hover:text-ds-brand-accent hover:border-ds-brand-accent/50 hover:bg-ds-surface-elevated transition-all shadow-lg flex items-center justify-center">
            <ICONS.arrowUp className="text-sm" />
          </button>
        </Tooltip>
      </div>

      {/* Theme toggle — always visible once mounted */}
      {mounted && (
        <Tooltip title={themeTooltip} placement="left">
          <button
            onClick={cycleTheme}
            aria-label="Cycle theme"
            className="w-10 h-10 rounded-ds-xl border border-ds-border-base bg-ds-surface-elevated/80 backdrop-blur-sm text-ds-text-secondary hover:text-ds-brand-accent hover:border-ds-brand-accent/50 hover:bg-ds-surface-elevated transition-all shadow-lg flex items-center justify-center">
            <ThemeIcon className="text-sm" />
          </button>
        </Tooltip>
      )}
    </div>
  );
}
