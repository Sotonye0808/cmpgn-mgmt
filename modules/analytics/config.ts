const ROLE = {
    USER: "USER",
    TEAM_LEAD: "TEAM_LEAD",
    ADMIN: "ADMIN",
    SUPER_ADMIN: "SUPER_ADMIN",
} as const;

type RoleValue = (typeof ROLE)[keyof typeof ROLE];

export const KPI_CARDS: (KpiCardConfig & { allowedRoles: RoleValue[] })[] = [
    {
        key: "totalPoints",
        label: "Total Points",
        icon: "star",
        color: "#7C3AED",
        allowedRoles: [ROLE.USER, ROLE.TEAM_LEAD, ROLE.ADMIN, ROLE.SUPER_ADMIN],
    },
    {
        key: "rank",
        label: "Current Rank",
        icon: "trophy",
        color: "#F59E0B",
        allowedRoles: [ROLE.USER, ROLE.TEAM_LEAD, ROLE.ADMIN, ROLE.SUPER_ADMIN],
    },
    {
        key: "linkClicks",
        label: "Link Clicks",
        icon: "links",
        color: "#3B82F6",
        allowedRoles: [ROLE.USER, ROLE.TEAM_LEAD, ROLE.ADMIN, ROLE.SUPER_ADMIN],
    },
    {
        key: "referrals",
        label: "Referrals",
        icon: "team",
        color: "#10B981",
        allowedRoles: [ROLE.USER, ROLE.TEAM_LEAD, ROLE.ADMIN, ROLE.SUPER_ADMIN],
    },
    {
        key: "donations",
        label: "Donations Given",
        icon: "donations",
        color: "#EF4444",
        allowedRoles: [ROLE.USER, ROLE.TEAM_LEAD, ROLE.ADMIN, ROLE.SUPER_ADMIN],
    },
    {
        key: "participants",
        label: "Total Participants",
        icon: "users",
        color: "#8B5CF6",
        allowedRoles: [ROLE.TEAM_LEAD, ROLE.ADMIN, ROLE.SUPER_ADMIN],
    },
    {
        key: "campaigns",
        label: "Active Campaigns",
        icon: "campaigns",
        color: "#06B6D4",
        allowedRoles: [ROLE.ADMIN, ROLE.SUPER_ADMIN],
    },
    {
        key: "totalDonations",
        label: "Total Donations Raised",
        icon: "bank",
        color: "#F97316",
        allowedRoles: [ROLE.ADMIN, ROLE.SUPER_ADMIN],
    },
];

export const ANALYTICS_SECTIONS: (PageSection & { allowedRoles: RoleValue[] })[] = [
    {
        key: "personal-kpis",
        label: "My Key Metrics",
        allowedRoles: [ROLE.USER, ROLE.TEAM_LEAD, ROLE.ADMIN, ROLE.SUPER_ADMIN],
    },
    {
        key: "engagement-timeline",
        label: "Engagement Timeline",
        allowedRoles: [ROLE.USER, ROLE.TEAM_LEAD, ROLE.ADMIN, ROLE.SUPER_ADMIN],
    },
    {
        key: "top-performers",
        label: "Top Soldiers",
        allowedRoles: [ROLE.TEAM_LEAD, ROLE.ADMIN, ROLE.SUPER_ADMIN],
    },
    {
        key: "campaign-analytics",
        label: "Campaign Analytics",
        allowedRoles: [ROLE.TEAM_LEAD, ROLE.ADMIN, ROLE.SUPER_ADMIN],
    },
    {
        key: "campaign-growth",
        label: "Campaign Growth",
        allowedRoles: [ROLE.TEAM_LEAD, ROLE.ADMIN, ROLE.SUPER_ADMIN],
    },
    {
        key: "platform-overview",
        label: "Platform Overview",
        allowedRoles: [ROLE.ADMIN, ROLE.SUPER_ADMIN],
    },
    {
        key: "team-analytics",
        label: "Team Analytics",
        allowedRoles: [ROLE.TEAM_LEAD, ROLE.ADMIN, ROLE.SUPER_ADMIN],
    },
    {
        key: "donation-analytics",
        label: "Donation Analytics",
        allowedRoles: [ROLE.ADMIN, ROLE.SUPER_ADMIN],
    },
    {
        key: "proofs-overview",
        label: "Deployment Proofs",
        allowedRoles: [ROLE.SUPER_ADMIN],
    },
];
