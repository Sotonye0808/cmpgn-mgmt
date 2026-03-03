// Smart Links module barrel — client-safe exports only
// Services are imported directly from @/modules/links/services/linkService by API routes
export { default as SmartLinkCard, SmartLinkEmpty } from "./components/SmartLinkCard";
export { default as SmartLinkStats } from "./components/SmartLinkStats";
export { useSmartLink } from "./hooks/useSmartLink";
