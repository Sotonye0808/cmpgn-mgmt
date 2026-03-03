"use client";

import { useState, useEffect, useCallback } from "react";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";

interface UsePointsOptions {
    campaignId?: string;
}

interface UsePointsReturn {
    summary: PointsSummary | null;
    progress: RankProgress | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export function usePoints({ campaignId }: UsePointsOptions = {}): UsePointsReturn {
    const [summary, setSummary] = useState<PointsSummary | null>(null);
    const [progress, setProgress] = useState<RankProgress | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const qs = new URLSearchParams();
            if (campaignId) qs.set("campaignId", campaignId);
            const res = await window.fetch(`/api/points/me?${qs}`);
            if (!res.ok) throw new Error("Failed to fetch points");
            const json = await res.json();
            setSummary(json.data.summary);
            setProgress(json.data.progress);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    }, [campaignId]);

    useEffect(() => { fetch(); }, [fetch]);
    useAutoRefresh("pointsLedger", fetch);

    return { summary, progress, loading, error, refetch: fetch };
}
