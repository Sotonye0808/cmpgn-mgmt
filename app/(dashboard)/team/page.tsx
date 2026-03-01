"use client";

import { useState, useEffect, useCallback } from "react";
import { Divider, message } from "antd";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { TEAM_PAGE_CONTENT } from "@/config/content";
import { useLeaderboard } from "@/modules/leaderboard/hooks/useLeaderboard";
import LeaderboardTable from "@/modules/leaderboard/components/LeaderboardTable";
import LeaderboardFilters from "@/modules/leaderboard/components/LeaderboardFilters";
import {
    useTeams,
    TeamManagementPanel,
    GroupManagementPanel,
    MyTeamCard,
    TEAM_PAGE_SECTIONS,
} from "@/modules/teams";
import Spinner from "@/components/ui/Spinner";

export default function TeamPage() {
    const { user } = useAuth();
    const { isAdmin } = useRole();
    const { teams, groups, myTeam, loading: teamsLoading, refetch } = useTeams(user?.id);
    const [filter, setFilter] = useState<LeaderboardFilter>("team");
    const [page, setPage] = useState(1);
    const [myTeamMembers, setMyTeamMembers] = useState<
        Array<{ id: string; firstName: string; lastName: string; role: string; profilePicture?: string }>
    >([]);

    const { entries, myRank, total, loading: lbLoading } = useLeaderboard({
        filter,
        page,
        pageSize: 20,
    });

    // Fetch members of user's team
    useEffect(() => {
        if (!myTeam) {
            setMyTeamMembers([]);
            return;
        }
        window
            .fetch(`/api/teams/${myTeam.id}`)
            .then((r) => r.json())
            .then((json) => {
                if (json.data?.members) {
                    setMyTeamMembers(
                        json.data.members.map((m: Record<string, unknown>) => ({
                            id: m.id as string,
                            firstName: m.firstName as string,
                            lastName: m.lastName as string,
                            role: m.role as string,
                            profilePicture: m.profilePicture as string | undefined,
                        }))
                    );
                }
            })
            .catch(() => {
                /* silent */
            });
    }, [myTeam]);

    const handleRemoveMember = useCallback(
        async (userId: string) => {
            if (!myTeam) return;
            try {
                const res = await window.fetch(
                    `/api/teams/${myTeam.id}/members?userId=${userId}`,
                    { method: "DELETE" }
                );
                const json = await res.json();
                if (json.success) {
                    message.success("Member removed");
                    refetch();
                } else {
                    message.error(json.error ?? "Failed");
                }
            } catch {
                message.error("Network error");
            }
        },
        [myTeam, refetch]
    );

    const visibleSections = TEAM_PAGE_SECTIONS.filter((s) =>
        s.allowedRoles.includes(user?.role as unknown as string)
    );

    if (teamsLoading) {
        return (
            <div className="flex justify-center py-16">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-ds-text-primary">
                    {TEAM_PAGE_CONTENT.title}
                </h1>
                <p className="text-sm text-ds-text-secondary mt-1">
                    {TEAM_PAGE_CONTENT.subtitle}
                </p>
            </div>

            {/* My Team — visible to all */}
            {visibleSections.some((s) => s.key === "my-team") && myTeam && (
                <>
                    <MyTeamCard
                        team={myTeam}
                        members={myTeamMembers}
                        isAdmin={isAdmin}
                        currentUserId={user?.id}
                        onRemoveMember={handleRemoveMember}
                    />
                    <Divider className="my-0" />
                </>
            )}

            {/* Admin: Team Management */}
            {visibleSections.some((s) => s.key === "team-management") && isAdmin && (
                <>
                    <TeamManagementPanel
                        teams={teams}
                        groups={groups}
                        onRefresh={refetch}
                    />
                    <Divider className="my-0" />
                </>
            )}

            {/* Admin: Group Management */}
            {visibleSections.some((s) => s.key === "group-management") && isAdmin && (
                <>
                    <GroupManagementPanel
                        groups={groups}
                        teams={teams}
                        onRefresh={refetch}
                    />
                    <Divider className="my-0" />
                </>
            )}

            {/* Leaderboard — visible to all */}
            {visibleSections.some((s) => s.key === "leaderboard") && (
                <div className="space-y-4">
                    {/* My rank card (brief) */}
                    {myRank && (
                        <div className="glass-surface rounded-ds-xl p-4 flex items-center gap-4">
                            <div className="text-4xl font-bold font-ds-mono text-ds-brand-accent">
                                #{myRank.position}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-ds-text-primary">
                                    Your current rank
                                </p>
                                <p className="text-xs text-ds-text-subtle">
                                    {myRank.score} pts · {total} total participants
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-ds-text-primary">
                            {TEAM_PAGE_CONTENT.performanceTitle}
                        </h2>
                        <LeaderboardFilters
                            value={filter}
                            onChange={(f) => {
                                setFilter(f);
                                setPage(1);
                            }}
                        />
                    </div>

                    {lbLoading ? (
                        <div className="flex justify-center py-16">
                            <Spinner />
                        </div>
                    ) : (
                        <LeaderboardTable
                            entries={entries}
                            total={total}
                            page={page}
                            pageSize={20}
                            loading={lbLoading}
                            currentUserId={user?.id}
                            onPageChange={setPage}
                        />
                    )}
                </div>
            )}
        </div>
    );
}
