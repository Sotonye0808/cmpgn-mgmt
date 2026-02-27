// UserRole as string values for config (const enum can't be used at runtime in arrays)
const ROLE = {
    USER: "USER",
    TEAM_LEAD: "TEAM_LEAD",
    ADMIN: "ADMIN",
    SUPER_ADMIN: "SUPER_ADMIN",
} as const;

type RoleValue = (typeof ROLE)[keyof typeof ROLE];

export interface CampaignSection {
    key: string;
    allowedRoles: RoleValue[];
}

export const CAMPAIGN_SECTIONS: CampaignSection[] = [
    {
        key: "story-view",
        allowedRoles: [ROLE.USER, ROLE.TEAM_LEAD, ROLE.ADMIN, ROLE.SUPER_ADMIN],
    },
    {
        key: "campaign-grid",
        allowedRoles: [ROLE.USER, ROLE.TEAM_LEAD, ROLE.ADMIN, ROLE.SUPER_ADMIN],
    },
    {
        key: "admin-actions",
        allowedRoles: [ROLE.ADMIN, ROLE.SUPER_ADMIN],
    },
    {
        key: "participant-management",
        allowedRoles: [ROLE.ADMIN, ROLE.SUPER_ADMIN],
    },
];

export const CAMPAIGN_FILTER_OPTIONS = [
    { label: "All Statuses", value: "" },
    { label: "Active", value: "ACTIVE" },
    { label: "Draft", value: "DRAFT" },
    { label: "Paused", value: "PAUSED" },
    { label: "Completed", value: "COMPLETED" },
    { label: "Archived", value: "ARCHIVED" },
] as const;

export const CAMPAIGN_GOAL_OPTIONS = [
    { label: "Shares", value: "SHARES" },
    { label: "Clicks", value: "CLICKS" },
    { label: "Referrals", value: "REFERRALS" },
    { label: "Donations", value: "DONATIONS" },
    { label: "Participants", value: "PARTICIPANTS" },
] as const;

export const CAMPAIGN_MEDIA_OPTIONS = [
    { label: "Image", value: "IMAGE" },
    { label: "Video", value: "VIDEO" },
    { label: "Text Only", value: "TEXT" },
    { label: "Link", value: "LINK" },
] as const;
