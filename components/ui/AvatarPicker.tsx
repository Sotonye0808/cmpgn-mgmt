"use client";

import { useState } from "react";
import { Avatar, Input, Segmented, Button } from "antd";
import {
    CURATED_AVATARS,
    AVATAR_CATEGORIES,
    buildCustomAvatarUrl,
    type AvatarOption,
} from "@/config/avatars";
import { cn } from "@/lib/utils/cn";

interface Props {
    value?: string;
    onChange?: (url: string) => void;
    className?: string;
}

export default function AvatarPicker({ value, onChange, className }: Props) {
    const [category, setCategory] = useState<string>("warrior");
    const [customSeed, setCustomSeed] = useState("");
    const [mode, setMode] = useState<"curated" | "custom">("curated");

    const filteredAvatars = CURATED_AVATARS.filter(
        (a) => a.category === category
    );

    const handleSelect = (url: string) => {
        onChange?.(url);
    };

    const handleCustomBuild = () => {
        if (!customSeed.trim()) return;
        const url = buildCustomAvatarUrl(customSeed.trim());
        onChange?.(url);
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

                    {/* Grid of avatars */}
                    <div className="grid grid-cols-4 gap-3">
                        {filteredAvatars.map((avatar) => (
                            <button
                                key={avatar.id}
                                type="button"
                                title={avatar.label}
                                onClick={() => handleSelect(avatar.url)}
                                className={cn(
                                    "flex flex-col items-center gap-1.5 p-3 rounded-ds-lg transition-all",
                                    "hover:bg-ds-surface-elevated cursor-pointer",
                                    value === avatar.url &&
                                        "ring-2 ring-ds-brand-accent bg-ds-surface-elevated"
                                )}
                            >
                                <Avatar
                                    src={avatar.url}
                                    size={56}
                                    className="border border-ds-border-default"
                                />
                                <span className="text-xs text-ds-text-subtle truncate w-full text-center">
                                    {avatar.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </>
            ) : (
                /* Custom builder */
                <div className="space-y-3">
                    <p className="text-xs text-ds-text-subtle">
                        Enter any word or name to generate a unique avatar
                    </p>
                    <div className="flex gap-2">
                        <Input
                            placeholder="e.g. my-unique-avatar"
                            value={customSeed}
                            onChange={(e) => setCustomSeed(e.target.value)}
                            onPressEnter={handleCustomBuild}
                        />
                        <Button type="primary" onClick={handleCustomBuild}>
                            Generate
                        </Button>
                    </div>
                    {customSeed && (
                        <div className="flex justify-center">
                            <Avatar
                                src={buildCustomAvatarUrl(customSeed)}
                                size={80}
                                className="border-2 border-ds-brand-accent"
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Current selection preview */}
            {value && (
                <div className="flex items-center gap-3 pt-2 border-t border-ds-border-subtle">
                    <Avatar src={value} size={48} />
                    <span className="text-sm text-ds-text-secondary">
                        Selected avatar
                    </span>
                </div>
            )}
        </div>
    );
}
