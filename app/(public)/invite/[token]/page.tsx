"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Result, Spin, Tag, message } from "antd";
import { ICONS } from "@/config/icons";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/config/routes";

interface InvitePreview {
    token: string;
    teamName: string;
    teamMemberCount: number;
    teamMaxMembers: number;
    groupName: string | null;
    targetRole: "MEMBER" | "TEAM_LEAD";
    isActive: boolean;
    isExpired: boolean;
    isFull: boolean;
}

export default function InvitePage() {
    const params = useParams<{ token: string }>();
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const [preview, setPreview] = useState<InvitePreview | null>(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [joined, setJoined] = useState(false);

    useEffect(() => {
        if (!params.token) return;
        window
            .fetch(`/api/invite/${params.token}`)
            .then((r) => r.json())
            .then((json) => {
                if (json.success) {
                    setPreview(json.data);
                } else {
                    setError(json.error ?? "Invalid invite link");
                }
            })
            .catch(() => setError("Failed to load invite"))
            .finally(() => setLoading(false));
    }, [params.token]);

    const handleJoin = async () => {
        if (!user) {
            // Redirect to login with return URL
            router.push(`${ROUTES.LOGIN}?redirect=/invite/${params.token}`);
            return;
        }

        setJoining(true);
        try {
            const res = await window.fetch(`/api/invite/${params.token}/join`, {
                method: "POST",
            });
            const json = await res.json();
            if (json.success) {
                setJoined(true);
                message.success("Successfully joined the team!");
            } else {
                message.error(json.error ?? "Failed to join");
            }
        } catch {
            message.error("Network error");
        } finally {
            setJoining(false);
        }
    };

    if (loading || authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spin size="large" />
            </div>
        );
    }

    if (error || !preview) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Result
                    status="error"
                    title="Invalid Invite"
                    subTitle={error ?? "This invite link is invalid or has expired."}
                    extra={
                        <Button type="primary" onClick={() => router.push(ROUTES.HOME)}>
                            Go Home
                        </Button>
                    }
                />
            </div>
        );
    }

    if (joined) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Result
                    status="success"
                    title="Welcome to the Team!"
                    subTitle={`You have joined ${preview.teamName} as ${preview.targetRole === "TEAM_LEAD" ? "Team Lead" : "a member"}.`}
                    extra={
                        <Button
                            type="primary"
                            onClick={() => router.push(ROUTES.TEAM)}
                        >
                            Go to Team Page
                        </Button>
                    }
                />
            </div>
        );
    }

    const isUsable = preview.isActive && !preview.isExpired && !preview.isFull;

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="glass-surface rounded-ds-xl p-8 max-w-md w-full text-center space-y-6">
                <div className="text-5xl text-ds-brand-accent">
                    <ICONS.team />
                </div>

                <div>
                    <h1 className="text-2xl font-bold text-ds-text-primary">
                        Join {preview.teamName}
                    </h1>
                    {preview.groupName && (
                        <p className="text-sm text-ds-text-subtle mt-1">
                            Part of {preview.groupName}
                        </p>
                    )}
                </div>

                <div className="flex justify-center gap-3">
                    <Tag color="blue">
                        {preview.teamMemberCount}/{preview.teamMaxMembers} members
                    </Tag>
                    <Tag color={preview.targetRole === "TEAM_LEAD" ? "gold" : "default"}>
                        {preview.targetRole === "TEAM_LEAD" ? "Team Lead" : "Member"}
                    </Tag>
                </div>

                {!isUsable ? (
                    <div className="text-ds-text-subtle text-sm">
                        {!preview.isActive && "This invite link has been deactivated."}
                        {preview.isExpired && "This invite link has expired."}
                        {preview.isFull && "This invite link has reached its usage limit."}
                    </div>
                ) : user ? (
                    <Button
                        type="primary"
                        size="large"
                        loading={joining}
                        onClick={handleJoin}
                        block
                    >
                        Join Team
                    </Button>
                ) : (
                    <div className="space-y-3">
                        <p className="text-sm text-ds-text-secondary">
                            Sign in to join this team
                        </p>
                        <Button
                            type="primary"
                            size="large"
                            onClick={() =>
                                router.push(
                                    `${ROUTES.LOGIN}?redirect=/invite/${params.token}`
                                )
                            }
                            block
                        >
                            Sign In & Join
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
