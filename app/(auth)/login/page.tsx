"use client";

import { Form, Input, Alert } from "antd";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AUTH_CONTENT } from "@/config/content";
import { ROUTES } from "@/config/routes";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const c = AUTH_CONTENT.login;

  const handleSubmit = async (values: { email: string; password: string }) => {
    setLoading(true);
    setError(null);
    try {
      await login(values.email, values.password);
      router.push(ROUTES.DASHBOARD);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-surface rounded-ds-2xl p-8">
      <h1 className="text-2xl font-bold text-ds-text-primary mb-1">
        {c.title}
      </h1>
      <p className="text-ds-text-secondary text-sm mb-6">{c.subtitle}</p>

      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          className="mb-4 rounded-ds-lg"
          closable
          onClose={() => setError(null)}
        />
      )}

      <Form layout="vertical" onFinish={handleSubmit} requiredMark={false}>
        <Form.Item
          label={
            <span className="text-ds-text-secondary text-sm">
              {c.emailLabel}
            </span>
          }
          name="email"
          rules={[
            { required: true, type: "email", message: "Enter a valid email" },
          ]}>
          <Input
            placeholder={c.emailPlaceholder}
            size="large"
            className="rounded-ds-lg bg-ds-surface-sunken border-ds-border-base"
          />
        </Form.Item>

        <Form.Item
          label={
            <span className="text-ds-text-secondary text-sm">
              {c.passwordLabel}
            </span>
          }
          name="password"
          rules={[{ required: true, message: "Enter your password" }]}>
          <Input.Password
            placeholder={c.passwordPlaceholder}
            size="large"
            className="rounded-ds-lg bg-ds-surface-sunken border-ds-border-base"
          />
        </Form.Item>

        <Button
          htmlType="submit"
          loading={loading}
          variant="primary"
          size="large"
          block
          className="mt-2">
          {c.submitButton}
        </Button>
      </Form>

      <p className="text-center text-sm text-ds-text-subtle mt-6">
        {c.registerPrompt}{" "}
        <Link
          href={ROUTES.REGISTER}
          className="text-ds-brand-accent hover:underline font-medium">
          {c.registerLink}
        </Link>
      </p>
    </div>
  );
}
