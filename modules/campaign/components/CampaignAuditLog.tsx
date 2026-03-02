"use client";

import { useState, useEffect, useCallback } from "react";
import { Timeline, Tag, Skeleton, Empty, Avatar, Tooltip } from "antd";
import GlassCard from "@/components/ui/GlassCard";
import { ICONS } from "@/config/icons";
import { ROUTES } from "@/config/routes";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { formatDate } from "@/lib/utils/format";

const EVENT_TYPE_CONFIG: Record<
  string,
  { label: string; color: string; icon: string }
> = {
  CREATED: { label: "Created", color: "green", icon: "add" },
  STATUS_CHANGED: { label: "Status Changed", color: "blue", icon: "refresh" },
  FIELDS_UPDATED: { label: "Fields Updated", color: "purple", icon: "edit" },
  PARTICIPANT_JOINED: {
    label: "Participant Joined",
    color: "cyan",
    icon: "user",
  },
  DONATION_RECEIVED: {
    label: "Donation Received",
    color: "gold",
    icon: "dollar",
  },
  GOAL_REACHED: { label: "Goal Reached", color: "green", icon: "trophy" },
  ENDED: { label: "Ended", color: "red", icon: "close" },
};

interface AuditEntry extends CampaignAuditEvent {
  actorName?: string;
}

interface CampaignAuditLogProps {
  campaignId: string;
}

export default function CampaignAuditLog({
  campaignId,
}: CampaignAuditLogProps) {
  const [events, setEvents] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAudit = useCallback(async () => {
    try {
      const res = await fetch(
        `${ROUTES.API.CAMPAIGNS.AUDIT(campaignId)}?pageSize=50`
      );
      if (!res.ok) return;
      const json = await res.json();
      setEvents(json.data ?? []);
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    fetchAudit();
  }, [fetchAudit]);

  useAutoRefresh("campaignAuditEvents", fetchAudit);

  if (loading) return <Skeleton active paragraph={{ rows: 4 }} />;
  if (events.length === 0)
    return <Empty description="No audit events yet" className="py-8" />;

  // Group events by date
  const grouped = events.reduce<Record<string, AuditEntry[]>>((acc, event) => {
    const date = event.createdAt.slice(0, 10);
    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {});

  return (
    <GlassCard padding="lg">
      <div className="flex items-center gap-2 mb-6">
        <ICONS.clock className="text-ds-brand-accent text-lg" />
        <h3 className="text-lg font-semibold text-ds-text-primary">
          Audit Trail
        </h3>
        <Tag className="ml-auto">{events.length} events</Tag>
      </div>

      <div className="space-y-6">
        {Object.entries(grouped).map(([date, dayEvents]) => (
          <div key={date}>
            <div className="text-xs font-semibold text-ds-text-subtle uppercase tracking-wide mb-3">
              {formatDate(date)}
            </div>
            <Timeline
              items={dayEvents.map((event) => {
                const cfg = EVENT_TYPE_CONFIG[event.eventType] ?? {
                  label: event.eventType,
                  color: "gray",
                  icon: "info",
                };
                const IconComponent =
                  ICONS[cfg.icon as keyof typeof ICONS] ?? ICONS.info;

                return {
                  color: cfg.color,
                  dot: (
                    <Avatar
                      size="small"
                      className="bg-ds-brand-accent/20 text-ds-brand-accent"
                      icon={<IconComponent />}
                    />
                  ),
                  children: (
                    <div className="pb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Tag color={cfg.color}>{cfg.label}</Tag>
                        <span className="text-xs text-ds-text-subtle">
                          {new Date(event.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      {event.note && (
                        <p className="text-sm text-ds-text-primary mt-1">
                          {event.note}
                        </p>
                      )}
                      <div className="text-xs text-ds-text-subtle mt-1">
                        by{" "}
                        <span className="font-medium">
                          {event.actorName ?? event.actorId}
                        </span>
                      </div>
                      {/* Show field diffs for FIELDS_UPDATED */}
                      {event.eventType === "FIELDS_UPDATED" &&
                        event.before &&
                        event.after && (
                          <div className="mt-2 bg-ds-surface-elevated rounded-ds-lg p-2 text-xs space-y-1">
                            {Object.keys(event.after).map((field) => (
                              <div key={field} className="flex gap-2">
                                <span className="font-medium text-ds-text-subtle min-w-[80px]">
                                  {field}:
                                </span>
                                <Tooltip title="Before">
                                  <span className="text-ds-status-error line-through">
                                    {String(
                                      (
                                        event.before as Record<string, unknown>
                                      )?.[field] ?? "—"
                                    )}
                                  </span>
                                </Tooltip>
                                <span className="text-ds-text-subtle">→</span>
                                <Tooltip title="After">
                                  <span className="text-ds-success">
                                    {String(
                                      (
                                        event.after as Record<string, unknown>
                                      )?.[field] ?? "—"
                                    )}
                                  </span>
                                </Tooltip>
                              </div>
                            ))}
                          </div>
                        )}
                      {/* Show status change diff */}
                      {event.eventType === "STATUS_CHANGED" &&
                        event.before &&
                        event.after && (
                          <div className="mt-2 flex items-center gap-2 text-xs">
                            <Tag>
                              {String(
                                (event.before as Record<string, unknown>)
                                  ?.status
                              )}
                            </Tag>
                            <span className="text-ds-text-subtle">→</span>
                            <Tag color="blue">
                              {String(
                                (event.after as Record<string, unknown>)?.status
                              )}
                            </Tag>
                          </div>
                        )}
                    </div>
                  ),
                };
              })}
            />
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
