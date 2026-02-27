"use client";

import { useState } from "react";
import {
  Card,
  Tabs,
  Typography,
  Form,
  Input,
  Button,
  Avatar,
  Row,
  Col,
  Divider,
  Tag,
  message,
} from "antd";
import { useAuth } from "@/hooks/useAuth";
import { SETTINGS_PAGE_CONTENT } from "@/config/content";
import { ICONS } from "@/config/icons";
import { UserManagementPanel } from "@/modules/users";
import FlaggedUsersTable from "@/modules/trust/components/FlaggedUsersTable";
import TrustReviewModal from "@/modules/trust/components/TrustReviewModal";
import { useFlaggedUsers } from "@/modules/trust/hooks/useTrust";
import { GlobalLeaderboardAdminView } from "@/modules/leaderboard";
import PageHeader from "@/components/ui/PageHeader";

const { Title, Text } = Typography;

function ProfileSection() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "?";

  async function handleSave() {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: values.firstName,
          lastName: values.lastName,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to save");
      message.success("Profile updated!");
    } catch (e: unknown) {
      if (e instanceof Error && e.message !== "failed") {
        message.error(e.message);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center gap-4">
        <Avatar
          size={64}
          className="bg-ds-brand-accent text-white font-bold text-xl">
          {initials}
        </Avatar>
        <div>
          <Text strong className="text-ds-text-primary block">
            {user?.firstName} {user?.lastName}
          </Text>
          <Text type="secondary">{user?.email}</Text>
          <div className="mt-1">
            <Tag color="purple">{user?.role?.replace(/_/g, " ")}</Tag>
          </div>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          firstName: user?.firstName,
          lastName: user?.lastName,
          email: user?.email,
        }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="First Name"
              name="firstName"
              rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Last Name"
              name="lastName"
              rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, type: "email" }]}>
          <Input prefix={<ICONS.mail />} disabled />
        </Form.Item>
        <Button
          type="primary"
          loading={saving}
          onClick={handleSave}
          icon={<ICONS.check />}>
          Save Changes
        </Button>
      </Form>
    </div>
  );
}

function SecuritySection() {
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  async function handlePasswordChange() {
    await form.validateFields();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    form.resetFields();
    setSaving(false);
  }

  return (
    <div className="space-y-6 max-w-md">
      <Form form={form} layout="vertical">
        <Form.Item
          label="Current Password"
          name="currentPassword"
          rules={[{ required: true }]}>
          <Input.Password prefix={<ICONS.lock />} />
        </Form.Item>
        <Form.Item
          label="New Password"
          name="newPassword"
          rules={[{ required: true, min: 8 }]}>
          <Input.Password prefix={<ICONS.lock />} />
        </Form.Item>
        <Form.Item
          label="Confirm New Password"
          name="confirmPassword"
          dependencies={["newPassword"]}
          rules={[
            { required: true },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Passwords do not match."));
              },
            }),
          ]}>
          <Input.Password prefix={<ICONS.lock />} />
        </Form.Item>
        <Button
          type="primary"
          loading={saving}
          onClick={handlePasswordChange}
          icon={<ICONS.check />}>
          Update Password
        </Button>
      </Form>
    </div>
  );
}

function AdminSection() {
  const { flaggedUsers, loading, refresh } = useFlaggedUsers();
  const [reviewing, setReviewing] = useState<{
    userId: string;
    name: string;
  } | null>(null);

  return (
    <div className="space-y-8">
      <div>
        <Title level={5}>Leaderboard Snapshot Management</Title>
        <GlobalLeaderboardAdminView />
      </div>

      <Divider />

      <div>
        <Title level={5}>Flagged User Review</Title>
        <FlaggedUsersTable
          users={flaggedUsers}
          loading={loading}
          onReview={(userId) => {
            const u = flaggedUsers.find((f) => f.userId === userId);
            if (u)
              setReviewing({ userId, name: `${u.firstName} ${u.lastName}` });
          }}
        />
        {reviewing && (
          <TrustReviewModal
            open
            userId={reviewing.userId}
            userName={reviewing.name}
            onClose={() => setReviewing(null)}
            onResolved={() => {
              setReviewing(null);
              refresh();
            }}
          />
        )}
      </div>

      <Divider />

      <div>
        <Title level={5}>User Management</Title>
        <UserManagementPanel />
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole(["ADMIN", "SUPER_ADMIN"]);

  const tabItems = [
    {
      key: "profile",
      label: (
        <span className="flex items-center gap-2">
          <ICONS.users />
          {SETTINGS_PAGE_CONTENT.profileSection}
        </span>
      ),
      children: <ProfileSection />,
    },
    {
      key: "security",
      label: (
        <span className="flex items-center gap-2">
          <ICONS.lock />
          {SETTINGS_PAGE_CONTENT.securitySection}
        </span>
      ),
      children: <SecuritySection />,
    },
    ...(isAdmin
      ? [
          {
            key: "admin",
            label: (
              <span className="flex items-center gap-2">
                <ICONS.settings />
                {SETTINGS_PAGE_CONTENT.adminSection}
              </span>
            ),
            children: <AdminSection />,
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={SETTINGS_PAGE_CONTENT.title}
        subtitle={SETTINGS_PAGE_CONTENT.subtitle}
      />

      <Card
        bordered={false}
        className="bg-ds-surface-elevated border border-ds-border-base">
        <Tabs items={tabItems} defaultActiveKey="profile" />
      </Card>
    </div>
  );
}
