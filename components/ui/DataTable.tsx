"use client";

import { Table, Button, Tooltip } from "antd";
import type {
  ColumnGroupType,
  ColumnType,
  ColumnsType,
  TableProps,
} from "antd/es/table";
import { cn } from "@/lib/utils/cn";
import { exportToExcel } from "@/lib/utils/exportExcel";
import { ICONS } from "@/config/icons";

interface ExportConfig<T> {
  /** Filename without extension. Defaults to "export". */
  filename?: string;
  /**
   * Map from row object key → column header label used in the exported file.
   * When omitted, all keys in the data objects are exported with their raw names.
   * Pass an ordered partial record to control ordering and label overrides.
   */
  headers?: Partial<Record<keyof T, string>>;
  /**
   * Optional transformer to convert the table dataSource into the flat objects
   * that will be written to the sheet. Useful when cells render computed values.
   * When omitted, the raw dataSource objects are exported as-is.
   */
  toRow?: (item: T) => Record<string, unknown>;
}

interface DataTableProps<T extends object> extends TableProps<T> {
  /** Extra classes applied to the outer wrapper div. */
  wrapperClassName?: string;
  /**
   * When provided, an Export button is rendered above the table. Clicking it
   * downloads the current dataSource as an Excel (.xlsx) file.
   */
  exportConfig?: ExportConfig<T>;
  /**
   * Max height of the scrollable table body (px number or CSS string).
   * Enables a sticky header + vertical body scroll within the container.
   * Defaults to "calc(100vh - 280px)" which fits most dashboard panels.
   * Pass false to disable vertical clamping and let the table grow freely.
   */
  maxBodyHeight?: number | string | false;
  /**
   * When true, columns default to nowrap + ellipsis (opt out per-column with
   * ellipsis: false). When false (default), cells use natural wrapping and
   * overflow scrolls horizontally so no data is clipped.
   */
  compactCells?: boolean;
}

/**
 * Normalise columns — optionally inject nowrap + ellipsis defaults.
 * When `compact` is false, cells use natural sizing and AntD handles overflow
 * via scroll.x, so every cell's content is always reachable via horizontal scroll.
 * Recurses into ColumnGroup children.
 */
function normaliseColumns<T extends object>(
  cols: ColumnsType<T> | undefined,
  compact: boolean,
): ColumnsType<T> | undefined {
  if (!cols) return undefined;
  return cols.map((col) => {
    if ("children" in col) {
      const g = col as ColumnGroupType<T>;
      return {
        ...g,
        children: normaliseColumns(g.children as ColumnsType<T>, compact) ?? [],
      };
    }
    const c = col as ColumnType<T>;
    const prevOnCell = c.onCell;
    const prevOnHeaderCell = c.onHeaderCell;

    // In compact mode, honour per-column ellipsis (default ON).
    // In normal mode, never force ellipsis — let content define width.
    const useEllipsis = compact ? (c.ellipsis ?? true) : c.ellipsis === true;

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
 *  • By default, cells use natural wrapping — data is never clipped.
 *    Set compactCells={true} for the old behaviour (nowrap + ellipsis).
 *  • Sticky header is built into AntD's scroll.y — no manual `sticky` prop needed.
 *  • Pagination defaults include page-size changer.
 */
export default function DataTable<T extends object>({
  wrapperClassName,
  className,
  maxBodyHeight = "calc(100vh - 280px)",
  compactCells = false,
  exportConfig,
  columns,
  ...props
}: DataTableProps<T>) {
  const scrollY = maxBodyHeight === false ? undefined : maxBodyHeight;

  const handleExport = () => {
    const source = (props.dataSource ?? []) as T[];
    if (source.length === 0) return;
    const rows = exportConfig?.toRow
      ? source.map(exportConfig.toRow)
      : (source as unknown as Record<string, unknown>[]);
    exportToExcel(
      rows,
      exportConfig?.filename ?? "export",
      exportConfig?.headers as Partial<Record<string, string>> | undefined,
    );
  };

  return (
    <div className={cn("space-y-2", wrapperClassName)}>
      {exportConfig && (
        <div className="flex justify-end">
          <Tooltip title="Export to Excel">
            <Button
              icon={<ICONS.download />}
              onClick={handleExport}
              disabled={!props.dataSource || (props.dataSource as T[]).length === 0}>
              Export
            </Button>
          </Tooltip>
        </div>
      )}
      <div
        className={cn(
        // overflow-hidden clips corners to match the rounded border AND lets
        // AntD's INTERNAL scroll container (.ant-table-body) handle horizontal +
        // vertical overflow. Do NOT add overflow-x-auto here.
        "w-full overflow-hidden rounded-ds-xl border border-ds-border-base bg-ds-surface-elevated",
      )}>
      <Table<T>
        {...props}
        columns={normaliseColumns(columns, compactCells)}
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
    </div>
  );
}
