"use client";

import { useState, useEffect, useCallback } from "react";
import { ROUTES } from "@/config/routes";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";

interface UseDonationsReturn {
    donations: Donation[];
    total: number;
    loading: boolean;
    error: string | null;
    page: number;
    setPage: (p: number) => void;
    refresh: () => void;
}

export function useDonations(): UseDonationsReturn {
    const [donations, setDonations] = useState<Donation[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);

    const fetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await window.fetch(
                `${ROUTES.API.DONATIONS.BASE}/me?page=${page}`
            );
            if (!res.ok) throw new Error("Failed to load donations");
            const json = await res.json();
            setDonations(json.data ?? []);
            setTotal(json.pagination?.total ?? 0);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        fetch();
    }, [fetch]);

    useAutoRefresh("donations", fetch);

    return { donations, total, loading, error, page, setPage, refresh: fetch };
}

// ─── Campaign Fundraising Stats ───────────────────────────────────────────────

interface UseFundraisingReturn {
    stats: DonationStats | null;
    loading: boolean;
    error: string | null;
    refresh: () => void;
}

export function useFundraising(campaignId: string): UseFundraisingReturn {
    const [stats, setStats] = useState<DonationStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        if (!campaignId) return;
        setLoading(true);
        try {
            const res = await window.fetch(
                `${ROUTES.API.DONATIONS.BASE}/campaigns/${campaignId}`
            );
            if (!res.ok) throw new Error("Failed to load fundraising stats");
            const json = await res.json();
            setStats(json.data);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    }, [campaignId]);

    useEffect(() => {
        fetch();
    }, [fetch]);

    useAutoRefresh("donations", fetch);

    return { stats, loading, error, refresh: fetch };
}
