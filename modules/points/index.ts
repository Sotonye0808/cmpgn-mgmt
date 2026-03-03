// Points module — client-safe exports only
// Services are imported directly from @/modules/points/services/pointsService by API routes
export { usePoints } from "./hooks/usePoints";
export { default as PointsSummaryCard } from "./components/PointsSummaryCard";
export { default as RankBadge } from "./components/RankBadge";
export { default as RankProgressBar } from "./components/RankProgress";
