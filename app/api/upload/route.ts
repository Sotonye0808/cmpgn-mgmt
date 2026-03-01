import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import {
    successResponse,
    badRequestResponse,
    handleApiError,
} from "@/lib/utils/api";

// ─── Mock Upload Handler ──────────────────────────────────────────────────────
// Phase 14 swap: replace with Cloudinary SDK upload
// cloudinary.uploader.upload(file, { folder: "cmpgn-mgmt", ... })

const ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "video/mp4",
    "video/webm",
];
const MAX_SIZE_MB = 10;

export async function POST(request: NextRequest) {
    try {
        const auth = await requireAuth();
        if (auth.error) return auth.error;

        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return badRequestResponse("No file provided");
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            return badRequestResponse(
                `Unsupported file type: ${file.type}. Allowed: ${ALLOWED_TYPES.join(", ")}`
            );
        }

        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            return badRequestResponse(
                `File too large. Max ${MAX_SIZE_MB}MB`
            );
        }

        // ─── Mock: generate a deterministic placeholder URL ───────────────
        // In production this would call Cloudinary and return the real URL.
        const isImage = file.type.startsWith("image/");
        const timestamp = Date.now();
        const mockUrl = isImage
            ? `https://picsum.photos/seed/${timestamp}/800/600`
            : `https://example.com/video/${timestamp}.mp4`;

        const mockThumbnailUrl = isImage
            ? mockUrl
            : `https://picsum.photos/seed/${timestamp}/400/300`;

        return successResponse(
            {
                url: mockUrl,
                thumbnailUrl: mockThumbnailUrl,
                type: isImage ? "IMAGE" : "VIDEO",
                fileName: file.name,
                fileSize: file.size,
                mimeType: file.type,
            },
            201
        );
    } catch (err) {
        return handleApiError(err);
    }
}
