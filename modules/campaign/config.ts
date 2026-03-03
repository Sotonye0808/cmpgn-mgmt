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

export const CAMPAIGN_STATUS_OPTIONS = [
    { label: "Draft", value: "DRAFT" },
    { label: "Active", value: "ACTIVE" },
    { label: "Paused", value: "PAUSED" },
    { label: "Completed", value: "COMPLETED" },
    { label: "Archived", value: "ARCHIVED" },
] as const;

export const CAMPAIGN_AUDIENCE_TAGS = [
    { label: "General", value: "GENERAL" },
    { label: "Youth", value: "YOUTH" },
    { label: "Students", value: "STUDENTS" },
    { label: "Professionals", value: "PROFESSIONALS" },
    { label: "Parents", value: "PARENTS" },
    { label: "Seniors", value: "SENIORS" },
    { label: "Entrepreneurs", value: "ENTREPRENEURS" },
    { label: "Tech Enthusiasts", value: "TECH_ENTHUSIASTS" },
    { label: "Social Media Users", value: "SOCIAL_MEDIA_USERS" },
    { label: "Church Members", value: "CHURCH_MEMBERS" },
    { label: "Urban", value: "URBAN" },
    { label: "Rural", value: "RURAL" },
    { label: "Gamers", value: "GAMERS" },
] as const;

/**
 * Media-type-conditional field visibility rules.
 * Each key is a CampaignMediaType value.  The boolean flags indicate whether
 * a field should be shown in the form and in display components for that type.
 */
export const MEDIA_TYPE_FIELDS = {
    IMAGE: { showContent: false, showMediaUrl: false, showUpload: true, showThumbnailUpload: false },
    VIDEO: { showContent: false, showMediaUrl: false, showUpload: true, showThumbnailUpload: false },
    TEXT:  { showContent: true,  showMediaUrl: false, showUpload: false, showThumbnailUpload: true },
    LINK:  { showContent: false, showMediaUrl: true,  showUpload: false, showThumbnailUpload: true },
} as const;

export type MediaTypeFieldConfig = (typeof MEDIA_TYPE_FIELDS)[keyof typeof MEDIA_TYPE_FIELDS];