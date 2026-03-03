"use client";

import { Table } from "antd";
import type { ColumnGroupType, ColumnType, ColumnsType, TableProps } from "antd/es/table";
import { cn } from "@/lib/utils/cn";

interface DataTableProps<T extends object> extends TableProps<T> {
  /** Extra classes applied to the outer wrapper div. */
  wrapperClassName?: string;
  /**
   * Max height of the scrollable table body (px number or CSS string).
   * Enables a sticky header + vertical body scroll within the container.
   * Defaults to "calc(100vh - 280px)" which fits most dashboard panels.
   * Pass false to disable vertical clamping and let the table grow freely.
   */
  maxBodyHeight?: number | string | false;
}

/**
 * Inject nowrap + ellipsis defaults into every column.
 * Merges with any onCell / onHeaderCell the caller already provided.
 * Recurses into ColumnGroup children.
 */
function withNowrap<T extends object>(
  cols: ColumnsType<T> | undefined,
): ColumnsType<T> | undefined {
  if (!cols) return undefined;
  return cols.map((col) => {
    if ("children" in col) {
      const g = col as ColumnGroupType<T>;
      return { ...g, children: withNowrap(g.children as ColumnsType<T>) ?? [] };
    }
    const c = col as ColumnType<T>;
    const prevOnCell = c.onCell;
    const prevOnHeaderCell = c.onHeaderCell;
    // Caller's explicit ellipsis: false wins; otherwise default ON.
    const useEllipsis = c.ellipsis ?? true;
    return {
      ...c,
      ellipsis: useEllipsis,
      onCell: (record: T, index?: number) => ({
        style: {
          whiteSpace: useEllipsis ? ("nowrap" as const) : ("normal" as const),
          verticalAlign: "middle",
          ...(useEllipsis ? {} : { overflowWrap: "anywhere" as const }),
        },
        ...(prevOnCell ? prevOnCell(record, index) : {}),
      }),
      onHeaderCell: (column) => ({
        style: { whiteSpace: "nowrap" as const },
        // antd/es and rc-table resolve ColumnType<T> from different paths;
        // the runtime shape is identical — cast to satisfy the compiler.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(prevOnHeaderCell ? prevOnHeaderCell(column as any) : {}),
      }),
    } as ColumnType<T>;
  });
}

/**
 * DataTable — DS-compliant Ant Design table wrapper.
 *
 * Behaviour contract:
 *  • Horizontal scroll is handled by AntD internally (scroll.x = "max-content").
 *    Do NOT add overflow-x-auto to parent elements — it conflicts with AntD's
 *    own scroll container and causes dual-scrollbar and layout bugs.
 *  • Cell content never wraps (injected via onCell whiteSpace: nowrap).
 *  • Ellipsis + tooltip is on by default; opt out per-column with ellipsis: false.
 *  • Sticky header is built into AntD's scroll.y — no manual `sticky` prop needed.
 *  • Pagination defaults include page-size changer.
 */
export default function DataTable<T extends object>({
  wrapperClassName,
  className,
  maxBodyHeight = "calc(100vh - 280px)",
  columns,
  ...props
}: DataTableProps<T>) {
  const scrollY = maxBodyHeight === false ? undefined : maxBodyHeight;

  return (
    <div
      className={cn(
        // overflow-hidden is INTENTIONAL: it clips the corners to match the
        // rounded border AND lets AntD's INTERNAL scroll container (.ant-table-body)
        // handle horizontal + vertical overflow. Do NOT add overflow-x-auto here.
        "w-full overflow-hidden rounded-ds-xl border border-ds-border-base bg-ds-surface-elevated",
        wrapperClassName,
      )}>
      <Table<T>
        {...props}
        columns={withNowrap(columns)}
        className={cn("ds-data-table w-full", className)}
        scroll={
          props.scroll ?? {
            x: "max-content",
            y: scrollY,
          }
        }
        rowClassName={(record, index) =>
          cn(
            "hover:bg-ds-brand-accent-subtle transition-colors",
            typeof props.rowClassName === "function"
              ? (props.rowClassName as (record: T, index: number) => string)(
                  record,
                  index,
                )
              : (props.rowClassName ?? ""),
          )
        }
        pagination={
          props.pagination === false
            ? false
            : {
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "50"],
                showTotal: (total: number) => `${total} records`,
                ...((typeof props.pagination === "object"
                  ? props.pagination
                  : {}) as object),
              }
        }
      />
    </div>
  );
}

