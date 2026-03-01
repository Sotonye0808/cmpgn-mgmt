import { mockDb } from "@/lib/data/mockDb";
import { mockCache } from "@/lib/data/mockCache";

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
    let users = mockDb.users._data;

    if (role) {
        users = users.filter((u) => (u.role as unknown as string) === role);
    }

    if (search) {
        const lower = search.toLowerCase();
        users = users.filter(
            (u) =>
                u.firstName.toLowerCase().includes(lower) ||
                u.lastName.toLowerCase().includes(lower) ||
                u.email.toLowerCase().includes(lower)
        );
    }

    return users.map((u) => ({
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role as unknown as string,
        createdAt: u.createdAt,
        isActive: true, // mock: all users are active
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
    const user = mockDb.users.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    // Privilege ceiling: only SUPER_ADMIN can modify ADMIN/SUPER_ADMIN users
    // or assign ADMIN/SUPER_ADMIN roles
    if (actorRole && actorRole !== "SUPER_ADMIN") {
        const targetCurrentRole = user.role as unknown as string;
        if (PROTECTED_ROLES.includes(targetCurrentRole)) {
            throw new Error("Insufficient permissions to modify this user's role");
        }
        if (!ADMIN_ASSIGNABLE_ROLES.includes(newRole)) {
            throw new Error("Insufficient permissions to assign this role");
        }
    }

    // Prevent self-demotion for SUPER_ADMIN
    if (actorId === userId && actorRole === "SUPER_ADMIN" && newRole !== "SUPER_ADMIN") {
        throw new Error("Cannot demote your own SUPER_ADMIN role");
    }

    const updated = mockDb.users.update({
        where: { id: userId },
        data: { role: newRole as unknown as UserRole },
    });
    if (!updated) throw new Error("Failed to update user");

    mockCache.del(`user:${userId}`);
    mockDb.emit("users:changed");

    return {
        id: updated.id,
        email: updated.email,
        firstName: updated.firstName,
        lastName: updated.lastName,
        role: updated.role as unknown as string,
        createdAt: updated.createdAt,
        isActive: true,
    };
}
