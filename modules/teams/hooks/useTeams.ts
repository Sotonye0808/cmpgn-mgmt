"use client";

import { useState, useEffect, useCallback } from "react";
import { useMockDbSubscription } from "@/hooks/useMockDbSubscription";

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

            if (teamsRes.ok) {
                const json = await teamsRes.json();
                const allTeams: Team[] = json.data ?? [];
                setTeams(allTeams);

                // Find user's team
                if (userId) {
                    const userTeam = allTeams.find((t) =>
                        t.memberIds.includes(userId)
                    );
                    setMyTeam(userTeam ?? null);
                }
            }

            if (groupsRes.ok) {
                const json = await groupsRes.json();
                const allGroups: Group[] = json.data ?? [];
                setGroups(allGroups);

                // Find user's group (via team)
                if (userId && myTeam) {
                    const userGroup = allGroups.find((g) =>
                        g.teamIds.includes(myTeam.id)
                    );
                    setMyGroup(userGroup ?? null);
                }
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to load teams");
        } finally {
            setLoading(false);
        }
    }, [userId, myTeam]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useMockDbSubscription("teams", fetchData);
    useMockDbSubscription("groups", fetchData);

    return { teams, groups, myTeam, myGroup, loading, error, refetch: fetchData };
}
