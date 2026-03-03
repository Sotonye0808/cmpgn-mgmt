// ─── Team Module Config ───────────────────────────────────────────────────────

export const TEAM_PAGE_SECTIONS: PageSection[] = [
    {
        key: "my-team",
        label: "My Team",
        allowedRoles: ["USER", "TEAM_LEAD", "ADMIN", "SUPER_ADMIN"],
    },
    {
        key: "team-management",
        label: "Team Management",
        allowedRoles: ["ADMIN", "SUPER_ADMIN"],
    },
    {
        key: "group-management",
        label: "Group Management",
        allowedRoles: ["ADMIN", "SUPER_ADMIN"],
    },
    {
        key: "invite-links",
        label: "Invite Links",
        allowedRoles: ["TEAM_LEAD", "ADMIN", "SUPER_ADMIN"],
    },
    {
        key: "leaderboard",
        label: "Team Leaderboard",
        allowedRoles: ["USER", "TEAM_LEAD", "ADMIN", "SUPER_ADMIN"],
    },
];

export const TEAM_MANAGEMENT_CONFIG = {
    maxMembers: 10,
    maxTeamsPerGroup: 4,
    inviteExpiryDays: 7,
    defaultMaxInviteUses: 50,
} as const;
