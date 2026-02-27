"use client";

import { useAuth } from "@/hooks/useAuth";
import { USERS_PAGE_CONTENT } from "@/config/content";
import { UserManagementPanel } from "@/modules/users";
import { Empty, Typography } from "antd";

const { Title, Text } = Typography;

export default function UsersPage() {
  const { user, hasRole } = useAuth();

  if (!user || !hasRole(["ADMIN", "SUPER_ADMIN"])) {
    return (
      <Empty
        description="You don't have permission to view this page."
        className="py-24"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Title level={2} style={{ margin: 0 }}>
          {USERS_PAGE_CONTENT.title}
        </Title>
        <Text type="secondary">{USERS_PAGE_CONTENT.subtitle}</Text>
      </div>

      <UserManagementPanel />
    </div>
  );
}
