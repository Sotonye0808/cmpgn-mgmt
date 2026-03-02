"use client";

import { Avatar } from "antd";
import Link from "next/link";
import { formatNumber } from "@/lib/utils/format";
import { RANK_LEVELS } from "@/config/ranks";
import { cn } from "@/lib/utils/cn";
import { ROUTES } from "@/config/routes";

interface LeaderboardPodiumProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
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
    glow: "shadow-ds-border-strong/40",
    bg: "from-ds-surface-sunken to-ds-surface-base",
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
    glow: "shadow-ds-chart-4/30",
    bg: "from-ds-chart-4/15 to-ds-chart-4/10",
  },
];

export default function LeaderboardPodium({
  entries,
  currentUserId,
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
                  position === 1 ? "ring-yellow-400" : "ring-ds-border-strong",
                )}>
                {entry.firstName[0]}
              </Avatar>
              <div className="text-center">
                <Link
                  href={entry.userId === currentUserId ? ROUTES.SETTINGS : ROUTES.USER_DETAIL(entry.userId)}
                  className="text-sm font-semibold text-ds-text-primary hover:text-ds-brand-accent transition-colors leading-tight">
                  {entry.firstName}
                </Link>
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
