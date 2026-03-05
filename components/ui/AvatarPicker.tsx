"use client";

import { useState, useCallback } from "react";
import { Avatar, Input, Segmented, Tooltip } from "antd";
import {
  CURATED_AVATARS,
  AVATAR_CATEGORIES,
  AVATAR_STYLES,
  SEED_SUGGESTIONS,
  buildCustomAvatarUrl,
} from "@/config/avatars";
import { ICONS } from "@/config/icons";
import { cn } from "@/lib/utils/cn";

interface Props {
  value?: string;
  onChange?: (url: string) => void;
  className?: string;
}

export default function AvatarPicker({ value, onChange, className }: Props) {
  const [category, setCategory] = useState<string>("warrior");
  const [mode, setMode] = useState<"curated" | "custom">("curated");

  // Custom builder state
  const [customSeed, setCustomSeed] = useState("");
  const [customStyle, setCustomStyle] = useState(AVATAR_STYLES[0].key);

  const filteredAvatars = CURATED_AVATARS.filter((a) => a.category === category);

  // Live custom preview URL — updates as user types
  const customPreviewUrl = customSeed.trim()
    ? buildCustomAvatarUrl(customSeed.trim(), customStyle)
    : null;

  const handleSelect = (url: string) => onChange?.(url);

  const handleCustomSeedChange = (seed: string) => {
    setCustomSeed(seed);
    // Auto-apply the live preview as the selection
    if (seed.trim()) {
      onChange?.(buildCustomAvatarUrl(seed.trim(), customStyle));
    }
  };

  const handleStyleChange = useCallback(
    (style: string) => {
      setCustomStyle(style);
      if (customSeed.trim()) {
        onChange?.(buildCustomAvatarUrl(customSeed.trim(), style));
      }
    },
    [customSeed, onChange],
  );

  const randomizeSeed = () => {
    const suggestion =
      SEED_SUGGESTIONS[Math.floor(Math.random() * SEED_SUGGESTIONS.length)];
    const suffix = Math.floor(Math.random() * 999);
    const seed = `${suggestion}-${suffix}`;
    setCustomSeed(seed);
    onChange?.(buildCustomAvatarUrl(seed, customStyle));
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Mode toggle */}
      <Segmented
        options={[
          { label: "Curated", value: "curated" },
          { label: "Custom Builder", value: "custom" },
        ]}
        value={mode}
        onChange={(v) => setMode(v as "curated" | "custom")}
        className="bg-ds-surface-elevated"
      />

      {mode === "curated" ? (
        <>
          {/* Category filter */}
          <Segmented
            options={AVATAR_CATEGORIES.map((c) => ({
              label: c.label,
              value: c.key,
            }))}
            value={category}
            onChange={(v) => setCategory(v as string)}
            size="small"
            className="bg-ds-surface-elevated"
          />

          {/* Avatar grid — 5 columns, 2 rows */}
          <div className="grid grid-cols-5 gap-2 max-h-[320px] overflow-y-auto scrollbar-hide pr-0.5">
            {filteredAvatars.map((avatar) => (
              <Tooltip key={avatar.id} title={avatar.label} placement="top">
                <button
                  type="button"
                  onClick={() => handleSelect(avatar.url)}
                  className={cn(
                    "flex flex-col items-center gap-1 p-2 rounded-ds-lg transition-all",
                    "hover:bg-ds-surface-elevated cursor-pointer",
                    value === avatar.url &&
                      "ring-2 ring-ds-brand-accent bg-ds-surface-elevated",
                  )}>
                  <Avatar
                    src={avatar.url}
                    size={52}
                    className="border border-ds-border-subtle"
                  />
                  <span className="text-[10px] text-ds-text-subtle truncate w-full text-center leading-tight">
                    {avatar.label}
                  </span>
                </button>
              </Tooltip>
            ))}
          </div>
        </>
      ) : (
        /* ── Custom Builder ──────────────────────────────────────────── */
        <div className="space-y-4">
          {/* Style picker */}
          <div>
            <p className="text-xs font-medium text-ds-text-subtle mb-2 uppercase tracking-wide">
              Style
            </p>
            <div className="grid grid-cols-3 gap-2">
              {AVATAR_STYLES.map((style) => {
                const previewUrl = buildCustomAvatarUrl(
                  customSeed.trim() || "preview-seed",
                  style.key,
                );
                return (
                  <button
                    key={style.key}
                    type="button"
                    onClick={() => handleStyleChange(style.key)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 p-2.5 rounded-ds-lg border transition-all",
                      customStyle === style.key
                        ? "border-ds-brand-accent bg-ds-brand-accent-subtle"
                        : "border-ds-border-subtle hover:border-ds-border-base hover:bg-ds-surface-elevated",
                    )}>
                    <Avatar
                      src={previewUrl}
                      size={36}
                      className="border border-ds-border-subtle"
                    />
                    <div className="text-center">
                      <p className="text-xs font-medium text-ds-text-primary leading-tight">
                        {style.label}
                      </p>
                      <p className="text-[10px] text-ds-text-subtle leading-tight">
                        {style.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Seed input with live preview */}
          <div>
            <p className="text-xs font-medium text-ds-text-subtle mb-2 uppercase tracking-wide">
              Seed — any word or name
            </p>
            <div className="flex gap-2">
              <Input
                prefix={<ICONS.user className="text-ds-text-subtle text-sm" />}
                placeholder="e.g. my-alias, deploy-master"
                value={customSeed}
                onChange={(e) => handleCustomSeedChange(e.target.value)}
                allowClear
              />
              <Tooltip title="Random seed">
                <button
                  type="button"
                  onClick={randomizeSeed}
                  className="shrink-0 w-9 h-9 flex items-center justify-center rounded-ds-lg border border-ds-border-base hover:border-ds-brand-accent hover:text-ds-brand-accent text-ds-text-subtle transition-all">
                  <ICONS.refresh className="text-sm" />
                </button>
              </Tooltip>
            </div>

            {/* Suggestion chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {SEED_SUGGESTIONS.slice(0, 5).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleCustomSeedChange(s)}
                  className="text-[11px] px-2 py-0.5 rounded-ds-full border border-ds-border-base text-ds-text-subtle hover:border-ds-brand-accent hover:text-ds-brand-accent transition-all">
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Live preview */}
          {customPreviewUrl && (
            <div className="flex items-center gap-4 p-3 rounded-ds-lg bg-ds-surface-elevated border border-ds-border-subtle">
              <Avatar
                src={customPreviewUrl}
                size={72}
                className="border-2 border-ds-brand-accent shrink-0"
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-ds-text-primary truncate">
                  {customSeed}
                </p>
                <p className="text-xs text-ds-text-subtle">
                  {AVATAR_STYLES.find((s) => s.key === customStyle)?.label} style
                </p>
                <p className="text-[11px] text-ds-brand-accent mt-0.5">
                  Live preview — updates as you type
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Current selection footer */}
      {value && (
        <div className="flex items-center gap-3 pt-3 border-t border-ds-border-subtle">
          <Avatar src={value} size={40} className="border border-ds-border-base shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-ds-text-subtle">Current selection</p>
            <p className="text-[11px] text-ds-text-disabled truncate">{value}</p>
          </div>
        </div>
      )}
    </div>
  );
}
