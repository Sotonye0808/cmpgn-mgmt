"use client";

import { useState, useEffect, useCallback } from "react";
import { ROUTES } from "@/config/routes";
import { useMockDbSubscription } from "@/hooks/useMockDbSubscription";

interface UseTrustReturn {
    trustScore: TrustScore | null;
    loading: boolean;
    error: string | null;
    refresh: () => void;
}

export function useTrustScore(): UseTrustReturn {
    const [trustScore, setTrustScore] = useState<TrustScore | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await window.fetch(ROUTES.API.TRUST.ME);
            if (!res.ok) throw new Error("Failed to load trust score");
            const json = await res.json();
            setTrustScore(json.data);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetch();
    }, [fetch]);

    useMockDbSubscription("trustScores", fetch);

    return { trustScore, loading, error, refresh: fetch };
}

// ─── Flagged Users (Admin) ────────────────────────────────────────────────────

interface UseFlaggedUsersReturn {
    flaggedUsers: TrustFlagRecord[];
    loading: boolean;
    error: string | null;
    refresh: () => void;
}

export function useFlaggedUsers(): UseFlaggedUsersReturn {
    const [flaggedUsers, setFlaggedUsers] = useState<TrustFlagRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await window.fetch(ROUTES.API.TRUST.USERS);
            if (!res.ok) throw new Error("Failed to load flagged users");
            const json = await res.json();
            setFlaggedUsers(json.data ?? []);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetch();
    }, [fetch]);

    useMockDbSubscription("trustScores", fetch);

    return { flaggedUsers, loading, error, refresh: fetch };
}
