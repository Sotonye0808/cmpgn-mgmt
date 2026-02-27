// NOTE: no top-level `next/headers` import — that package is Node.js-only and
// this module is also imported by Edge middleware (for verifyAccessToken).
// Cookie helpers use a dynamic import so they are safe to tree-shake in Edge.
import jwt from "jsonwebtoken";
import {
    JWT_ACCESS_COOKIE,
    JWT_ACCESS_EXPIRY,
    JWT_ACCESS_SECRET,
    JWT_REFRESH_COOKIE,
    JWT_REFRESH_EXPIRY,
    JWT_REFRESH_SECRET,
} from "../constants";

export interface JwtPayload {
    sub: string;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
}

function requireSecrets() {
    if (!JWT_ACCESS_SECRET || !JWT_REFRESH_SECRET) {
        throw new Error(
            "Missing JWT secrets — set JWT_ACCESS_SECRET and JWT_REFRESH_SECRET in .env.local"
        );
    }
}

export function signAccessToken(payload: Omit<JwtPayload, "iat" | "exp">): string {
    requireSecrets();
    return jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: JWT_ACCESS_EXPIRY });
}

export function signRefreshToken(payload: Omit<JwtPayload, "iat" | "exp">): string {
    requireSecrets();
    return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRY });
}

export function verifyAccessToken(token: string): JwtPayload | null {
    try {
        return jwt.verify(token, JWT_ACCESS_SECRET) as JwtPayload;
    } catch {
        return null;
    }
}

export function verifyRefreshToken(token: string): JwtPayload | null {
    try {
        return jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;
    } catch {
        return null;
    }
}

export async function setAuthCookies(accessToken: string, refreshToken: string): Promise<void> {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    cookieStore.set(JWT_ACCESS_COOKIE, accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 15 * 60, // 15 minutes
    });
    cookieStore.set(JWT_REFRESH_COOKIE, refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60, // 7 days
    });
}

export async function clearAuthCookies(): Promise<void> {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    cookieStore.delete(JWT_ACCESS_COOKIE);
    cookieStore.delete(JWT_REFRESH_COOKIE);
}
