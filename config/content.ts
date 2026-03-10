// All static copy lives here — no literal strings in JSX

export const LANDING_CONTENT = {
    meta: {
        title: "DMHicc — Digital Mobilization Army",
        description:
            "Join Heaven's Digital Mobilizers. Smart campaign link distribution, referral tracking, rank progression, and real-time analytics.",
    },
    hero: {
        headline: "Digital Mobilization Army",
        subheadline:
            "Join Heaven's Digital Mobilizers. Every member gets a personal tracking link, every campaign has clear direction, and every leader has real-time insight.",
        cta: "Enlist Now",
        ctaSecondary: "Learn More",
    },
    features: [
        {
            key: "ammunition",
            icon: "links" as const,
            title: "Campaign Link Distribution",
            description:
                "Every member–campaign pair gets a unique trackable link. Monitor reach, clicks, and conversions in real time.",
        },
        {
            key: "gamification",
            icon: "star" as const,
            title: "Rank & Rewards",
            description:
                "Earn Impact, Consistency, Leadership, and Reliability points. Rise from Recruit to General.",
        },
        {
            key: "referrals",
            icon: "team" as const,
            title: "Referral Engine",
            description:
                "Track who referred whom. Attribute sign-ups to referrers and campaigns automatically.",
        },
        {
            key: "analytics",
            icon: "analytics" as const,
            title: "Real-Time Analytics",
            description:
                "Live dashboards for members and leaders. Engagement trends, top performers, and campaign health.",
        },
        {
            key: "proofs",
            icon: "check" as const,
            title: "Activity Verification",
            description:
                "Submit screenshot evidence after sharing your link. Verified proofs earn Reliability points and build your credibility score.",
        },
    ],
    stats: [
        { key: "ammo", label: "Links Deployed", value: "100M+" },
        { key: "missions", label: "Active Campaigns", value: "500+" },
        { key: "soldiers", label: "Digital Members", value: "10K+" },
        { key: "conversions", label: "Conversion Rate", value: "12%" },
    ],
    footer: {
        copyright: "© 2026 Harvesters International Christian Centre. DMHicc Platform.",
        tagline: "Built for Heaven's Digital Army.",
    },
    home: {
        featuredSection: {
            heading: "Featured Campaign",
            subheading: "The flagship campaign currently gaining the most traction.",
            participantsLabel: "Members:",
            subCampaignsLabel: "Sub-Missions:",
        },
        topMobilizersSection: {
            heading: "Top 5 Digital Members",
            subheading: "The highest-ranking members across all campaigns.",
        },
        featuresSection: {
            heading: "Everything You Need to Make an Impact",
            subheading: "One platform for campaign link distribution, referral tracking, rank progression, and real-time analytics.",
        },
        ctaSection: {
            heading: "Ready to Make an Impact?",
            body: "Join thousands of digital members already using DMHicc to share, grow, and lead their campaigns.",
        },
    },
} as const;

export const DEV_CREDENTIALS = [
    { label: "Super Admin", email: "super@dmhicc.org", password: "Password123!", role: "SUPER_ADMIN" },
    { label: "Admin", email: "admin@dmhicc.org", password: "Password123!", role: "ADMIN" },
    { label: "Team Lead", email: "lead@dmhicc.org", password: "Password123!", role: "TEAM_LEAD" },
    { label: "User", email: "user@dmhicc.org", password: "Password123!", role: "USER" },
] as const;

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
        devCredentialsTitle: "Quick Login (Dev Only)",
    },
    register: {
        title: "Enlist Now",
        subtitle: "Join DMHicc's Digital Mobilization Army",
        firstNameLabel: "First Name",
        firstNamePlaceholder: "Adaeze",
        lastNameLabel: "Last Name",
        lastNamePlaceholder: "Okafor",
        emailLabel: "Email Address",
        emailPlaceholder: "you@example.com",
        passwordLabel: "Password",
        passwordPlaceholder: "Min. 8 characters",
        campusLabel: "Campus",
        campusPlaceholder: "Select your campus",
        submitButton: "Create Account",
        loginPrompt: "Already have an account?",
        loginLink: "Sign in",
    },
} as const;

export const DASHBOARD_CONTENT = {
    greeting: "Welcome back, {name}!",
    subtitle: "Here's your activity overview for today.",
    sections: {
        activeCampaigns: "Active Missions",
        myLinks: "My Links",
        recentActivity: "Recent Activity",
        leaderboard: "Leaderboard",
    },
    kpi: {
        totalPoints: "Total Points",
        rank: "Rank",
        activeCampaigns: "Active Missions",
        referrals: "Referrals",
        linkClicks: "Link Clicks",
        donationsRaised: "Donations Raised",
    },
} as const;

export const CAMPAIGN_CONTENT = {
    page: {
        title: "Missions",
        description: "Browse and join active campaigns",
        emptyTitle: "No Missions Yet",
        emptyDescription: "Check back soon for new missions to join.",
        createButton: "New Mission",
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
        createTitle: "Create Mission",
        editTitle: "Edit Mission",
        titleLabel: "Mission Title",
        titlePlaceholder: "Enter a compelling mission title",
        descriptionLabel: "Description",
        descriptionPlaceholder: "Brief description of this mission",
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
        thumbnailLabel: "Thumbnail Image",
        thumbnailHint: "Upload a preview image for social sharing and campaign cards.",
        uploadLabel: "Upload Media",
        uploadHint: "Upload an image or video for this campaign.",
        contentHint: "The main body text displayed to members.",
        parentCampaignLabel: "Parent Mega Mission (optional)",
        isMegaCampaignLabel: "This is a Mega Mission",
        submitCreate: "Create Mission",
        submitEdit: "Save Changes",
    },
    mega: {
        badge: "MEGA",
        subCampaignsTitle: "Sub-Missions",
        subCampaignsEmpty: "No sub-missions yet.",
    },
    detail: {
        submitProofButton: "Submit Status View",
    },
} as const;

export const SMART_LINK_CONTENT = {
    page: {
        title: "My Links",
        description: "Your unique trackable links for each campaign",
        emptyTitle: "No Links Yet",
        emptyDescription: "Join a campaign to receive your tracking link.",
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
    brandTagline: "Recruiting Online Souls",
} as const;

export const LEADERBOARD_PAGE_CONTENT = {
    title: "Leaderboard",
    subtitle: "Top members ranked by impact, consistency, leadership, and reliability.",
    emptyState: "No members yet. Join a campaign to appear on the leaderboard.",
    myRankLabel: "Your Position",
} as const;

export const ENGAGEMENT_PAGE_CONTENT = {
    title: "My Engagement",
    subtitle: "Track your reach, activity, and impact across all missions.",
    timelineTitle: "Activity Over Time",
    statsTitle: "Overview",
} as const;

export const REFERRAL_PAGE_CONTENT = {
    title: "Referrals",
    subtitle: "Track who you've referred and how your network is growing.",
    linkPanelTitle: "Your Invite Link",
    linkPanelDescription: "Share this link with anyone to invite them to join DMHicc. When they sign up, you earn referral points!",
    statsTitle: "Referral Stats",
    howItWorksTitle: "How Referrals Work",
    howItWorksSteps: [
        { title: "Share your link", description: "Copy your personal invite link and share it with friends." },
        { title: "They sign up", description: "When someone registers using your link, they're attributed to you." },
        { title: "Earn points", description: "You receive referral points for each successful signup and ongoing cascade points." },
    ],
    emptyState: "You haven't referred anyone yet. Share your invite link to get started!",
    pointsInsightsTitle: "Your Referral Earnings",
    pointsInsightsDescription: "You earn Leadership Points for every signup through your referral link, plus a 10% cascade bonus on all points your referrals earn.",
    pointsEarnedLabel: "Total Leadership Points from your referral network",
} as const;

export const POINTS_PAGE_CONTENT = {
    title: "Points & Rank",
    subtitle: "Your score breakdown and progress toward the next rank.",
    summaryTitle: "Points Summary",
    rankTitle: "Your Rank",
    ledgerTitle: "Points History",
} as const;

export const DONATION_PAGE_CONTENT = {
    title: "Donations",
    subtitle: "Support missions and track your giving history.",
    formTitle: "Make a Donation",
    amountLabel: "Amount",
    campaignLabel: "Mission",
    messageLabel: "Message (optional)",
    messagePlaceholder: "Leave an encouraging message...",
    submitButton: "Donate Now",
    historyTitle: "My Donations",
    progressTitle: "Fundraising Progress",
    topDonorsTitle: "Top Donors",
    emptyHistory: "You haven't donated yet. Support a mission today!",
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
    subtitle: "Your dashboard — engagement, points, referrals, and more.",
    kpiTitle: "Key Metrics",
    engagementTitle: "Engagement Timeline",
    performersTitle: "Top Members",
    growthTitle: "Campaign Growth",
    overviewTitle: "Platform Overview",
    campaignAnalyticsTitle: "Campaign Analytics",
    campaignAnalyticsPlaceholder: "Select a campaign above to view detailed analytics.",
    campaignAnalyticsEngagementLabel: "Engagement Trend",
    campaignAnalyticsTopSoldiersLabel: "Top Members — This Campaign",
    userStatsTitle: "User Stats & Contributions",
    userStatsSubtitle: "View any member's engagement, referrals, donation history, and activity.",
    userStatsSearchPlaceholder: "Search by name or email",
} as const;

export const SETTINGS_PAGE_CONTENT = {
    title: "Settings",
    subtitle: "Manage your account and platform configuration.",
    profileSection: "Profile",
    securitySection: "Security",
    adminSection: "Administration",
    weaponsOfChoiceSection: "My Platforms",
    weaponsOfChoiceDescription: "Select the social media platforms you share on.",
} as const;

export const SOCIAL_PLATFORMS_CONFIG = [
    { key: "FACEBOOK", label: "Facebook", icon: "facebook" as const, color: "#1877F2" },
    { key: "INSTAGRAM", label: "Instagram", icon: "instagram" as const, color: "#E4405F" },
    // { key: "TWITTER_X", label: "Twitter / X", icon: "twitterX" as const, color: "#1DA1F2" },
    { key: "TIKTOK", label: "TikTok", icon: "tiktok" as const, color: "#000000" },
    { key: "TELEGRAM", label: "Telegram", icon: "telegram" as const, color: "#0088CC" },
    // { key: "YOUTUBE", label: "YouTube", icon: "youtube" as const, color: "#FF0000" },
    { key: "WHATSAPP", label: "WhatsApp", icon: "whatsapp" as const, color: "#25D366" },
    { key: "SNAPCHAT", label: "Snapchat", icon: "snapchat" as const, color: "#FFFC00" },
] as const;

export const TEAM_PAGE_CONTENT = {
    title: "My Team",
    subtitle: "View and manage your team's participation and performance.",
    membersTitle: "Team Members",
    performanceTitle: "Team Performance",
    emptyState: "No team members found.",
    noTeamMessage: "You are not currently part of a team.",
    noTeamPrompt: "Ask your admin to add you to one.",
    inviteLinkDescription: "Generate a shareable invite link for new team members (up to 10 uses).",
    roleFilter: "Filter by rank",
} as const;

export const NOT_FOUND_CONTENT = {
    code: "404",
    title: "Page Not Found",
    subtitle: "The page you're looking for doesn't exist or has been moved.",
    backButton: "Go Back",
    homeButton: "Back to Dashboard",
} as const;

export const VIEW_PROOF_CONTENT = {
    title: "Status Views",
    subtitle: "Upload screenshots showing you've shared your campaign link on each platform.",
    uploadButton: "Submit Status View",
    modalTitle: "Upload Status View",
    platformLabel: "Platform Shared On",
    screenshotLabel: "Screenshot",
    screenshotPlaceholder: "Upload a screenshot",
    submitButton: "Submit Status View",
    status: {
        PENDING: "Under Review",
        APPROVED: "Verified",
        REJECTED: "Rejected",
    },
    emptyState: "No status views submitted yet.",
    submitFromDetailButton: "Submit Status View",
    reviewTitle: "Review Status Views",
    approveButton: "Approve",
    rejectButton: "Reject",
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

export const DASHBOARD_FOOTER_CONTENT = {
    brand: {
        name: "DMHicc",
        tagline: "Digital Mobilization Army — Recruiting Online Souls",
    },
    developer: {
        label: "Built by",
        name: "S.D.",
        url: "https://sotonye-dagogo.is-a.dev",
    },
    platform: {
        name: "DMHicc",
        version: "1.0.0-mvp",
        tagline: "Digital Mobilization Army — Recruiting Online Souls",
    },
    columns: [
        {
            key: "platform",
            heading: "Platform",
            links: [
                { key: "campaigns", label: "Campaigns", href: "/campaigns" },
                { key: "leaderboard", label: "Leaderboard", href: "/leaderboard" },
                { key: "analytics", label: "Analytics", href: "/analytics" },
                { key: "donations", label: "Donations", href: "/donations" },
            ],
        },
        {
            key: "account",
            heading: "Account",
            links: [
                { key: "settings", label: "Settings", href: "/settings" },
                { key: "referrals", label: "Referrals", href: "/referrals" },
                { key: "report-bug", label: "Report a Bug", href: "/report-bug" },
            ],
        },
        {
            key: "company",
            heading: "Company",
            links: [
                { key: "about", label: "About", href: "/about" },
                { key: "contact", label: "Contact", href: "/contact" },
                { key: "privacy", label: "Privacy Policy", href: "/privacy" },
                { key: "terms", label: "Terms", href: "/terms" },
            ],
        },
    ],
    quickLinks: [
        { key: "lobby", label: "Lobby", href: "/" },
        { key: "campaigns", label: "Campaigns", href: "/campaigns" },
        { key: "leaderboard", label: "Leaderboard", href: "/leaderboard" },
        { key: "analytics", label: "Analytics", href: "/analytics" },
        { key: "donations", label: "Donations", href: "/donations" },
        { key: "settings", label: "Settings", href: "/settings" },
        { key: "about", label: "About", href: "/about" },
        { key: "privacy", label: "Privacy", href: "/privacy" },
        { key: "terms", label: "Terms", href: "/terms" },
        { key: "report-bug", label: "Report Bug", href: "/report-bug" },
    ],
    legal: {
        copyright: { entity: "Harvesters International Christian Centre. DMHicc Platform." },
        rights: "All rights reserved.",
        entity: "DMHicc",
    },
} as const;

export const PUBLIC_FOOTER_CONTENT = {
    brand: {
        name: "DMHicc",
        tagline: "Digital Mobilization Army — Recruiting Online Souls",
    },
    columns: [
        {
            key: "company",
            heading: "Company",
            links: [
                { key: "about", label: "About", href: "/about" },
                { key: "contact", label: "Contact", href: "/contact" },
                { key: "report-bug", label: "Report Bug", href: "/report-bug" },
            ],
        },
        {
            key: "legal",
            heading: "Legal",
            links: [
                { key: "privacy", label: "Privacy Policy", href: "/privacy" },
                { key: "terms", label: "Terms of Service", href: "/terms" },
            ],
        },
        {
            key: "platform",
            heading: "Platform",
            links: [
                { key: "login", label: "Sign In", href: "/login" },
                { key: "register", label: "Get Started", href: "/register" },
            ],
        },
    ],
    legal: {
        copyright: { entity: "Harvesters International Christian Centre. DMHicc Platform." },
        rights: "All rights reserved.",
    },
    developer: {
        label: "Built by",
        name: "S.D.",
        url: "https://sotonye-dagogo.is-a.dev",
    },
} as const;

export const COOKIE_CONSENT_CONTENT = {
    title: "We use cookies",
    body: "DMHicc uses only essential cookies required for the platform to function — authentication sessions, security tokens, and preference storage. We do not use tracking, advertising, or third-party analytics cookies.",
    learnMoreLabel: "Learn more",
    learnMoreHref: "/privacy#cookies",
    acceptLabel: "Got it",
    storageKey: "dmhicc_cookie_consent",
    storageValue: "accepted",
} as const;

export const ABOUT_PAGE_CONTENT = {
    meta: {
        title: "About DMHicc",
        description: "The story and mission behind the DMHicc platform.",
    },
    hero: {
        eyebrow: "Our Mission",
        headline: "Mobilizing the Church for Digital Impact",
        subheadline:
            "DMHicc — Digital Mobilization & Harvest Impact Campaign Center — is the operational backbone for structured digital outreach at Harvesters International Christian Centre.",
    },
    sections: [
        {
            key: "what-we-do",
            heading: "What We Do",
            body: "DMHicc gives every mobilizer a unique smart link, every campaign a full lifecycle, and every leader a live dashboard. From tracking link clicks to attributing referrals and calculating gamified impact scores, the platform turns organic sharing into measurable, managed outreach.",
        },
        {
            key: "why-it-matters",
            heading: "Why It Matters",
            body: "Large organisations run dozens of simultaneous campaigns across multiple platforms. Without structure, effort is invisible. DMHicc makes every share traceable, every referral attributable, and every participant's contribution visible — creating accountability and motivation at scale.",
        },
        {
            key: "built-for",
            heading: "Built For",
            body: "The platform is purpose-built for Harvesters ICC's mobilization teams — team leads, digital champions, and administrators — but is architected to be extensible for any structured campaign organisation.",
        },
    ],
    stats: [
        { key: "launched", label: "Platform Launched", value: "2026" },
        { key: "phases", label: "Build Phases", value: "15" },
        { key: "modules", label: "Core Modules", value: "10+" },
    ],
    teamSection: {
        heading: "Built With Purpose",
        body: "DMHicc is designed and developed as an internal platform aligned with Harvesters ICC's digital strategy. Every feature decision is made with the mobilizer — not an abstract user — in mind.",
    },
} as const;

export const CONTACT_PAGE_CONTENT = {
    meta: {
        title: "Contact — DMHicc",
        description: "Get in touch with the DMHicc platform team.",
    },
    hero: {
        eyebrow: "Get In Touch",
        headline: "We're Here to Help",
        subheadline:
            "Have a question about the platform, your account, or a campaign? Reach out using the channels below.",
    },
    channels: [
        {
            key: "email",
            icon: "mail" as const,
            label: "Email Support",
            value: "churchministry@harvestersng.org",
            description: "For account issues, access requests, and general enquiries.",
            action: { label: "Send Email", href: "mailto:churchministry@harvestersng.org" },
        },
        {
            key: "admin",
            icon: "settings" as const,
            label: "Platform Administration",
            value: "sdagogo@harvestersng.org",
            description: "For campaign creation, role management, and admin matters.",
            action: { label: "Contact Admin", href: "mailto:sdagogo@harvestersng.org" },
        },
        {
            key: "church",
            icon: "team" as const,
            label: "Harvesters ICC",
            value: "churchministry@harvestersng.org",
            description: "For church-related enquiries and partnership matters.",
            action: { label: "Visit Website", href: "https://harvestersng.org" },
        },
    ],
    note: {
        heading: "Response Time",
        body: "We aim to respond to all platform-related requests within 1–2 business days. For urgent account access issues, please include your registered email and role in your message.",
    },
} as const;

export const PRIVACY_PAGE_CONTENT = {
    meta: {
        title: "Privacy Policy — DMHicc",
        description: "How DMHicc collects, uses, and protects your information.",
    },
    hero: {
        eyebrow: "Legal",
        headline: "Privacy Policy",
        effectiveDate: "Effective: January 1, 2026",
    },
    intro:
        "This Privacy Policy explains how DMHicc (\"Platform\", \"we\", \"us\") collects, uses, and safeguards information in connection with your use of the DMHicc platform operated by Harvesters International Christian Centre.",
    sections: [
        {
            key: "information-we-collect",
            heading: "Information We Collect",
            paragraphs: [
                "We collect information you provide directly: your name, email address, and password when you register for an account.",
                "We automatically collect usage data: campaign participation events, smart link clicks, referral attributions, points earned, and leaderboard positions.",
                "We collect device and session data: browser type, device identifiers, and authentication session tokens.",
            ],
        },
        {
            key: "how-we-use",
            heading: "How We Use Your Information",
            paragraphs: [
                "To operate and secure your account and authenticate your identity across sessions.",
                "To track campaign participation, calculate points, attribute referrals, and generate engagement analytics.",
                "To display your name and rank on leaderboards visible to other platform participants.",
                "To send platform-related communications such as account changes or security alerts.",
            ],
        },
        {
            key: "data-sharing",
            heading: "Data Sharing",
            paragraphs: [
                "We do not sell your personal data to third parties.",
                "Your performance data (rank, points, participation) is visible to other authenticated platform users as part of the leaderboard and team features.",
                "Administrative staff with ADMIN or SUPER_ADMIN roles can view all user accounts, campaign participation, and trust scores for platform management purposes.",
            ],
        },
        {
            key: "data-retention",
            heading: "Data Retention",
            paragraphs: [
                "Account data is retained for as long as your account is active. Upon account deactivation, personal identifiers are pseudonymised and activity records are retained for platform integrity purposes.",
            ],
        },
        {
            key: "your-rights",
            heading: "Your Rights",
            paragraphs: [
                "You have the right to access, correct, or request deletion of your personal data. To exercise these rights, contact us at churchministry@harvestersng.org.",
                "You may request a copy of the data we hold about you at any time.",
            ],
        },
        {
            key: "cookies",
            heading: "Cookies & Local Storage",
            anchor: "cookies",
            paragraphs: [
                "DMHicc uses only essential cookies and local storage. These are strictly necessary for the platform to function — they cannot be disabled without breaking core functionality.",
                "We do not use advertising cookies, cross-site tracking cookies, or third-party analytics cookies.",
                "We set two session-management cookies stored as secure, httpOnly HTTP cookies that are inaccessible to JavaScript: a short-lived access token used to authenticate API requests, and a longer-lived refresh token used to renew your session without requiring you to log in again. We also store a single browser preference flag in localStorage to record that you have acknowledged this cookie notice.",
            ],
        },
        {
            key: "security",
            heading: "Security",
            paragraphs: [
                "Passwords are hashed using bcrypt. Authentication tokens are stored in httpOnly cookies inaccessible to JavaScript. We apply rate limiting and trust scoring to detect and mitigate abusive activity.",
            ],
        },
        {
            key: "contact",
            heading: "Contact",
            paragraphs: [
                "For privacy-related enquiries, contact us at churchministry@harvestersng.org or write to: Harvesters International Christian Centre, Lagos, Nigeria.",
            ],
        },
    ],
} as const;

export const TERMS_PAGE_CONTENT = {
    meta: {
        title: "Terms of Service — DMHicc",
        description: "The terms and conditions governing your use of the DMHicc platform.",
    },
    hero: {
        eyebrow: "Legal",
        headline: "Terms of Service",
        effectiveDate: "Effective: January 1, 2026",
    },
    intro:
        "These Terms of Service (\"Terms\") govern your access to and use of the DMHicc platform operated by Harvesters International Christian Centre (\"Organisation\", \"we\", \"us\"). By accessing or using DMHicc, you agree to these Terms.",
    sections: [
        {
            key: "eligibility",
            heading: "Eligibility",
            paragraphs: [
                "DMHicc is an internal platform for authorised members of Harvesters International Christian Centre and its affiliated digital mobilization teams. Access is by invitation or approval only.",
                "You must be at least 16 years of age to use the platform.",
            ],
        },
        {
            key: "account",
            heading: "Your Account",
            paragraphs: [
                "You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.",
                "You must provide accurate information when registering. Impersonation or providing false information may result in immediate account suspension.",
                "You must notify us promptly at churchministry@harvestersng.org if you suspect unauthorised use of your account.",
            ],
        },
        {
            key: "acceptable-use",
            heading: "Acceptable Use",
            paragraphs: [
                "You agree not to use DMHicc to: distribute spam or malicious content via smart links; exploit the gamification system through artificial or automated activity; attempt to reverse-engineer, scrape, or compromise the platform's security; or engage in any activity that fraudulently inflates points, referrals, or donation figures.",
                "Violations detected by the platform's trust scoring system may result in account suspension or permanent ban.",
            ],
        },
        {
            key: "campaigns",
            heading: "Campaign Participation",
            paragraphs: [
                "Campaigns are created and managed by authorised administrators. By participating in a campaign, you consent to your activity data (clicks, referrals, participation events) being tracked, attributed, and displayed on platform leaderboards.",
                "Campaign goals, timelines, and rewards are set by administrators and are subject to change.",
            ],
        },
        {
            key: "points-and-rewards",
            heading: "Points & Rewards",
            paragraphs: [
                "Points are awarded according to the platform's gamification rules and are non-transferable, have no monetary value, and cannot be redeemed outside the platform.",
                "The Organisation reserves the right to adjust, reset, or revoke points in cases of detected fraud or system error.",
            ],
        },
        {
            key: "donations",
            heading: "Donations",
            paragraphs: [
                "Any donations facilitated through the platform are transmitted to the Organisation's designated accounts. DMHicc does not store full payment credentials.",
                "All donations are final unless an administrative error can be demonstrated. Contact admin@dmhicc.org for donation-related queries.",
            ],
        },
        {
            key: "intellectual-property",
            heading: "Intellectual Property",
            paragraphs: [
                "All platform code, design, and content are the property of Harvesters International Christian Centre. You may not reproduce, redistribute, or create derivative works without express written permission.",
            ],
        },
        {
            key: "termination",
            heading: "Termination",
            paragraphs: [
                "We reserve the right to suspend or terminate your account at any time for violations of these Terms or for conduct deemed harmful to the platform community.",
                "You may request account deletion by contacting churchministry@harvestersng.org.",
            ],
        },
        {
            key: "liability",
            heading: "Limitation of Liability",
            paragraphs: [
                "The platform is provided \"as is\" for internal operational purposes. The Organisation makes no warranties regarding uptime, data availability, or fitness for any particular purpose beyond campaign management.",
                "To the extent permitted by law, the Organisation's liability for any claim arising from your use of DMHicc is limited to the amount you paid to access the platform (which is nil, as it is a free internal tool).",
            ],
        },
        {
            key: "changes",
            heading: "Changes to These Terms",
            paragraphs: [
                "We may update these Terms from time to time. Continued use of the platform after changes are posted constitutes acceptance of the revised Terms.",
            ],
        },
        {
            key: "contact",
            heading: "Contact",
            paragraphs: [
                "Questions about these Terms? Contact us at churchministry@harvestersng.org or write to: Harvesters International Christian Centre, Lagos, Nigeria.",
            ],
        },
    ],
} as const;

export const HOW_IT_WORKS_STEPS = [
    {
        key: "enlist",
        step: "1",
        title: "Join a Campaign",
        description: "Browse active campaigns and join those that align with your calling. Your personal tracking link is issued instantly.",
    },
    {
        key: "deploy",
        step: "2",
        title: "Share with Purpose",
        description: "Download content, share your unique tracking link across your social media, and post your screenshots from the 24th hour.",
    },
    {
        key: "earn",
        step: "3",
        title: "Earn Points & Rank Up",
        description: "Every click, referral, and conversion earns you points. Rise through the ranks from Recruit to General.",
    },
    {
        key: "proof",
        step: "4",
        title: "Submit Status View",
        description: "After sharing, upload a screenshot as evidence. Approved status views earn Reliability points and verify your activity to team leads.",
    },
    {
        key: "impact",
        step: "5",
        title: "Track Your Impact",
        description: "Real-time dashboards show your engagement stats, referral network, proof history, and fundraising contributions.",
    },
    {
        key: "contribute",
        step: "6",
        title: "Make Your Contribution",
        description: "Support missions financially by selecting a bank account, transferring your donation, and noting the reference number. Multiple currencies are supported across dedicated accounts.",
    },
    {
        key: "submit-proof",
        step: "7",
        title: "Submit Your Proof",
        description: "Upload a screenshot or receipt of your bank transfer as proof of payment. Your donation status moves to Received immediately and goes into the verification queue for Commanders to approve.",
    },
] as const;

/** Proof pipeline stages — rendered on How It Works page */
export const PROOF_PIPELINE_STAGES = [
    {
        key: "submit",
        step: "1",
        label: "Submit",
        description: "Upload a screenshot of your shared campaign link on any platform.",
        status: "PENDING" as const,
        statusLabel: "Queued for Review",
        color: "#F59E0B",
    },
    {
        key: "review",
        step: "2",
        label: "Review",
        description: "A Team Lead or Admin reviews the proof against the campaign requirements.",
        status: "REVIEW" as const,
        statusLabel: "Under Review",
        color: "#3B82F6",
    },
    {
        key: "approved",
        step: "3a",
        label: "Approved",
        description: "Proof accepted — Reliability points are instantly credited to your rank score.",
        status: "APPROVED" as const,
        statusLabel: "Points Credited",
        color: "#10B981",
    },
    {
        key: "rejected",
        step: "3b",
        label: "Rejected",
        description: "Proof did not meet requirements. Review any notes from your reviewer and resubmit.",
        status: "REJECTED" as const,
        statusLabel: "Resubmit",
        color: "#EF4444",
    },
] as const;

export const FAQ_ITEMS = [
    {
        key: "what-is-dmhicc",
        question: "What is DMHicc?",
        answer: "DMHicc is the Digital Mobilization Army — a platform that gives every member a personal tracking link, a rank progression system, and live analytics — all in one place.",
    },
    {
        key: "who-can-join",
        question: "Who can join campaigns?",
        answer: "Any registered member can browse and join active campaigns. Team Leads and Admins have additional tools for managing campaigns and members.",
    },
    {
        key: "how-points-work",
        question: "How do military ranks work?",
        answer: "Points are earned across four categories: Impact (clicks & conversions), Consistency (streaks), Leadership (referrals), and Reliability (campaign completion). Your total determines your rank — from Recruit all the way to General.",
    },
    {
        key: "ammunition",
        question: "What is a tracking link?",
        answer: "Each member–campaign combination generates a unique short URL that tracks every click, share, and referral attribution automatically.",
    },
    {
        key: "donations",
        question: "How do donations work?",
        answer: "Members can donate directly to campaigns with fundraising goals. Donations earn Leadership Points and surface on the campaign's fundraising leaderboard.",
    },
    {
        key: "what-is-proof",
        question: "What is a Status View?",
        answer: "A Status View is a screenshot you upload showing that you've shared your campaign link on a social media platform, messaging app, or email. It's your evidence of real-world sharing.",
    },
    {
        key: "proof-pipeline",
        question: "How does the status view review pipeline work?",
        answer: "After you submit a status view, it enters a PENDING queue. A Team Lead or Admin reviews it against the campaign requirements. If approved, Reliability Points are instantly credited to your rank. If rejected, you receive reviewer notes and can resubmit an improved status view.",
    },
    {
        key: "proof-points",
        question: "What points do I earn from status views?",
        answer: "Approved status views earn Reliability Points — one of the four point categories that make up your rank score. The more consistently you submit verified status views, the faster you advance through the ranks.",
    },
    {
        key: "donation-flow",
        question: "How do I make a donation?",
        answer: "Navigate to the Donations page, select a campaign, choose a currency and bank account, transfer the specified amount, and then upload a screenshot of your transfer receipt as proof of payment. Your donation will be queued for admin verification.",
    },
    {
        key: "proof-requirements",
        question: "What are the proof requirements for donations?",
        answer: "Upload a clear screenshot showing the bank transfer confirmation — including the amount, date, and reference number. Blurry or cropped images may be rejected. Admins review proofs within 24–48 hours.",
    },
    {
        key: "verification-timeline",
        question: "How long does donation verification take?",
        answer: "Most donations are verified within 24–48 hours. Once an Admin approves your proof, the donation status changes to Verified and you receive Leadership Points for your contribution.",
    },
    {
        key: "supported-currencies",
        question: "What currencies are supported?",
        answer: "We currently support NGN (Nigerian Naira), USD (US Dollar), and GBP (British Pound). Each currency has dedicated bank accounts. Select your preferred currency when making a donation to see available accounts.",
    },
    {
        key: "team-invite-links",
        question: "How do team invite links work?",
        answer: "Team Leads and Admins can generate invite links with a set number of uses and an optional expiry date. Share the link with your contacts — when they click it, they join your team automatically. You can track usage from the Teams page.",
    },
] as const;

// ─── Bug Report Page ─────────────────────────────────────────────────────────

export const BUG_REPORT_CONTENT = {
    meta: {
        title: "Report a Bug",
        description: "Help us improve DMHicc by reporting issues you encounter.",
    },
    hero: {
        eyebrow: "Help Us Improve",
        headline: "Report a Bug",
        subheadline: "Found something that doesn't work as expected? Let us know and we'll fix it.",
    },
    form: {
        categoryLabel: "Category",
        categoryPlaceholder: "Select a category",
        descriptionLabel: "Description",
        descriptionPlaceholder: "Describe the issue you encountered in as much detail as possible — what you were doing, what you expected, and what happened instead.",
        emailLabel: "Email Address",
        emailPlaceholder: "your@email.com",
        emailHint: "So we can follow up if we need more details.",
        screenshotLabel: "Screenshot",
        screenshotHint: "Optional — upload a screenshot showing the issue.",
        submitLabel: "Submit Report",
        submittingLabel: "Submitting…",
    },
    success: {
        title: "Report Submitted",
        message: "Thank you for helping us improve DMHicc. Our team will review your report and address it as soon as possible.",
        backLabel: "Back to Home",
    },
} as const;

export const BUG_REPORT_CATEGORIES = [
    { key: "UI_ISSUE", label: "UI / Visual Issue", description: "Layout broken, elements misaligned, styling problems" },
    { key: "DATA_ISSUE", label: "Data Issue", description: "Incorrect numbers, missing data, stale information" },
    { key: "PERFORMANCE", label: "Performance", description: "Slow loading, timeouts, unresponsive pages" },
    { key: "FEATURE_REQUEST", label: "Feature Request", description: "Something you'd like us to add or improve" },
    { key: "ACCESS_AUTH", label: "Access / Authentication", description: "Login issues, permissions errors, locked out" },
    { key: "OTHER", label: "Other", description: "Anything else not covered above" },
] as const;

export const BUG_REPORT_STATUSES = [
    { key: "OPEN", label: "Open", color: "#3B82F6" },
    { key: "IN_PROGRESS", label: "In Progress", color: "#F59E0B" },
    { key: "RESOLVED", label: "Resolved", color: "#10B981" },
    { key: "CLOSED", label: "Closed", color: "#6B7280" },
] as const;
