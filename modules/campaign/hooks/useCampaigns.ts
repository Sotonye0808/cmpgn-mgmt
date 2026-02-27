"use client";

import { useState, useEffect, useCallback } from "react";
import { ROUTES } from "@/config/routes";
import type { PaginatedResponse } from "@/types/api";

interface UseCampaignsOptions {
    filters?: CampaignFilters;
    page?: number;
    pageSize?: number;
}

export function useCampaigns({ filters = {}, page = 1, pageSize = 10 }: UseCampaignsOptions = {}) {
    const [data, setData] = useState<PaginatedResponse<Campaign> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                pageSize: pageSize.toString(),
                ...(filters.status && { status: filters.status as string }),
                ...(filters.search && { search: filters.search }),
                ...(filters.goalType && { goalType: filters.goalType as string }),
            });
            const res = await window.fetch(`${ROUTES.API.CAMPAIGNS.BASE}?${params}`);
            const json = await res.json();
            if (!res.ok) throw new Error(json.error ?? "Failed to fetch campaigns");
            setData(json);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error");
        } finally {
            setLoading(false);
        }
    }, [filters.status, filters.search, filters.goalType, page, pageSize]);

    useEffect(() => {
        fetch();
    }, [fetch]);

    return { campaigns: data?.data ?? [], pagination: data?.pagination, loading, error, refetch: fetch };
}
