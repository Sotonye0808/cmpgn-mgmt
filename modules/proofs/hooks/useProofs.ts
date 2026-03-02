"use client";

import { useState, useEffect, useCallback } from "react";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { fetchProofs, submitProof, reviewProof, type ReviewProofInput } from "../services/proofService";

// ─── useProofs ────────────────────────────────────────────────────────────────
// Fetches proofs for the current user (or all proofs for admin).
// Optionally scoped to a single campaign.

interface UseProofsReturn {
    proofs: ViewProof[];
    loading: boolean;
    error: string | null;
    refresh: () => void;
}

export function useProofs(campaignId?: string): UseProofsReturn {
    const [proofs, setProofs] = useState<ViewProof[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchProofs(campaignId);
            setProofs(data);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to load proofs");
        } finally {
            setLoading(false);
        }
    }, [campaignId]);

    useEffect(() => { fetch(); }, [fetch]);
    useAutoRefresh("viewProofs", fetch);

    return { proofs, loading, error, refresh: fetch };
}

// ─── useSubmitProof ───────────────────────────────────────────────────────────

interface UseSubmitProofReturn {
    submit: (input: CreateViewProofInput) => Promise<void>;
    loading: boolean;
    error: string | null;
    success: boolean;
    reset: () => void;
}

export function useSubmitProof(onSuccess?: () => void): UseSubmitProofReturn {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const reset = useCallback(() => {
        setError(null);
        setSuccess(false);
    }, []);

    const submit = useCallback(
        async (input: CreateViewProofInput) => {
            setLoading(true);
            setError(null);
            setSuccess(false);
            try {
                await submitProof(input);
                setSuccess(true);
                onSuccess?.();
            } catch (e) {
                setError(e instanceof Error ? e.message : "Failed to submit proof");
            } finally {
                setLoading(false);
            }
        },
        [onSuccess],
    );

    return { submit, loading, error, success, reset };
}

// ─── useReviewProof ───────────────────────────────────────────────────────────

interface UseReviewProofReturn {
    review: (proofId: string, input: ReviewProofInput) => Promise<void>;
    loading: boolean;
    error: string | null;
}

export function useReviewProof(onSuccess?: () => void): UseReviewProofReturn {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const review = useCallback(
        async (proofId: string, input: ReviewProofInput) => {
            setLoading(true);
            setError(null);
            try {
                await reviewProof(proofId, input);
                onSuccess?.();
            } catch (e) {
                setError(e instanceof Error ? e.message : "Failed to review proof");
            } finally {
                setLoading(false);
            }
        },
        [onSuccess],
    );

    return { review, loading, error };
}
