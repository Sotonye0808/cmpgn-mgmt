"use client";

import { useState, useEffect, useCallback } from "react";
import { ROUTES } from "@/config/routes";

export function useCampaign(id: string) {
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        setError(null);
        try {
            const res = await window.fetch(ROUTES.API.CAMPAIGNS.DETAIL(id));
            const json = await res.json();
            if (!res.ok) throw new Error(json.error ?? "Campaign not found");
            setCampaign(json.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetch();
    }, [fetch]);

    return { campaign, loading, error, refetch: fetch };
}
