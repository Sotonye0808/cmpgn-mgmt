// ─── Cloudinary Server-Side Configuration ────────────────────────────────────
// All uploads go through server-side API routes — the API secret never
// reaches the client. URLs stored in PostgreSQL via Prisma.
//
// Cloudinary folder structure (inside the "cmpgn-mgmt" root folder):
//   cmpgn-mgmt/media/images/    — campaign images, thumbnails, metaImage
//   cmpgn-mgmt/media/videos/    — campaign videos
//   cmpgn-mgmt/proofs/deployment/ — ViewProof screenshotUrl
//   cmpgn-mgmt/proofs/donations/  — Donation proofScreenshotUrl

import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

// ─── Configure SDK (runs once at module load) ────────────────────────────────

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

// ─── Asset Category → Folder Mapping ─────────────────────────────────────────

type AssetCategory =
    | "campaign-image"
    | "campaign-video"
    | "proof-deployment"
    | "proof-donation";

const FOLDER_MAP: Record<AssetCategory, string> = {
    "campaign-image": "cmpgn-mgmt/media/images",
    "campaign-video": "cmpgn-mgmt/media/videos",
    "proof-deployment": "cmpgn-mgmt/proofs/deployment",
    "proof-donation": "cmpgn-mgmt/proofs/donations",
} as const;

const RESOURCE_TYPE_MAP: Record<AssetCategory, "image" | "video"> = {
    "campaign-image": "image",
    "campaign-video": "video",
    "proof-deployment": "image",
    "proof-donation": "image",
} as const;

// ─── Upload Result Shape ─────────────────────────────────────────────────────

interface UploadResult {
    url: string;
    thumbnailUrl: string;
    publicId: string;
    width?: number;
    height?: number;
    format: string;
    bytes: number;
}

// ─── Upload Helper ───────────────────────────────────────────────────────────

interface UploadOptions {
    publicId?: string;
    tags?: string[];
    /** Override generated transformation for thumbnail. */
    thumbnailTransform?: string;
}

/**
 * Upload a file to Cloudinary under the correct folder.
 *
 * @param file - A Buffer (from FormData), a base64 data URI, or a remote URL.
 * @param category - Determines the destination folder and resource type.
 * @param options - Optional publicId, tags, thumbnail transform.
 * @returns The secure URL, thumbnail URL, and metadata.
 */
export async function uploadAsset(
    file: Buffer | string,
    category: AssetCategory,
    options: UploadOptions = {}
): Promise<UploadResult> {
    const folder = FOLDER_MAP[category];
    const resourceType = RESOURCE_TYPE_MAP[category];

    // Convert Buffer to base64 data URI for the upload stream
    const uploadSource =
        file instanceof Buffer
            ? `data:${resourceType === "video" ? "video/mp4" : "image/png"};base64,${file.toString("base64")}`
            : file;

    const result: UploadApiResponse = await cloudinary.uploader.upload(
        uploadSource as string,
        {
            folder,
            resource_type: resourceType,
            public_id: options.publicId,
            tags: options.tags,
            overwrite: !!options.publicId, // overwrite only when publicId is explicit
            transformation:
                resourceType === "image"
                    ? [{ quality: "auto:good", fetch_format: "auto" }]
                    : undefined,
        }
    );

    // Generate thumbnail URL (image → 400px wide; video → poster frame at 1s)
    const thumbnailUrl =
        options.thumbnailTransform ??
        (resourceType === "image"
            ? cloudinary.url(result.public_id, {
                  width: 400,
                  crop: "scale",
                  quality: "auto",
                  fetch_format: "auto",
                  secure: true,
              })
            : cloudinary.url(result.public_id, {
                  resource_type: "video",
                  start_offset: "1",
                  width: 400,
                  crop: "scale",
                  format: "jpg",
                  secure: true,
              }));

    return {
        url: result.secure_url,
        thumbnailUrl,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
    };
}

/**
 * Delete an asset by its public ID.
 */
export async function deleteAsset(
    publicId: string,
    resourceType: "image" | "video" = "image"
): Promise<void> {
    await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
    });
}

// Re-export types for consumers
export type { AssetCategory, UploadResult, UploadOptions };
