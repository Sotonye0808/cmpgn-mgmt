// ─── Campus Configuration ────────────────────────────────────────────────────
// Centralised campus list for user registration and profile.
// Add / reorder entries here — UI renders via .map().

export interface CampusOption {
    label: string;
    value: string;
}

export const CAMPUS_OPTIONS: CampusOption[] = [
    { label: "Abuja (City Centre)", value: "ABUJA_CITY_CENTRE" },
    { label: "Abuja (Gwarinpa)", value: "ABUJA_GWARINPA" },
    { label: "Abuja (Wuse)", value: "ABUJA_WUSE" },
    { label: "Abuja (Lugbe)", value: "ABUJA_LUGBE" },
    { label: "Lagos (Lekki)", value: "LAGOS_LEKKI" },
    { label: "Lagos (Ikeja)", value: "LAGOS_IKEJA" },
    { label: "Lagos (Victoria Island)", value: "LAGOS_VI" },
    { label: "Port Harcourt", value: "PORT_HARCOURT" },
    { label: "Ibadan", value: "IBADAN" },
    { label: "Benin City", value: "BENIN_CITY" },
    { label: "Kaduna", value: "KADUNA" },
    { label: "Jos", value: "JOS" },
    { label: "Enugu", value: "ENUGU" },
    { label: "Warri", value: "WARRI" },
    { label: "Calabar", value: "CALABAR" },
    { label: "Owerri", value: "OWERRI" },
    { label: "Uyo", value: "UYO" },
    { label: "Online / Diaspora", value: "ONLINE_DIASPORA" },
] as const;

/** Resolve a campus value to its display label. */
export function getCampusLabel(value: string): string {
    return CAMPUS_OPTIONS.find((c) => c.value === value)?.label ?? value;
}
