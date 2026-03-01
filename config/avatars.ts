// ─── Avatar Config ────────────────────────────────────────────────────────────
// 16 curated avatars using DiceBear Adventurer Neutral API (SVG, deterministic).
// Phase 14: swap to Cloudinary-hosted assets if needed.

export interface AvatarOption {
    id: string;
    label: string;
    url: string;
    category: "warrior" | "strategist" | "creator" | "leader";
}

const DICEBEAR_BASE = "https://api.dicebear.com/9.x/adventurer-neutral/svg";

export const CURATED_AVATARS: AvatarOption[] = [
    // Warriors
    { id: "av-01", label: "Storm Trooper", url: `${DICEBEAR_BASE}?seed=storm-trooper`, category: "warrior" },
    { id: "av-02", label: "Blaze Runner", url: `${DICEBEAR_BASE}?seed=blaze-runner`, category: "warrior" },
    { id: "av-03", label: "Iron Guard", url: `${DICEBEAR_BASE}?seed=iron-guard`, category: "warrior" },
    { id: "av-04", label: "Shadow Striker", url: `${DICEBEAR_BASE}?seed=shadow-striker`, category: "warrior" },

    // Strategists
    { id: "av-05", label: "Mind Weaver", url: `${DICEBEAR_BASE}?seed=mind-weaver`, category: "strategist" },
    { id: "av-06", label: "Code Breaker", url: `${DICEBEAR_BASE}?seed=code-breaker`, category: "strategist" },
    { id: "av-07", label: "Signal Master", url: `${DICEBEAR_BASE}?seed=signal-master`, category: "strategist" },
    { id: "av-08", label: "Data Oracle", url: `${DICEBEAR_BASE}?seed=data-oracle`, category: "strategist" },

    // Creators
    { id: "av-09", label: "Pixel Mage", url: `${DICEBEAR_BASE}?seed=pixel-mage`, category: "creator" },
    { id: "av-10", label: "Echo Artist", url: `${DICEBEAR_BASE}?seed=echo-artist`, category: "creator" },
    { id: "av-11", label: "Spark Crafter", url: `${DICEBEAR_BASE}?seed=spark-crafter`, category: "creator" },
    { id: "av-12", label: "Wave Designer", url: `${DICEBEAR_BASE}?seed=wave-designer`, category: "creator" },

    // Leaders
    { id: "av-13", label: "Crown Bearer", url: `${DICEBEAR_BASE}?seed=crown-bearer`, category: "leader" },
    { id: "av-14", label: "Shield Captain", url: `${DICEBEAR_BASE}?seed=shield-captain`, category: "leader" },
    { id: "av-15", label: "Rally Chief", url: `${DICEBEAR_BASE}?seed=rally-chief`, category: "leader" },
    { id: "av-16", label: "Flame Vanguard", url: `${DICEBEAR_BASE}?seed=flame-vanguard`, category: "leader" },
];

export const AVATAR_CATEGORIES = [
    { key: "warrior", label: "Warriors" },
    { key: "strategist", label: "Strategists" },
    { key: "creator", label: "Creators" },
    { key: "leader", label: "Leaders" },
] as const;

/** Build a custom DiceBear avatar URL from a seed string */
export function buildCustomAvatarUrl(seed: string): string {
    return `${DICEBEAR_BASE}?seed=${encodeURIComponent(seed)}`;
}
