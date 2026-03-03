// Services
export { submitProof, fetchProofs, reviewProof } from "./services/proofService";

// Hooks
export { useProofs, useSubmitProof, useReviewProof } from "./hooks/useProofs";

// Components
export { default as ProofCard } from "./components/ProofCard";
export { default as ProofList, ProofStatusFilter } from "./components/ProofList";
export { default as SubmitProofModal } from "./components/SubmitProofModal";
export { default as ProofReviewPanel } from "./components/ProofReviewPanel";

// Config
export {
    PROOF_STATUS_CONFIG,
    PROOF_PLATFORM_OPTIONS,
    PROOFS_PAGE_SECTIONS,
    PROOFS_PAGE_CONTENT,
} from "./config";
