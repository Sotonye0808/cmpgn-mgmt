"use client";

import { useEffect, useState } from "react";
import { Card, Tabs, Badge, Skeleton, Tag } from "antd";
import Link from "next/link";
import { ROUTES } from "@/config/routes";
import { ICONS } from "@/config/icons";
import { useAuth } from "@/hooks/useAuth";
import StatusBadge from "@/components/ui/StatusBadge";

interface MyCampaignsResult {
  joined: Campaign[];
  created: Campaign[];
}

// ─── Compact campaign row for the "my campaigns" panel ───────────────────────
function CampaignRow({ campaign, tag }: { campaign: Campaign; tag?: string }) {
  return (
    <Link
      href={ROUTES.CAMPAIGN_DETAIL(campaign.id)}
      className="flex items-center gap-3 px-3 py-2.5 rounded-ds-lg hover:bg-ds-brand-accent-subtle transition-colors group no-underline">
      <div className="w-9 h-9 rounded-ds-md overflow-hidden bg-ds-surface-sunken shrink-0 flex items-center justify-center">
        {campaign.mediaUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={campaign.mediaUrl}
            alt={campaign.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <ICONS.campaigns className="text-ds-text-muted text-sm" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ds-text-primary group-hover:text-ds-brand-accent transition-colors truncate leading-tight">
          {campaign.title}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <StatusBadge status={campaign.status as string} />
          {tag && (
            <Tag color="blue" className="text-xs !m-0 !px-1 !py-0 !leading-4">
              {tag}
            </Tag>
          )}
        </div>
      </div>
      <ICONS.arrowRight className="text-ds-text-muted text-xs group-hover:text-ds-brand-accent transition-colors shrink-0" />
    </Link>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function MyCampaignsEmpty({ message }: { message: string }) {
  return (
    <div className="py-6 text-center text-ds-text-subtle text-sm">
      {message}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function MyCampaignsPanel() {
  const { user } = useAuth();
  const [data, setData] = useState<MyCampaignsResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch(ROUTES.API.CAMPAIGNS.ME)
      .then((r) => r.json())
      .then((json) => setData(json.data ?? null))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return null;

  const joined = data?.joined ?? [];
  const created = data?.created ?? [];

  const hasCreated = created.length > 0;

  const tabItems = [
    {
      key: "joined",
      label: (
        <span className="flex items-center gap-1.5">
          <ICONS.check className="text-xs" />
          Joined
          {joined.length > 0 && (
            <Badge
              count={joined.length}
              color="var(--ds-brand-accent)"
              size="small"
            />
          )}
        </span>
      ),
      children: loading ? (
        <Skeleton active paragraph={{ rows: 3 }} />
      ) : joined.length === 0 ? (
        <MyCampaignsEmpty message="You haven't joined any campaigns yet." />
      ) : (
        <div className="space-y-0.5">
          {joined.map((c) => (
            <CampaignRow key={c.id} campaign={c} />
          ))}
        </div>
      ),
    },
    ...(hasCreated
      ? [
          {
            key: "created",
            label: (
              <span className="flex items-center gap-1.5">
                <ICONS.add className="text-xs" />
                Created
                <Badge
                  count={created.length}
                  color="var(--ds-brand-accent)"
                  size="small"
                />
              </span>
            ),
            children: (
              <div className="space-y-0.5">
                {created.map((c) => (
                  <CampaignRow key={c.id} campaign={c} tag="Creator" />
                ))}
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <Card
      title={
        <span className="flex items-center gap-2 text-ds-text-primary">
          <ICONS.star className="text-ds-brand-accent" />
          My Campaigns
        </span>
      }
      size="small"
      className="bg-ds-surface-elevated border-ds-border-subtle rounded-ds-xl"
      extra={
        <Link
          href={ROUTES.CAMPAIGNS}
          className="text-xs text-ds-text-subtle hover:text-ds-brand-accent transition-colors">
          View all
        </Link>
      }>
      <Tabs
        items={tabItems}
        size="small"
        className="[&_.ant-tabs-nav]:mb-2"
        defaultActiveKey="joined"
      />
    </Card>
  );
}
