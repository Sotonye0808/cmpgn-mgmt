"use client";

import { Avatar } from "antd";
import { formatNumber } from "@/lib/utils/format";
import { RANK_LEVELS } from "@/config/ranks";
import { cn } from "@/lib/utils/cn";

interface LeaderboardPodiumProps {
  entries: LeaderboardEntry[];
  className?: string;
}

const getRankLevel = (score: number): RankLevel =>
  [...RANK_LEVELS]
    .sort((a, b) => b.minScore - a.minScore)
    .find((r) => score >= r.minScore) ?? RANK_LEVELS[0];

const PODIUM_CONFIG = [
  {
    position: 2,
    height: "h-20",
    medal: "🥈",
    glow: "shadow-gray-400/30",
    bg: "from-gray-500/20 to-gray-600/10",
  },
  {
    position: 1,
    height: "h-28",
    medal: "🥇",
    glow: "shadow-yellow-400/40",
    bg: "from-yellow-500/20 to-amber-600/10",
  },
  {
    position: 3,
    height: "h-16",
    medal: "🥉",
    glow: "shadow-orange-400/30",
    bg: "from-orange-500/15 to-orange-600/10",
  },
];

export default function LeaderboardPodium({
  entries,
  className,
}: LeaderboardPodiumProps) {
  if (entries.length < 3) return null;

  // Arrange: 2nd, 1st, 3rd
  const ordered = PODIUM_CONFIG.map((cfg) => ({
    ...cfg,
    entry: entries.find((e) => e.rank === cfg.position),
  }));

  return (
    <div className={cn("flex items-end justify-center gap-4 py-4", className)}>
      {ordered.map(({ position, height, medal, glow, bg, entry }) => {
        if (!entry) return null;
        const rankLevel = getRankLevel(entry.score);
        return (
          <div key={position} className="flex flex-col items-center gap-3">
            {/* User info */}
            <div className="flex flex-col items-center gap-1.5">
              <Avatar
                src={entry.profilePicture}
                size={position === 1 ? 64 : 48}
                className={cn(
                  "ring-2",
                  position === 1 ? "ring-yellow-400" : "ring-gray-400",
                )}>
                {entry.firstName[0]}
              </Avatar>
              <div className="text-center">
                <p className="text-sm font-semibold text-ds-text-primary leading-tight">
                  {entry.firstName}
                </p>
                <p className="text-xs text-ds-text-subtle">
                  {rankLevel.badge} {rankLevel.name}
                </p>
                <p className="text-sm font-bold font-ds-mono text-ds-brand-accent mt-0.5">
                  {formatNumber(entry.score)}
                </p>
              </div>
            </div>

            {/* Podium block */}
            <div
              className={cn(
                "w-24 flex flex-col items-center justify-start pt-3 rounded-t-ds-lg",
                `bg-gradient-to-b ${bg}`,
                `shadow-lg ${glow}`,
                "border border-ds-border-base",
                height,
              )}>
              <span className="text-2xl">{medal}</span>
              <span className="text-xs font-bold text-ds-text-subtle mt-1">
                #{position}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
