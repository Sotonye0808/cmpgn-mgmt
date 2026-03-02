"use client";

import { useCallback, useEffect, useState } from "react";
import { useAutoRefresh } from "./useAutoRefresh";

export function useNotifications() {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await fetch("/api/notifications");
            if (!res.ok) return;
            const json = await res.json();
            setNotifications(json.data ?? []);
        } catch {
            // silently fail — bell just shows no items
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Re-fetch when the notifications table changes (e.g. another tab or server push)
    useAutoRefresh("notifications", fetchNotifications);

    const markRead = useCallback(async (id: string) => {
        // Optimistic update
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
        await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    }, []);

    const markAllRead = useCallback(async () => {
        // Optimistic update
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        await fetch("/api/notifications/read-all", { method: "POST" });
    }, []);

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return { notifications, unreadCount, loading, markRead, markAllRead };
}
