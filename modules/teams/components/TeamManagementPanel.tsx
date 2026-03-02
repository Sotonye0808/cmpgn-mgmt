"use client";

import { useState, useEffect } from "react";
import { Button, Modal, Form, Input, Select, message, Empty } from "antd";
import { ICONS } from "@/config/icons";
import TeamCard from "./TeamCard";
import TeamMemberStatsTable from "./TeamMemberStatsTable";
import type { TeamMemberStat } from "../services/teamService";

interface Props {
  teams: Team[];
  groups: Group[];
  onRefresh: () => void;
}

export default function TeamManagementPanel({
  teams,
  groups,
  onRefresh,
}: Props) {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailTeamId, setDetailTeamId] = useState<string | null>(null);
  const [detailStats, setDetailStats] = useState<TeamMemberStat[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // Fetch member stats when a team is selected
  useEffect(() => {
    if (!detailTeamId) return;
    setDetailLoading(true);
    window
      .fetch(`/api/teams/${detailTeamId}/stats`)
      .then((r) => r.json())
      .then((json) => {
        if (json.data) setDetailStats(json.data as TeamMemberStat[]);
      })
      .catch(() => message.error("Failed to load team stats"))
      .finally(() => setDetailLoading(false));
  }, [detailTeamId]);

  const handleCreateTeam = async (values: {
    name: string;
    groupId: string;
  }) => {
    setLoading(true);
    try {
      const res = await window.fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (json.success) {
        message.success("Team created");
        setCreateModalOpen(false);
        form.resetFields();
        onRefresh();
      } else {
        message.error(json.error ?? "Failed to create team");
      }
    } catch {
      message.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (teamId: string, userId: string) => {
    try {
      const res = await window.fetch(
        `/api/teams/${teamId}/members?userId=${userId}`,
        { method: "DELETE" },
      );
      const json = await res.json();
      if (json.success) {
        message.success("Member removed");
        // Refresh detail
        setDetailTeamId(null);
        onRefresh();
      } else {
        message.error(json.error ?? "Failed to remove member");
      }
    } catch {
      message.error("Network error");
    }
  };

  const groupOptions = groups.map((g) => ({
    value: g.id,
    label: `${g.name} (${g.teamIds.length}/${g.maxTeams} teams)`,
    disabled: g.teamIds.length >= g.maxTeams,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-ds-text-primary">
          All Teams
        </h2>
        <Button
          type="primary"
          icon={<ICONS.add />}
          onClick={() => setCreateModalOpen(true)}>
          Create Team
        </Button>
      </div>

      {teams.length === 0 ? (
        <Empty description="No teams yet" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => {
            const group = groups.find((g) => g.teamIds.includes(team.id));
            return (
              <TeamCard
                key={team.id}
                team={team}
                groupName={group?.name}
                onViewDetails={setDetailTeamId}
              />
            );
          })}
        </div>
      )}

      {/* Create Team Modal */}
      <Modal
        title="Create Team"
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        footer={null}
        destroyOnClose>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateTeam}
          className="mt-4">
          <Form.Item
            name="name"
            label="Team Name"
            rules={[
              { required: true, message: "Required" },
              { min: 2, message: "Min 2 chars" },
            ]}>
            <Input placeholder="e.g. WhatsApp Warriors" />
          </Form.Item>
          <Form.Item
            name="groupId"
            label="Group"
            rules={[{ required: true, message: "Required" }]}>
            <Select placeholder="Select group" options={groupOptions} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Create Team
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Team Detail Modal */}
      <Modal
        title={teams.find((t) => t.id === detailTeamId)?.name ?? "Team Details"}
        open={!!detailTeamId}
        onCancel={() => {
          setDetailTeamId(null);
          setDetailStats([]);
        }}
        footer={null}
        width={600}>
        {detailTeamId && (
          <TeamMemberStatsTable
            stats={detailStats}
            loading={detailLoading}
            onRemove={(userId) => handleRemoveMember(detailTeamId, userId)}
          />
        )}
      </Modal>
    </div>
  );
}
