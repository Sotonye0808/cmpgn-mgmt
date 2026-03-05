// ─── Avatar Config ────────────────────────────────────────────────────────────
// 40 curated avatars across 4 categories using DiceBear Adventurer Neutral.
// Custom builder supports 6 distinct DiceBear style collections.
// Phase 14: swap to Cloudinary-hosted assets if needed.

export interface AvatarOption {
    id: string;
    label: string;
    url: string;
    category: "warrior" | "strategist" | "creator" | "leader";
}

export interface AvatarStyle {
    key: string;
    label: string;
    description: string;
}

const DICEBEAR_V9 = "https://api.dicebear.com/9.x";
const BASE = `${DICEBEAR_V9}/adventurer-neutral/svg`;

export const CURATED_AVATARS: AvatarOption[] = [
    // ── Warriors ──────────────────────────────────────────────────────────────
    { id: "av-01", label: "Storm Trooper",  url: `${BASE}?seed=storm-trooper`,  category: "warrior" },
    { id: "av-02", label: "Blaze Runner",   url: `${BASE}?seed=blaze-runner`,   category: "warrior" },
    { id: "av-03", label: "Iron Guard",     url: `${BASE}?seed=iron-guard`,     category: "warrior" },
    { id: "av-04", label: "Shadow Striker", url: `${BASE}?seed=shadow-striker`, category: "warrior" },
    { id: "av-05", label: "Night Hawk",     url: `${BASE}?seed=night-hawk`,     category: "warrior" },
    { id: "av-06", label: "Thunder Fist",   url: `${BASE}?seed=thunder-fist`,   category: "warrior" },
    { id: "av-07", label: "Steel Viper",    url: `${BASE}?seed=steel-viper`,    category: "warrior" },
    { id: "av-08", label: "Arc Blade",      url: `${BASE}?seed=arc-blade`,      category: "warrior" },
    { id: "av-09", label: "Ember Wolf",     url: `${BASE}?seed=ember-wolf`,     category: "warrior" },
    { id: "av-10", label: "Frost Lance",    url: `${BASE}?seed=frost-lance`,    category: "warrior" },

    // ── Strategists ───────────────────────────────────────────────────────────
    { id: "av-11", label: "Mind Weaver",    url: `${BASE}?seed=mind-weaver`,    category: "strategist" },
    { id: "av-12", label: "Code Breaker",   url: `${BASE}?seed=code-breaker`,   category: "strategist" },
    { id: "av-13", label: "Signal Master",  url: `${BASE}?seed=signal-master`,  category: "strategist" },
    { id: "av-14", label: "Data Oracle",    url: `${BASE}?seed=data-oracle`,    category: "strategist" },
    { id: "av-15", label: "Grid Tactician", url: `${BASE}?seed=grid-tactician`, category: "strategist" },
    { id: "av-16", label: "Pulse Analyst",  url: `${BASE}?seed=pulse-analyst`,  category: "strategist" },
    { id: "av-17", label: "Cipher Knight",  url: `${BASE}?seed=cipher-knight`,  category: "strategist" },
    { id: "av-18", label: "Nexus Sage",     url: `${BASE}?seed=nexus-sage`,     category: "strategist" },
    { id: "av-19", label: "Echo Scholar",   url: `${BASE}?seed=echo-scholar`,   category: "strategist" },
    { id: "av-20", label: "Arc Planner",    url: `${BASE}?seed=arc-planner`,    category: "strategist" },

    // ── Creators ──────────────────────────────────────────────────────────────
    { id: "av-21", label: "Pixel Mage",      url: `${BASE}?seed=pixel-mage`,      category: "creator" },
    { id: "av-22", label: "Echo Artist",     url: `${BASE}?seed=echo-artist`,     category: "creator" },
    { id: "av-23", label: "Spark Crafter",   url: `${BASE}?seed=spark-crafter`,   category: "creator" },
    { id: "av-24", label: "Wave Designer",   url: `${BASE}?seed=wave-designer`,   category: "creator" },
    { id: "av-25", label: "Lens Maker",      url: `${BASE}?seed=lens-maker`,      category: "creator" },
    { id: "av-26", label: "Rhythm Forge",    url: `${BASE}?seed=rhythm-forge`,    category: "creator" },
    { id: "av-27", label: "Color Alchemist", url: `${BASE}?seed=color-alchemist`, category: "creator" },
    { id: "av-28", label: "Canvas Rebel",    url: `${BASE}?seed=canvas-rebel`,    category: "creator" },
    { id: "av-29", label: "Light Sculptor",  url: `${BASE}?seed=light-sculptor`,  category: "creator" },
    { id: "av-30", label: "Syntax Poet",     url: `${BASE}?seed=syntax-poet`,     category: "creator" },

    // ── Leaders ───────────────────────────────────────────────────────────────
    { id: "av-31", label: "Crown Bearer",    url: `${BASE}?seed=crown-bearer`,    category: "leader" },
    { id: "av-32", label: "Shield Captain",  url: `${BASE}?seed=shield-captain`,  category: "leader" },
    { id: "av-33", label: "Rally Chief",     url: `${BASE}?seed=rally-chief`,     category: "leader" },
    { id: "av-34", label: "Flame Vanguard",  url: `${BASE}?seed=flame-vanguard`,  category: "leader" },
    { id: "av-35", label: "Apex Commander",  url: `${BASE}?seed=apex-commander`,  category: "leader" },
    { id: "av-36", label: "Tide Marshal",    url: `${BASE}?seed=tide-marshal`,    category: "leader" },
    { id: "av-37", label: "Banner Warden",   url: `${BASE}?seed=banner-warden`,   category: "leader" },
    { id: "av-38", label: "Forge Admiral",   url: `${BASE}?seed=forge-admiral`,   category: "leader" },
    { id: "av-39", label: "Oath Keeper",     url: `${BASE}?seed=oath-keeper`,     category: "leader" },
    { id: "av-40", label: "Crest Herald",    url: `${BASE}?seed=crest-herald`,    category: "leader" },
];

export const AVATAR_CATEGORIES = [
    { key: "warrior",    label: "Warriors" },
    { key: "strategist", label: "Strategists" },
    { key: "creator",    label: "Creators" },
    { key: "leader",     label: "Leaders" },
] as const;

/** DiceBear style collections available in the custom builder */
export const AVATAR_STYLES: AvatarStyle[] = [
    { key: "adventurer-neutral", label: "Adventurer", description: "Cartoon faces" },
    { key: "bottts-neutral",     label: "Bots",        description: "Robot characters" },
    { key: "pixel-art-neutral",  label: "Pixel",       description: "Retro pixel art" },
    { key: "notionists-neutral", label: "Abstract",    description: "Notion-style shapes" },
    { key: "lorelei-neutral",    label: "Portrait",    description: "Illustrated portraits" },
    { key: "fun-emoji",          label: "Emoji",       description: "Fun emoji faces" },
];

/** Random seed suggestions for the custom builder */
export const SEED_SUGGESTIONS = [
    "your-name", "my-alias", "deploy-master", "harvest-king",
    "digital-nomad", "campaign-zero", "ghost-protocol", "signal-9",
];

/** Build a DiceBear avatar URL for any style + seed combination */
export function buildCustomAvatarUrl(seed: string, style = "adventurer-neutral"): string {
    return `${DICEBEAR_V9}/${style}/svg?seed=${encodeURIComponent(seed)}`;
}
