export { };

declare global {
    // ─── Enums ──────────────────────────────────────────────────────────────────
    const enum UserRole {
        USER = "USER",
        TEAM_LEAD = "TEAM_LEAD",
        ADMIN = "ADMIN",
        SUPER_ADMIN = "SUPER_ADMIN",
    }

    const enum CampaignStatus {
        DRAFT = "DRAFT",
        ACTIVE = "ACTIVE",
        PAUSED = "PAUSED",
        COMPLETED = "COMPLETED",
        ARCHIVED = "ARCHIVED",
    }

    const enum CampaignMediaType {
        IMAGE = "IMAGE",
        VIDEO = "VIDEO",
        LINK = "LINK",
        TEXT = "TEXT",
    }

    const enum GoalType {
        SHARES = "SHARES",
        CLICKS = "CLICKS",
        REFERRALS = "REFERRALS",
        DONATIONS = "DONATIONS",
        PARTICIPANTS = "PARTICIPANTS",
    }

    const enum LinkEventType {
        VIEW = "VIEW",
        CLICK = "CLICK",
        SHARE = "SHARE",
        CONVERSION = "CONVERSION",
        REFERRAL = "REFERRAL",
    }

    const enum PointType {
        IMPACT = "IMPACT",
        CONSISTENCY = "CONSISTENCY",
        LEADERSHIP = "LEADERSHIP",
        RELIABILITY = "RELIABILITY",
    }

    const enum DonationStatus {
        PENDING = "PENDING",
        COMPLETED = "COMPLETED",
        FAILED = "FAILED",
        REFUNDED = "REFUNDED",
    }

    const enum TrustFlag {
        DUPLICATE_ACTIVITY = "DUPLICATE_ACTIVITY",
        ABNORMAL_CLICKS = "ABNORMAL_CLICKS",
        SUSPICIOUS_DEVICE = "SUSPICIOUS_DEVICE",
        RATE_LIMITED = "RATE_LIMITED",
    }

    // ─── Core Entities ───────────────────────────────────────────────────────────

    interface User {
        id: string;
        email: string;
        passwordHash: string;
        firstName: string;
        lastName: string;
        role: UserRole;
        profilePicture?: string;
        trustScore: number;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
    }

    interface AuthUser {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: UserRole;
        profilePicture?: string;
    }

    interface CampaignMedia {
        id: string;
        type: CampaignMediaType;
        url: string;
        thumbnailUrl?: string;
        altText?: string;
        order: number;
    }

    interface Campaign {
        id: string;
        title: string;
        description: string;
        content: string;
        media: CampaignMedia[];
        mediaType?: CampaignMediaType;
        mediaUrl?: string;
        thumbnailUrl?: string;
        ctaText?: string;
        ctaUrl?: string;
        createdById: string;
        status: CampaignStatus;
        goalType?: GoalType;
        goalTarget?: number;
        goalCurrent?: number;
        startDate?: string;
        endDate?: string;
        targetAudience?: string[];
        publishedAt?: string;
        metaTitle?: string;
        metaDescription?: string;
        metaImage?: string;
        viewCount: number;
        clickCount: number;
        shareCount: number;
        likeCount?: number;
        participantCount?: number;
        createdAt: string;
        updatedAt: string;
    }

    interface CampaignParticipation {
        id: string;
        userId: string;
        campaignId: string;
        joinedAt: string;
        smartLinkId?: string;
    }

    interface SmartLink {
        id: string;
        slug: string;
        userId: string;
        campaignId: string;
        originalUrl: string;
        clickCount: number;
        uniqueClickCount: number;
        conversionCount: number;
        isActive: boolean;
        isExpired: boolean;
        expiresAt?: string;
        createdAt: string;
        updatedAt: string;
    }

    interface LinkEvent {
        id: string;
        linkId: string;
        smartLinkId?: string;
        slug?: string;
        eventType: LinkEventType;
        type?: LinkEventType;
        userId?: string;
        ipAddress?: string;
        ipHash?: string;
        userAgent?: string;
        referrer?: string;
        referer?: string;
        country?: string;
        createdAt: string;
    }

    interface Referral {
        id: string;
        inviterId: string;
        inviteeId: string;
        campaignId: string;
        slug: string;
        createdAt: string;
    }

    interface Donation {
        id: string;
        userId: string;
        campaignId: string;
        amount: number;
        currency: string;
        status: DonationStatus;
        reference: string;
        createdAt: string;
        updatedAt: string;
    }

    interface PointsLedgerEntry {
        id: string;
        userId: string;
        campaignId?: string;
        type: PointType;
        value: number;
        description: string;
        referenceId?: string;
        createdAt: string;
    }

    interface PointsSummary {
        userId: string;
        campaignId?: string;
        impact: number;
        consistency: number;
        leadership: number;
        reliability: number;
        total: number;
    }

    interface LeaderboardSnapshot {
        id: string;
        userId: string;
        campaignId?: string;
        period: string;
        rank: number;
        score: number;
        createdAt: string;
    }

    interface TrustScore {
        id: string;
        userId: string;
        score: number;
        flags: TrustFlag[];
        lastReviewedAt?: string;
        updatedAt: string;
    }

    // ─── Input Types ─────────────────────────────────────────────────────────────

    interface CreateCampaignInput {
        title: string;
        description: string;
        content: string;
        media?: CampaignMedia[];
        mediaType?: CampaignMediaType;
        mediaUrl?: string;
        thumbnailUrl?: string;
        ctaText?: string;
        ctaUrl?: string;
        goalType?: GoalType;
        goalTarget?: number;
        startDate?: string;
        endDate?: string;
        targetAudience?: string[];
        metaTitle?: string;
        metaDescription?: string;
        metaImage?: string;
        publishImmediately?: boolean;
    }

    interface UpdateCampaignInput {
        title?: string;
        description?: string;
        content?: string;
        media?: CampaignMedia[];
        mediaType?: CampaignMediaType;
        mediaUrl?: string;
        thumbnailUrl?: string;
        ctaText?: string;
        ctaUrl?: string;
        goalType?: GoalType;
        goalTarget?: number;
        startDate?: string;
        endDate?: string;
        targetAudience?: string[];
        metaTitle?: string;
        metaDescription?: string;
        metaImage?: string;
        status?: CampaignStatus;
    }

    interface RegisterInput {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
    }

    interface LoginInput {
        email: string;
        password: string;
    }

    // ─── Filters & Pagination ────────────────────────────────────────────────────

    interface PaginationParams {
        page: number;
        pageSize: number;
    }

    interface CampaignFilters {
        status?: CampaignStatus;
        search?: string;
        startDateFrom?: string;
        startDateTo?: string;
        goalType?: GoalType;
    }

    // ─── Engagement ──────────────────────────────────────────────────────────────

    interface EngagementStats {
        userId: string;
        campaignId?: string;
        shares: number;
        clicks: number;
        views: number;
        conversions: number;
        referrals: number;
        uniqueVisitors: number;
    }

    interface EngagementTimelinePoint {
        date: string;
        clicks: number;
        shares: number;
        conversions: number;
    }

    // ─── Referrals ───────────────────────────────────────────────────────────────

    interface ReferralStats {
        userId: string;
        campaignId?: string;
        totalReferrals: number;
        activeReferrals: number;
        conversionRate: number;
        directInvites: number;
    }

    // ─── Points / Gamification ───────────────────────────────────────────────────

    type PointsAction = "CLICK_RECEIVED" | "SHARE_MADE" | "CONVERSION_RECEIVED" | "DAILY_STREAK" | "WEEKLY_STREAK" | "REFERRAL_JOINED" | "TEAM_MILESTONE" | "GOAL_MET" | "REPORT_ACCURATE";

    interface RankLevel {
        level: number;
        name: string;
        minScore: number;
        badge: string;
        color: string;
        perks: string[];
    }

    interface RankProgress {
        currentRank: RankLevel;
        nextRank: RankLevel | null;
        totalScore: number;
        pointsToNext: number | null;
        progressPercent: number;
    }

    // ─── Leaderboard ─────────────────────────────────────────────────────────────

    interface LeaderboardEntry {
        userId: string;
        firstName: string;
        lastName: string;
        profilePicture?: string;
        rank: number;
        score: number;
        impact: number;
        consistency: number;
        leadership: number;
        reliability: number;
        campaignId?: string;
    }

    type LeaderboardFilter = "individual" | "global";

    interface UserRankInfo {
        position: number;
        score: number;
        percentile: number;
        campaignId?: string;
    }

    // ─── Donation ────────────────────────────────────────────────────────────────

    interface CreateDonationInput {
        campaignId: string;
        amount: number;
        currency: string;
        message?: string;
    }

    interface DonationStats {
        campaignId: string;
        totalRaised: number;
        donorCount: number;
        conversionRate: number;
        topDonors: { userId: string; firstName: string; lastName: string; total: number }[];
    }

    // ─── Trust ───────────────────────────────────────────────────────────────────

    interface TrustFlagRecord {
        userId: string;
        firstName: string;
        lastName: string;
        email: string;
        score: number;
        flags: TrustFlag[];
        lastReviewedAt?: string;
    }

    // ─── Analytics ───────────────────────────────────────────────────────────────

    interface UserAnalytics {
        engagement: EngagementStats;
        points: PointsSummary;
        rank: RankProgress;
        referrals: ReferralStats;
        donations: { total: number; count: number };
        streaks: { daily: number; weekly: number };
    }

    interface CampaignAnalytics {
        participants: number;
        growth: { date: string; count: number }[];
        topPerformers: LeaderboardEntry[];
        engagementTrend: EngagementTimelinePoint[];
        fundraising: DonationStats;
    }

    interface OverviewAnalytics {
        totalUsers: number;
        activeCampaigns: number;
        totalDonations: number;
        totalPoints: number;
        topCampaigns: { id: string; title: string; participants: number }[];
    }

    // ─── Shared Config Shapes ────────────────────────────────────────────────────

    interface RoleGuarded<T> {
        item: T;
        allowedRoles: string[];
    }

    interface KpiCardConfig {
        key: string;
        label: string;
        icon: string;
        color: string;
        allowedRoles: string[];
    }

    interface NavItem {
        key: string;
        label: string;
        href: string;
        icon: string;
        allowedRoles: string[];
        children?: NavItem[];
    }

    interface PageSection {
        key: string;
        label: string;
        allowedRoles: string[];
    }

    // ─── Notifications ───────────────────────────────────────────────────────────

    type NotificationType =
        | "CAMPAIGN_UPDATE"
        | "REFERRAL_JOINED"
        | "POINTS_EARNED"
        | "TRUST_FLAG"
        | "SYSTEM";

    interface AppNotification {
        id: string;
        userId: string;
        type: NotificationType;
        title: string;
        body: string;
        isRead: boolean;
        link?: string;
        createdAt: string;
    }
}
