"use client";

import { useState, useEffect, useCallback } from "react";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";

interface UseLeaderboardOptions {
    campaignId?: string;
    filter?: LeaderboardFilter;
    page?: number;
    pageSize?: number;
    /** Number of days to look back. 0 = all time. */
    days?: number;
}

interface UseLeaderboardReturn {
    entries: LeaderboardEntry[];
    myRank: UserRankInfo | null;
    total: number;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useLeaderboard({
    campaignId,
    filter = "individual",
    page = 1,
    pageSize = 20,
    days,
}: UseLeaderboardOptions = {}): UseLeaderboardReturn {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [myRank, setMyRank] = useState<UserRankInfo | null>(null);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const qs = new URLSearchParams({ filter, page: String(page), pageSize: String(pageSize) });
            if (campaignId) qs.set("campaignId", campaignId);
            if (days !== undefined) qs.set("days", String(days));

            // When filter is "individual" and no campaignId is provided, fall back to global.
            // Calling /api/leaderboard/campaigns/global would result in zero results (no campaign
            // with id "global" exists). Campaign-scoped individual rankings are driven by J2.
            let listUrl: string;
            if (filter === "team") {
                listUrl = `/api/leaderboard/team?${qs}`;
            } else if (filter === "group") {
                listUrl = `/api/leaderboard/group?${qs}`;
            } else if (filter === "global" || !campaignId) {
                listUrl = `/api/leaderboard/global?${qs}`;
            } else {
                listUrl = `/api/leaderboard/campaigns/${campaignId}?${qs}`;
            }

            const [listRes, myRankRes] = await Promise.all([
                window.fetch(listUrl),
                window.fetch(`/api/leaderboard/me?${campaignId ? `campaignId=${campaignId}` : ""}`),
            ]);

            if (listRes.ok) {
                const json = await listRes.json();
                setEntries(json.data ?? []);
                setTotal(json.pagination?.total ?? 0);
            }
            if (myRankRes.ok) {
                const json = await myRankRes.json();
                setMyRank(json.data);
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    }, [campaignId, filter, page, pageSize, days]);

    useEffect(() => { fetch(); }, [fetch]);
    useAutoRefresh("leaderboardSnapshots", fetch);
    useAutoRefresh("pointsLedger", fetch);

    return { entries, myRank, total, loading, error, refetch: fetch };
}
