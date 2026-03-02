// ─── Auto-Refresh Interval Configuration ─────────────────────────────────────
// Per-table polling intervals (milliseconds) for the useAutoRefresh hook.
// Lower = more responsive but more requests. 0 = disabled (no polling).
// Tuned per domain: high-traffic tables poll faster; admin views poll slower.

export type RefreshTable =
    | "users"
    | "campaigns"
    | "participations"
    | "smartLinks"
    | "linkEvents"
    | "referrals"
    | "donations"
    | "pointsLedger"
    | "leaderboardSnapshots"
    | "trustScores"
    | "notifications"
    | "viewProofs"
    | "groups"
    | "teams"
    | "teamInviteLinks"
    | "campaignAuditEvents";

export const REFRESH_INTERVALS: Record<RefreshTable, number> = {
    // High-frequency — user watching live stats
    linkEvents: 5_000,         // 5s
    smartLinks: 5_000,         // 5s

    // Medium-frequency — scoreboards, points
    pointsLedger: 10_000,      // 10s
    participations: 10_000,    // 10s
    notifications: 10_000,     // 10s

    // Lower-frequency — admin / review workflows
    campaigns: 15_000,         // 15s
    donations: 15_000,         // 15s
    referrals: 30_000,         // 30s
    viewProofs: 30_000,        // 30s

    // Slow — rankings, analytics, admin views
    leaderboardSnapshots: 30_000, // 30s
    trustScores: 60_000,       // 60s
    users: 60_000,             // 60s
    groups: 60_000,            // 60s
    teams: 60_000,             // 60s
    teamInviteLinks: 60_000,   // 60s
    campaignAuditEvents: 60_000, // 60s
} as const;
