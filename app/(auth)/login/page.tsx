"use client";

import { Form, Input, Alert } from "antd";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AUTH_CONTENT, DEV_CREDENTIALS } from "@/config/content";
import { ROUTES } from "@/config/routes";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import Spinner from "@/components/ui/Spinner";

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN:
    "bg-ds-status-error/20 text-ds-status-error border-ds-status-error/30",
  ADMIN:
    "bg-ds-status-warning/20 text-ds-status-warning border-ds-status-warning/30",
  TEAM_LEAD: "bg-ds-chart-3/20 text-ds-chart-3 border-ds-chart-3/30",
  USER: "bg-ds-brand-success/20 text-ds-brand-success border-ds-brand-success/30",
};

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const c = AUTH_CONTENT.login;
  const isDev =
    process.env.NEXT_PUBLIC_SHOW_DEV_CREDS === "true" ||
    process.env.NODE_ENV === "development";

  const handleSubmit = async (values: { email: string; password: string }) => {
    setLoading(true);
    setError(null);
    try {
      await login(values.email, values.password);
      const redirect = searchParams.get("redirect");
      router.replace(
        redirect && redirect.startsWith("/") ? redirect : ROUTES.DASHBOARD,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (email: string, password: string) => {
    form.setFieldsValue({ email, password });
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

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}>
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

      {isDev && (
        <div className="mt-6 pt-5 border-t border-ds-border-base/50">
          <p className="text-xs text-ds-text-subtle mb-3 text-center font-medium tracking-wide uppercase">
            {c.devCredentialsTitle}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {DEV_CREDENTIALS.map((cred) => (
              <button
                key={cred.email}
                type="button"
                onClick={() => fillCredentials(cred.email, cred.password)}
                className={`text-left px-3 py-2 rounded-ds-lg border text-xs transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${ROLE_COLORS[cred.role]}`}>
                <span className="font-semibold block">{cred.label}</span>
                <span className="opacity-70 text-[11px]">{cred.email}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<Spinner fullPage tip="Loading login form..." />}>
      <LoginForm />
    </Suspense>
  );
}
