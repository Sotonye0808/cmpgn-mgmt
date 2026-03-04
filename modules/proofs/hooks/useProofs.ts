"use client";

import { useState, useEffect, useCallback } from "react";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import {
    fetchProofs,
    submitProof,
    reviewProof,
    batchReviewProofs,
    type ReviewProofInput,
    type BatchReviewInput,
    type BatchReviewResult,
} from "../services/proofService";

// ─── useProofs ────────────────────────────────────────────────────────────────
// Fetches proofs for the current user (or all proofs for admin).
// Optionally scoped to a single campaign or "team" scope for team leads.

interface UseProofsReturn {
    proofs: ViewProof[];
    loading: boolean;
    error: string | null;
    refresh: () => void;
}

export function useProofs(campaignId?: string, scope?: "team"): UseProofsReturn {
    const [proofs, setProofs] = useState<ViewProof[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchProofs(campaignId, scope);
            setProofs(data);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to load proofs");
        } finally {
            setLoading(false);
        }
    }, [campaignId, scope]);

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
    review: (proofId: string, input: ReviewProofInput) => Promise<boolean>;
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
                return true;
            } catch (e) {
                setError(e instanceof Error ? e.message : "Failed to review proof");
                return false;
            } finally {
                setLoading(false);
            }
        },
        [onSuccess],
    );

    return { review, loading, error };
}

// ─── useBatchReviewProof ──────────────────────────────────────────────────────

interface UseBatchReviewProofReturn {
    batchReview: (input: BatchReviewInput) => Promise<BatchReviewResult | undefined>;
    loading: boolean;
    error: string | null;
}

export function useBatchReviewProof(onSuccess?: () => void): UseBatchReviewProofReturn {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const batchReview = useCallback(
        async (input: BatchReviewInput): Promise<BatchReviewResult | undefined> => {
            setLoading(true);
            setError(null);
            try {
                const result = await batchReviewProofs(input);
                onSuccess?.();
                return result;
            } catch (e) {
                setError(e instanceof Error ? e.message : "Failed to batch review proofs");
                return undefined;
            } finally {
                setLoading(false);
            }
        },
        [onSuccess],
    );

    return { batchReview, loading, error };
}
