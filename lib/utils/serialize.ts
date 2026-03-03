// ─── Prisma → Global Type Serialization ──────────────────────────────────────
// Converts Prisma return values (Date objects, Decimal instances) into the
// plain JSON shapes declared in global.d.ts (ISO string dates, number amounts).
// Use this at the service layer boundary when returning entity data.

/**
 * Deep-serialize a Prisma result to match the JSON wire format.
 * - Date → ISO string
 * - Prisma Decimal → number
 * - Everything else passes through unchanged.
 */
export function serialize<T>(data: unknown): T {
    return JSON.parse(
        JSON.stringify(data, (_key, value) => {
            // Prisma Decimal → number
            if (
                value !== null &&
                typeof value === "object" &&
                typeof value.toNumber === "function"
            ) {
                return value.toNumber();
            }
            return value;
        })
    ) as T;
}

/**
 * Serialize an array of Prisma results.
 */
export function serializeArray<T>(data: unknown[]): T[] {
    return data.map((item) => serialize<T>(item));
}
