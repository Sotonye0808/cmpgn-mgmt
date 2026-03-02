import { mockDb } from "@/lib/data/mockDb";
import { mockCache } from "@/lib/data/mockCache";
import { RANK_LEVELS } from "@/config/ranks";

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_TEAM_MEMBERS = 10;
const MAX_GROUP_TEAMS = 4;
const CACHE_TTL = 60_000; // 1 minute

// ─── Groups ───────────────────────────────────────────────────────────────────

export interface CreateGroupInput {
    name: string;
    description?: string;
}

export async function createGroup(
    input: CreateGroupInput,
    actorRole: string
): Promise<Group> {
    if (actorRole !== "ADMIN" && actorRole !== "SUPER_ADMIN") {
        throw new Error("Only admins can create groups");
    }

    const now = new Date().toISOString();
    const group = mockDb.groups.create({
        data: {
            name: input.name,
            description: input.description,
            teamIds: [],
            maxTeams: MAX_GROUP_TEAMS,
            createdAt: now,
            updatedAt: now,
        },
    });

    mockCache.invalidatePattern("groups:");
    mockDb.emit("groups:changed");
    return group;
}

export async function listGroups(): Promise<Group[]> {
    const cached = mockCache.get<Group[]>("groups:list");
    if (cached) return cached;

    const groups = mockDb.groups.findMany({
        orderBy: { createdAt: "desc" },
    });
    mockCache.set("groups:list", groups, CACHE_TTL);
    return groups;
}

export async function getGroup(groupId: string): Promise<Group | null> {
    return mockDb.groups.findUnique({ where: { id: groupId } });
}

export async function getGroupWithTeams(
    groupId: string
): Promise<{ group: Group; teams: Team[] } | null> {
    const group = mockDb.groups.findUnique({ where: { id: groupId } });
    if (!group) return null;

    const teams = mockDb.teams.findMany().filter((t) => group.teamIds.includes(t.id));
    return { group, teams };
}

// ─── Teams ────────────────────────────────────────────────────────────────────

export interface CreateTeamInput {
    name: string;
    groupId: string;
    teamLeadId?: string;
}

export async function createTeam(
    input: CreateTeamInput,
    actorRole: string
): Promise<Team> {
    if (actorRole !== "ADMIN" && actorRole !== "SUPER_ADMIN") {
        throw new Error("Only admins can create teams");
    }

    const group = mockDb.groups.findUnique({ where: { id: input.groupId } });
    if (!group) throw new Error("Group not found");

    if (group.teamIds.length >= group.maxTeams) {
        throw new Error(
            `Group "${group.name}" already has ${group.maxTeams} teams (max)`
        );
    }

    const now = new Date().toISOString();
    const initialMembers: string[] = [];

    // If a team lead is assigned, validate and add as first member
    if (input.teamLeadId) {
        const leadUser = mockDb.users.findUnique({ where: { id: input.teamLeadId } });
        if (!leadUser) throw new Error("Team lead user not found");
        initialMembers.push(input.teamLeadId);
    }

    return mockDb.transaction(async (tx) => {
        const team = tx.teams.create({
            data: {
                name: input.name,
                groupId: input.groupId,
                teamLeadId: input.teamLeadId,
                memberIds: initialMembers,
                maxMembers: MAX_TEAM_MEMBERS,
                createdAt: now,
                updatedAt: now,
            },
        });

        // Add team to group
        tx.groups.update({
            where: { id: input.groupId },
            data: {
                teamIds: [...group.teamIds, team.id],
                updatedAt: now,
            },
        });

        // Assign team lead's teamId on their user record
        if (input.teamLeadId) {
            tx.users.update({
                where: { id: input.teamLeadId },
                data: { teamId: team.id, updatedAt: now },
            });
        }

        mockCache.invalidatePattern("groups:");
        mockCache.invalidatePattern("teams:");
        mockDb.emit("teams:changed");
        mockDb.emit("groups:changed");

        return team;
    });
}

export async function listTeams(groupId?: string): Promise<Team[]> {
    const cacheKey = groupId ? `teams:list:${groupId}` : "teams:list:all";
    const cached = mockCache.get<Team[]>(cacheKey);
    if (cached) return cached;

    let teams: Team[];
    if (groupId) {
        teams = mockDb.teams.findMany().filter((t) => t.groupId === groupId);
    } else {
        teams = mockDb.teams.findMany({ orderBy: { createdAt: "desc" } });
    }
    mockCache.set(cacheKey, teams, CACHE_TTL);
    return teams;
}

export async function getTeam(teamId: string): Promise<Team | null> {
    return mockDb.teams.findUnique({ where: { id: teamId } });
}

export async function getTeamWithMembers(
    teamId: string
): Promise<{ team: Team; members: User[] } | null> {
    const team = mockDb.teams.findUnique({ where: { id: teamId } });
    if (!team) return null;

    const members = mockDb.users.findMany().filter((u) =>
        team.memberIds.includes(u.id)
    );
    return { team, members };
}

export interface TeamMemberStat {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
    profilePicture?: string;
    totalPoints: number;
    rankBadge: string;
    rankName: string;
    donationCount: number;
}

export async function getTeamMemberStats(
    teamId: string
): Promise<TeamMemberStat[] | null> {
    const result = await getTeamWithMembers(teamId);
    if (!result) return null;

    const sortedRanks = [...RANK_LEVELS].sort((a, b) => b.minScore - a.minScore);

    return result.members
        .map((member) => {
            const totalPoints = mockDb.pointsLedger._data
                .filter((e) => e.userId === member.id)
                .reduce((sum, e) => sum + Number(e.value), 0);

            const rankLevel =
                sortedRanks.find((r) => totalPoints >= r.minScore) ?? RANK_LEVELS[0];

            const donationCount = mockDb.donations._data.filter(
                (d) => d.userId === member.id && d.status === "VERIFIED"
            ).length;

            return {
                id: member.id,
                firstName: member.firstName,
                lastName: member.lastName,
                role: member.role as unknown as string,
                profilePicture: member.profilePicture,
                totalPoints,
                rankBadge: rankLevel.badge,
                rankName: rankLevel.name,
                donationCount,
            };
        })
        .sort((a, b) => b.totalPoints - a.totalPoints);
}

// ─── Team Membership ──────────────────────────────────────────────────────────

export async function addMemberToTeam(
    teamId: string,
    userId: string
): Promise<Team> {
    const team = mockDb.teams.findUnique({ where: { id: teamId } });
    if (!team) throw new Error("Team not found");

    if (team.memberIds.includes(userId)) {
        throw new Error("User is already a member of this team");
    }

    if (team.memberIds.length >= team.maxMembers) {
        throw new Error(
            `Team "${team.name}" is full (${team.maxMembers} members max)`
        );
    }

    const user = mockDb.users.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    if (user.teamId && user.teamId !== teamId) {
        throw new Error("User is already a member of another team");
    }

    const now = new Date().toISOString();

    return mockDb.transaction(async (tx) => {
        const updated = tx.teams.update({
            where: { id: teamId },
            data: {
                memberIds: [...team.memberIds, userId],
                updatedAt: now,
            },
        });
        if (!updated) throw new Error("Failed to update team");

        tx.users.update({
            where: { id: userId },
            data: { teamId, updatedAt: now },
        });

        mockCache.invalidatePattern("teams:");
        mockCache.del(`user:${userId}`);
        mockDb.emit("teams:changed");
        mockDb.emit("users:changed");

        return updated;
    });
}

export async function removeMemberFromTeam(
    teamId: string,
    userId: string
): Promise<Team> {
    const team = mockDb.teams.findUnique({ where: { id: teamId } });
    if (!team) throw new Error("Team not found");

    if (!team.memberIds.includes(userId)) {
        throw new Error("User is not a member of this team");
    }

    const now = new Date().toISOString();

    return mockDb.transaction(async (tx) => {
        const updatedData: Partial<Team> = {
            memberIds: team.memberIds.filter((id) => id !== userId),
            updatedAt: now,
        };

        // If this user was the team lead, clear the lead
        if (team.teamLeadId === userId) {
            updatedData.teamLeadId = undefined;
        }

        const updated = tx.teams.update({
            where: { id: teamId },
            data: updatedData,
        });
        if (!updated) throw new Error("Failed to update team");

        tx.users.update({
            where: { id: userId },
            data: { teamId: undefined, updatedAt: now },
        });

        mockCache.invalidatePattern("teams:");
        mockCache.del(`user:${userId}`);
        mockDb.emit("teams:changed");
        mockDb.emit("users:changed");

        return updated;
    });
}

// ─── Team Lead ────────────────────────────────────────────────────────────────

export async function setTeamLead(
    teamId: string,
    userId?: string
): Promise<Team> {
    const team = mockDb.teams.findUnique({ where: { id: teamId } });
    if (!team) throw new Error("Team not found");

    if (userId) {
        if (!team.memberIds.includes(userId)) {
            throw new Error("User must be a team member to become team lead");
        }
    }

    const now = new Date().toISOString();
    const updated = mockDb.teams.update({
        where: { id: teamId },
        data: { teamLeadId: userId, updatedAt: now },
    });
    if (!updated) throw new Error("Failed to update team");

    // Update user roles — promote new lead, demote old lead
    if (userId) {
        mockDb.users.update({
            where: { id: userId },
            data: { role: "TEAM_LEAD" as unknown as UserRole, updatedAt: now },
        });
    }
    if (team.teamLeadId && team.teamLeadId !== userId) {
        mockDb.users.update({
            where: { id: team.teamLeadId },
            data: { role: "USER" as unknown as UserRole, updatedAt: now },
        });
    }

    mockCache.invalidatePattern("teams:");
    mockDb.emit("teams:changed");
    mockDb.emit("users:changed");
    return updated;
}

// ─── Invite Links ─────────────────────────────────────────────────────────────

export async function generateInviteLink(
    teamId: string,
    targetRole: "MEMBER" | "TEAM_LEAD",
    createdById: string,
    maxUses = 50
): Promise<TeamInviteLink> {
    const team = mockDb.teams.findUnique({ where: { id: teamId } });
    if (!team) throw new Error("Team not found");

    const token = `${teamId}-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();
    // Default expiry: 7 days
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const invite = mockDb.teamInviteLinks.create({
        data: {
            token,
            teamId,
            targetRole,
            createdById,
            usedCount: 0,
            maxUses,
            expiresAt,
            isActive: true,
            createdAt: now,
        },
    });

    mockDb.emit("teamInviteLinks:changed");
    return invite;
}

export async function getInviteLink(
    token: string
): Promise<{
    invite: TeamInviteLink;
    team: Team;
    group: Group | null;
} | null> {
    const invite = mockDb.teamInviteLinks
        .findMany()
        .find((i) => i.token === token);
    if (!invite) return null;

    const team = mockDb.teams.findUnique({ where: { id: invite.teamId } });
    if (!team) return null;

    const group = mockDb.groups.findUnique({ where: { id: team.groupId } });

    return { invite, team, group };
}

export async function consumeInviteLink(
    token: string,
    userId: string
): Promise<{ team: Team; role: "MEMBER" | "TEAM_LEAD" }> {
    const data = await getInviteLink(token);
    if (!data) throw new Error("Invalid invite link");

    const { invite, team } = data;

    // Validate invite is usable
    if (!invite.isActive) {
        throw new Error("This invite link has been deactivated");
    }
    if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
        throw new Error("This invite link has expired");
    }
    if (invite.usedCount >= invite.maxUses) {
        throw new Error("This invite link has reached its usage limit");
    }

    // Validate user
    const user = mockDb.users.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    if (team.memberIds.includes(userId)) {
        throw new Error("You are already a member of this team");
    }

    if (user.teamId && user.teamId !== team.id) {
        throw new Error("You are already a member of another team");
    }

    if (team.memberIds.length >= team.maxMembers) {
        throw new Error(`Team "${team.name}" is full`);
    }

    const now = new Date().toISOString();

    return mockDb.transaction(async (tx) => {
        // Add user to team
        tx.teams.update({
            where: { id: team.id },
            data: {
                memberIds: [...team.memberIds, userId],
                teamLeadId:
                    invite.targetRole === "TEAM_LEAD" ? userId : team.teamLeadId,
                updatedAt: now,
            },
        });

        // Update user record
        const newRole: string =
            invite.targetRole === "TEAM_LEAD" ? "TEAM_LEAD" : user.role as unknown as string;
        tx.users.update({
            where: { id: userId },
            data: {
                teamId: team.id,
                role: newRole as unknown as UserRole,
                updatedAt: now,
            },
        });

        // Increment usage
        tx.teamInviteLinks.update({
            where: { id: invite.id },
            data: { usedCount: invite.usedCount + 1 },
        });

        mockCache.invalidatePattern("teams:");
        mockCache.del(`user:${userId}`);
        mockDb.emit("teams:changed");
        mockDb.emit("users:changed");
        mockDb.emit("teamInviteLinks:changed");

        const updatedTeam = tx.teams.findUnique({ where: { id: team.id } })!;
        return { team: updatedTeam, role: invite.targetRole };
    });
}

// ─── Deactivate Invite ────────────────────────────────────────────────────────

export async function deactivateInviteLink(
    token: string,
    actorRole: string
): Promise<TeamInviteLink> {
    if (actorRole !== "ADMIN" && actorRole !== "SUPER_ADMIN" && actorRole !== "TEAM_LEAD") {
        throw new Error("Insufficient permissions");
    }

    const invite = mockDb.teamInviteLinks
        .findMany()
        .find((i) => i.token === token);
    if (!invite) throw new Error("Invite link not found");

    const updated = mockDb.teamInviteLinks.update({
        where: { id: invite.id },
        data: { isActive: false },
    });
    if (!updated) throw new Error("Failed to deactivate invite");

    mockDb.emit("teamInviteLinks:changed");
    return updated;
}
