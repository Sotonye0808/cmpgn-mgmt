"use client";

import { useState, useEffect, useCallback } from "react";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";

interface UseReferralOptions {
    campaignId?: string;
}

interface UseReferralReturn {
    stats: ReferralStats | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useReferral({ campaignId }: UseReferralOptions = {}): UseReferralReturn {
    const [stats, setStats] = useState<ReferralStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const qs = new URLSearchParams();
            if (campaignId) qs.set("campaignId", campaignId);
            const res = await window.fetch(`/api/referrals/me?${qs}`);
            if (!res.ok) throw new Error("Failed to fetch referral stats");
            const json = await res.json();
            setStats(json.data);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    }, [campaignId]);

    useEffect(() => { fetch(); }, [fetch]);
    useAutoRefresh("referrals", fetch);

    return { stats, loading, error, refetch: fetch };
}
