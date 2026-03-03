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
    HOW_IT_WORKS: "/how-it-works",

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

    // Invites
    INVITE: (token: string) => `/invite/${token}`,

    // Proofs
    PROOFS: "/proofs",

    // Admin
    USERS: "/users",
    USER_DETAIL: (id: string) => `/users/${id}`,
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
            REFRESH: "/api/auth/refresh",
        },
        CAMPAIGNS: {
            BASE: "/api/campaigns",
            DETAIL: (id: string) => `/api/campaigns/${id}`,
            PARTICIPANTS: (id: string) => `/api/campaigns/${id}/participants`,
            JOINED: "/api/campaigns/joined",
            ME: "/api/campaigns/me",
            AUDIT: (id: string) => `/api/campaigns/${id}/audit`,
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
            PROOFS: "/api/engagement/proofs",
            PROOF_REVIEW: (id: string) => `/api/engagement/proofs/${id}/review`,
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
            TEAM: "/api/leaderboard/team",
            GROUP: "/api/leaderboard/group",
            SNAPSHOT: "/api/leaderboard/snapshot",
            CAMPAIGN: (id: string) => `/api/leaderboard/campaigns/${id}`,
        },
        DONATIONS: {
            BASE: "/api/donations",
            ME: "/api/donations/me",
            ADMIN: "/api/donations/admin",
            ANALYTICS: "/api/donations/analytics",
            CAMPAIGN: (id: string) => `/api/donations/campaigns/${id}`,
            DETAIL: (id: string) => `/api/donations/${id}`,
            VERIFY: (id: string) => `/api/donations/${id}/verify`,
            PROOF: (id: string) => `/api/donations/${id}/proof`,
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
            ME: "/api/users/me",
            ROLE: (id: string) => `/api/users/${id}/role`,
            PROFILE: (id: string) => `/api/users/${id}/profile`,
            WEAPONS: "/api/users/weapons",
        },
        UPLOAD: "/api/upload",
        TEAMS: {
            BASE: "/api/teams",
            DETAIL: (id: string) => `/api/teams/${id}`,
            MEMBERS: (id: string) => `/api/teams/${id}/members`,
            LEAD: (id: string) => `/api/teams/${id}/lead`,
            INVITE: (id: string) => `/api/teams/${id}/invite`,
            STATS: (id: string) => `/api/teams/${id}/stats`,
        },
        GROUPS: {
            BASE: "/api/groups",
        },
        PUBLIC: {
            STATS: "/api/public/stats",
        },
        INVITE: {
            PREVIEW: (token: string) => `/api/invite/${token}`,
            JOIN: (token: string) => `/api/invite/${token}/join`,
        },
    },
} as const;
