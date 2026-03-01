import { SOCIAL_PLATFORMS_CONFIG } from "@/config/content";

const ROLE = {
    USER: "USER",
    TEAM_LEAD: "TEAM_LEAD",
    ADMIN: "ADMIN",
    SUPER_ADMIN: "SUPER_ADMIN",
} as const;

type RoleValue = (typeof ROLE)[keyof typeof ROLE];

// ─── Status display config ───────────────────────────────────────────────────

export const PROOF_STATUS_CONFIG: Record<
    string,
    { label: string; color: string; bgToken: string }
> = {
    PENDING: { label: "Pending Review", color: "#F59E0B", bgToken: "bg-amber-500/10" },
    APPROVED: { label: "Approved", color: "#10B981", bgToken: "bg-emerald-500/10" },
    REJECTED: { label: "Rejected", color: "#EF4444", bgToken: "bg-red-500/10" },
};

// ─── Platform options (derived from global content config) ───────────────────

export const PROOF_PLATFORM_OPTIONS = SOCIAL_PLATFORMS_CONFIG.map((p) => ({
    value: p.key,
    label: p.label,
    color: p.color,
}));

// ─── Page sections (role-gated) ───────────────────────────────────────────────

export const PROOFS_PAGE_SECTIONS: (PageSection & { allowedRoles: RoleValue[] })[] = [
    {
        key: "my-proofs",
        label: "My Proofs",
        allowedRoles: [ROLE.USER, ROLE.TEAM_LEAD, ROLE.ADMIN, ROLE.SUPER_ADMIN],
    },
    {
        key: "team-proofs",
        label: "Team / Campaign Proofs",
        allowedRoles: [ROLE.TEAM_LEAD, ROLE.ADMIN, ROLE.SUPER_ADMIN],
    },
];

export const PROOFS_PAGE_CONTENT = {
    title: "Proof of Deployment",
    subtitle: "Submit screenshots proving your ammunition was deployed. Earn Reliability points on approval.",
    myProofsTitle: "My Deployment Proofs",
    myProofsEmpty: "You haven't submitted any proofs yet.",
    teamProofsTitle: "Team & Campaign Proofs",
    teamProofsEmpty: "No proofs found for this campaign.",
    submitBtn: "Submit Proof",
    submitModalTitle: "Submit Deployment Proof",
    submitSuccess: "Proof submitted successfully! It will be reviewed shortly.",
    approveBtn: "Approve",
    rejectBtn: "Reject",
    reviewNotesPlaceholder: "Optional notes for the soldier...",
    campaignFilterLabel: "Filter by Campaign",
    allCampaigns: "All Campaigns",
} as const;
