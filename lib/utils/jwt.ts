import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import {
    JWT_ACCESS_COOKIE,
    JWT_ACCESS_EXPIRY,
    JWT_REFRESH_COOKIE,
    JWT_REFRESH_EXPIRY,
} from "../constants";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? "dev-access-secret-change-in-prod";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? "dev-refresh-secret-change-in-prod";

export interface JwtPayload {
    sub: string;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
}

export function signAccessToken(payload: Omit<JwtPayload, "iat" | "exp">): string {
    return jwt.sign(payload, ACCESS_SECRET, { expiresIn: JWT_ACCESS_EXPIRY });
}

export function signRefreshToken(payload: Omit<JwtPayload, "iat" | "exp">): string {
    return jwt.sign(payload, REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRY });
}

export function verifyAccessToken(token: string): JwtPayload | null {
    try {
        return jwt.verify(token, ACCESS_SECRET) as JwtPayload;
    } catch {
        return null;
    }
}

export function verifyRefreshToken(token: string): JwtPayload | null {
    try {
        return jwt.verify(token, REFRESH_SECRET) as JwtPayload;
    } catch {
        return null;
    }
}

export async function setAuthCookies(accessToken: string, refreshToken: string): Promise<void> {
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
    const cookieStore = await cookies();
    cookieStore.delete(JWT_ACCESS_COOKIE);
    cookieStore.delete(JWT_REFRESH_COOKIE);
}
