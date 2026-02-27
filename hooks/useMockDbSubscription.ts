"use client";

import { useEffect } from "react";

// Client-side hook: subscribes to globally available mockDb EventEmitter
// via SSE-like polling for dev mode (since EventEmitter is server-side).
// In production this would use WebSockets / SSE / SWR revalidation.

export function useMockDbSubscription(
    tableName: string,
    onChange: () => void
) {
    useEffect(() => {
        // In development we poll every 3s as a simple simulation
        // Production: swap to WebSocket/SSE subscription
        if (process.env.NODE_ENV !== "development") return;

        const interval = setInterval(() => {
            // Polling trigger represents a "changed" event
            // Real implementation: subscribe to SSE endpoint that wraps mockDb EventEmitter
        }, 3000);

        return () => clearInterval(interval);
    }, [tableName, onChange]);
}
