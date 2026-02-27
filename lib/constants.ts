// ─── Pagination ───────────────────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

// ─── Campaign ────────────────────────────────────────────────────────────────
export const CAMPAIGN_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days default

// ─── Smart Links ─────────────────────────────────────────────────────────────
export const SMART_LINK_PREFIX = "/c/";
export const SMART_LINK_EXPIRY_DAYS = 30;
export const SMART_LINK_SLUG_LENGTH = 7;

// ─── Auth / JWT ──────────────────────────────────────────────────────────────
export const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? "";
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? "";
export const BCRYPT_SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);
export const JWT_ACCESS_EXPIRY = "180m";
export const JWT_REFRESH_EXPIRY = "7d";
export const JWT_ACCESS_COOKIE = "dmhicc_access";
export const JWT_REFRESH_COOKIE = "dmhicc_refresh";

// ─── Cache TTLs (ms) ─────────────────────────────────────────────────────────
export const CACHE_TTL_LEADERBOARD = 60_000; // 1 min
export const CACHE_TTL_CAMPAIGN_LIST = 30_000; // 30 sec
export const CACHE_TTL_POINTS_SUMMARY = 60_000; // 1 min
export const CACHE_TTL_ENGAGEMENT = 30_000; // 30 sec
export const CACHE_TTL_DONATIONS = 30_000; // 30 sec
export const CACHE_TTL_TRUST = 60_000; // 1 min
export const CACHE_TTL_ANALYTICS = 60_000; // 1 min

// ─── Points Config ────────────────────────────────────────────────────────────
export const POINTS_CONFIG = {
    CLICK_RECEIVED: { type: "IMPACT" as const, value: 1 },
    SHARE_MADE: { type: "IMPACT" as const, value: 5 },
    CONVERSION_RECEIVED: { type: "IMPACT" as const, value: 10 },
    DAILY_STREAK: { type: "CONSISTENCY" as const, value: 5 },
    WEEKLY_STREAK: { type: "CONSISTENCY" as const, value: 25 },
    REFERRAL_JOINED: { type: "LEADERSHIP" as const, value: 25 },
    TEAM_MILESTONE: { type: "LEADERSHIP" as const, value: 50 },
    GOAL_MET: { type: "RELIABILITY" as const, value: 30 },
    REPORT_ACCURATE: { type: "RELIABILITY" as const, value: 10 },
} as const;

// ─── Trust Score ─────────────────────────────────────────────────────────────
export const DEFAULT_TRUST_SCORE = 100;
export const TRUST_SCORE_PENALTY = 10;
export const TRUST_SCORE_MIN = 0;
export const TRUST_SCORE_MAX = 100;

// ─── Rate Limiting ────────────────────────────────────────────────────────────
export const LINK_EVENT_RATE_LIMIT_WINDOW_MS = 60_000; // 1 min
export const LINK_EVENT_RATE_LIMIT_MAX = 30; // 30 events per minute per IP
