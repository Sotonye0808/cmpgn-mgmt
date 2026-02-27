"use client";

import { useState, useEffect, useCallback } from "react";

interface UseSmartLinkOptions {
    campaignId: string;
    enabled?: boolean;
}

interface UseSmartLinkReturn {
    link: SmartLink | null;
    loading: boolean;
    error: string | null;
    generate: () => Promise<void>;
    refetch: () => void;
}

export function useSmartLink({ campaignId, enabled = true }: UseSmartLinkOptions): UseSmartLinkReturn {
    const [link, setLink] = useState<SmartLink | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchLink = useCallback(async () => {
        if (!campaignId || !enabled) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/smart-links?campaignId=${campaignId}`);
            if (res.ok) {
                const json = await res.json();
                setLink(json.data?.[0] ?? null);
            }
        } catch {
            // No link yet — that's fine
        } finally {
            setLoading(false);
        }
    }, [campaignId, enabled]);

    const generate = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/smart-links/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ campaignId }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error ?? "Failed to generate link");
            setLink(json.data);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Failed to generate link");
        } finally {
            setLoading(false);
        }
    }, [campaignId]);

    useEffect(() => {
        fetchLink();
    }, [fetchLink]);

    return { link, loading, error, generate, refetch: fetchLink };
}
