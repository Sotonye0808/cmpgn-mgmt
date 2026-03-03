"use client";

import { useState, useCallback, useEffect } from "react";
import { Select, Tag, Empty, Modal, Input, message } from "antd";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/config/routes";
import { BUG_REPORT_CATEGORIES, BUG_REPORT_STATUSES } from "@/config/content";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";

const { TextArea } = Input;

interface BugReportRow {
    id: string;
    category: string;
    description: string;
    email: string;
    userId?: string;
    userAgent?: string;
    pageUrl?: string;
    status: string;
    adminNotes?: string;
    createdAt: string;
    updatedAt: string;
}

const STATUS_COLOR_MAP: Record<string, string> = {
    OPEN: "blue",
    IN_PROGRESS: "orange",
    RESOLVED: "green",
    CLOSED: "default",
};

const CATEGORY_LABEL_MAP = new Map<string, string>(
    BUG_REPORT_CATEGORIES.map((c) => [c.key, c.label])
);

const STATUS_LABEL_MAP = new Map<string, string>(
    BUG_REPORT_STATUSES.map((s) => [s.key, s.label])
);

export default function BugReportsPage() {
    const { user, hasRole } = useAuth();
    const [reports, setReports] = useState<BugReportRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [meta, setMeta] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 0 });
    const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
    const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);

    // Detail modal
    const [selected, setSelected] = useState<BugReportRow | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [adminNotes, setAdminNotes] = useState("");

    const fetchReports = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), pageSize: "20" });
            if (statusFilter) params.set("status", statusFilter);
            if (categoryFilter) params.set("category", categoryFilter);

            const res = await fetch(`${ROUTES.API.BUG_REPORTS.BASE}?${params}`);
            if (!res.ok) throw new Error("Failed to fetch reports");
            const json = await res.json();
            setReports(json.data?.data ?? []);
            setMeta((prev) => json.data?.meta ?? prev);
        } catch {
            // Handled silently
        } finally {
            setLoading(false);
        }
    }, [statusFilter, categoryFilter]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    useAutoRefresh("campaigns" as never, fetchReports); // piggyback on slow interval

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        setUpdatingStatus(true);
        try {
            const res = await fetch(ROUTES.API.BUG_REPORTS.DETAIL(id), {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus, adminNotes: adminNotes || undefined }),
            });
            if (!res.ok) throw new Error("Update failed");
            message.success("Bug report updated");
            setDetailOpen(false);
            fetchReports(meta.page);
        } catch {
            message.error("Failed to update bug report");
        } finally {
            setUpdatingStatus(false);
        }
    };

    if (!user || !hasRole(["SUPER_ADMIN"])) {
        return (
            <Empty
                description="You don't have permission to view this page."
                className="py-24"
            />
        );
    }

    const columns = [
        {
            title: "Date",
            dataIndex: "createdAt",
            key: "createdAt",
            width: 150,
            render: (val: string) =>
                new Date(val).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                }),
        },
        {
            title: "Category",
            dataIndex: "category",
            key: "category",
            width: 160,
            render: (val: string) => CATEGORY_LABEL_MAP.get(val) ?? val,
        },
        {
            title: "Description",
            dataIndex: "description",
            key: "description",
            ellipsis: true,
            render: (val: string) => (
                <span className="text-ds-text-secondary">{val.length > 80 ? `${val.slice(0, 80)}…` : val}</span>
            ),
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            width: 200,
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            width: 120,
            render: (val: string) => (
                <Tag color={STATUS_COLOR_MAP[val] ?? "default"}>
                    {STATUS_LABEL_MAP.get(val) ?? val}
                </Tag>
            ),
        },
        {
            title: "Actions",
            key: "actions",
            width: 100,
            render: (_: unknown, record: BugReportRow) => (
                <button
                    onClick={() => {
                        setSelected(record);
                        setAdminNotes(record.adminNotes ?? "");
                        setDetailOpen(true);
                    }}
                    className="text-ds-brand-accent hover:underline text-sm"
                >
                    Review
                </button>
            ),
        },
    ];

    const statusOptions = [
        { value: "", label: "All Statuses" },
        ...BUG_REPORT_STATUSES.map((s) => ({ value: s.key, label: s.label })),
    ];
    const categoryOptions = [
        { value: "", label: "All Categories" },
        ...BUG_REPORT_CATEGORIES.map((c) => ({ value: c.key, label: c.label })),
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Bug Reports"
                subtitle="Review and manage bug reports submitted by users."
            />

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <Select
                    options={statusOptions}
                    value={statusFilter ?? ""}
                    onChange={(v) => setStatusFilter(v || undefined)}
                    className="w-44"
                    placeholder="Filter by status"
                />
                <Select
                    options={categoryOptions}
                    value={categoryFilter ?? ""}
                    onChange={(v) => setCategoryFilter(v || undefined)}
                    className="w-52"
                    placeholder="Filter by category"
                />
            </div>

            <DataTable
                columns={columns}
                dataSource={reports}
                loading={loading}
                rowKey="id"
                pagination={{
                    current: meta.page,
                    pageSize: meta.pageSize,
                    total: meta.total,
                    onChange: (page) => fetchReports(page),
                }}
            />

            {/* Detail / Review Modal */}
            <Modal
                open={detailOpen}
                onCancel={() => setDetailOpen(false)}
                title="Bug Report Details"
                footer={null}
                width={640}
            >
                {selected && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-ds-text-subtle">Category:</span>{" "}
                                <strong>{CATEGORY_LABEL_MAP.get(selected.category) ?? selected.category}</strong>
                            </div>
                            <div>
                                <span className="text-ds-text-subtle">Status:</span>{" "}
                                <Tag color={STATUS_COLOR_MAP[selected.status] ?? "default"}>
                                    {STATUS_LABEL_MAP.get(selected.status) ?? selected.status}
                                </Tag>
                            </div>
                            <div>
                                <span className="text-ds-text-subtle">Email:</span>{" "}
                                <strong>{selected.email}</strong>
                            </div>
                            <div>
                                <span className="text-ds-text-subtle">Date:</span>{" "}
                                <strong>{new Date(selected.createdAt).toLocaleString()}</strong>
                            </div>
                            {selected.userId && (
                                <div className="col-span-2">
                                    <span className="text-ds-text-subtle">User ID:</span>{" "}
                                    <code className="text-xs bg-ds-surface-sunken px-1 rounded">{selected.userId}</code>
                                </div>
                            )}
                            {selected.pageUrl && (
                                <div className="col-span-2">
                                    <span className="text-ds-text-subtle">Page URL:</span>{" "}
                                    <span className="text-xs break-all">{selected.pageUrl}</span>
                                </div>
                            )}
                            {selected.userAgent && (
                                <div className="col-span-2">
                                    <span className="text-ds-text-subtle">User Agent:</span>{" "}
                                    <span className="text-xs break-all text-ds-text-disabled">{selected.userAgent}</span>
                                </div>
                            )}
                        </div>

                        <div>
                            <h4 className="text-sm font-semibold text-ds-text-primary mb-1">Description</h4>
                            <div className="bg-ds-surface-sunken rounded-ds-lg p-3 text-sm whitespace-pre-wrap">
                                {selected.description}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-semibold text-ds-text-primary mb-1">Admin Notes</h4>
                            <TextArea
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                rows={3}
                                placeholder="Add internal notes about this report…"
                            />
                        </div>

                        <div>
                            <h4 className="text-sm font-semibold text-ds-text-primary mb-2">Update Status</h4>
                            <div className="flex flex-wrap gap-2">
                                {BUG_REPORT_STATUSES.map((s) => (
                                    <button
                                        key={s.key}
                                        onClick={() => handleStatusUpdate(selected.id, s.key)}
                                        disabled={updatingStatus || selected.status === s.key}
                                        className={`px-3 py-1 rounded-ds-lg text-sm font-medium border transition-all ${
                                            selected.status === s.key
                                                ? "border-ds-brand-accent bg-ds-brand-accent text-white cursor-default"
                                                : "border-ds-border-base hover:border-ds-brand-accent hover:text-ds-brand-accent"
                                        }`}
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
