"use client";

import { useState, useEffect, useCallback } from "react";
import { ROUTES } from "@/config/routes";
import { useMockDbSubscription } from "@/hooks/useMockDbSubscription";

interface UseAnalyticsReturn {
    analytics: UserAnalytics | null;
    loading: boolean;
    error: string | null;
    refresh: () => void;
}

export function useUserAnalytics(): UseAnalyticsReturn {
    const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await window.fetch(ROUTES.API.ANALYTICS.ME);
            if (!res.ok) throw new Error("Failed to load analytics");
            const json = await res.json();
            setAnalytics(json.data);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetch();
    }, [fetch]);

    useMockDbSubscription("pointsLedger", fetch);
    useMockDbSubscription("linkEvents", fetch);
    useMockDbSubscription("referrals", fetch);

    return { analytics, loading, error, refresh: fetch };
}

// ─── Campaign Analytics ───────────────────────────────────────────────────────

interface UseCampaignAnalyticsReturn {
    analytics: CampaignAnalytics | null;
    loading: boolean;
    error: string | null;
    refresh: () => void;
}

export function useCampaignAnalytics(
    campaignId: string
): UseCampaignAnalyticsReturn {
    const [analytics, setAnalytics] = useState<CampaignAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        if (!campaignId) return;
        setLoading(true);
        setError(null);
        try {
            const res = await window.fetch(
                ROUTES.API.ANALYTICS.CAMPAIGN(campaignId)
            );
            if (!res.ok) throw new Error("Failed to load campaign analytics");
            const json = await res.json();
            setAnalytics(json.data);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    }, [campaignId]);

    useEffect(() => {
        fetch();
    }, [fetch]);

    useMockDbSubscription("linkEvents", fetch);
    useMockDbSubscription("donations", fetch);

    return { analytics, loading, error, refresh: fetch };
}

// ─── Overview Analytics (Admin) ───────────────────────────────────────────────

interface UseOverviewAnalyticsReturn {
    overview: OverviewAnalytics | null;
    loading: boolean;
    error: string | null;
    refresh: () => void;
}

export function useOverviewAnalytics(): UseOverviewAnalyticsReturn {
    const [overview, setOverview] = useState<OverviewAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await window.fetch(ROUTES.API.ANALYTICS.OVERVIEW);
            if (!res.ok) throw new Error("Failed to load overview");
            const json = await res.json();
            setOverview(json.data);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetch();
    }, [fetch]);

    useMockDbSubscription("users", fetch);
    useMockDbSubscription("campaigns", fetch);

    return { overview, loading, error, refresh: fetch };
}
