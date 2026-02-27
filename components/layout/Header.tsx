"use client";

import { Avatar, Dropdown } from "antd";
import type { MenuProps } from "antd";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ICONS } from "@/config/icons";
import { ROUTES } from "@/config/routes";

interface HeaderProps {
  title?: string;
}

export default function Header({ title }: HeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

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
    {
      key: "settings",
      icon: <ICONS.settings className="text-base" />,
      label: "Settings",
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
    <header className="h-14 bg-ds-surface-elevated border-b border-ds-border-base flex items-center justify-between px-6 shrink-0">
      {title && (
        <h1 className="text-lg font-semibold text-ds-text-primary">{title}</h1>
      )}
      {!title && <div />}

      <div className="flex items-center gap-3">
        <button
          aria-label="Notifications"
          className="w-8 h-8 rounded-ds-lg flex items-center justify-center text-ds-text-subtle hover:text-ds-brand-accent hover:bg-ds-surface-sunken transition-all">
          <ICONS.bell className="text-base" />
        </button>

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
