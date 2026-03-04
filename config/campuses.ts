// ─── Campus Configuration ────────────────────────────────────────────────────
// Centralised campus list for user registration and profile.
// Add / reorder entries here — UI renders via .map().

export interface CampusOption {
    label: string;
    value: string;
}

export const CAMPUS_OPTIONS: CampusOption[] = [
    { label: "London", value: "LONDON" },
    { label: "Birmingham", value: "BIRMINGHAM" },
    { label: "Glasgow", value: "GLASGOW" },
    { label: "Manchester", value: "MANCHESTER" },
    { label: "Houston", value: "HOUSTON" },
    { label: "North London", value: "NORTH_LONDON" },
    { label: "Kent", value: "KENT" },
    { label: "Toronto", value: "TORONTO" },
    { label: "Gbagada", value: "GBAGADA" },
    { label: "Magodo", value: "MAGODO" },
    { label: "Ikorodu", value: "IKORODU" },
    { label: "Ibadan Jericho", value: "IBADAN_JERICHO" },
    { label: "Akobo", value: "AKOBO" },
    { label: "Apapa", value: "APAPA" },
    { label: "Surulere", value: "SURULERE" },
    { label: "Abeokuta", value: "ABEOKUTA" },
    { label: "Ilupeju", value: "ILUPEJU" },
    { label: "Yaba", value: "YABA" },
    { label: "Port Harcourt", value: "PORT_HARCOURT" },
    { label: "Oluyole", value: "OLUYOLE" },
    { label: "Ogba", value: "OGBA" },
    { label: "Anthony", value: "ANTHONY" },
    { label: "Alimosho", value: "ALIMOSHO" },
    { label: "Ikeja", value: "IKEJA" },
    { label: "Ikoyi", value: "IKOYI" },
    { label: "Isolo", value: "ISOLO" },
    { label: "Iyana Ipaja", value: "IYANA_IPAJA" },
    { label: "Abule Egba", value: "ABULE_EGBA" },
    { label: "Ghana", value: "GHANA" },
    { label: "Abuja", value: "ABUJA" },
    { label: "Lekki", value: "LEKKI" },
    { label: "Globe", value: "GLOBE" },
    { label: "Ajah", value: "AJAH" },
    { label: "Online", value: "ONLINE" },
] as const;

/** Resolve a campus value to its display label. */
export function getCampusLabel(value: string): string {
    return CAMPUS_OPTIONS.find((c) => c.value === value)?.label ?? value;
}
