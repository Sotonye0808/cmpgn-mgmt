"use client";

import { useState, useEffect, useRef } from "react";
import { Upload, App, Image, Tooltip } from "antd";
import { ICONS } from "@/config/icons";
import { cn } from "@/lib/utils/cn";

interface Props {
  value?: string[];
  onChange?: (urls: string[]) => void;
  /** Max number of images that can be uploaded at once / held at once */
  max?: number;
  maxSizeMb?: number;
  accept?: string;
  placeholder?: string;
  className?: string;
  id?: string;
}

/**
 * Multi-image uploader bound to a single Form.Item field (value: string[]).
 * Uploads through POST /api/upload (Cloudinary) and emits the list of URLs.
 * Enforces a per-file size limit and a hard count limit (`max`).
 */
export default function MultiImageUpload({
  value = [],
  onChange,
  max = 5,
  maxSizeMb = 10,
  accept = "image/*",
  placeholder = "Click or drag to upload",
  className,
  id,
}: Props) {
  const { message: msgApi } = App.useApp();
  const [urls, setUrls] = useState<string[]>(value ?? []);
  const [uploading, setUploading] = useState(false);
  // Refs keep the current list + in-flight count accurate when the browser
  // fires beforeUpload once per selected file within a single batch.
  const urlsRef = useRef<string[]>(value ?? []);
  const pendingRef = useRef(0);

  useEffect(() => {
    urlsRef.current = value ?? [];
    setUrls(value ?? []);
  }, [value]);

  const commit = (next: string[]) => {
    urlsRef.current = next;
    setUrls(next);
    onChange?.(next);
  };

  const handleUpload = async (file: File): Promise<boolean> => {
    if (urlsRef.current.length + pendingRef.current >= max) {
      msgApi.warning(`You can upload up to ${max} images`);
      return false;
    }
    if (file.size > maxSizeMb * 1024 * 1024) {
      msgApi.error(`File too large. Max ${maxSizeMb}MB`);
      return false;
    }

    pendingRef.current += 1;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await window.fetch("/api/upload?category=proof-deployment", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();

      if (json.success) {
        const url = (json.data as { url?: string } | undefined)?.url;
        if (url) commit([...urlsRef.current, url]);
        else msgApi.error(json.error ?? "Upload failed");
      } else {
        msgApi.error(json.error ?? "Upload failed");
      }
    } catch {
      msgApi.error("Network error during upload");
    } finally {
      pendingRef.current -= 1;
      setUploading(false);
    }

    // Prevent antd default upload behavior
    return false;
  };

  const handleRemove = (url: string) => {
    commit(urls.filter((u) => u !== url));
  };

  const remaining = Math.max(0, max - urls.length);

  return (
    <div className={cn("space-y-3", className)}>
      {urls.length > 0 && (
        <ul className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 list-none p-0 m-0">
          {urls.map((url, idx) => (
            <li
              key={url}
              className="relative rounded-ds-md overflow-hidden border border-ds-border-default bg-ds-surface-elevated">
              <Image
                src={url}
                alt={`Uploaded screenshot ${idx + 1}`}
                className="w-full h-20 object-cover"
                preview={{ mask: "View" }}
              />
              <Tooltip title="Remove">
                <button
                  type="button"
                  aria-label={`Remove screenshot ${idx + 1}`}
                  onClick={() => handleRemove(url)}
                  className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center rounded-full bg-black/60 text-white hover:bg-red-500 transition-colors">
                  <ICONS.close className="text-xs" />
                </button>
              </Tooltip>
            </li>
          ))}
        </ul>
      )}

      {remaining > 0 && (
        <Upload.Dragger
          accept={accept}
          multiple
          showUploadList={false}
          beforeUpload={handleUpload}
          disabled={uploading}
          id={id}
          className="!bg-ds-surface-elevated !border-ds-border-default hover:!border-ds-brand-accent">
          <div className="py-3 text-center">
            {uploading ? (
              <div className="text-ds-text-subtle">
                <ICONS.upload className="text-xl mb-1 mx-auto" />
                <p className="text-sm">Uploading...</p>
              </div>
            ) : (
              <div className="text-ds-text-subtle">
                <ICONS.upload className="text-xl mb-1 mx-auto" />
                <p className="text-sm">{placeholder}</p>
                <p className="text-xs mt-0.5">
                  {urls.length}/{max} uploaded · Max {maxSizeMb}MB each
                </p>
              </div>
            )}
          </div>
        </Upload.Dragger>
      )}
    </div>
  );
}
