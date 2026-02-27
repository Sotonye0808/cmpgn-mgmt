"use client";

import { useState, useEffect, useCallback } from "react";
import { useMockDbSubscription } from "@/hooks/useMockDbSubscription";

interface UseEngagementOptions {
    campaignId?: string;
    days?: number;
}

interface UseEngagementReturn {
    stats: EngagementStats | null;
    timeline: EngagementTimelinePoint[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useEngagement({ campaignId, days = 14 }: UseEngagementOptions = {}): UseEngagementReturn {
    const [stats, setStats] = useState<EngagementStats | null>(null);
    const [timeline, setTimeline] = useState<EngagementTimelinePoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const qs = new URLSearchParams();
            if (campaignId) qs.set("campaignId", campaignId);
            qs.set("days", String(days));

            const [statsRes, timelineRes] = await Promise.all([
                window.fetch(`/api/engagement/me?${qs}`),
                window.fetch(`/api/engagement/timeline?${qs}`),
            ]);

            if (!statsRes.ok || !timelineRes.ok) throw new Error("Failed to fetch engagement");

            const [statsData, timelineData] = await Promise.all([
                statsRes.json(),
                timelineRes.json(),
            ]);

            setStats(statsData.data);
            setTimeline(timelineData.data ?? []);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    }, [campaignId, days]);

    useEffect(() => { fetch(); }, [fetch]);
    useMockDbSubscription("linkEvents", fetch);

    return { stats, timeline, loading, error, refetch: fetch };
}

// Convenience hook for components that only need the timeline (e.g. AnalyticsPage)
export function useEngagementTimeline(days = 14): {
    timeline: EngagementTimelinePoint[];
    loading: boolean;
} {
    const { timeline, loading } = useEngagement({ days });
    return { timeline, loading };
}
