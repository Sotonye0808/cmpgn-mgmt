"use client";

import { useState } from "react";
import { Upload, App, Image } from "antd";
import { ICONS } from "@/config/icons";
import { cn } from "@/lib/utils/cn";

interface UploadedMedia {
  url: string;
  thumbnailUrl: string;
  type: "IMAGE" | "VIDEO";
  fileName: string;
  /** Cloudinary public_id — use for cleanup via DELETE /api/upload */
  publicId: string;
}

interface Props {
  value?: string;
  onChange?: (url: string) => void;
  onUploadComplete?: (media: UploadedMedia) => void;
  accept?: string;
  maxSizeMb?: number;
  placeholder?: string;
  className?: string;
  showPreview?: boolean;
  /** Passed as ?category= to /api/upload — controls the Cloudinary folder */
  category?: string;
}

export default function MediaUpload({
  value,
  onChange,
  onUploadComplete,
  accept = "image/*,video/mp4,video/webm",
  maxSizeMb = 10,
  placeholder = "Click or drag to upload",
  className,
  showPreview = true,
  category,
}: Props) {
  const { message: msgApi } = App.useApp();
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(value);

  const handleUpload = async (file: File): Promise<boolean> => {
    if (file.size > maxSizeMb * 1024 * 1024) {
      msgApi.error(`File too large. Max ${maxSizeMb}MB`);
      return false;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadUrl = `/api/upload${category ? `?category=${encodeURIComponent(category)}` : ""}`;
      const res = await window.fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });
      const json = await res.json();

      if (json.success) {
        const media = json.data as UploadedMedia;
        setPreviewUrl(media.url);
        onChange?.(media.url);
        onUploadComplete?.(media);
        msgApi.success("Upload successful");
      } else {
        msgApi.error(json.error ?? "Upload failed");
      }
    } catch {
      msgApi.error("Network error during upload");
    } finally {
      setUploading(false);
    }

    // Prevent antd default upload behavior
    return false;
  };

  return (
    <div className={cn("space-y-3", className)}>
      <Upload.Dragger
        accept={accept}
        showUploadList={false}
        beforeUpload={handleUpload}
        disabled={uploading}
        className="!bg-ds-surface-elevated !border-ds-border-default hover:!border-ds-brand-accent">
        <div className="py-4 text-center">
          {uploading ? (
            <div className="text-ds-text-subtle">
              <ICONS.upload className="text-2xl mb-2" />
              <p className="text-sm">Uploading...</p>
            </div>
          ) : (
            <div className="text-ds-text-subtle">
              <ICONS.upload className="text-2xl mb-2" />
              <p className="text-sm">{placeholder}</p>
              <p className="text-xs mt-1">
                Max {maxSizeMb}MB · Images &amp; video
              </p>
            </div>
          )}
        </div>
      </Upload.Dragger>

      {showPreview && previewUrl && (
        <div className="rounded-ds-lg overflow-hidden border border-ds-border-default">
          <Image
            src={previewUrl}
            alt="Upload preview"
            className="w-full max-h-48 object-cover"
            fallback="https://picsum.photos/400/200?grayscale"
          />
        </div>
      )}
    </div>
  );
}
