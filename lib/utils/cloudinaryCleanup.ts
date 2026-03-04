/**
 * Client-side Cloudinary cleanup utilities.
 *
 * These helpers are used by campaign create/edit pages to maintain ACID
 * asset handling:
 *   - On cancel: delete any assets uploaded-but-not-saved during the session
 *   - On successful edit: delete old assets whose URLs were replaced
 */

/** Extract the Cloudinary public_id from a stored secure URL. Returns null for non-Cloudinary URLs. */
export function extractCloudinaryPublicId(url: string | null | undefined): string | null {
    if (!url?.includes("res.cloudinary.com")) return null;
    // URL: https://res.cloudinary.com/{cloud}/{resource_type}/upload/{version?}/{public_id}.{ext}
    // Transformations in the URL (e.g. c_thumb,w_400) come before the public_id segment.
    // We match everything after the last transformation or version segment up to the file extension.
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)\.[a-zA-Z0-9]+(?:\?.*)?$/);
    return match?.[1] ?? null;
}

export interface TrackedAsset {
    publicId: string;
    resourceType: "image" | "video";
}

/**
 * Delete a single Cloudinary asset via the app's upload API.
 * Best-effort — never throws, never blocks the UX.
 */
export async function deleteCloudinaryAsset(
    publicId: string,
    resourceType: "image" | "video" = "image",
): Promise<void> {
    try {
        await fetch("/api/upload", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ publicId, resourceType }),
        });
    } catch {
        // Best-effort — never block UX for cleanup failures
    }
}

/**
 * Delete multiple Cloudinary assets concurrently.
 * All deletions are best-effort — failures are silently swallowed.
 */
export async function deleteCloudinaryAssets(assets: TrackedAsset[]): Promise<void> {
    if (assets.length === 0) return;
    await Promise.allSettled(
        assets.map(({ publicId, resourceType }) =>
            deleteCloudinaryAsset(publicId, resourceType),
        ),
    );
}

/**
 * Compute which old campaign assets need cleanup after a successful edit.
 *
 * Compares old URL fields against newly submitted values. If an old field
 * contained a Cloudinary URL that was replaced, we extract its publicId and
 * schedule it for deletion.
 *
 * Note: thumbnailUrl is often a transformation of mediaUrl (same publicId),
 * so we de-duplicate before returning.
 */
export function computeObsoleteAssets(
    old: { mediaUrl?: string | null; thumbnailUrl?: string | null; mediaType?: string | null },
    submitted: Record<string, unknown>,
): TrackedAsset[] {
    const candidates: Array<{ url: string | null | undefined; resourceType: "image" | "video" }> = [];

    if (old.mediaUrl && old.mediaUrl !== submitted.mediaUrl) {
        candidates.push({
            url: old.mediaUrl,
            resourceType: old.mediaType === "VIDEO" ? "video" : "image",
        });
    }

    if (old.thumbnailUrl && old.thumbnailUrl !== submitted.thumbnailUrl) {
        candidates.push({ url: old.thumbnailUrl, resourceType: "image" });
    }

    // Deduplicate by publicId before returning
    const seen = new Set<string>();
    const result: TrackedAsset[] = [];
    for (const { url, resourceType } of candidates) {
        const id = extractCloudinaryPublicId(url);
        if (id && !seen.has(id)) {
            seen.add(id);
            result.push({ publicId: id, resourceType });
        }
    }
    return result;
}
