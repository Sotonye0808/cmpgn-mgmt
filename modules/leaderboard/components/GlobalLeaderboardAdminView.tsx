"use client";

import { useState } from "react";
import { Button, Card, Alert, Typography, Space, Divider, Tag } from "antd";
import { ICONS } from "@/config/icons";
import { ROUTES } from "@/config/routes";

const { Text, Title } = Typography;

interface Props {
  campaignId?: string;
  snapshotCount?: number;
  latestPeriod?: string;
  snapshotAgeMins?: number;
}

export default function GlobalLeaderboardAdminView({
  campaignId,
  snapshotCount = 0,
  latestPeriod,
  snapshotAgeMins,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleRefresh() {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const body = campaignId ? { campaignId } : {};
      const res = await fetch(ROUTES.API.LEADERBOARD.SNAPSHOT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Snapshot refresh failed.");
      setSuccess(`Snapshot refreshed at ${new Date().toLocaleTimeString()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Snapshot refresh failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card
      className="glass-surface"
      bordered={false}
      title={
        <Space>
          <ICONS.leaderboard className="text-ds-brand-accent" />
          <Title level={5} style={{ margin: 0 }}>
            {campaignId
              ? "Campaign Leaderboard Admin"
              : "Global Leaderboard Admin"}
          </Title>
        </Space>
      }
      extra={
        <Button
          type="primary"
          icon={<ICONS.refresh />}
          loading={loading}
          onClick={handleRefresh}>
          Refresh Snapshot
        </Button>
      }>
      {error && (
        <Alert
          type="error"
          message={error}
          closable
          onClose={() => setError(null)}
          className="mb-4"
        />
      )}
      {success && (
        <Alert
          type="success"
          message={success}
          closable
          onClose={() => setSuccess(null)}
          className="mb-4"
        />
      )}

      <Space size="large" wrap>
        <Space>
          <ICONS.analytics className="text-ds-text-subtle" />
          <Text type="secondary">Snapshot Records:</Text>
          <Tag>{snapshotCount}</Tag>
        </Space>
        <Space>
          <ICONS.clock className="text-ds-text-subtle" />
          <Text type="secondary">Snapshot Age:</Text>
          <Tag
            color={
              snapshotAgeMins !== undefined && snapshotAgeMins < 60
                ? "green"
                : "orange"
            }>
            {snapshotAgeMins !== undefined
              ? `${snapshotAgeMins} min ago`
              : "No snapshot yet"}
          </Tag>
        </Space>
        <Space>
          <ICONS.calendar className="text-ds-text-subtle" />
          <Text type="secondary">Latest Period:</Text>
          <Tag>{latestPeriod ?? "—"}</Tag>
        </Space>
      </Space>

      <Divider />

      <Text type="secondary" className="text-xs">
        Refreshing a snapshot recomputes all ranks from live data and stores a
        point-in-time record. The leaderboard cache is invalidated
        automatically.
        {campaignId
          ? ` Scoped to campaign ${campaignId}.`
          : " Applies to the global all-time leaderboard."}
      </Text>
    </Card>
  );
}
