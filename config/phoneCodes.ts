// ─── Phone Country Codes Config ───────────────────────────────────────────────
// Used by PhoneInput component. Add more entries as needed.

export const PHONE_COUNTRY_CODES = [
    { label: "🇳🇬 +234", value: "234", country: "Nigeria" },
    { label: "🇬🇧 +44", value: "44", country: "UK" },
    { label: "🇺🇸 +1", value: "1", country: "US" },
    { label: "🇬🇭 +233", value: "233", country: "Ghana" },
    { label: "🇰🇪 +254", value: "254", country: "Kenya" },
    { label: "🇿🇦 +27", value: "27", country: "South Africa" },
] as const;

export type PhoneCountryCode = (typeof PHONE_COUNTRY_CODES)[number]["value"];

export const DEFAULT_COUNTRY_CODE: PhoneCountryCode = "234";

/** Parse a combined "+{code}{digits}" string back into its parts, or return defaults. */
export function parsePhoneNumber(value?: string): {
    code: PhoneCountryCode;
    digits: string;
} {
    if (!value) return { code: DEFAULT_COUNTRY_CODE, digits: "" };
    // Strip leading +
    const stripped = value.startsWith("+") ? value.slice(1) : value;
    // Try longest match first (e.g. 234 before 1)
    const sorted = [...PHONE_COUNTRY_CODES].sort(
        (a, b) => b.value.length - a.value.length
    );
    for (const entry of sorted) {
        if (stripped.startsWith(entry.value)) {
            return {
                code: entry.value as PhoneCountryCode,
                digits: stripped.slice(entry.value.length),
            };
        }
    }
    return { code: DEFAULT_COUNTRY_CODE, digits: stripped };
}
