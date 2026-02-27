"use client";

import { Tag, Tooltip } from "antd";
import { ICONS } from "@/config/icons";
import { TRUST_PAGE_CONTENT } from "@/config/content";

interface Props {
  score: number;
  flags?: TrustFlag[];
  compact?: boolean;
}

// Using AntD semantic aliases so ConfigProvider darkAlgorithm/defaultAlgorithm
// handles contrast automatically — no hardcoded hex that bypasses theme context.
function scoreColor(score: number): string {
  if (score >= 80) return "success";
  if (score >= 50) return "warning";
  return "error";
}

function scoreLabel(score: number): string {
  if (score >= 80) return "Trusted";
  if (score >= 50) return "Caution";
  return "Flagged";
}

export default function TrustScoreIndicator({
  score,
  flags = [],
  compact = false,
}: Props) {
  const color = scoreColor(score);
  const label = scoreLabel(score);
  const ShieldIcon = ICONS.trust;

  if (compact) {
    return (
      <Tooltip title={`Trust score: ${score} — ${label}`}>
        <Tag color={color} icon={<ShieldIcon />} style={{ cursor: "default" }}>
          {score}
        </Tag>
      </Tooltip>
    );
  }

  return (
    <div
      className="glass-surface rounded-ds-xl p-4"
      style={{ "--_dc": color } as React.CSSProperties}>
      <div className="flex items-center gap-2 mb-3">
        <ShieldIcon className="text-xl text-dynamic" />
        <span className="font-semibold text-ds-text-primary">
          {TRUST_PAGE_CONTENT.scoreLabel}
        </span>
      </div>

      <div className="text-4xl font-extrabold font-ds-mono mb-1 text-dynamic">
        {score}
        <span className="text-base text-ds-text-subtle font-normal ml-1">
          / 100
        </span>
      </div>
      <div className="text-sm mb-4 text-dynamic">{label}</div>

      {flags.length > 0 ? (
        <div className="space-y-1">
          <div className="text-xs text-ds-text-subtle mb-2">
            {TRUST_PAGE_CONTENT.flagsLabel}
          </div>
          {(flags as unknown as string[]).map((flag) => (
            <Tooltip
              key={flag}
              title={
                TRUST_PAGE_CONTENT.flagDescriptions[
                  flag as keyof typeof TRUST_PAGE_CONTENT.flagDescriptions
                ] ?? flag
              }>
              <Tag color="red" className="text-xs">
                {flag.replace(/_/g, " ")}
              </Tag>
            </Tooltip>
          ))}
        </div>
      ) : (
        <div className="text-sm text-ds-text-subtle">
          {TRUST_PAGE_CONTENT.noFlags}
        </div>
      )}
    </div>
  );
}
