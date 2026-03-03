"use client";

import { useState } from "react";
import { Button, Modal, Form, Input, Empty, message, Tag } from "antd";
import { ICONS } from "@/config/icons";

interface Props {
    groups: Group[];
    teams: Team[];
    onRefresh: () => void;
}

export default function GroupManagementPanel({
    groups,
    teams,
    onRefresh,
}: Props) {

    const [createOpen, setCreateOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    const handleCreate = async (values: {
        name: string;
        description?: string;
    }) => {
        setLoading(true);
        try {
            const res = await window.fetch("/api/groups", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });
            const json = await res.json();
            if (json.success) {
                message.success("Group created");
                setCreateOpen(false);
                form.resetFields();
                onRefresh();
            } else {
                message.error(json.error ?? "Failed to create group");
            }
        } catch {
            message.error("Network error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-ds-text-primary">
                    All Groups
                </h2>
                <Button
                    type="primary"
                    icon={<ICONS.add />}
                    onClick={() => setCreateOpen(true)}
                >
                    Create Group
                </Button>
            </div>

            {groups.length === 0 ? (
                <Empty description="No groups yet" />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {groups.map((group) => {
                        const groupTeams = teams.filter((t) =>
                            group.teamIds.includes(t.id)
                        );
                        const totalMembers = groupTeams.reduce(
                            (acc, t) => acc + t.memberIds.length,
                            0
                        );
                        return (
                            <div
                                key={group.id}
                                className="glass-surface rounded-ds-xl p-5"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="text-base font-semibold text-ds-text-primary">
                                            {group.name}
                                        </h3>
                                        {group.description && (
                                            <p className="text-xs text-ds-text-subtle mt-0.5">
                                                {group.description}
                                            </p>
                                        )}
                                    </div>
                                    <Tag color="blue">
                                        {group.teamIds.length}/{group.maxTeams} teams
                                    </Tag>
                                </div>

                                <div className="flex gap-4 text-xs text-ds-text-secondary">
                                    <span>
                                        <ICONS.team className="mr-1" />
                                        {groupTeams.length} teams
                                    </span>
                                    <span>
                                        <ICONS.user className="mr-1" />
                                        {totalMembers} members
                                    </span>
                                </div>

                                {groupTeams.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-1">
                                        {groupTeams.map((t) => (
                                            <Tag key={t.id} className="text-xs">
                                                {t.name}
                                            </Tag>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            <Modal
                title="Create Group"
                open={createOpen}
                onCancel={() => setCreateOpen(false)}
                footer={null}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleCreate}
                    className="mt-4"
                >
                    <Form.Item
                        name="name"
                        label="Group Name"
                        rules={[
                            { required: true, message: "Required" },
                            { min: 2, message: "Min 2 chars" },
                        ]}
                    >
                        <Input placeholder="e.g. Alpha Division" />
                    </Form.Item>
                    <Form.Item name="description" label="Description">
                        <Input.TextArea
                            placeholder="Optional description"
                            rows={3}
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            block
                        >
                            Create Group
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
