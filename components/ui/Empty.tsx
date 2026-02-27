"use client";

import { Empty as AntEmpty } from "antd";
import type { EmptyProps } from "antd";

interface EmptyStateProps extends EmptyProps {
  title?: string;
  description?: string;
}

export default function EmptyState({
  title,
  description,
  ...props
}: EmptyStateProps) {
  return (
    <AntEmpty
      description={
        <div className="text-center">
          {title && (
            <p className="text-ds-text-primary font-semibold text-base mb-1">
              {title}
            </p>
          )}
          {description && (
            <p className="text-ds-text-subtle text-sm">{description}</p>
          )}
          {!title && !description && null}
        </div>
      }
      image={AntEmpty.PRESENTED_IMAGE_SIMPLE}
      {...props}
    />
  );
}
