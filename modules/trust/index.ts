// Trust module — client-safe exports only
// Services are imported directly from @/modules/trust/services/trustService by API routes
export { useTrustScore, useFlaggedUsers } from "./hooks/useTrust";
export { default as TrustScoreIndicator } from "./components/TrustScoreIndicator";
export { default as FlaggedUsersTable } from "./components/FlaggedUsersTable";
export { default as TrustReviewModal } from "./components/TrustReviewModal";
