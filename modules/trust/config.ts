import {
    LINK_EVENT_RATE_LIMIT_WINDOW_MS,
    LINK_EVENT_RATE_LIMIT_MAX,
    TRUST_SCORE_PENALTY,
} from "@/lib/constants";

export interface FraudRule {
    id: string;
    name: string;
    flag: TrustFlag;
    penalty: number;
    /** Check if this event triggers the rule.
     *  @param event   The incoming link event
     *  @param history All prior events from the same user in the current window
     */
    check(event: LinkEvent, history: LinkEvent[]): boolean;
}

export const FRAUD_RULES: FraudRule[] = [
    {
        id: "duplicate-activity",
        name: "Duplicate Activity",
        flag: "DUPLICATE_ACTIVITY" as unknown as TrustFlag,
        penalty: TRUST_SCORE_PENALTY,
        check(event, history) {
            // Flag if the same eventType + linkId combo appears more than 5× in the window
            return (
                history.filter(
                    (h) =>
                        h.linkId === event.linkId &&
                        h.eventType === event.eventType
                ).length > 5
            );
        },
    },
    {
        id: "abnormal-clicks",
        name: "Abnormal Click Velocity",
        flag: "ABNORMAL_CLICKS" as unknown as TrustFlag,
        penalty: TRUST_SCORE_PENALTY,
        check(event, history) {
            // Flag if user has more than LINK_EVENT_RATE_LIMIT_MAX within the window
            const cutoff = Date.now() - LINK_EVENT_RATE_LIMIT_WINDOW_MS;
            const recent = history.filter(
                (h) =>
                    h.userId === event.userId &&
                    new Date(h.createdAt).getTime() > cutoff
            );
            return recent.length >= LINK_EVENT_RATE_LIMIT_MAX;
        },
    },
    {
        id: "suspicious-device",
        name: "Suspicious Device Fingerprint",
        flag: "SUSPICIOUS_DEVICE" as unknown as TrustFlag,
        penalty: TRUST_SCORE_PENALTY,
        check(event, history) {
            // Flag if the same IP appears from 3+ distinct userIds in the window
            if (!event.ipAddress) return false;
            const sameIpUsers = new Set(
                history
                    .filter((h) => h.ipAddress === event.ipAddress)
                    .map((h) => h.userId)
            );
            return sameIpUsers.size >= 3;
        },
    },
    {
        id: "rate-limited",
        name: "Rate Limit Breach",
        flag: "RATE_LIMITED" as unknown as TrustFlag,
        penalty: TRUST_SCORE_PENALTY * 2,
        check(event, history) {
            // Per-link CLICK velocity > 3× the normal limit
            const cutoff = Date.now() - LINK_EVENT_RATE_LIMIT_WINDOW_MS;
            const recentForLink = history.filter(
                (h) =>
                    h.linkId === event.linkId &&
                    new Date(h.createdAt).getTime() > cutoff
            );
            return recentForLink.length >= LINK_EVENT_RATE_LIMIT_MAX * 3;
        },
    },
];
