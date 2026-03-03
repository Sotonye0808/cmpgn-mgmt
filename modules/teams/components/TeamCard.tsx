"use client";

import { Tag, Button, Tooltip } from "antd";
import { ICONS } from "@/config/icons";
import { cn } from "@/lib/utils/cn";

interface Props {
  team: Team;
  groupName?: string;
  isMyTeam?: boolean;
  onViewDetails?: (teamId: string) => void;
}

export default function TeamCard({
  team,
  groupName,
  isMyTeam,
  onViewDetails,
}: Props) {
  const memberCount = team.memberIds.length;
  const capacityPercent = Math.round((memberCount / team.maxMembers) * 100);

  return (
    <div
      className={cn(
        "glass-surface rounded-ds-xl p-5 transition-all duration-200",
        isMyTeam && "glow-border",
      )}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-ds-text-primary">
              {team.name}
            </h3>
            {isMyTeam && (
              <Tag color="purple" className="text-xs">
                Your Team
              </Tag>
            )}
          </div>
          {groupName && (
            <p className="text-xs text-ds-text-subtle mt-0.5">{groupName}</p>
          )}
        </div>
        {team.teamLeadId && (
          <Tooltip title="Has team lead">
            <Tag color="gold" className="text-xs">
              <ICONS.crown /> Led
            </Tag>
          </Tooltip>
        )}
      </div>

      {/* Capacity bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-ds-text-subtle mb-1">
          <span>
            {memberCount}/{team.maxMembers} members
          </span>
          <span>{capacityPercent}%</span>
        </div>
        <div className="h-1.5 bg-ds-surface-elevated rounded-full overflow-hidden">
          <div
            className="h-full bg-ds-brand-accent rounded-full transition-all duration-300 bar-dynamic"
            style={{ "--_bar-w": `${capacityPercent}%` } as React.CSSProperties}
          />
        </div>
      </div>

      {onViewDetails && (
        <Button
          type="link"
          size="small"
          onClick={() => onViewDetails(team.id)}
          className="p-0 text-ds-brand-accent">
          View Details →
        </Button>
      )}
    </div>
  );
}
