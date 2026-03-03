"use client";

import { Avatar, Tag, List, Empty, Button } from "antd";
import { ICONS } from "@/config/icons";
import { TEAM_PAGE_CONTENT } from "@/config/content";

interface Props {
    team: Team;
    members: Array<{
        id: string;
        firstName: string;
        lastName: string;
        role: string;
        profilePicture?: string;
    }>;
    isAdmin: boolean;
    currentUserId?: string;
    onRemoveMember?: (userId: string) => void;
}

export default function MyTeamCard({
    team,
    members,
    isAdmin,
    currentUserId,
    onRemoveMember,
}: Props) {


    return (
        <div className="glass-surface rounded-ds-xl p-5">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-ds-text-primary">
                        {team.name}
                    </h3>
                    <p className="text-xs text-ds-text-subtle">
                        {members.length}/{team.maxMembers} members
                    </p>
                </div>
                {team.teamLeadId && (
                    <Tag color="gold" className="text-xs">
                        <ICONS.crown /> Team has a lead
                    </Tag>
                )}
            </div>

            {members.length === 0 ? (
                <Empty description={TEAM_PAGE_CONTENT.emptyState} />
            ) : (
                <List
                    dataSource={members}
                    renderItem={(member) => {
                        const isLead = member.id === team.teamLeadId;
                        const isSelf = member.id === currentUserId;
                        return (
                            <List.Item
                                className="!px-0"
                                actions={
                                    (isAdmin || isSelf) && onRemoveMember
                                        ? [
                                              <Button
                                                  key="remove"
                                                  type="link"
                                                  danger
                                                  size="small"
                                                  onClick={() => onRemoveMember(member.id)}
                                              >
                                                  {isSelf ? "Leave" : "Remove"}
                                              </Button>,
                                          ]
                                        : undefined
                                }
                            >
                                <List.Item.Meta
                                    avatar={
                                        <Avatar
                                            src={member.profilePicture}
                                            className="bg-ds-brand-accent"
                                        >
                                            {member.firstName[0]}
                                            {member.lastName[0]}
                                        </Avatar>
                                    }
                                    title={
                                        <span className="text-ds-text-primary">
                                            {member.firstName} {member.lastName}
                                            {isLead && (
                                                <Tag
                                                    color="gold"
                                                    className="ml-2 text-xs"
                                                >
                                                    Lead
                                                </Tag>
                                            )}
                                            {isSelf && (
                                                <Tag className="ml-2 text-xs">
                                                    You
                                                </Tag>
                                            )}
                                        </span>
                                    }
                                    description={
                                        <span className="text-ds-text-subtle text-xs">
                                            {member.role}
                                        </span>
                                    }
                                />
                            </List.Item>
                        );
                    }}
                />
            )}
        </div>
    );
}
