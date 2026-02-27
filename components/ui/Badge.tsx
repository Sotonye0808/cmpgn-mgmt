"use client";

import { Badge as AntBadge } from "antd";
import type { BadgeProps as AntBadgeProps } from "antd";

type BadgeProps = AntBadgeProps;

export default function Badge(props: BadgeProps) {
  return <AntBadge {...props} />;
}
