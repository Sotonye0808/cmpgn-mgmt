import { cisConfig } from "@/lib/config/cis";
import { successResponse } from "@/lib/utils/api";

export async function GET() {
    return successResponse({
        appName: cisConfig.appName,
        appUrl: cisConfig.appUrl,
        platformSlug: cisConfig.platformSlug,
        ready: cisConfig.ready,
        apiUrl: cisConfig.apiUrl,
        webhookPath: cisConfig.webhookPath,
        webhookConfigured: Boolean(cisConfig.webhookSecret),
    });
}
