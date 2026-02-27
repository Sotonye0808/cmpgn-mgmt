"use client";

import { Avatar, Dropdown, Badge } from "antd";
import type { MenuProps } from "antd";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ICONS } from "@/config/icons";
import { ROUTES } from "@/config/routes";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationDropdown from "@/components/ui/NotificationDropdown";

interface HeaderProps {
  title?: string;
  onMenuToggle?: () => void;
}

export default function Header({ title, onMenuToggle }: HeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const {
    unreadCount,
    notifications,
    markRead,
    markAllRead,
    loading: notifLoading,
  } = useNotifications();

  const handleLogout = async () => {
    await logout();
    router.push(ROUTES.LOGIN);
  };

  const menuItems: MenuProps["items"] = [
    {
      key: "profile",
      icon: <ICONS.users className="text-base" />,
      label: "Profile & Settings",
      onClick: () => router.push(ROUTES.SETTINGS),
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <ICONS.logout className="text-base" />,
      label: "Sign Out",
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <header className="h-14 glass-nav sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 shrink-0">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            aria-label="Open menu"
            className="md:hidden w-8 h-8 rounded-ds-lg flex items-center justify-center text-ds-text-subtle hover:text-ds-brand-accent hover:bg-ds-surface-sunken transition-all">
            <ICONS.menu className="text-base" />
          </button>
        )}
        {title && (
          <h1 className="text-lg font-semibold text-ds-text-primary">
            {title}
          </h1>
        )}
      </div>

      {!title && <div />}

      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <Dropdown
          dropdownRender={() => (
            <NotificationDropdown
              notifications={notifications}
              loading={notifLoading}
              onMarkRead={markRead}
              onMarkAllRead={markAllRead}
            />
          )}
          trigger={["click"]}
          placement="bottomRight">
          <button
            aria-label="Notifications"
            className="relative w-8 h-8 rounded-ds-lg flex items-center justify-center text-ds-text-subtle hover:text-ds-brand-accent hover:bg-ds-brand-accent-subtle hover:glow-border transition-all">
            <Badge count={unreadCount} size="small" offset={[2, -2]}>
              <ICONS.bell className="text-base" />
            </Badge>
          </button>
        </Dropdown>

        <Dropdown
          menu={{ items: menuItems }}
          placement="bottomRight"
          trigger={["click"]}>
          <button className="flex items-center gap-2 rounded-ds-lg px-2 py-1 hover:bg-ds-surface-sunken transition-colors">
            <Avatar
              size={32}
              src={user?.profilePicture}
              className="bg-ds-brand-accent">
              {user?.firstName?.charAt(0)}
              {user?.lastName?.charAt(0)}
            </Avatar>
            <div className="hidden md:block text-left">
              <div className="text-xs font-medium text-ds-text-primary leading-tight">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="text-xs text-ds-text-subtle leading-tight">
                {((user?.role as string) ?? "").replace("_", " ")}
              </div>
            </div>
          </button>
        </Dropdown>
      </div>
    </header>
  );
}
