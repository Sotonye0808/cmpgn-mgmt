"use client";

import { Form, Input, Alert } from "antd";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AUTH_CONTENT } from "@/config/content";
import { ROUTES } from "@/config/routes";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

export default function RegisterPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const c = AUTH_CONTENT.register;

  const handleSubmit = async (values: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(ROUTES.API.AUTH.REGISTER, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Registration failed");
      // Auto-login after registration
      await login(values.email, values.password);
      router.push(ROUTES.DASHBOARD);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
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
        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label={
              <span className="text-ds-text-secondary text-sm">
                {c.firstNameLabel}
              </span>
            }
            name="firstName"
            rules={[{ required: true, min: 2, message: "Min 2 characters" }]}>
            <Input
              placeholder={c.firstNamePlaceholder}
              size="large"
              className="rounded-ds-lg"
            />
          </Form.Item>
          <Form.Item
            label={
              <span className="text-ds-text-secondary text-sm">
                {c.lastNameLabel}
              </span>
            }
            name="lastName"
            rules={[{ required: true, min: 2, message: "Min 2 characters" }]}>
            <Input
              placeholder={c.lastNamePlaceholder}
              size="large"
              className="rounded-ds-lg"
            />
          </Form.Item>
        </div>

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
            className="rounded-ds-lg"
          />
        </Form.Item>

        <Form.Item
          label={
            <span className="text-ds-text-secondary text-sm">
              {c.passwordLabel}
            </span>
          }
          name="password"
          rules={[
            { required: true },
            { min: 8, message: "Min 8 characters" },
            { pattern: /[A-Z]/, message: "Must include uppercase letter" },
            { pattern: /[0-9]/, message: "Must include a number" },
          ]}>
          <Input.Password
            placeholder={c.passwordPlaceholder}
            size="large"
            className="rounded-ds-lg"
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
        {c.loginPrompt}{" "}
        <Link
          href={ROUTES.LOGIN}
          className="text-ds-brand-accent hover:underline font-medium">
          {c.loginLink}
        </Link>
      </p>
    </div>
  );
}
