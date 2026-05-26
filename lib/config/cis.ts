import crypto from "node:crypto";

import { cisConfig } from "./cis-config";

export { cisConfig };

function normaliseSignature(signature: string | null): string | null {
    if (!signature) {
        return null;
    }

    const trimmed = signature.trim();
    if (trimmed.startsWith("sha256=")) {
        return trimmed.slice("sha256=".length);
    }

    return trimmed.length > 0 ? trimmed : null;
}

export function buildCisWebhookSignature(timestamp: string, payload: string): string {
    const secret = cisConfig.webhookSecret;
    if (!secret) {
        return "";
    }

    return crypto
        .createHmac("sha256", secret)
        .update(`${timestamp}.${payload}`)
        .digest("hex");
}

export function verifyCisWebhookSignature(params: {
    payload: string;
    signature: string | null;
    timestamp: string | null;
}): boolean {
    if (!cisConfig.webhookSecret) {
        return false;
    }

    const normalizedSignature = normaliseSignature(params.signature);
    const numericTimestamp = params.timestamp ? Number.parseInt(params.timestamp, 10) : Number.NaN;

    if (!normalizedSignature || Number.isNaN(numericTimestamp)) {
        return false;
    }

    const ageSeconds = Math.abs(Date.now() - numericTimestamp) / 1000;
    if (ageSeconds > cisConfig.webhookAllowedSkewSeconds) {
        return false;
    }

    const expectedSignature = buildCisWebhookSignature(params.timestamp ?? "", params.payload);
    if (!expectedSignature) {
        return false;
    }

    const expectedBuffer = Buffer.from(expectedSignature, "hex");
    const providedBuffer = Buffer.from(normalizedSignature, "hex");

    if (expectedBuffer.length !== providedBuffer.length) {
        return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, providedBuffer);
}
