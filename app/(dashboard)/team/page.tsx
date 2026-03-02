"use client";

import { useState, useEffect, useCallback } from "react";
import { Divider, message, Empty, Table, Button, Input } from "antd";
import type { ColumnsType } from "antd/es/table";
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
import { ICONS } from "@/config/icons";

// --------------------------------------------------------------------------
// Sub-tables for team / group leaderboard filters
// --------------------------------------------------------------------------
const TEAM_COLS: ColumnsType<TeamLeaderboardEntry> = [
    { title: "#", dataIndex: "rank", width: 56, align: "center" as const },
    {
        title: "Squad", dataIndex: "teamName",
        render: (v: string) => (
            <span className="font-semibold text-ds-text-primary">{v}</span>
        ),
    },
    { title: "Group", dataIndex: "groupName", className: "text-ds-text-secondary" },
    { title: "Members", dataIndex: "memberCount", align: "right" as const },
    {
        title: "Score", dataIndex: "score", align: "right" as const,
        render: (v: number) => (
            <span className="font-ds-mono font-bold text-ds-brand-accent">
                {(v ?? 0).toLocaleString()}
            </span>
        ),
    },
];

const GROUP_COLS: ColumnsType<GroupLeaderboardEntry> = [
    { title: "#", dataIndex: "rank", width: 56, align: "center" as const },
    {
        title: "Group", dataIndex: "groupName",
        render: (v: string) => (
            <span className="font-semibold text-ds-text-primary">{v}</span>
        ),
    },
    { title: "Teams", dataIndex: "teamCount", align: "right" as const },
    { title: "Members", dataIndex: "memberCount", align: "right" as const },
    {
        title: "Score", dataIndex: "score", align: "right" as const,
        render: (v: number) => (
            <span className="font-ds-mono font-bold text-ds-brand-accent">
                {(v ?? 0).toLocaleString()}
            </span>
        ),
    },
];

export default function TeamPage() {
    const { user } = useAuth();
    const { isAdmin } = useRole();
    const { teams, groups, myTeam, loading: teamsLoading, refetch } = useTeams(user?.id);

    // Leaderboard state — default to "global" to never hit the type-mismatch crash
    const [filter, setFilter] = useState<LeaderboardFilter>("global");
    const [page, setPage] = useState(1);
    const [teamEntries, setTeamEntries] = useState<TeamLeaderboardEntry[]>([]);
    const [groupEntries, setGroupEntries] = useState<GroupLeaderboardEntry[]>([]);
    const [rankingsLoading, setRankingsLoading] = useState(false);

    const isAggregateFilter = filter === "team" || filter === "group";

    // Only pass individual/global to useLeaderboard — team/group handled separately
    const { entries, myRank, total, loading: lbLoading } = useLeaderboard({
        filter: isAggregateFilter ? "global" : filter,
        page,
        pageSize: 20,
    });

    // Member list for the My-Team card
    const [myTeamMembers, setMyTeamMembers] = useState<
        Array<{ id: string; firstName: string; lastName: string; role: string; profilePicture?: string }>
    >([]);

    // Invite-link state
    const [inviteUrl, setInviteUrl] = useState<string | null>(null);
    const [inviteLoading, setInviteLoading] = useState(false);

    // Fetch team member list
    useEffect(() => {
        if (!myTeam) { setMyTeamMembers([]); return; }
        window.fetch(`/api/teams/${myTeam.id}`)
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
            .catch(() => { /* silent */ });
    }, [myTeam]);

    // Fetch team/group rankings when those filters are selected
    useEffect(() => {
        if (!isAggregateFilter) return;
        setRankingsLoading(true);
        const url = filter === "team" ? "/api/leaderboard/team" : "/api/leaderboard/group";
        window.fetch(url)
            .then((r) => r.json())
            .then((json) => {
                if (filter === "team") setTeamEntries(json.data ?? []);
                else setGroupEntries(json.data ?? []);
            })
            .catch(() => { /* silent */ })
            .finally(() => setRankingsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter]);

    const handleRemoveMember = useCallback(async (userId: string) => {
        if (!myTeam) return;
        try {
            const res = await window.fetch(
                `/api/teams/${myTeam.id}/members?userId=${userId}`,
                { method: "DELETE" }
            );
            const json = await res.json();
            if (json.success) { message.success("Member removed"); refetch(); }
            else message.error(json.error ?? "Failed to remove member");
        } catch {
            message.error("Network error");
        }
    }, [myTeam, refetch]);

    const handleGenerateInvite = useCallback(async () => {
        if (!myTeam) return;
        setInviteLoading(true);
        setInviteUrl(null);
        try {
            const res = await window.fetch(`/api/teams/${myTeam.id}/invite`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ targetRole: "MEMBER", maxUses: 10 }),
            });
            const json = await res.json();
            if (json.success && json.data?.token) {
                setInviteUrl(
                    `${window.location.origin}/register?inviteToken=${json.data.token}`
                );
            } else {
                message.error(json.error ?? "Could not generate invite link");
            }
        } catch {
            message.error("Network error");
        } finally {
            setInviteLoading(false);
        }
    }, [myTeam]);

    const handleCopyInvite = useCallback(() => {
        if (!inviteUrl) return;
        navigator.clipboard.writeText(inviteUrl).then(
            () => message.success("Invite link copied!"),
            () => message.error("Copy failed — please copy manually")
        );
    }, [inviteUrl]);

    const visibleSections = TEAM_PAGE_SECTIONS.filter((s) =>
        s.allowedRoles.includes(user?.role as unknown as string)
    );

    const userHasTeam = !!myTeam;
    const canManageTeam = isAdmin || user?.role === "TEAM_LEAD";

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

            {/* No-team empty state — shown to non-admin users not yet in a squad */}
            {!userHasTeam && !isAdmin && (
                <div className="rounded-ds-xl border border-ds-border-subtle bg-ds-surface-elevated p-8 text-center">
                    <Empty
                        description={
                            <span className="text-ds-text-secondary">
                                You are not currently part of a squad.
                                <br />
                                Ask your admin to add you to one.
                            </span>
                        }
                    />
                </div>
            )}

            {/* My Team card — users who belong to a team */}
            {visibleSections.some((s) => s.key === "my-team") && userHasTeam && (
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

            {/* Invite Links — TEAM_LEAD / ADMIN / SUPER_ADMIN with a team */}
            {visibleSections.some((s) => s.key === "invite-links") && userHasTeam && canManageTeam && (
                <>
                    <div className="space-y-3">
                        <h2 className="text-lg font-semibold text-ds-text-primary">
                            Invite Members
                        </h2>
                        <p className="text-sm text-ds-text-secondary">
                            Generate a shareable invite link for new squad members (up to 10 uses).
                        </p>
                        <div className="flex flex-wrap items-center gap-3">
                            <Button
                                type="primary"
                                icon={<ICONS.links />}
                                loading={inviteLoading}
                                onClick={handleGenerateInvite}
                            >
                                Generate Invite Link
                            </Button>
                            {inviteUrl && (
                                <>
                                    <Input
                                        readOnly
                                        value={inviteUrl}
                                        style={{ maxWidth: 420 }}
                                        className="font-ds-mono text-xs"
                                    />
                                    <Button
                                        icon={<ICONS.copy />}
                                        onClick={handleCopyInvite}
                                    >
                                        Copy
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                    <Divider className="my-0" />
                </>
            )}

            {/* Admin: Team Management */}
            {visibleSections.some((s) => s.key === "team-management") && isAdmin && (
                <>
                    <TeamManagementPanel teams={teams} groups={groups} onRefresh={refetch} />
                    <Divider className="my-0" />
                </>
            )}

            {/* Admin: Group Management */}
            {visibleSections.some((s) => s.key === "group-management") && isAdmin && (
                <>
                    <GroupManagementPanel groups={groups} teams={teams} onRefresh={refetch} />
                    <Divider className="my-0" />
                </>
            )}

            {/* Leaderboard section */}
            {visibleSections.some((s) => s.key === "leaderboard") && (
                <div className="space-y-4">
                    {/* Personal rank card — only meaningful for individual/global filters */}
                    {myRank && !isAggregateFilter && (
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

                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <h2 className="text-lg font-semibold text-ds-text-primary">
                            {TEAM_PAGE_CONTENT.performanceTitle}
                        </h2>
                        <LeaderboardFilters
                            value={filter}
                            onChange={(f) => { setFilter(f); setPage(1); }}
                        />
                    </div>

                    {/* Team rankings table */}
                    {filter === "team" && (
                        <Table<TeamLeaderboardEntry>
                            rowKey="teamId"
                            dataSource={teamEntries}
                            columns={TEAM_COLS}
                            loading={rankingsLoading}
                            pagination={false}
                            size="small"
                            className="rounded-ds-xl overflow-hidden"
                        />
                    )}

                    {/* Group rankings table */}
                    {filter === "group" && (
                        <Table<GroupLeaderboardEntry>
                            rowKey="groupId"
                            dataSource={groupEntries}
                            columns={GROUP_COLS}
                            loading={rankingsLoading}
                            pagination={false}
                            size="small"
                            className="rounded-ds-xl overflow-hidden"
                        />
                    )}

                    {/* Individual / Global rankings */}
                    {!isAggregateFilter && (
                        lbLoading ? (
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
                        )
                    )}
                </div>
            )}
        </div>
    );
}
