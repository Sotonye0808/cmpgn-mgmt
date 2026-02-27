"use client";

import { Button as AntButton } from "antd";
import type { ButtonProps as AntButtonProps } from "antd";
import { cn } from "@/lib/utils/cn";

interface ButtonProps extends Omit<AntButtonProps, "type" | "variant"> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success";
  href?: string;
  target?: string;
}

export default function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonProps) {
  const variantClasses = {
    primary:
      "bg-ds-brand-accent hover:bg-ds-brand-accent-hover border-transparent text-white hover:glow-border",
    secondary:
      "bg-transparent border-ds-border-base text-ds-text-primary hover:glow-border",
    ghost:
      "bg-transparent border-transparent text-ds-text-secondary hover:text-ds-brand-accent",
    danger: "bg-ds-status-error border-transparent text-white hover:opacity-90",
    success:
      "bg-ds-brand-success border-transparent text-white hover:opacity-90",
  };

  return (
    <AntButton
      className={cn(
        "rounded-ds-lg font-medium transition-all duration-150",
        variantClasses[variant],
        className,
      )}
      {...props}>
      {children}
    </AntButton>
  );
}
