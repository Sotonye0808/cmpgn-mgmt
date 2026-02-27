"use client";

import { Table } from "antd";
import type { TableProps } from "antd";
import { cn } from "@/lib/utils/cn";

interface DataTableProps<T extends object> extends TableProps<T> {
  /** Extra classes applied to the outer wrapper div. */
  wrapperClassName?: string;
}

/**
 * DataTable — DS-compliant table wrapper.
 *
 * Enforces:
 *   - overflow-x-auto for mobile  (B5)
 *   - opaque surface (glass on tables is a DS violation)
 *   - rounded-ds-xl container
 *   - DS-token row hover
 *   - sticky header
 */
export default function DataTable<T extends object>({
  wrapperClassName,
  className,
  ...props
}: DataTableProps<T>) {
  return (
    <div
      className={cn(
        "w-full overflow-x-auto rounded-ds-xl border border-ds-border-base bg-ds-surface-elevated",
        wrapperClassName,
      )}>
      <Table<T>
        {...props}
        className={cn("w-full", className)}
        rowClassName={(_, index) =>
          cn(
            "hover:bg-ds-brand-accent-subtle transition-colors",
            typeof props.rowClassName === "function"
              ? (props.rowClassName as (record: T, index: number) => string)(
                  _ as T,
                  index,
                )
              : (props.rowClassName ?? ""),
          )
        }
        sticky
        pagination={
          props.pagination === false
            ? false
            : {
                showSizeChanger: false,
                ...((typeof props.pagination === "object"
                  ? props.pagination
                  : {}) as object),
              }
        }
      />
    </div>
  );
}
