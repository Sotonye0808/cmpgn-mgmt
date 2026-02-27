// All static copy lives here — no literal strings in JSX

export const LANDING_CONTENT = {
    meta: {
        title: "DMHicc — Digital Mobilization & Harvest Impact Campaign Center",
        description:
            "Transform your digital outreach into measurable campaign impact. Smart links, referral tracking, gamification, and real-time analytics.",
    },
    hero: {
        headline: "Turn Digital Outreach Into Measurable Impact",
        subheadline:
            "DMHicc gives every mobilizer a smart link, every campaign a lifecycle, and every leader a live dashboard.",
        cta: "Get Started",
        ctaSecondary: "Learn More",
    },
    features: [
        {
            key: "smart-links",
            icon: "links" as const,
            title: "Smart Link Engine",
            description:
                "Every user–campaign pair gets a unique trackable link. Monitor clicks, devices, and referrals in real time.",
        },
        {
            key: "gamification",
            icon: "star" as const,
            title: "Points & Gamification",
            description:
                "Earn Impact, Consistency, Leadership, and Reliability points. Climb the leaderboard.",
        },
        {
            key: "referrals",
            icon: "team" as const,
            title: "Referral Engine",
            description:
                "Track who invited whom. Attribute referrals to inviters and campaigns automatically.",
        },
        {
            key: "analytics",
            icon: "analytics" as const,
            title: "Live Analytics",
            description:
                "Real-time dashboards for mobilizers and admins. Engagement trends, top performers, and campaign health.",
        },
    ],
    stats: [
        { key: "links", label: "Smart Links Tracked", value: "100M+" },
        { key: "campaigns", label: "Active Campaigns", value: "500+" },
        { key: "mobilizers", label: "Mobilizers", value: "10K+" },
        { key: "conversions", label: "Conversion Rate", value: "12%" },
    ],
    footer: {
        copyright: "© 2026 Harvesters International Christian Centre. DMHicc Platform.",
        tagline: "Built for Digital Mobilization at Scale.",
    },
} as const;

export const AUTH_CONTENT = {
    login: {
        title: "Welcome Back",
        subtitle: "Sign in to your DMHicc dashboard",
        emailLabel: "Email Address",
        emailPlaceholder: "you@example.com",
        passwordLabel: "Password",
        passwordPlaceholder: "••••••••",
        submitButton: "Sign In",
        registerPrompt: "Don't have an account?",
        registerLink: "Register here",
        forgotPassword: "Forgot password?",
    },
    register: {
        title: "Create Account",
        subtitle: "Join DMHicc and start mobilizing",
        firstNameLabel: "First Name",
        firstNamePlaceholder: "Adaeze",
        lastNameLabel: "Last Name",
        lastNamePlaceholder: "Okafor",
        emailLabel: "Email Address",
        emailPlaceholder: "you@example.com",
        passwordLabel: "Password",
        passwordPlaceholder: "Min. 8 characters",
        submitButton: "Create Account",
        loginPrompt: "Already have an account?",
        loginLink: "Sign in",
    },
} as const;

export const DASHBOARD_CONTENT = {
    greeting: "Welcome back, {name}!",
    subtitle: "Here's what's happening with your campaigns today.",
    sections: {
        activeCampaigns: "Active Campaigns",
        myLinks: "My Smart Links",
        recentActivity: "Recent Activity",
        leaderboard: "Leaderboard",
    },
    kpi: {
        totalPoints: "Total Points",
        rank: "Current Rank",
        activeCampaigns: "Active Campaigns",
        referrals: "Referrals",
        linkClicks: "Link Clicks",
        donationsRaised: "Donations Raised",
    },
} as const;

export const CAMPAIGN_CONTENT = {
    page: {
        title: "Campaigns",
        description: "Browse and participate in active campaigns",
        emptyTitle: "No Campaigns Yet",
        emptyDescription: "Check back soon for new campaigns to join.",
        createButton: "New Campaign",
    },
    status: {
        DRAFT: "Draft",
        ACTIVE: "Active",
        PAUSED: "Paused",
        COMPLETED: "Completed",
        ARCHIVED: "Archived",
    },
    goalType: {
        SHARES: "Shares",
        CLICKS: "Clicks",
        REFERRALS: "Referrals",
        DONATIONS: "Donations",
        PARTICIPANTS: "Participants",
    },
    form: {
        createTitle: "Create Campaign",
        editTitle: "Edit Campaign",
        titleLabel: "Campaign Title",
        titlePlaceholder: "Enter a compelling campaign title",
        descriptionLabel: "Description",
        descriptionPlaceholder: "Brief description of this campaign",
        contentLabel: "Content",
        ctaTextLabel: "Call to Action Text",
        ctaTextPlaceholder: "e.g. Join Now",
        ctaUrlLabel: "Call to Action URL",
        goalTypeLabel: "Goal Type",
        goalTargetLabel: "Goal Target",
        startDateLabel: "Start Date",
        endDateLabel: "End Date",
        mediaTypeLabel: "Media Type",
        mediaUrlLabel: "Media URL",
        submitCreate: "Create Campaign",
        submitEdit: "Save Changes",
    },
} as const;

export const SMART_LINK_CONTENT = {
    page: {
        title: "My Smart Links",
        description: "Your unique trackable links for each campaign",
        emptyTitle: "No Smart Links Yet",
        emptyDescription: "Join a campaign to generate your smart link.",
    },
    card: {
        copyButton: "Copy Link",
        copiedButton: "Copied!",
        clicks: "Clicks",
        conversions: "Conversions",
        referrals: "Referrals",
        expiry: "Expires",
        expired: "Expired",
        active: "Active",
    },
} as const;

export const NAV_CONTENT = {
    brandName: "DMHicc",
    brandTagline: "Campaign Center",
} as const;

export const LEADERBOARD_PAGE_CONTENT = {
    title: "Leaderboard",
    subtitle: "Top participants ranked by impact, consistency, leadership, and reliability.",
    emptyState: "No participants yet. Join a campaign to appear on the leaderboard.",
    myRankLabel: "Your Position",
} as const;

export const ENGAGEMENT_PAGE_CONTENT = {
    title: "My Engagement",
    subtitle: "Track your reach, activity, and impact across all campaigns.",
    timelineTitle: "Activity Over Time",
    statsTitle: "Overview",
} as const;

export const REFERRAL_PAGE_CONTENT = {
    title: "Referrals",
    subtitle: "Track who you've invited and how your network is growing.",
    linkPanelTitle: "Your Referral Link",
} as const;

export const POINTS_PAGE_CONTENT = {
    title: "Points & Rank",
    subtitle: "Your gamification score breakdown and progress toward the next rank.",
    summaryTitle: "Points Summary",
    rankTitle: "Current Rank",
    ledgerTitle: "Points History",
} as const;

export const DONATION_PAGE_CONTENT = {
    title: "Donations",
    subtitle: "Support campaigns and track your giving history.",
    formTitle: "Make a Donation",
    amountLabel: "Amount",
    campaignLabel: "Campaign",
    messageLabel: "Message (optional)",
    messagePlaceholder: "Leave an encouraging message...",
    submitButton: "Donate Now",
    historyTitle: "My Donations",
    progressTitle: "Fundraising Progress",
    topDonorsTitle: "Top Donors",
    emptyHistory: "You haven't donated yet. Support a campaign today!",
    currencies: ["NGN", "USD", "GBP"],
} as const;

export const TRUST_PAGE_CONTENT = {
    title: "Trust Review",
    subtitle: "Review and resolve flagged user activity.",
    scoreLabel: "Trust Score",
    flagsLabel: "Active Flags",
    noFlags: "No active flags detected.",
    emptyTable: "No flagged users at this time.",
    reviewButton: "Review",
    resolveButton: "Resolve",
    penalizeButton: "Penalize",
    escalateButton: "Escalate",
    flagDescriptions: {
        DUPLICATE_ACTIVITY: "Multiple identical events detected in a short window.",
        ABNORMAL_CLICKS: "Unusually high click velocity detected.",
        SUSPICIOUS_DEVICE: "Repeated events from the same device fingerprint.",
        RATE_LIMITED: "User exceeded rate limits for link events.",
    },
} as const;

export const ANALYTICS_PAGE_CONTENT = {
    title: "Analytics",
    subtitle: "Your performance dashboard — engagement, points, referrals, and more.",
    kpiTitle: "Key Metrics",
    engagementTitle: "Engagement Timeline",
    performersTitle: "Top Performers",
    growthTitle: "Campaign Growth",
    overviewTitle: "Platform Overview",
} as const;

export const SETTINGS_PAGE_CONTENT = {
    title: "Settings",
    subtitle: "Manage your account and platform configuration.",
    profileSection: "Profile",
    securitySection: "Security",
    adminSection: "Administration",
} as const;

export const USERS_PAGE_CONTENT = {
    title: "User Management",
    subtitle: "Manage platform users and assign roles.",
    emptyState: "No users found.",
    roleLabel: "Role",
    statusLabel: "Status",
    actionsLabel: "Actions",
    changeRoleButton: "Change Role",
    deactivateButton: "Deactivate",
} as const;

export const HOW_IT_WORKS_STEPS = [
    {
        key: "join",
        step: "1",
        title: "Join a Campaign",
        description: "Browse active campaigns and join those that align with your calling. Your smart link is generated instantly.",
    },
    {
        key: "share",
        step: "2",
        title: "Share Your Link",
        description: "Distribute your unique trackable link across social media, email, and messaging platforms.",
    },
    {
        key: "earn",
        step: "3",
        title: "Earn Points & Rank Up",
        description: "Every click, referral, and conversion earns you points. Climb the leaderboard and unlock new rank badges.",
    },
    {
        key: "impact",
        step: "4",
        title: "Measure Your Impact",
        description: "Real-time dashboards show your engagement stats, referral network, and fundraising contributions.",
    },
] as const;

export const FAQ_ITEMS = [
    {
        key: "what-is-dmhicc",
        question: "What is DMHicc?",
        answer: "DMHicc is a digital mobilization platform that gives every participant a trackable smart link, points system, and live analytics — all within one campaign management center.",
    },
    {
        key: "who-can-join",
        question: "Who can join campaigns?",
        answer: "Any registered user can browse and join active campaigns. Team Leads and Admins have additional tools for managing campaigns and participants.",
    },
    {
        key: "how-points-work",
        question: "How do points work?",
        answer: "Points are earned across four categories: Impact (clicks & conversions), Consistency (streaks), Leadership (referrals), and Reliability (goal completion). Your total determines your rank and leaderboard position.",
    },
    {
        key: "smart-links",
        question: "What are smart links?",
        answer: "Each user–campaign pair gets a unique short URL that tracks every click, share, and referral attribution automatically.",
    },
    {
        key: "donations",
        question: "How do donations work?",
        answer: "Users can donate directly to campaigns with fundraising goals. Donations earn Leadership Points and surface on the campaign's fundraising leaderboard.",
    },
] as const;
