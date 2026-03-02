"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Skeleton,
  Tag,
  Tabs,
  Avatar,
  Descriptions,
  Empty,
  Button,
  Image,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import DataTable from "@/components/ui/DataTable";
import PageHeader from "@/components/ui/PageHeader";
import GlassCard from "@/components/ui/GlassCard";
import { ICONS } from "@/config/icons";
import { ROUTES } from "@/config/routes";
import { useAuth } from "@/hooks/useAuth";
import { DONATION_STATUS_CONFIG } from "@/config/bankAccounts";
import { formatDate } from "@/lib/utils/format";

const ROLE_COLORS: Record<string, string> = {
  USER: "default",
  TEAM_LEAD: "blue",
  ADMIN: "purple",
  SUPER_ADMIN: "gold",
};

function formatCurrency(amount: number, currency = "NGN"): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<UserProfileView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(ROUTES.API.USERS.PROFILE(id));
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        setError(json?.error ?? "Failed to load profile");
        return;
      }
      const json = await res.json();
      setProfile(json.data ?? null);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (!authUser) {
    return (
      <Empty
        description="You must be signed in to view profiles."
        className="py-24"
      />
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton active paragraph={{ rows: 1 }} />
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="space-y-6">
        <Button onClick={() => router.push(ROUTES.USERS)} icon={<ICONS.left />}>
          Back to Users
        </Button>
        <Empty description={error ?? "Profile not found"} className="py-24" />
      </div>
    );
  }

  const { user, analytics, donations, participations, referrals, team, group, trustScore } =
    profile;
  const userRole = user.role as unknown as string;

  // KPI strip data
  const kpiItems = [
    {
      label: "Total Points",
      value: analytics.points.total.toLocaleString(),
    },
    {
      label: "Rank",
      value: analytics.rank.currentRank.name,
    },
    {
      label: "Links Shared",
      value: analytics.engagement.shares.toLocaleString(),
    },
    {
      label: "Donations",
      value: formatCurrency(analytics.donations.total),
    },
    {
      label: "Referrals Given",
      value: referrals.given.toString(),
    },
    {
      label: "Trust Score",
      value: (trustScore?.score ?? user.trustScore).toFixed(0),
    },
  ];

  // Donation table columns
  const donationColumns: ColumnsType<Donation> = [
    {
      title: "Reference",
      dataIndex: "reference",
      key: "reference",
      render: (ref: string) => (
        <span className="font-ds-mono text-xs text-ds-text-subtle">{ref}</span>
      ),
    },
    {
      title: "Amount",
      key: "amount",
      render: (_, rec) => (
        <span className="font-semibold text-ds-text-primary font-ds-mono">
          {formatCurrency(rec.amount, rec.currency)}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const cfg = DONATION_STATUS_CONFIG[status];
        return (
          <Tag color={cfg?.color ?? "default"}>{cfg?.label ?? status}</Tag>
        );
      },
    },
    {
      title: "Campaign",
      dataIndex: "campaignId",
      key: "campaign",
      render: (cId: string) => {
        const campaign = participations.find(
          (p) => p.campaignId === cId
        );
        return (
          <span className="text-sm text-ds-text-primary">
            {campaign ? cId.slice(0, 8) : cId.slice(0, 8)}
          </span>
        );
      },
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "date",
      render: (d: string) => formatDate(d),
    },
    {
      title: "Proof",
      key: "proof",
      render: (_, rec) =>
        rec.proofScreenshotUrl ? (
          <Image
            src={rec.proofScreenshotUrl}
            alt="proof"
            width={40}
            height={40}
            className="rounded"
            preview={{ mask: <ICONS.view /> }}
          />
        ) : (
          <span className="text-xs text-ds-text-subtle">—</span>
        ),
    },
  ];

  // Participation table columns
  const participationColumns: ColumnsType<CampaignParticipation> = [
    {
      title: "Campaign",
      dataIndex: "campaignId",
      key: "campaignId",
      render: (cId: string) => (
        <span className="text-sm text-ds-text-primary">{cId}</span>
      ),
    },
    {
      title: "Joined",
      dataIndex: "joinedAt",
      key: "joinedAt",
      render: (d: string) => formatDate(d),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          onClick={() => router.push(ROUTES.USERS)}
          icon={<ICONS.left />}
          size="small"
        />
        <PageHeader
          title={`${user.firstName} ${user.lastName}`}
          subtitle={user.email}
        />
      </div>

      {/* Identity Card */}
      <GlassCard padding="lg">
        <div className="flex items-start gap-6">
          <Avatar
            src={user.profilePicture}
            size={80}
            className="bg-ds-brand-accent/20 text-ds-brand-accent shrink-0">
            {user.firstName[0]}
            {user.lastName[0]}
          </Avatar>
          <div className="flex-1">
            <Descriptions
              column={{ xs: 1, sm: 2, md: 3 }}
              size="small"
              className="[&_.ant-descriptions-item-label]:text-ds-text-subtle">
              <Descriptions.Item label="Role">
                <Tag color={ROLE_COLORS[userRole] ?? "default"}>
                  {userRole}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Joined">
                {formatDate(user.createdAt)}
              </Descriptions.Item>
              {user.whatsappNumber && (
                <Descriptions.Item label="WhatsApp">
                  <a
                    href={`https://wa.me/${user.whatsappNumber.replace("+", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[#25D366] hover:underline">
                    <ICONS.whatsapp className="text-xs" />
                    {user.whatsappNumber}
                  </a>
                </Descriptions.Item>
              )}
              {team && (
                <Descriptions.Item label="Team">
                  {team.name}
                </Descriptions.Item>
              )}
              {group && (
                <Descriptions.Item label="Group">
                  {group.name}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Trust Score">
                <span className="font-ds-mono font-semibold">
                  {(trustScore?.score ?? user.trustScore).toFixed(0)}
                </span>
              </Descriptions.Item>
              {trustScore?.flags && trustScore.flags.length > 0 && (
                <Descriptions.Item label="Flags">
                  {trustScore.flags.map((f: string) => (
                    <Tag key={f} color="red" className="mr-1">
                      {f}
                    </Tag>
                  ))}
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        </div>
      </GlassCard>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpiItems.map((item) => (
          <div
            key={item.label}
            className="glass-surface rounded-ds-xl p-4 text-center">
            <div className="text-xs text-ds-text-subtle mb-1">
              {item.label}
            </div>
            <div className="text-xl font-bold text-ds-text-primary font-ds-mono">
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs: Donations, Participations, Activity */}
      <Tabs
        defaultActiveKey="donations"
        items={[
          {
            key: "donations",
            label: (
              <span>
                <ICONS.dollar className="mr-1" />
                Donations ({donations.length})
              </span>
            ),
            children:
              donations.length === 0 ? (
                <Empty description="No donations" />
              ) : (
                <DataTable<Donation>
                  columns={donationColumns}
                  dataSource={donations}
                  rowKey="id"
                  size="small"
                  pagination={{ pageSize: 10 }}
                />
              ),
          },
          {
            key: "participations",
            label: (
              <span>
                <ICONS.campaigns className="mr-1" />
                Campaigns ({participations.length})
              </span>
            ),
            children:
              participations.length === 0 ? (
                <Empty description="No campaign participations" />
              ) : (
                <DataTable<CampaignParticipation>
                  columns={participationColumns}
                  dataSource={participations}
                  rowKey="id"
                  size="small"
                  pagination={{ pageSize: 10 }}
                />
              ),
          },
          {
            key: "referrals",
            label: (
              <span>
                <ICONS.share className="mr-1" />
                Referrals
              </span>
            ),
            children: (
              <div className="grid grid-cols-2 gap-4 max-w-md">
                <div className="bg-ds-surface-elevated rounded-ds-lg p-4 text-center">
                  <div className="text-xs text-ds-text-subtle mb-1">
                    Given
                  </div>
                  <div className="text-2xl font-bold text-ds-brand-accent font-ds-mono">
                    {referrals.given}
                  </div>
                </div>
                <div className="bg-ds-surface-elevated rounded-ds-lg p-4 text-center">
                  <div className="text-xs text-ds-text-subtle mb-1">
                    Received
                  </div>
                  <div className="text-2xl font-bold text-ds-success font-ds-mono">
                    {referrals.received}
                  </div>
                </div>
              </div>
            ),
          },
          {
            key: "streaks",
            label: (
              <span>
                <ICONS.fire className="mr-1" />
                Streaks
              </span>
            ),
            children: (
              <div className="grid grid-cols-2 gap-4 max-w-md">
                <div className="bg-ds-surface-elevated rounded-ds-lg p-4 text-center">
                  <div className="text-xs text-ds-text-subtle mb-1">
                    Daily Streak
                  </div>
                  <div className="text-2xl font-bold text-ds-brand-accent font-ds-mono">
                    {analytics.streaks.daily} days
                  </div>
                </div>
                <div className="bg-ds-surface-elevated rounded-ds-lg p-4 text-center">
                  <div className="text-xs text-ds-text-subtle mb-1">
                    Weekly Streak
                  </div>
                  <div className="text-2xl font-bold text-ds-success font-ds-mono">
                    {analytics.streaks.weekly} weeks
                  </div>
                </div>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
