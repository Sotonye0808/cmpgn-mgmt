// ─── Avatar Config ────────────────────────────────────────────────────────────
// 60 curated avatars across 6 categories, each using a different DiceBear
// style collection for maximum visual variety.
// Custom builder exposes 18 DiceBear v9 style collections in 4 groups.
// Phase 14: swap to Cloudinary-hosted assets if needed.

export interface AvatarOption {
    id: string;
    label: string;
    url: string;
    category: "warrior" | "strategist" | "creator" | "leader" | "bot" | "pixel";
}

export interface AvatarStyle {
    key: string;
    label: string;
    description: string;
    group: "portrait" | "character" | "robot" | "abstract";
}

export interface AvatarStyleGroup {
    key: "portrait" | "character" | "robot" | "abstract";
    label: string;
}

const DICEBEAR_V9 = "https://api.dicebear.com/9.x";

// Each curated category uses a distinct DiceBear collection for variety
const W = `${DICEBEAR_V9}/adventurer/svg`;          // Warriors   — full-body adventurers
const S = `${DICEBEAR_V9}/personas/svg`;            // Strategists — illustrated personas
const C = `${DICEBEAR_V9}/open-peeps/svg`;          // Creators   — hand-drawn peeps
const L = `${DICEBEAR_V9}/lorelei/svg`;             // Leaders    — elegant portraits
const B = `${DICEBEAR_V9}/bottts/svg`;              // Bots       — full robot bodies
const P = `${DICEBEAR_V9}/pixel-art/svg`;           // Pixel      — retro pixel art

export const CURATED_AVATARS: AvatarOption[] = [
    // ── Warriors (adventurer — full-body cartoon) ─────────────────────────────
    { id: "av-01", label: "Storm Trooper",  url: `${W}?seed=storm-trooper`,  category: "warrior" },
    { id: "av-02", label: "Blaze Runner",   url: `${W}?seed=blaze-runner`,   category: "warrior" },
    { id: "av-03", label: "Iron Guard",     url: `${W}?seed=iron-guard`,     category: "warrior" },
    { id: "av-04", label: "Shadow Striker", url: `${W}?seed=shadow-striker`, category: "warrior" },
    { id: "av-05", label: "Night Hawk",     url: `${W}?seed=night-hawk`,     category: "warrior" },
    { id: "av-06", label: "Thunder Fist",   url: `${W}?seed=thunder-fist`,   category: "warrior" },
    { id: "av-07", label: "Steel Viper",    url: `${W}?seed=steel-viper`,    category: "warrior" },
    { id: "av-08", label: "Arc Blade",      url: `${W}?seed=arc-blade`,      category: "warrior" },
    { id: "av-09", label: "Ember Wolf",     url: `${W}?seed=ember-wolf`,     category: "warrior" },
    { id: "av-10", label: "Frost Lance",    url: `${W}?seed=frost-lance`,    category: "warrior" },

    // ── Strategists (personas — illustrated professional faces) ───────────────
    { id: "av-11", label: "Mind Weaver",    url: `${S}?seed=mind-weaver`,    category: "strategist" },
    { id: "av-12", label: "Code Breaker",   url: `${S}?seed=code-breaker`,   category: "strategist" },
    { id: "av-13", label: "Signal Master",  url: `${S}?seed=signal-master`,  category: "strategist" },
    { id: "av-14", label: "Data Oracle",    url: `${S}?seed=data-oracle`,    category: "strategist" },
    { id: "av-15", label: "Grid Tactician", url: `${S}?seed=grid-tactician`, category: "strategist" },
    { id: "av-16", label: "Pulse Analyst",  url: `${S}?seed=pulse-analyst`,  category: "strategist" },
    { id: "av-17", label: "Cipher Knight",  url: `${S}?seed=cipher-knight`,  category: "strategist" },
    { id: "av-18", label: "Nexus Sage",     url: `${S}?seed=nexus-sage`,     category: "strategist" },
    { id: "av-19", label: "Echo Scholar",   url: `${S}?seed=echo-scholar`,   category: "strategist" },
    { id: "av-20", label: "Arc Planner",    url: `${S}?seed=arc-planner`,    category: "strategist" },

    // ── Creators (open-peeps — expressive hand-drawn characters) ─────────────
    { id: "av-21", label: "Pixel Mage",      url: `${C}?seed=pixel-mage`,      category: "creator" },
    { id: "av-22", label: "Echo Artist",     url: `${C}?seed=echo-artist`,     category: "creator" },
    { id: "av-23", label: "Spark Crafter",   url: `${C}?seed=spark-crafter`,   category: "creator" },
    { id: "av-24", label: "Wave Designer",   url: `${C}?seed=wave-designer`,   category: "creator" },
    { id: "av-25", label: "Lens Maker",      url: `${C}?seed=lens-maker`,      category: "creator" },
    { id: "av-26", label: "Rhythm Forge",    url: `${C}?seed=rhythm-forge`,    category: "creator" },
    { id: "av-27", label: "Color Alchemist", url: `${C}?seed=color-alchemist`, category: "creator" },
    { id: "av-28", label: "Canvas Rebel",    url: `${C}?seed=canvas-rebel`,    category: "creator" },
    { id: "av-29", label: "Light Sculptor",  url: `${C}?seed=light-sculptor`,  category: "creator" },
    { id: "av-30", label: "Syntax Poet",     url: `${C}?seed=syntax-poet`,     category: "creator" },

    // ── Leaders (lorelei — elegant illustrated portraits) ─────────────────────
    { id: "av-31", label: "Crown Bearer",    url: `${L}?seed=crown-bearer`,    category: "leader" },
    { id: "av-32", label: "Shield Captain",  url: `${L}?seed=shield-captain`,  category: "leader" },
    { id: "av-33", label: "Rally Chief",     url: `${L}?seed=rally-chief`,     category: "leader" },
    { id: "av-34", label: "Flame Vanguard",  url: `${L}?seed=flame-vanguard`,  category: "leader" },
    { id: "av-35", label: "Apex Commander",  url: `${L}?seed=apex-commander`,  category: "leader" },
    { id: "av-36", label: "Tide Marshal",    url: `${L}?seed=tide-marshal`,    category: "leader" },
    { id: "av-37", label: "Banner Warden",   url: `${L}?seed=banner-warden`,   category: "leader" },
    { id: "av-38", label: "Forge Admiral",   url: `${L}?seed=forge-admiral`,   category: "leader" },
    { id: "av-39", label: "Oath Keeper",     url: `${L}?seed=oath-keeper`,     category: "leader" },
    { id: "av-40", label: "Crest Herald",    url: `${L}?seed=crest-herald`,    category: "leader" },

    // ── Bots (bottts — colorful full robot bodies) ────────────────────────────
    { id: "av-41", label: "Nano-9",       url: `${B}?seed=nano-9`,       category: "bot" },
    { id: "av-42", label: "Circuit-X",    url: `${B}?seed=circuit-x`,    category: "bot" },
    { id: "av-43", label: "Byte Warden",  url: `${B}?seed=byte-warden`,  category: "bot" },
    { id: "av-44", label: "Core Engine",  url: `${B}?seed=core-engine`,  category: "bot" },
    { id: "av-45", label: "Grid Bot",     url: `${B}?seed=grid-bot`,     category: "bot" },
    { id: "av-46", label: "Pulse Unit",   url: `${B}?seed=pulse-unit`,   category: "bot" },
    { id: "av-47", label: "Logic Frame",  url: `${B}?seed=logic-frame`,  category: "bot" },
    { id: "av-48", label: "Arc Droid",    url: `${B}?seed=arc-droid`,    category: "bot" },
    { id: "av-49", label: "Signal Bot",   url: `${B}?seed=signal-bot`,   category: "bot" },
    { id: "av-50", label: "Data Mech",    url: `${B}?seed=data-mech`,    category: "bot" },

    // ── Pixel (pixel-art — retro pixel-style characters) ─────────────────────
    { id: "av-51", label: "Pixel Knight",  url: `${P}?seed=pixel-knight`,  category: "pixel" },
    { id: "av-52", label: "8-Bit Ronin",   url: `${P}?seed=8bit-ronin`,    category: "pixel" },
    { id: "av-53", label: "Sprite Wizard", url: `${P}?seed=sprite-wizard`, category: "pixel" },
    { id: "av-54", label: "Block Runner",  url: `${P}?seed=block-runner`,  category: "pixel" },
    { id: "av-55", label: "Retro Archer",  url: `${P}?seed=retro-archer`,  category: "pixel" },
    { id: "av-56", label: "Voxel Mage",    url: `${P}?seed=voxel-mage`,    category: "pixel" },
    { id: "av-57", label: "Chip Guardian", url: `${P}?seed=chip-guardian`, category: "pixel" },
    { id: "av-58", label: "Neon Samurai",  url: `${P}?seed=neon-samurai`,  category: "pixel" },
    { id: "av-59", label: "Dot Fighter",   url: `${P}?seed=dot-fighter`,   category: "pixel" },
    { id: "av-60", label: "Grid Ranger",   url: `${P}?seed=grid-ranger`,   category: "pixel" },
];

export const AVATAR_CATEGORIES = [
    { key: "warrior",    label: "Warriors",    emoji: "⚔️" },
    { key: "strategist", label: "Strategists", emoji: "🧠" },
    { key: "creator",    label: "Creators",    emoji: "🎨" },
    { key: "leader",     label: "Leaders",     emoji: "👑" },
    { key: "bot",        label: "Bots",        emoji: "🤖" },
    { key: "pixel",      label: "Pixel",       emoji: "🕹️" },
] as const;

export const AVATAR_STYLE_GROUPS: AvatarStyleGroup[] = [
    { key: "portrait",  label: "Portraits & Faces" },
    { key: "character", label: "Full Characters" },
    { key: "robot",     label: "Robots & Bots" },
    { key: "abstract",  label: "Abstract & Geometric" },
];

/** 18 DiceBear v9 style collections for the custom builder, grouped by visual type */
export const AVATAR_STYLES: AvatarStyle[] = [
    // ── Portraits & Faces ────────────────────────────────────────────────────
    { key: "adventurer-neutral", label: "Adventurer",  description: "Cartoon face",        group: "portrait" },
    { key: "lorelei-neutral",    label: "Watercolour",  description: "Elegant portrait",    group: "portrait" },
    { key: "avataaars-neutral",  label: "Avataaars",    description: "Slack-style head",    group: "portrait" },
    { key: "micah",              label: "Micah",        description: "Artistic face",       group: "portrait" },
    { key: "big-ears-neutral",   label: "Big Ears",     description: "Cute face",           group: "portrait" },
    { key: "croodles-neutral",   label: "Doodle Face",  description: "Hand-drawn face",     group: "portrait" },

    // ── Full Characters ───────────────────────────────────────────────────────
    { key: "adventurer",         label: "Adventurer+",  description: "Full-body cartoon",   group: "character" },
    { key: "open-peeps",         label: "Peeps",        description: "Expressive peeps",    group: "character" },
    { key: "personas",           label: "Personas",     description: "Pro illustrated",     group: "character" },
    { key: "pixel-art",          label: "Pixel Art",    description: "Retro full body",     group: "character" },
    { key: "lorelei",            label: "Lorelei",      description: "Illustrated bust",    group: "character" },
    { key: "avataaars",          label: "Avataaars+",   description: "Colorful bust",       group: "character" },

    // ── Robots & Bots ─────────────────────────────────────────────────────────
    { key: "bottts-neutral",     label: "Bot Head",     description: "Robot face only",     group: "robot" },
    { key: "bottts",             label: "Bot Body",     description: "Full robot body",     group: "robot" },

    // ── Abstract & Geometric ──────────────────────────────────────────────────
    { key: "notionists-neutral", label: "Abstract",     description: "Notion-style shapes", group: "abstract" },
    { key: "shapes",             label: "Geometric",    description: "Bold shapes",         group: "abstract" },
    { key: "rings",              label: "Rings",        description: "Concentric rings",    group: "abstract" },
    { key: "fun-emoji",          label: "Emoji",        description: "Fun emoji faces",     group: "abstract" },
];

/** Random seed suggestions for the custom builder */
export const SEED_SUGGESTIONS = [
    "your-name", "my-alias", "deploy-master", "harvest-king",
    "digital-nomad", "campaign-zero", "ghost-protocol", "signal-9",
    "night-owl", "code-warrior", "rally-force", "apex-squad",
];

/** Build a DiceBear avatar URL for any style + seed combination */
export function buildCustomAvatarUrl(seed: string, style = "adventurer-neutral"): string {
    return `${DICEBEAR_V9}/${style}/svg?seed=${encodeURIComponent(seed)}`;
}
