"use client";

import { Card as AntCard } from "antd";
import type { CardProps as AntCardProps } from "antd";
import { cn } from "@/lib/utils/cn";

interface CardProps extends Omit<AntCardProps, "variant"> {
  variant?: "standard" | "glass" | "elevated" | "glow";
}

export default function Card({
  variant = "standard",
  className,
  children,
  ...props
}: CardProps) {
  const variantClasses = {
    standard:
      "bg-ds-surface-elevated border-ds-border-base shadow-ds-md rounded-ds-xl",
    glass: "glass-surface rounded-ds-xl",
    elevated:
      "bg-ds-surface-elevated border-ds-border-base shadow-ds-lg rounded-ds-xl",
    glow: "bg-ds-surface-elevated border-ds-border-base shadow-ds-md rounded-ds-xl glow-border-strong",
  };

  return (
    <AntCard
      className={cn(
        "overflow-hidden transition-all duration-150",
        variantClasses[variant],
        className,
      )}
      {...props}>
      {children}
    </AntCard>
  );
}
