"use client";

import { Avatar, Skeleton } from "antd";
import Link from "next/link";
import { DONATION_PAGE_CONTENT } from "@/config/content";
import { ROUTES } from "@/config/routes";

interface Donor {
  userId: string;
  firstName: string;
  lastName: string;
  total: number;
}

interface Props {
  donors: Donor[];
  loading?: boolean;
  currency?: string;
}

function formatCurrency(amount: number, currency = "NGN"): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

const MEDALS = ["🥇", "🥈", "🥉"];

export default function TopDonors({
  donors,
  loading = false,
  currency = "NGN",
}: Props) {
  if (loading) return <Skeleton active paragraph={{ rows: 5 }} />;
  if (!donors.length) return null;

  return (
    <div className="bg-ds-surface-elevated border border-ds-border-base rounded-ds-xl p-6">
      <h3 className="font-semibold text-ds-text-primary text-lg mb-4">
        {DONATION_PAGE_CONTENT.topDonorsTitle}
      </h3>
      <div className="space-y-3">
        {donors.map((donor, idx) => (
          <div
            key={donor.userId}
            className="flex items-center gap-3 p-3 rounded-ds-lg bg-ds-surface-elevated hover:glow-border transition-all">
            <span className="text-lg w-6 text-center">
              {MEDALS[idx] ?? `#${idx + 1}`}
            </span>
            <Avatar
              size="small"
              className="bg-ds-brand-accent text-white shrink-0">
              {donor.firstName.charAt(0)}
            </Avatar>
            <Link
              href={ROUTES.USER_DETAIL(donor.userId)}
              className="flex-1 text-sm font-medium text-ds-text-primary hover:text-ds-brand-accent transition-colors truncate">
              {donor.firstName} {donor.lastName}
            </Link>
            <span className="font-semibold text-ds-brand-accent font-ds-mono text-sm">
              {formatCurrency(donor.total, currency)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
