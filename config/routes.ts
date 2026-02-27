export const ROUTES = {
    // Public
    HOME: "/",
    LOGIN: "/login",
    REGISTER: "/register",
    PUBLIC_LINK: (slug: string) => `/c/${slug}`,
    ABOUT: "/about",
    CONTACT: "/contact",
    PRIVACY: "/privacy",
    TERMS: "/terms",

    // Dashboard
    DASHBOARD: "/dashboard",

    // Campaigns
    CAMPAIGNS: "/campaigns",
    CAMPAIGN_DETAIL: (id: string) => `/campaigns/${id}`,
    CAMPAIGN_NEW: "/campaigns/new",
    CAMPAIGN_EDIT: (id: string) => `/campaigns/${id}/edit`,

    // Smart Links
    SMART_LINKS: "/links",

    // Analytics
    ANALYTICS: "/analytics",

    // Leaderboard
    LEADERBOARD: "/leaderboard",

    // Donations
    DONATIONS: "/donations",

    // Team
    TEAM: "/team",

    // Admin
    USERS: "/users",
    TRUST_REVIEW: "/trust-review",

    // Profile / Settings
    SETTINGS: "/settings",

    // API
    API: {
        AUTH: {
            REGISTER: "/api/auth/register",
            LOGIN: "/api/auth/login",
            LOGOUT: "/api/auth/logout",
            ME: "/api/auth/me",
        },
        CAMPAIGNS: {
            BASE: "/api/campaigns",
            DETAIL: (id: string) => `/api/campaigns/${id}`,
            PARTICIPANTS: (id: string) => `/api/campaigns/${id}/participants`,
        },
        SMART_LINKS: {
            BASE: "/api/smart-links",
            GENERATE: "/api/smart-links/generate",
            DETAIL: (id: string) => `/api/smart-links/${id}`,
        },
        ENGAGEMENT: {
            ME: "/api/engagement/me",
            CAMPAIGN: (id: string) => `/api/engagement/campaigns/${id}`,
            TIMELINE: "/api/engagement/timeline",
        },
        REFERRALS: {
            ME: "/api/referrals/me",
            CAMPAIGN: (id: string) => `/api/referrals/campaigns/${id}`,
        },
        POINTS: {
            ME: "/api/points/me",
            AWARD: "/api/points/award",
            LEDGER: "/api/points/ledger",
        },
        LEADERBOARD: {
            BASE: "/api/leaderboard",
            ME: "/api/leaderboard/me",
            GLOBAL: "/api/leaderboard/global",
            SNAPSHOT: "/api/leaderboard/snapshot",
            CAMPAIGN: (id: string) => `/api/leaderboard/campaigns/${id}`,
        },
        DONATIONS: {
            BASE: "/api/donations",
            ME: "/api/donations/me",
            CAMPAIGN: (id: string) => `/api/donations/campaigns/${id}`,
            DETAIL: (id: string) => `/api/donations/${id}`,
        },
        TRUST: {
            ME: "/api/trust/me",
            USERS: "/api/trust/users",
            REVIEW: (id: string) => `/api/trust/users/${id}/review`,
        },
        ANALYTICS: {
            ME: "/api/analytics/me",
            CAMPAIGN: (id: string) => `/api/analytics/campaigns/${id}`,
            OVERVIEW: "/api/analytics/overview",
        },
        USERS: {
            BASE: "/api/users",
            ROLE: (id: string) => `/api/users/${id}/role`,
        },
    },
} as const;
