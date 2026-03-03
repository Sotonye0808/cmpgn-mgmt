// ─── Auto-Refresh Interval Configuration ─────────────────────────────────────
// Per-table polling intervals (milliseconds) for the useAutoRefresh hook.
// Lower = more responsive but more requests. 0 = disabled (no polling).
// Tuned per domain: high-traffic tables poll faster; admin views poll slower.
// These intervals are conservative to avoid excessive network chatter —
// the hook also deduplicates via data fingerprinting (see useAutoRefresh).

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
    linkEvents: 15_000,        // 15s  (was 5s)
    smartLinks: 15_000,        // 15s  (was 5s)

    // Medium-frequency — scoreboards, points
    pointsLedger: 30_000,      // 30s  (was 10s)
    participations: 30_000,    // 30s  (was 10s)
    notifications: 20_000,     // 20s  (was 10s)

    // Lower-frequency — admin / review workflows
    campaigns: 30_000,         // 30s  (was 15s)
    donations: 30_000,         // 30s  (was 15s)
    referrals: 60_000,         // 60s  (was 30s)
    viewProofs: 60_000,        // 60s  (was 30s)

    // Slow — rankings, analytics, admin views
    leaderboardSnapshots: 60_000, // 60s
    trustScores: 120_000,      // 2m   (was 60s)
    users: 120_000,            // 2m   (was 60s)
    groups: 120_000,           // 2m   (was 60s)
    teams: 120_000,            // 2m   (was 60s)
    teamInviteLinks: 120_000,  // 2m   (was 60s)
    campaignAuditEvents: 120_000, // 2m (was 60s)
} as const;
