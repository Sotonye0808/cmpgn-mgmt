import { format, formatDistanceToNow, parseISO } from "date-fns";

export function formatDate(date: string | Date): string {
    const d = typeof date === "string" ? parseISO(date) : date;
    return format(d, "d MMM yyyy");
}

export function formatDateTime(date: string | Date): string {
    const d = typeof date === "string" ? parseISO(date) : date;
    return format(d, "d MMM yyyy, HH:mm");
}

export function formatRelative(date: string | Date): string {
    const d = typeof date === "string" ? parseISO(date) : date;
    return formatDistanceToNow(d, { addSuffix: true });
}

export function formatCurrency(amount: number, currency = "NGN"): string {
    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
    }).format(amount);
}

export function formatNumber(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
}

export function formatPercent(value: number, total: number): string {
    if (total === 0) return "0%";
    return `${Math.round((value / total) * 100)}%`;
}
