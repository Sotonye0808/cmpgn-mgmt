import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import {
    successResponse,
    badRequestResponse,
    handleApiError,
} from "@/lib/utils/api";
import { uploadAsset, type AssetCategory } from "@/lib/cloudinary";

const ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "video/mp4",
    "video/webm",
];
const MAX_SIZE_MB = 10;

/** Map query param 'category' to AssetCategory. Falls back to campaign-image. */
function resolveCategory(raw?: string | null): AssetCategory {
    const map: Record<string, AssetCategory> = {
        "campaign-image": "campaign-image",
        "campaign-video": "campaign-video",
        "proof-deployment": "proof-deployment",
        "proof-donation": "proof-donation",
    };
    return map[raw ?? ""] ?? "campaign-image";
}

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

        const category = resolveCategory(
            request.nextUrl.searchParams.get("category")
        );

        // Convert File to base64 data URI for Cloudinary upload
        const bytes = await file.arrayBuffer();
        const base64 = Buffer.from(bytes).toString("base64");
        const dataUri = `data:${file.type};base64,${base64}`;

        const result = await uploadAsset(dataUri, category, {
            publicId: `${Date.now()}-${file.name.replace(/\.[^.]+$/, "")}`,
        });

        const isImage = file.type.startsWith("image/");

        return successResponse(
            {
                url: result.url,
                thumbnailUrl: isImage
                    ? result.url.replace("/upload/", "/upload/c_thumb,w_400,h_300/")
                    : result.url.replace(/\.[^.]+$/, ".jpg"),
                publicId: result.publicId,
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
