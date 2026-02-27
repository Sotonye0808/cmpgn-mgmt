"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { COOKIE_CONSENT_CONTENT } from "@/config/content";

/**
 * CookieConsent — bottom banner informing users about essential-only cookie usage.
 *
 * Client component — reads/writes localStorage to track dismissal.
 * Rendered in the (public) and (auth) layouts; removed from DOM once dismissed.
 * All copy comes from config/content.ts (COOKIE_CONSENT_CONTENT).
 */
export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(COOKIE_CONSENT_CONTENT.storageKey);
      if (stored !== COOKIE_CONSENT_CONTENT.storageValue) {
        setVisible(true);
      }
    } catch {
      // localStorage unavailable (SSR guard / privacy mode) — don't show
    }
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(
        COOKIE_CONSENT_CONTENT.storageKey,
        COOKIE_CONSENT_CONTENT.storageValue,
      );
    } catch {
      // ignore
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie notice"
      className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 sm:px-6 sm:pb-6 pointer-events-none">
      <div className="max-w-3xl mx-auto glass-surface glow-border rounded-ds-xl pointer-events-auto">
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Icon */}
          <div className="shrink-0 w-9 h-9 rounded-ds-lg bg-ds-brand-accent-subtle border border-ds-brand-accent/30 flex items-center justify-center text-lg select-none">
            🍪
          </div>

          {/* Copy */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-ds-text-primary mb-0.5">
              {COOKIE_CONSENT_CONTENT.title}
            </p>
            <p className="text-xs text-ds-text-subtle leading-relaxed">
              {COOKIE_CONSENT_CONTENT.body}{" "}
              <Link
                href={COOKIE_CONSENT_CONTENT.learnMoreHref}
                className="text-ds-brand-accent hover:underline underline-offset-2 whitespace-nowrap">
                {COOKIE_CONSENT_CONTENT.learnMoreLabel}
              </Link>
            </p>
          </div>

          {/* Dismiss */}
          <button
            type="button"
            onClick={dismiss}
            className="shrink-0 px-4 py-2 bg-ds-brand-accent hover:bg-ds-brand-accent-hover text-white text-sm font-medium rounded-ds-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ds-brand-accent focus-visible:ring-offset-2">
            {COOKIE_CONSENT_CONTENT.acceptLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
