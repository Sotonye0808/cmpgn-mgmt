import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { serialize, serializeArray } from "@/lib/utils/serialize";
import { getUserAnalytics } from "@/modules/analytics/services/analyticsService";

// ─── List All Users (Admin) ───────────────────────────────────────────────────

export interface UserListItem {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    createdAt: string;
    isActive: boolean;
}

export async function listUsers(
    search = "",
    role?: string
): Promise<UserListItem[]> {
    const where: Record<string, unknown> = {};

    if (role) {
        where.role = role;
    }

    if (search) {
        where.OR = [
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
        ];
    }

    const users = await prisma.user.findMany({ where });

    return users.map((u) => ({
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role as string,
        createdAt: u.createdAt.toISOString(),
        isActive: u.isActive,
    }));
}

// ─── Role Guard Constants ─────────────────────────────────────────────────────

const PROTECTED_ROLES: string[] = ["ADMIN", "SUPER_ADMIN"];
const ADMIN_ASSIGNABLE_ROLES: string[] = ["USER", "TEAM_LEAD"];

// ─── Change User Role ─────────────────────────────────────────────────────────

export async function changeUserRole(
    userId: string,
    newRole: string,
    actorId?: string,
    actorRole?: string
): Promise<UserListItem> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    if (actorRole && actorRole !== "SUPER_ADMIN") {
        const targetCurrentRole = user.role as string;
        if (PROTECTED_ROLES.includes(targetCurrentRole)) {
            throw new Error("Insufficient permissions to modify this user's role");
        }
        if (!ADMIN_ASSIGNABLE_ROLES.includes(newRole)) {
            throw new Error("Insufficient permissions to assign this role");
        }
    }

    if (actorId === userId && actorRole === "SUPER_ADMIN" && newRole !== "SUPER_ADMIN") {
        throw new Error("Cannot demote your own SUPER_ADMIN role");
    }

    const updated = await prisma.user.update({
        where: { id: userId },
        data: { role: newRole as never },
    });

    await redis.del(`user:${userId}`);

    return {
        id: updated.id,
        email: updated.email,
        firstName: updated.firstName,
        lastName: updated.lastName,
        role: updated.role as string,
        createdAt: updated.createdAt.toISOString(),
        isActive: updated.isActive,
    };
}

// ─── User Profile (Admin View) ────────────────────────────────────────────────

const PROTECTED_VIEW_ROLES: string[] = ["ADMIN", "SUPER_ADMIN"];

export async function getUserProfile(
    userId: string,
    actorRole: string
): Promise<UserProfileView> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    if (actorRole !== "SUPER_ADMIN") {
        const targetRole = user.role as string;
        if (PROTECTED_VIEW_ROLES.includes(targetRole)) {
            throw new Error("Insufficient permissions to view this profile");
        }
    }

    const analytics = await getUserAnalytics(userId);

    const [donations, participations, referralsGiven, referralsReceived, trustScore] =
        await Promise.all([
            prisma.donation.findMany({ where: { userId } }),
            prisma.campaignParticipation.findMany({ where: { userId } }),
            prisma.referral.count({ where: { inviterId: userId } }),
            prisma.referral.count({ where: { inviteeId: userId } }),
            prisma.trustScore.findUnique({ where: { userId } }),
        ]);

    // Resolve team + group
    let team: Team | undefined;
    let group: Group | undefined;

    if (user.teamId) {
        const rawTeam = await prisma.team.findUnique({
            where: { id: user.teamId },
            include: { members: { select: { id: true } } },
        });
        if (rawTeam) {
            team = serialize<Team>({
                ...rawTeam,
                memberIds: rawTeam.members.map((m) => m.id),
            });
            const rawGroup = await prisma.group.findUnique({
                where: { id: rawTeam.groupId },
                include: { teams: { select: { id: true } } },
            });
            if (rawGroup) {
                group = serialize<Group>({
                    ...rawGroup,
                    teamIds: rawGroup.teams.map((t) => t.id),
                });
            }
        }
    }

    return {
        user: serialize<User>(user),
        analytics,
        donations: serializeArray<Donation>(donations),
        participations: serializeArray<CampaignParticipation>(participations),
        referrals: { given: referralsGiven, received: referralsReceived },
        team,
        group,
        trustScore: trustScore ? serialize<TrustScore>(trustScore) : undefined,
    };
}
