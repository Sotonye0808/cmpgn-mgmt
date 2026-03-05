"use client";

import { useState, useCallback, useMemo } from "react";
import { Avatar, Input, Segmented, Tooltip } from "antd";
import {
  CURATED_AVATARS,
  AVATAR_CATEGORIES,
  AVATAR_STYLES,
  AVATAR_STYLE_GROUPS,
  SEED_SUGGESTIONS,
  buildCustomAvatarUrl,
} from "@/config/avatars";
import { ICONS } from "@/config/icons";
import { cn } from "@/lib/utils/cn";

interface Props {
  /** Currently applied / staged URL */
  value?: string;
  /**
   * Fires on every selection change — live preview only.
   * The parent (Modal) decides when to commit.
   */
  onChange?: (url: string) => void;
  className?: string;
}

export default function AvatarPicker({ value, onChange, className }: Props) {
  const [category, setCategory] = useState<string>("warrior");
  const [mode, setMode] = useState<"curated" | "custom">("curated");

  // Custom builder state
  const [customSeed, setCustomSeed] = useState("");
  const [customStyle, setCustomStyle] = useState(AVATAR_STYLES[0].key);
  // Which style group is open in the custom builder
  const [expandedGroup, setExpandedGroup] = useState<string>("portrait");

  const filteredAvatars = useMemo(
    () => CURATED_AVATARS.filter((a) => a.category === category),
    [category],
  );

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
          {/* Category pills — 6 categories, wraps gracefully */}
          <div className="flex flex-wrap gap-1.5">
            {AVATAR_CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setCategory(cat.key)}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded-ds-full text-xs font-medium transition-all border",
                  category === cat.key
                    ? "border-ds-brand-accent bg-ds-brand-accent-subtle text-ds-brand-accent"
                    : "border-ds-border-base text-ds-text-subtle hover:border-ds-border-strong hover:text-ds-text-secondary",
                )}>
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Avatar grid — 5 columns, scrollable */}
          <div className="grid grid-cols-5 gap-2 max-h-[300px] overflow-y-auto scrollbar-hide pr-0.5">
            {filteredAvatars.map((avatar) => {
              const isSelected = value === avatar.url;
              return (
                <Tooltip key={avatar.id} title={avatar.label} placement="top">
                  <button
                    type="button"
                    onClick={() => handleSelect(avatar.url)}
                    className={cn(
                      "relative flex flex-col items-center gap-1 p-2 rounded-ds-lg transition-all",
                      "hover:bg-ds-surface-elevated cursor-pointer",
                      isSelected && "ring-2 ring-ds-brand-accent bg-ds-surface-elevated",
                    )}>
                    <Avatar
                      src={avatar.url}
                      size={52}
                      className="border border-ds-border-subtle"
                    />
                    {isSelected && (
                      <span className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center rounded-full bg-ds-brand-accent text-white text-[9px] leading-none">
                        ✓
                      </span>
                    )}
                    <span className="text-[10px] text-ds-text-subtle truncate w-full text-center leading-tight">
                      {avatar.label}
                    </span>
                  </button>
                </Tooltip>
              );
            })}
          </div>
        </>
      ) : (
        /* ── Custom Builder ──────────────────────────────────────────── */
        <div className="space-y-4">
          {/* Style picker — grouped with expand/collapse per group */}
          <div>
            <p className="text-xs font-medium text-ds-text-subtle mb-2 uppercase tracking-wide">
              Style
            </p>
            <div className="space-y-2 max-h-[280px] overflow-y-auto scrollbar-hide pr-0.5">
              {AVATAR_STYLE_GROUPS.map((group) => {
                const stylesInGroup = AVATAR_STYLES.filter(
                  (s) => s.group === group.key,
                );
                const isOpen = expandedGroup === group.key;
                return (
                  <div key={group.key}>
                    {/* Group header */}
                    <button
                      type="button"
                      onClick={() => setExpandedGroup(isOpen ? "" : group.key)}
                      className="w-full flex items-center justify-between px-2 py-1 rounded-ds-md text-xs font-semibold text-ds-text-secondary uppercase tracking-wide hover:bg-ds-surface-elevated hover:text-ds-brand-accent transition-colors">
                      <span>{group.label}</span>
                      <ICONS.arrowDown
                        className="text-xs"
                        style={{
                          display: "inline-block",
                          transform: isOpen ? "rotate(180deg)" : "none",
                          transition: "transform 0.2s",
                        }}
                      />
                    </button>

                    {isOpen && (
                      <div className="grid grid-cols-3 gap-2 mt-2 mb-1">
                        {stylesInGroup.map((style) => {
                          const previewUrl = buildCustomAvatarUrl(
                            customSeed.trim() || "preview-seed",
                            style.key,
                          );
                          const isActive = customStyle === style.key;
                          return (
                            <button
                              key={style.key}
                              type="button"
                              onClick={() => handleStyleChange(style.key)}
                              className={cn(
                                "flex flex-col items-center gap-1.5 p-2 rounded-ds-lg border transition-all",
                                isActive
                                  ? "border-ds-brand-accent bg-ds-brand-accent-subtle"
                                  : "border-ds-border-subtle hover:border-ds-border-base hover:bg-ds-surface-elevated",
                              )}>
                              <Avatar
                                src={previewUrl}
                                size={34}
                                className="border border-ds-border-subtle"
                              />
                              <div className="text-center">
                                <p className="text-xs font-medium text-ds-text-primary leading-tight">
                                  {style.label}
                                </p>
                                <p className="text-[9px] text-ds-text-subtle leading-tight">
                                  {style.description}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
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
              {SEED_SUGGESTIONS.slice(0, 6).map((s) => (
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
            <p className="text-xs font-medium text-ds-text-subtle">Current selection</p>
            <p className="text-[11px] text-ds-text-disabled truncate">{value}</p>
          </div>
        </div>
      )}
    </div>
  );
}
