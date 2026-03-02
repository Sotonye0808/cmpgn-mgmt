"use client";

import { useState, useEffect, useCallback } from "react";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";

interface UseTeamsReturn {
    teams: Team[];
    groups: Group[];
    myTeam: Team | null;
    myGroup: Group | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useTeams(userId?: string): UseTeamsReturn {
    const [teams, setTeams] = useState<Team[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [myTeam, setMyTeam] = useState<Team | null>(null);
    const [myGroup, setMyGroup] = useState<Group | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [teamsRes, groupsRes] = await Promise.all([
                window.fetch("/api/teams"),
                window.fetch("/api/groups"),
            ]);

            let foundMyTeam: Team | null = null;

            if (teamsRes.ok) {
                const json = await teamsRes.json();
                const allTeams: Team[] = json.data ?? [];
                setTeams(allTeams);

                if (userId) {
                    foundMyTeam = allTeams.find((t) => t.memberIds.includes(userId)) ?? null;
                    setMyTeam(foundMyTeam);
                }
            }

            if (groupsRes.ok) {
                const json = await groupsRes.json();
                const allGroups: Group[] = json.data ?? [];
                setGroups(allGroups);

                // Use the locally resolved team — not the stale state value
                if (foundMyTeam) {
                    const userGroup = allGroups.find((g) =>
                        g.teamIds.includes(foundMyTeam!.id)
                    );
                    setMyGroup(userGroup ?? null);
                } else {
                    setMyGroup(null);
                }
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to load teams");
        } finally {
            setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]); // intentionally excludes myTeam — derived inside fetchData to avoid loop

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useAutoRefresh("teams", fetchData);
    useAutoRefresh("groups", fetchData);

    return { teams, groups, myTeam, myGroup, loading, error, refetch: fetchData };
}
