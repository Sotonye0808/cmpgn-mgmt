/**
 * Filter a list of items to those allowed for the given role.
 * Items must have an `allowedRoles` field.
 */
export function filterByRole<T extends { allowedRoles: string[] }>(
    items: T[],
    role: string
): T[] {
    return items.filter((item) => item.allowedRoles.includes(role));
}

/**
 * Check if a role is in a list of allowed roles.
 */
export function hasRole(userRole: string, allowedRoles: string[]): boolean {
    return allowedRoles.includes(userRole);
}

/**
 * Hierarchy of roles for "at least X" checks.
 */
const ROLE_HIERARCHY: string[] = ["USER", "TEAM_LEAD", "ADMIN", "SUPER_ADMIN"];

export function isAtLeastRole(userRole: string, minRole: string): boolean {
    return ROLE_HIERARCHY.indexOf(userRole) >= ROLE_HIERARCHY.indexOf(minRole);
}
