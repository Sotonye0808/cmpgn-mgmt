"use client";

import { useState, useEffect } from "react";
import { Select, Input, Button, Result } from "antd";
import { ROUTES } from "@/config/routes";
import { BUG_REPORT_CONTENT, BUG_REPORT_CATEGORIES } from "@/config/content";
import { ICONS } from "@/config/icons";
import MediaUpload from "@/components/ui/MediaUpload";
import Link from "next/link";

const { TextArea } = Input;

interface AuthUser {
  email?: string;
  id?: string;
}

export default function BugReportForm() {
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  // Auto-fill email for authenticated users
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(ROUTES.API.AUTH.ME);
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setCurrentUser(json.data);
            setEmail(json.data.email ?? "");
          }
        }
      } catch {
        // Not authenticated — that's fine
      }
    }
    fetchUser();
  }, []);

  const handleSubmit = async () => {
    if (!category || !description.trim() || !email.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch(ROUTES.API.BUG_REPORTS.BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          description: description.trim(),
          email: email.trim(),
          screenshotUrl,
          pageUrl:
            typeof window !== "undefined" ? window.location.href : undefined,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Failed to submit report");
      }

      setSubmitted(true);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Result
        status="success"
        title={BUG_REPORT_CONTENT.success.title}
        subTitle={BUG_REPORT_CONTENT.success.message}
        extra={
          <Link href={ROUTES.HOME}>
            <Button type="primary">
              {BUG_REPORT_CONTENT.success.backLabel}
            </Button>
          </Link>
        }
      />
    );
  }

  const categoryOptions = BUG_REPORT_CATEGORIES.map((c) => ({
    value: c.key,
    label: (
      <div>
        <div className="font-medium">{c.label}</div>
        <div className="text-xs text-ds-text-subtle">{c.description}</div>
      </div>
    ),
  }));

  const content = BUG_REPORT_CONTENT.form;

  return (
    <div className="rounded-ds-xl border border-ds-border-base bg-ds-surface-elevated p-6 md:p-8 space-y-6">
      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-ds-text-primary mb-2">
          {content.categoryLabel} <span className="text-red-500">*</span>
        </label>
        <Select
          placeholder={content.categoryPlaceholder}
          options={categoryOptions}
          value={category}
          onChange={setCategory}
          className="w-full"
          size="large"
          optionLabelProp="label"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-ds-text-primary mb-2">
          {content.descriptionLabel} <span className="text-red-500">*</span>
        </label>
        <TextArea
          placeholder={content.descriptionPlaceholder}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={6}
          maxLength={5000}
          showCount
          size="large"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-ds-text-primary mb-2">
          {content.emailLabel} <span className="text-red-500">*</span>
        </label>
        <Input
          placeholder={content.emailPlaceholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          size="large"
          disabled={!!currentUser?.email}
        />
        <p className="text-xs text-ds-text-subtle mt-1">{content.emailHint}</p>
      </div>

      {/* Screenshot (optional) */}
      <div>
        <label className="block text-sm font-medium text-ds-text-primary mb-2">
          {content.screenshotLabel}
        </label>
        <MediaUpload
          accept="image/*"
          maxSizeMb={10}
          showPreview
          onUploadComplete={(media) => setScreenshotUrl(media.url)}
        />
        <p className="text-xs text-ds-text-subtle mt-1">{content.screenshotHint}</p>
      </div>

      {/* Error */}
      {error && (
        <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-ds-lg p-3">
          {error}
        </div>
      )}

      {/* Submit */}
      <Button
        type="primary"
        size="large"
        block
        onClick={handleSubmit}
        loading={submitting}
        disabled={!category || !description.trim() || !email.trim()}
        icon={<ICONS.bug />}>
        {submitting ? content.submittingLabel : content.submitLabel}
      </Button>
    </div>
  );
}
