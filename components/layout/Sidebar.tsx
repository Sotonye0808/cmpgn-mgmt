"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Tooltip } from "antd";
import { NAV_ITEMS } from "@/config/navigation";
import { NAV_CONTENT } from "@/config/content";
import { ICONS } from "@/config/icons";
import { useRole } from "@/hooks/useRole";
import { cn } from "@/lib/utils/cn";

export default function Sidebar() {
  const pathname = usePathname();
  const { filterByRole, role } = useRole();
  const [collapsed, setCollapsed] = useState(false);

  const visibleItems = filterByRole(NAV_ITEMS);

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-ds-surface-elevated border-r border-ds-border-base transition-all duration-200 shrink-0",
        collapsed ? "w-16" : "w-60",
      )}>
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-ds-border-base shrink-0">
        <div className="w-8 h-8 rounded-ds-lg bg-ds-brand-accent flex items-center justify-center shrink-0">
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
                      ? "bg-ds-brand-accent-subtle text-ds-brand-accent glow-border"
                      : "text-ds-text-secondary hover:bg-ds-surface-sunken hover:text-ds-text-primary",
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
          onClick={() => setCollapsed(!collapsed)}
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
    </aside>
  );
}
