"use client";

import { Skeleton as AntSkeleton } from "antd";
import type { SkeletonProps as AntSkeletonProps } from "antd";

type SkeletonProps = AntSkeletonProps;

export default function Skeleton({ active = true, ...props }: SkeletonProps) {
  return <AntSkeleton active={active} {...props} />;
}

export function SkeletonCard() {
  return (
    <div className="bg-ds-surface-elevated rounded-ds-xl p-6 border border-ds-border-base">
      <AntSkeleton active avatar paragraph={{ rows: 3 }} />
    </div>
  );
}
