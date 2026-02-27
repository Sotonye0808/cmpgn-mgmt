"use client";

import React from "react";
import { Button, Empty, Spin } from "antd";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { ICONS } from "@/config/icons";
import { formatDistanceToNow } from "date-fns";

interface Props {
  notifications: AppNotification[];
  loading: boolean;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

const TYPE_ICON: Record<NotificationType, keyof typeof ICONS> = {
  CAMPAIGN_UPDATE: "campaigns",
  REFERRAL_JOINED: "team",
  POINTS_EARNED: "star",
  TRUST_FLAG: "trust",
  SYSTEM: "info",
};

const TYPE_COLOR: Record<NotificationType, string> = {
  CAMPAIGN_UPDATE: "var(--ds-brand-accent)",
  REFERRAL_JOINED: "var(--ds-chart-3)",
  POINTS_EARNED: "var(--ds-brand-success)",
  TRUST_FLAG: "var(--ds-status-warning)",
  SYSTEM: "var(--ds-text-muted)",
};

export default function NotificationDropdown({
  notifications,
  loading,
  onMarkRead,
  onMarkAllRead,
}: Props) {
  const router = useRouter();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  function handleClick(n: AppNotification) {
    if (!n.isRead) onMarkRead(n.id);
    if (n.link) router.push(n.link);
  }

  return (
    <div className="w-80 bg-ds-surface-elevated border border-ds-border-base rounded-ds-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-ds-border-base">
        <span className="text-sm font-semibold text-ds-text-primary">
          Notifications
          {unreadCount > 0 && (
            <span
              className="ml-2 text-xs bg-dynamic text-white rounded-full px-1.5 py-0.5"
              style={
                { "--_dc": "var(--ds-brand-accent)" } as React.CSSProperties
              }>
              {unreadCount}
            </span>
          )}
        </span>
        {unreadCount > 0 && (
          <Button
            type="link"
            size="small"
            className="!text-ds-text-muted !text-xs !p-0 hover:!text-ds-brand-accent"
            onClick={(e) => {
              e.stopPropagation();
              onMarkAllRead();
            }}>
            Mark all read
          </Button>
        )}
      </div>

      {/* Body */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-8">
            <Spin size="small" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-8">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span className="text-ds-text-muted text-sm">
                  You&apos;re all caught up!
                </span>
              }
            />
          </div>
        ) : (
          notifications.map((n) => {
            const IconComponent = ICONS[TYPE_ICON[n.type]] ?? ICONS.bell;
            return (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                className={cn(
                  "w-full text-left px-4 py-3 flex gap-3 items-start",
                  "border-b border-ds-border-subtle last:border-b-0",
                  "transition-colors duration-150",
                  "hover:bg-ds-brand-accent-subtle",
                  !n.isRead && "bg-ds-surface-card",
                )}>
                {/* Icon */}
                <span
                  className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm"
                  style={{
                    background: `${TYPE_COLOR[n.type]}22`,
                    color: TYPE_COLOR[n.type],
                  }}>
                  <IconComponent />
                </span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={cn(
                        "text-sm leading-tight",
                        n.isRead
                          ? "text-ds-text-secondary font-normal"
                          : "text-ds-text-primary font-semibold",
                      )}>
                      {n.title}
                    </span>
                    {!n.isRead && (
                      <span
                        className="flex-shrink-0 w-2 h-2 rounded-full mt-1"
                        style={{ background: "var(--ds-brand-accent)" }}
                      />
                    )}
                  </div>
                  <p className="text-xs text-ds-text-muted mt-0.5 line-clamp-2">
                    {n.body}
                  </p>
                  <span className="text-xs text-ds-text-disabled mt-1 block">
                    {formatDistanceToNow(new Date(n.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
