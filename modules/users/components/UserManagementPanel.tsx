"use client";

import { useState, useEffect, useCallback } from "react";
import { Tag, Select, Button, Input, message, Skeleton, Empty } from "antd";
import type { ColumnsType } from "antd/es/table";
import DataTable from "@/components/ui/DataTable";
import { USERS_PAGE_CONTENT } from "@/config/content";
import { ROUTES } from "@/config/routes";
import type { UserListItem } from "@/modules/users/services/userService";

const ROLE_COLORS: Record<string, string> = {
  USER: "default",
  TEAM_LEAD: "blue",
  ADMIN: "purple",
  SUPER_ADMIN: "gold",
};

const ALL_ROLES = ["USER", "TEAM_LEAD", "ADMIN", "SUPER_ADMIN"];

export default function UserManagementPanel() {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | undefined>();
  const [msgApi, contextHolder] = message.useMessage();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (roleFilter) params.set("role", roleFilter);
      const res = await fetch(`${ROUTES.API.USERS.BASE}?${params}`);
      if (!res.ok) throw new Error("Failed to load users");
      const json = await res.json();
      setUsers(json.data ?? []);
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const changeRole = async (userId: string, role: string) => {
    try {
      const res = await fetch(ROUTES.API.USERS.ROLE(userId), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error("Failed to update role");
      msgApi.success("Role updated");
      fetchUsers();
    } catch (e) {
      msgApi.error(e instanceof Error ? e.message : "Error");
    }
  };

  const columns: ColumnsType<UserListItem> = [
    {
      title: "Name",
      key: "name",
      render: (_, rec) => (
        <div>
          <div className="font-medium text-ds-text-primary">
            {rec.firstName} {rec.lastName}
          </div>
          <div className="text-xs text-ds-text-subtle">{rec.email}</div>
        </div>
      ),
    },
    {
      title: USERS_PAGE_CONTENT.roleLabel,
      dataIndex: "role",
      key: "role",
      render: (role: string) => (
        <Tag color={ROLE_COLORS[role] ?? "default"}>{role}</Tag>
      ),
    },
    {
      title: "Joined",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (d: string) => new Date(d).toLocaleDateString(),
    },
    {
      title: USERS_PAGE_CONTENT.actionsLabel,
      key: "actions",
      render: (_, rec) => (
        <Select
          size="small"
          value={rec.role}
          style={{ width: 130 }}
          options={ALL_ROLES.map((r) => ({ value: r, label: r }))}
          onChange={(val) => changeRole(rec.id, val)}
        />
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input.Search
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            className="flex-1"
          />
          <Select
            placeholder="Filter by role"
            allowClear
            style={{ width: 160 }}
            options={ALL_ROLES.map((r) => ({ value: r, label: r }))}
            onChange={setRoleFilter}
          />
          <Button onClick={fetchUsers}>Refresh</Button>
        </div>

        {loading ? (
          <Skeleton active paragraph={{ rows: 5 }} />
        ) : users.length === 0 ? (
          <Empty description={USERS_PAGE_CONTENT.emptyState} />
        ) : (
          <DataTable<UserListItem>
            columns={columns}
            dataSource={users}
            rowKey="id"
            size="small"
            pagination={{ pageSize: 15 }}
          />
        )}
      </div>
    </>
  );
}
