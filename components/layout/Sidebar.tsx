"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Tooltip, Drawer } from "antd";
import { NAV_ITEMS } from "@/config/navigation";
import { NAV_CONTENT } from "@/config/content";
import { ICONS } from "@/config/icons";
import { useRole } from "@/hooks/useRole";
import { cn } from "@/lib/utils/cn";

interface SidebarProps {
  /** Controls whether the mobile Drawer is open. Managed by DashboardLayout. */
  mobileOpen?: boolean;
  /** Called when the mobile Drawer requests close. */
  onMobileClose?: () => void;
}

function SidebarContent({
  collapsed,
  onCollapse,
}: {
  collapsed: boolean;
  onCollapse: () => void;
}) {
  const pathname = usePathname();
  const { filterByRole, role } = useRole();
  const visibleItems = filterByRole(NAV_ITEMS);

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-ds-surface-sidebar border-r border-ds-border-glass transition-all duration-200",
        collapsed ? "w-16" : "w-60",
      )}>
      {/* Brand — glass card treatment */}
      <div className="px-2 pt-3 pb-2 shrink-0">
        <div className="flex items-center gap-3 px-3 py-3 rounded-ds-lg glass-surface">
          <div className="w-8 h-8 rounded-ds-lg bg-ds-brand-accent glow-border flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">D</span>
          </div>
          {!collapsed && (
            <div>
              <div className="font-bold text-ds-text-primary text-sm leading-tight">
                {NAV_CONTENT.brandName}
              </div>
              <div className="text-xs text-ds-text-subtle">
                {NAV_CONTENT.brandTagline}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-1">
          {visibleItems.map((item) => {
            const Icon =
              ICONS[item.icon as keyof typeof ICONS] ?? ICONS.dashboard;
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");

            const navItem = (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-ds-lg text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-ds-brand-accent-subtle text-ds-brand-accent glow-border border border-ds-border-glass"
                      : "text-ds-text-secondary hover:bg-ds-brand-accent-subtle/50 hover:text-ds-text-primary hover:glow-border",
                  )}>
                  <Icon className="text-base shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              </li>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.key} title={item.label} placement="right">
                  {navItem}
                </Tooltip>
              );
            }
            return navItem;
          })}
        </ul>
      </nav>

      {/* Role Badge + Collapse Toggle */}
      <div className="border-t border-ds-border-base px-4 py-3 shrink-0">
        {!collapsed && (
          <div className="text-xs text-ds-text-subtle mb-2 uppercase tracking-wider font-medium">
            {role.replace("_", " ")}
          </div>
        )}
        <button
          onClick={onCollapse}
          className="flex items-center gap-2 text-ds-text-subtle hover:text-ds-brand-accent text-sm transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
          {collapsed ? (
            <ICONS.right className="text-base" />
          ) : (
            <ICONS.left className="text-base" />
          )}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </div>
  );
}

export default function Sidebar({
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Desktop sidebar — hidden on mobile/tablet */}
      <aside
        className={cn("hidden md:flex shrink-0", collapsed ? "w-16" : "w-60")}>
        <SidebarContent
          collapsed={collapsed}
          onCollapse={() => setCollapsed(!collapsed)}
        />
      </aside>

      {/* Mobile Drawer — shown only on small screens */}
      <Drawer
        open={mobileOpen}
        onClose={onMobileClose}
        placement="left"
        width={240}
        styles={{ body: { padding: 0 }, header: { display: "none" } }}
        className="md:hidden">
        <div className="h-full flex flex-col">
          <SidebarContent
            collapsed={false}
            onCollapse={() => onMobileClose?.()}
          />
        </div>
      </Drawer>
    </>
  );
}
