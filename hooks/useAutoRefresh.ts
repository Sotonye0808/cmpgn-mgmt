// ─── Auto-Refresh Hook ───────────────────────────────────────────────────────
// Production replacement for useMockDbSubscription.
// Polls at a configured interval per table and pauses when the tab is hidden.
// Supports optional data fingerprinting: when `getFingerprint` returns the
// same value as the previous tick the `onChange` callback is skipped, avoiding
// unnecessary re-renders and fetch cycles.

"use client";

import { useEffect, useRef, useCallback } from "react";
import { REFRESH_INTERVALS, type RefreshTable } from "@/config/realtime";

interface AutoRefreshOptions {
    /**
     * Return a lightweight fingerprint of the current data (e.g. an array
     * length, JSON hash, or `updatedAt` timestamp). When the fingerprint
     * equals the previous tick's value the `onChange` callback is skipped.
     * Omit to fire every interval unconditionally.
     */
    getFingerprint?: () => string | number;
}

/**
 * Subscribe to periodic data refreshes for a given table.
 *
 * @param tableName - The table/domain to watch (typed via RefreshTable).
 * @param onChange  - Callback fired each interval (typically a fetch/setState).
 * @param options   - Optional fingerprint configuration.
 */
export function useAutoRefresh(
    tableName: RefreshTable,
    onChange: () => void,
    options?: AutoRefreshOptions,
): void {
    const savedCallback = useRef(onChange);
    const savedFingerprint = useRef(options?.getFingerprint);
    const lastFingerprint = useRef<string | number | null>(null);

    // Keep refs fresh without re-triggering the effect
    useEffect(() => {
        savedCallback.current = onChange;
    }, [onChange]);

    useEffect(() => {
        savedFingerprint.current = options?.getFingerprint;
    }, [options?.getFingerprint]);

    const tick = useCallback(() => {
        const fp = savedFingerprint.current;
        if (fp) {
            const current = fp();
            if (current === lastFingerprint.current) return; // no change — skip
            lastFingerprint.current = current;
        }
        savedCallback.current();
    }, []);

    useEffect(() => {
        const intervalMs = REFRESH_INTERVALS[tableName] ?? 30_000;

        // Skip polling entirely when interval is 0 (disabled)
        if (intervalMs === 0) return;

        let timerId: ReturnType<typeof setInterval> | null = null;

        function start() {
            if (timerId) return;
            timerId = setInterval(tick, intervalMs);
        }

        function stop() {
            if (timerId) {
                clearInterval(timerId);
                timerId = null;
            }
        }

        function handleVisibility() {
            if (document.visibilityState === "visible") {
                // Immediately fire on tab refocus, then resume interval
                tick();
                start();
            } else {
                stop();
            }
        }

        // Listen for the global "dmhicc:refresh" event dispatched by the navbar
        // refresh button. Forces an immediate re-fetch across all subscribed hooks.
        function handleGlobalRefresh() {
            savedCallback.current();
        }

        // Start polling
        start();

        // Pause when tab is hidden
        document.addEventListener("visibilitychange", handleVisibility);
        window.addEventListener("dmhicc:refresh", handleGlobalRefresh);

        return () => {
            stop();
            document.removeEventListener("visibilitychange", handleVisibility);
            window.removeEventListener("dmhicc:refresh", handleGlobalRefresh);
        };
    }, [tableName, tick]);
}
