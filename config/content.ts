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

export const TEAM_PAGE_CONTENT = {
    title: "Team",
    subtitle: "View and manage your team's participation and performance.",
    membersTitle: "Team Members",
    performanceTitle: "Team Performance",
    emptyState: "No team members found.",
    roleFilter: "Filter by role",
} as const;

export const NOT_FOUND_CONTENT = {
    code: "404",
    title: "Page Not Found",
    subtitle: "The page you're looking for doesn't exist or has been moved.",
    backButton: "Go Back",
    homeButton: "Back to Dashboard",
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
    developer: {
        label: "Built by",
        name: "S.D.",
        url: "https://sotonye-dagogo.is-a.dev",
    },
    platform: {
        name: "DMHicc",
        version: "1.0.0-mvp",
        tagline: "Digital Mobilization & Harvest Impact Campaign Center",
    },
    quickLinks: [
        { key: "lobby", label: "Lobby", href: "/" },
        { key: "campaigns", label: "Campaigns", href: "/campaigns" },
        { key: "leaderboard", label: "Leaderboard", href: "/leaderboard" },
        { key: "analytics", label: "Analytics", href: "/analytics" },
        { key: "donations", label: "Donations", href: "/donations" },
        { key: "settings", label: "Settings", href: "/settings" },
    ],
    legal: "© 2026 DMHicc",
} as const;

export const PUBLIC_FOOTER_CONTENT = {
    brand: {
        name: "DMHicc",
        tagline: "Digital Mobilization & Harvest Impact Campaign Center",
    },
    columns: [
        {
            key: "company",
            heading: "Company",
            links: [
                { key: "about", label: "About", href: "/about" },
                { key: "contact", label: "Contact", href: "/contact" },
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
        copyright: "© 2026 Harvesters International Christian Centre. DMHicc Platform.",
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
            value: "support@dmhicc.org",
            description: "For account issues, access requests, and general enquiries.",
            action: { label: "Send Email", href: "mailto:support@dmhicc.org" },
        },
        {
            key: "admin",
            icon: "settings" as const,
            label: "Platform Administration",
            value: "admin@dmhicc.org",
            description: "For campaign creation, role management, and admin matters.",
            action: { label: "Contact Admin", href: "mailto:admin@dmhicc.org" },
        },
        {
            key: "church",
            icon: "team" as const,
            label: "Harvesters ICC",
            value: "info@harvesters.org.ng",
            description: "For church-related enquiries and partnership matters.",
            action: { label: "Visit Website", href: "https://harvesters.org.ng" },
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
                "You have the right to access, correct, or request deletion of your personal data. To exercise these rights, contact us at support@dmhicc.org.",
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
            ],
            cookieTable: [
                {
                    key: "access-token",
                    name: "dmhicc_access",
                    purpose: "Stores your JWT access token to authenticate API requests",
                    type: "httpOnly cookie",
                    duration: "15 minutes",
                },
                {
                    key: "refresh-token",
                    name: "dmhicc_refresh",
                    purpose: "Stores your JWT refresh token to renew your session without re-login",
                    type: "httpOnly cookie",
                    duration: "7 days",
                },
                {
                    key: "cookie-consent",
                    name: "dmhicc_cookie_consent",
                    purpose: "Remembers that you have dismissed the cookie notice",
                    type: "localStorage",
                    duration: "Persistent",
                },
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
                "For privacy-related enquiries, contact us at support@dmhicc.org or write to: Harvesters International Christian Centre, Lagos, Nigeria.",
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
                "You must notify us promptly at support@dmhicc.org if you suspect unauthorised use of your account.",
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
                "You may request account deletion by contacting support@dmhicc.org.",
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
                "Questions about these Terms? Contact us at support@dmhicc.org or write to: Harvesters International Christian Centre, Lagos, Nigeria.",
            ],
        },
    ],
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
