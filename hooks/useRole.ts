"use client";

import { useAuth } from "./useAuth";
import { filterByRole, hasRole, isAtLeastRole } from "@/lib/utils/roleGuard";

export function useRole() {
    const { user } = useAuth();
    const role = (user?.role as string) ?? "";

    return {
        role,
        hasRole: (roles: string[]) => hasRole(role, roles),
        isAtLeast: (minRole: string) => isAtLeastRole(role, minRole),
        filterByRole: <T extends { allowedRoles: string[] }>(items: T[]) =>
            filterByRole(items, role),
        isAdmin: hasRole(role, ["ADMIN", "SUPER_ADMIN"]),
        isSuperAdmin: role === "SUPER_ADMIN",
        isTeamLead: hasRole(role, ["TEAM_LEAD", "ADMIN", "SUPER_ADMIN"]),
    };
}
