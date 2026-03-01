// Thin client-side wrappers around /api/engagement/proofs
// All writes go through the API so the server-side mockDb is the single source of truth.

import { ROUTES } from "@/config/routes";

export interface ProofWithMeta extends ViewProof {
    userName?: string;
    campaignTitle?: string;
}

// ─── Submit a new proof ──────────────────────────────────────────────────────

export async function submitProof(input: CreateViewProofInput): Promise<ViewProof> {
    const res = await fetch(ROUTES.API.ENGAGEMENT.PROOFS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });
    if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error((json as { message?: string }).message ?? "Failed to submit proof");
    }
    const json = await res.json();
    return (json as { data: ViewProof }).data;
}

// ─── Fetch proofs (own proofs for users; all for admin) ───────────────────────

export async function fetchProofs(campaignId?: string): Promise<ViewProof[]> {
    const url = new URL(ROUTES.API.ENGAGEMENT.PROOFS, window.location.origin);
    if (campaignId) url.searchParams.set("campaignId", campaignId);
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error("Failed to fetch proofs");
    const json = await res.json();
    return (json as { data: ViewProof[] }).data;
}

// ─── Review a proof (admin / team lead) ──────────────────────────────────────

export interface ReviewProofInput {
    status: "APPROVED" | "REJECTED";
    notes?: string;
}

export async function reviewProof(proofId: string, input: ReviewProofInput): Promise<ViewProof> {
    const res = await fetch(ROUTES.API.ENGAGEMENT.PROOF_REVIEW(proofId), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });
    if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error((json as { message?: string }).message ?? "Failed to review proof");
    }
    const json = await res.json();
    return (json as { data: ViewProof }).data;
}
