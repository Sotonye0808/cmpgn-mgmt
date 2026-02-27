"use client";

import { Tag as AntTag } from "antd";
import type { TagProps as AntTagProps } from "antd";
import { cn } from "@/lib/utils/cn";

type TagProps = AntTagProps;

export default function Tag({ className, ...props }: TagProps) {
  return (
    <AntTag
      className={cn("rounded-ds-sm text-xs font-medium", className)}
      {...props}
    />
  );
}
