import { SMART_LINK_SLUG_LENGTH } from "../constants";

const SLUG_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";

/**
 * Generate a unique URL-safe lowercase alphanumeric slug.
 * Format: 6–8 chars (default 7). userId/campaignId are NOT encoded in slug.
 */
export function generateSlug(length = SMART_LINK_SLUG_LENGTH): string {
    let slug = "";
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    for (const byte of array) {
        slug += SLUG_CHARS[byte % SLUG_CHARS.length];
    }
    return slug;
}

/**
 * Check if a slug is valid format
 */
export function isValidSlug(slug: string): boolean {
    return /^[a-z0-9]{6,8}$/.test(slug);
}
