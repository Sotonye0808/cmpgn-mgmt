"use client";

import { useAuth } from "@/hooks/useAuth";
import { USERS_PAGE_CONTENT } from "@/config/content";
import { UserManagementPanel } from "@/modules/users";
import { Empty } from "antd";
import PageHeader from "@/components/ui/PageHeader";

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
      <PageHeader
        title={USERS_PAGE_CONTENT.title}
        subtitle={USERS_PAGE_CONTENT.subtitle}
      />

      <UserManagementPanel />
    </div>
  );
}
