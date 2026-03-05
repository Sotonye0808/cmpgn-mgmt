import { ROUTES } from "./routes";

// UserRole values as string literals for use in config arrays
// (since const enum cannot be used in non-const contexts at runtime)
const ROLE = {
    USER: "USER",
    TEAM_LEAD: "TEAM_LEAD",
    ADMIN: "ADMIN",
    SUPER_ADMIN: "SUPER_ADMIN",
} as const;

type RoleValue = (typeof ROLE)[keyof typeof ROLE];

export interface NavItem {
    key: string;
    label: string;
    href: string;
    icon: string;
    allowedRoles: RoleValue[];
    /** When true, this item is hidden from navigation but the page still exists. */
    deprecated?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
    {
        key: "dashboard",
        label: "Dashboard",
        href: ROUTES.DASHBOARD,
        icon: "dashboard",
        allowedRoles: [ROLE.USER, ROLE.TEAM_LEAD, ROLE.ADMIN, ROLE.SUPER_ADMIN],
    },
    {
        key: "campaigns",
        label: "Campaigns",
        href: ROUTES.CAMPAIGNS,
        icon: "campaigns",
        allowedRoles: [ROLE.USER, ROLE.TEAM_LEAD, ROLE.ADMIN, ROLE.SUPER_ADMIN],
    },
    {
        key: "links",
        label: "My Links",
        href: ROUTES.SMART_LINKS,
        icon: "links",
        allowedRoles: [ROLE.USER, ROLE.TEAM_LEAD, ROLE.ADMIN, ROLE.SUPER_ADMIN],
    },
    {
        key: "leaderboard",
        label: "Leaderboard",
        href: ROUTES.LEADERBOARD,
        icon: "leaderboard",
        allowedRoles: [ROLE.USER, ROLE.TEAM_LEAD, ROLE.ADMIN, ROLE.SUPER_ADMIN],
    },
    {
        key: "donations",
        label: "Donations",
        href: ROUTES.DONATIONS,
        icon: "donations",
        allowedRoles: [ROLE.USER, ROLE.TEAM_LEAD, ROLE.ADMIN, ROLE.SUPER_ADMIN],
    },
    {
        key: "proofs",
        label: "Status Views",
        href: ROUTES.PROOFS,
        icon: "proofs",
        allowedRoles: [ROLE.USER, ROLE.TEAM_LEAD, ROLE.ADMIN, ROLE.SUPER_ADMIN],
    },
    {
        key: "analytics",
        label: "Analytics",
        href: ROUTES.ANALYTICS,
        icon: "analytics",
        allowedRoles: [ROLE.USER, ROLE.TEAM_LEAD, ROLE.ADMIN, ROLE.SUPER_ADMIN],
    },
    {
        key: "referrals",
        label: "Referrals",
        href: ROUTES.REFERRALS,
        icon: "share",
        allowedRoles: [ROLE.USER, ROLE.TEAM_LEAD, ROLE.ADMIN, ROLE.SUPER_ADMIN],
    },
    {
        key: "team",
        label: "Team",
        href: ROUTES.TEAM,
        icon: "team",
        allowedRoles: [ROLE.TEAM_LEAD, ROLE.ADMIN, ROLE.SUPER_ADMIN],
        deprecated: true,
    },
    {
        key: "users",
        label: "Users",
        href: ROUTES.USERS,
        icon: "users",
        allowedRoles: [ROLE.SUPER_ADMIN],
    },
    {
        key: "trust",
        label: "Trust Review",
        href: ROUTES.TRUST_REVIEW,
        icon: "trust",
        allowedRoles: [ROLE.SUPER_ADMIN],
    },
    {
        key: "bug-reports",
        label: "Bug Reports",
        href: ROUTES.BUG_REPORTS,
        icon: "bug",
        allowedRoles: [ROLE.SUPER_ADMIN],
    },
    {
        key: "report-bug",
        label: "Report a Bug",
        href: ROUTES.REPORT_BUG,
        icon: "bug",
        allowedRoles: [ROLE.USER, ROLE.TEAM_LEAD, ROLE.ADMIN, ROLE.SUPER_ADMIN],
    },
];
