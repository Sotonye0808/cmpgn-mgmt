"use client";

import { useState, useEffect, useCallback } from "react";
import { App, Avatar, Input, Pagination, Select, Skeleton, Tag } from "antd";
import Link from "next/link";
import GlassCard from "@/components/ui/GlassCard";
import { ICONS } from "@/config/icons";
import { ROUTES } from "@/config/routes";
import { ANALYTICS_PAGE_CONTENT } from "@/config/content";

// ─── Local constants ─────────────────────────────────────────────────────────

const ROLE_COLORS: Record<string, string> = {
  USER: "default",
  TEAM_LEAD: "blue",
  ADMIN: "purple",
  SUPER_ADMIN: "gold",
};

const ROLE_LABELS: Record<string, string> = {
  USER: "User",
  TEAM_LEAD: "Team Lead",
  ADMIN: "Admin",
  SUPER_ADMIN: "Super Admin",
};

// ─── Types ───────────────────────────────────────────────────────────────────

interface UserListItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
  isActive: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInitials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

const ROLE_OPTIONS = [
  { value: "", label: "All Roles" },
  { value: "USER", label: "User" },
  { value: "TEAM_LEAD", label: "Team Lead" },
  { value: "ADMIN", label: "Admin" },
  { value: "SUPER_ADMIN", label: "Super Admin" },
];

// ─── Component ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 8;

export default function UserStatsSection() {
  const { message: msgApi } = App.useApp();

  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search input so we don't fire on every keystroke
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setCurrentPage(1); // Reset to page 1 whenever search/filter changes
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (roleFilter) params.set("role", roleFilter);
      const res = await fetch(`${ROUTES.API.USERS.BASE}?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch users");
      const json = await res.json();
      setUsers(json.data ?? []);
    } catch {
      msgApi.error("Failed to load user list.");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, roleFilter, msgApi]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const content = ANALYTICS_PAGE_CONTENT;

  return (
    <GlassCard padding="lg">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-1">
        <ICONS.users className="text-ds-brand-accent text-lg" />
        <h2 className="text-lg font-semibold text-ds-text-primary">
          {content.userStatsTitle}
        </h2>
      </div>
      <p className="text-ds-text-subtle text-sm mb-5">
        {content.userStatsSubtitle}
      </p>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Input
          prefix={<ICONS.search className="text-ds-text-subtle text-sm" />}
          placeholder={content.userStatsSearchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          className="max-w-xs"
        />
        <Select
          value={roleFilter}
          onChange={setRoleFilter}
          options={ROLE_OPTIONS}
          className="min-w-[140px]"
        />
        <button
          onClick={fetchUsers}
          className="inline-flex items-center gap-1 text-xs text-ds-text-subtle hover:text-ds-brand-accent transition-colors"
        >
          <ICONS.refresh className="text-sm" />
          Refresh
        </button>
      </div>

      {/* User list — paginated slice */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} avatar paragraph={{ rows: 1 }} active />
          ))}
        </div>
      ) : users.length === 0 ? (
        <p className="text-ds-text-subtle text-sm">No users match your search.</p>
      ) : (
        <div className="space-y-3">
          {users
            .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
            .map((u) => (
              <UserRow key={u.id} user={u} />
            ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && users.length > PAGE_SIZE && (
        <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
          <p className="text-xs text-ds-text-subtle">
            Showing{" "}
            {Math.min((currentPage - 1) * PAGE_SIZE + 1, users.length)}–{Math.min(currentPage * PAGE_SIZE, users.length)}{" "}
            of {users.length} member{users.length !== 1 ? "s" : ""}
          </p>
          <Pagination
            current={currentPage}
            pageSize={PAGE_SIZE}
            total={users.length}
            onChange={setCurrentPage}
            size="small"
            showSizeChanger={false}
          />
        </div>
      )}
      {!loading && users.length > 0 && users.length <= PAGE_SIZE && (
        <p className="text-xs text-ds-text-subtle mt-4 text-right">
          Showing {users.length} member{users.length !== 1 ? "s" : ""}
        </p>
      )}
    </GlassCard>
  );
}

// ─── Individual User Row ──────────────────────────────────────────────────────

function UserRow({ user }: { user: UserListItem }) {
  const roleLabel = ROLE_LABELS[user.role] ?? user.role;
  const roleColor = ROLE_COLORS[user.role] ?? "default";

  const fullName = `${user.firstName} ${user.lastName}`;
  const joinedDate = new Date(user.createdAt).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const profileHref = ROUTES.USER_DETAIL(user.id);

  return (
    <div className="flex items-center gap-3 p-3 rounded-ds-lg border border-ds-border-subtle bg-ds-surface-base hover:border-ds-brand-accent/40 hover:bg-ds-surface-elevated transition-all">
      {/* Avatar */}
      <Avatar
        size={40}
        className="bg-ds-brand-primary text-white shrink-0 font-semibold text-sm"
      >
        {getInitials(user.firstName, user.lastName)}
      </Avatar>

      {/* Name + meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-ds-text-primary text-sm truncate">
            {fullName}
          </span>
          <Tag color={roleColor} className="text-xs leading-none">
            {roleLabel}
          </Tag>
          {!user.isActive && (
            <Tag color="red" className="text-xs leading-none">
              Inactive
            </Tag>
          )}
        </div>
        <p className="text-ds-text-subtle text-xs truncate mt-0.5">
          {user.email}
        </p>
        <p className="text-ds-text-subtle text-xs mt-0.5">
          Joined {joinedDate}
        </p>
      </div>

      {/* Action — view full profile */}
      <Link
        href={profileHref}
        className="shrink-0 inline-flex items-center gap-1 text-xs text-ds-brand-accent hover:underline font-medium"
      >
        View profile
        <ICONS.arrowRight className="text-xs" />
      </Link>
    </div>
  );
}
