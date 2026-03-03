// ─── Auto-Refresh Hook ───────────────────────────────────────────────────────
// Production replacement for useMockDbSubscription.
// Polls at a configured interval per table and pauses when the tab is hidden.
// Identical external API — same call signature as the old hook.

"use client";

import { useEffect, useRef, useCallback } from "react";
import { REFRESH_INTERVALS, type RefreshTable } from "@/config/realtime";

/**
 * Subscribe to periodic data refreshes for a given table.
 *
 * @param tableName - The table/domain to watch (typed via RefreshTable).
 * @param onChange  - Callback fired each interval (typically a fetch/setState).
 */
export function useAutoRefresh(
    tableName: RefreshTable,
    onChange: () => void
): void {
    const savedCallback = useRef(onChange);

    // Keep callback ref fresh without re-triggering the effect
    useEffect(() => {
        savedCallback.current = onChange;
    }, [onChange]);

    const tick = useCallback(() => {
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

        // Start polling
        start();

        // Pause when tab is hidden
        document.addEventListener("visibilitychange", handleVisibility);

        return () => {
            stop();
            document.removeEventListener("visibilitychange", handleVisibility);
        };
    }, [tableName, tick]);
}
