import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { serialize } from "@/lib/utils/serialize";
import { nanoid } from "nanoid";

// ─── Exported Types ───────────────────────────────────────────────────────────

export interface TeamMemberStat {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    profilePicture: string | null;
    role: string;
    points: number;
    clicks: number;
    donationCount: number;
    rankBadge: string;
    rankName: string;
}

// ─── Groups ───────────────────────────────────────────────────────────────────

export async function createGroup(input: {
    name: string;
    description?: string;
    maxTeams?: number;
}): Promise<Group> {
    const group = await prisma.group.create({
        data: {
            name: input.name,
            description: input.description,
            maxTeams: input.maxTeams ?? 10,
        },
    });

    await redis.invalidatePattern("groups:");
    return toGroupView(group);
}

export async function listGroups(): Promise<Group[]> {
    const cacheKey = "groups:list";
    const cached = await redis.get<Group[]>(cacheKey);
    if (cached) return cached;

    const groups = await prisma.group.findMany({
        include: { teams: { select: { id: true } } },
        orderBy: { createdAt: "desc" },
    });

    const result = groups.map((g) => ({
        ...serialize<Group>(g),
        teamIds: g.teams.map((t) => t.id),
    }));

    await redis.set(cacheKey, result, 60_000);
    return result;
}

export async function getGroup(id: string): Promise<Group | null> {
    const group = await prisma.group.findUnique({
        where: { id },
        include: { teams: { select: { id: true } } },
    });
    if (!group) return null;
    return {
        ...serialize<Group>(group),
        teamIds: group.teams.map((t) => t.id),
    };
}

export async function getGroupWithTeams(id: string) {
    const group = await prisma.group.findUnique({
        where: { id },
        include: {
            teams: {
                include: { members: { select: { id: true, firstName: true, lastName: true } } },
            },
        },
    });
    if (!group) return null;

    return {
        ...serialize<Group>(group),
        teamIds: group.teams.map((t) => t.id),
        teams: group.teams.map((t) => ({
            ...serialize<Team>(t),
            memberIds: t.members.map((m) => m.id),
            members: t.members,
        })),
    };
}

// ─── Teams ────────────────────────────────────────────────────────────────────

export async function createTeam(input: {
    name: string;
    groupId: string;
    teamLeadId?: string;
    maxMembers?: number;
}): Promise<Team> {
    const team = await prisma.$transaction(async (tx) => {
        const created = await tx.team.create({
            data: {
                name: input.name,
                groupId: input.groupId,
                teamLeadId: input.teamLeadId,
                maxMembers: input.maxMembers ?? 20,
            },
        });

        // If team lead specified, assign them to this team
        if (input.teamLeadId) {
            await tx.user.update({
                where: { id: input.teamLeadId },
                data: { teamId: created.id },
            });
        }

        return created;
    });

    await redis.invalidatePattern("teams:");
    await redis.invalidatePattern("groups:");
    return toTeamView(team);
}

export async function listTeams(groupId?: string): Promise<Team[]> {
    const cacheKey = `teams:list:${groupId ?? "all"}`;
    const cached = await redis.get<Team[]>(cacheKey);
    if (cached) return cached;

    const where = groupId ? { groupId } : {};
    const teams = await prisma.team.findMany({
        where,
        include: { members: { select: { id: true } } },
        orderBy: { createdAt: "desc" },
    });

    const result = teams.map((t) => ({
        ...serialize<Team>(t),
        memberIds: t.members.map((m) => m.id),
    }));

    await redis.set(cacheKey, result, 60_000);
    return result;
}

export async function getTeam(id: string): Promise<Team | null> {
    const team = await prisma.team.findUnique({
        where: { id },
        include: { members: { select: { id: true } } },
    });
    if (!team) return null;
    return { ...serialize<Team>(team), memberIds: team.members.map((m) => m.id) };
}

export async function getTeamWithMembers(id: string) {
    const team = await prisma.team.findUnique({
        where: { id },
        include: {
            members: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    profilePicture: true,
                    role: true,
                    isActive: true,
                    createdAt: true,
                },
            },
            group: { select: { id: true, name: true } },
        },
    });
    if (!team) return null;

    return {
        ...serialize<Team>(team),
        memberIds: team.members.map((m) => m.id),
        members: team.members.map((m) => serialize(m)),
        group: team.group ? serialize(team.group) : null,
    };
}

export async function getTeamMemberStats(teamId: string): Promise<TeamMemberStat[] | null> {
    const team = await prisma.team.findUnique({
        where: { id: teamId },
        include: {
            members: {
                select: { id: true, firstName: true, lastName: true, profilePicture: true, role: true },
            },
        },
    });
    if (!team) return null;

    const memberIds = team.members.map((m) => m.id);

    const [pointEntries, events, donations] = await Promise.all([
        prisma.pointsLedgerEntry.findMany({
            where: { userId: { in: memberIds } },
        }),
        prisma.linkEvent.findMany({
            where: { smartLink: { userId: { in: memberIds } } },
        }),
        prisma.donation.findMany({
            where: { userId: { in: memberIds } },
        }),
    ]);

    // Simple rank assignment based on points
    const rankTiers = [
        { min: 1000, badge: "🎖️", name: "General" },
        { min: 500, badge: "⭐", name: "Colonel" },
        { min: 200, badge: "🏅", name: "Major" },
        { min: 50, badge: "🔰", name: "Corporal" },
        { min: 0, badge: "🪖", name: "Private" },
    ];

    return team.members.map((m) => {
        const memberPoints = pointEntries
            .filter((p) => p.userId === m.id)
            .reduce((s: number, p) => s + p.value, 0);
        const memberClicks = events.filter(
            (e) => e.eventType === "CLICK" && e.userId === m.id
        ).length;
        const donationCount = donations.filter((d) => d.userId === m.id).length;
        const tier = rankTiers.find((r) => memberPoints >= r.min) ?? rankTiers[rankTiers.length - 1];

        return {
            id: m.id,
            userId: m.id,
            firstName: m.firstName,
            lastName: m.lastName,
            profilePicture: m.profilePicture,
            role: m.role,
            points: memberPoints,
            clicks: memberClicks,
            donationCount,
            rankBadge: tier.badge,
            rankName: tier.name,
        };
    });
}

// ─── Membership ───────────────────────────────────────────────────────────────

export async function addMemberToTeam(
    teamId: string,
    userId: string
): Promise<Team> {
    const team = await prisma.$transaction(async (tx) => {
        const t = await tx.team.findUnique({
            where: { id: teamId },
            include: { members: { select: { id: true } } },
        });
        if (!t) throw new Error("Team not found");
        if (t.members.length >= t.maxMembers) throw new Error("Team is full");

        await tx.user.update({
            where: { id: userId },
            data: { teamId },
        });

        return tx.team.findUnique({
            where: { id: teamId },
            include: { members: { select: { id: true } } },
        });
    });

    await redis.invalidatePattern("teams:");
    return { ...serialize<Team>(team!), memberIds: team!.members.map((m: { id: string }) => m.id) };
}

export async function removeMemberFromTeam(
    teamId: string,
    userId: string
): Promise<Team> {
    await prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({ where: { id: userId } });
        if (!user || user.teamId !== teamId) throw new Error("User not in team");

        await tx.user.update({
            where: { id: userId },
            data: { teamId: null },
        });
    });

    const team = await prisma.team.findUnique({
        where: { id: teamId },
        include: { members: { select: { id: true } } },
    });

    await redis.invalidatePattern("teams:");
    return { ...serialize<Team>(team!), memberIds: team!.members.map((m) => m.id) };
}

export async function setTeamLead(
    teamId: string,
    userId: string
): Promise<Team> {
    const team = await prisma.team.update({
        where: { id: teamId },
        data: { teamLeadId: userId },
        include: { members: { select: { id: true } } },
    });

    // Also update user role to TEAM_LEAD
    await prisma.user.update({
        where: { id: userId },
        data: { role: "TEAM_LEAD" as never },
    });

    await redis.invalidatePattern("teams:");
    return { ...serialize<Team>(team), memberIds: team.members.map((m) => m.id) };
}

// ─── Invite Links ─────────────────────────────────────────────────────────────

export async function generateInviteLink(input: {
    teamId: string;
    createdById: string;
    targetRole?: "MEMBER" | "TEAM_LEAD";
    maxUses?: number;
    expiresInDays?: number;
}): Promise<TeamInviteLink> {
    const token = nanoid(16);
    const expiresAt = input.expiresInDays
        ? new Date(Date.now() + input.expiresInDays * 86_400_000)
        : undefined;

    const link = await prisma.teamInviteLink.create({
        data: {
            token,
            teamId: input.teamId,
            targetRole: input.targetRole ?? "MEMBER",
            createdById: input.createdById,
            maxUses: input.maxUses ?? 10,
            usedCount: 0,
            isActive: true,
            expiresAt,
        },
    });

    return serialize<TeamInviteLink>(link);
}

export async function getInviteLink(token: string): Promise<TeamInviteLink | null> {
    const link = await prisma.teamInviteLink.findUnique({ where: { token } });
    return link ? serialize<TeamInviteLink>(link) : null;
}

export async function consumeInviteLink(
    token: string,
    userId: string
): Promise<{ team: Team; invite: TeamInviteLink }> {
    return prisma.$transaction(async (tx) => {
        const link = await tx.teamInviteLink.findUnique({ where: { token } });
        if (!link) throw new Error("Invite link not found");
        if (!link.isActive) throw new Error("Invite link is inactive");
        if (link.usedCount >= link.maxUses) throw new Error("Invite link fully used");
        if (link.expiresAt && new Date(link.expiresAt) < new Date())
            throw new Error("Invite link has expired");

        // Add user to team
        await tx.user.update({
            where: { id: userId },
            data: { teamId: link.teamId },
        });

        // If target role is TEAM_LEAD, update user role
        if (link.targetRole === "TEAM_LEAD") {
            await tx.user.update({
                where: { id: userId },
                data: { role: "TEAM_LEAD" as never },
            });
        }

        // Increment used count
        const updatedLink = await tx.teamInviteLink.update({
            where: { id: link.id },
            data: { usedCount: { increment: 1 } },
        });

        const team = await tx.team.findUnique({
            where: { id: link.teamId },
            include: { members: { select: { id: true } } },
        });

        await redis.invalidatePattern("teams:");

        return {
            team: { ...serialize<Team>(team!), memberIds: team!.members.map((m: { id: string }) => m.id) },
            invite: serialize<TeamInviteLink>(updatedLink),
        };
    });
}

export async function deactivateInviteLink(id: string): Promise<TeamInviteLink> {
    const link = await prisma.teamInviteLink.update({
        where: { id },
        data: { isActive: false },
    });
    return serialize<TeamInviteLink>(link);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert Prisma Team to global Team with computed memberIds */
async function toTeamView(team: unknown): Promise<Team> {
    const t = serialize<Team>(team);
    const members = await prisma.user.findMany({
        where: { teamId: t.id },
        select: { id: true },
    });
    return { ...t, memberIds: members.map((m) => m.id) };
}

/** Convert Prisma Group to global Group with computed teamIds */
async function toGroupView(group: unknown): Promise<Group> {
    const g = serialize<Group>(group);
    const teams = await prisma.team.findMany({
        where: { groupId: g.id },
        select: { id: true },
    });
    return { ...g, teamIds: teams.map((t) => t.id) };
}
