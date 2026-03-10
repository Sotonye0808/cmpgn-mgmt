import * as XLSX from "xlsx";

/**
 * Export an array of objects to an Excel (.xlsx) file and trigger a browser
 * download. Column headers are derived from the keys of the first record —
 * pass `headers` to customise which keys to include and their display names.
 *
 * @param data      Array of plain objects (rows).
 * @param filename  Base filename without extension (e.g. "users").
 * @param headers   Optional mapping from object key → column header label.
 *                  When provided, only listed keys are included and in order.
 */
export function exportToExcel<T extends Record<string, unknown>>(
    data: T[],
    filename: string,
    headers?: Partial<Record<keyof T, string>>,
): void {
    if (data.length === 0) return;

    let rows: Record<string, unknown>[];

    if (headers) {
        const keys = Object.keys(headers) as (keyof T)[];
        rows = data.map((item) =>
            Object.fromEntries(
                keys.map((k) => [headers[k] ?? String(k), item[k] ?? ""]),
            ),
        );
    } else {
        rows = data as Record<string, unknown>[];
    }

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Auto-size columns based on the content
    const colWidths = Object.keys(rows[0] ?? {}).map((key) => ({
        wch: Math.max(
            key.length,
            ...rows.map((r) => String(r[key] ?? "").length),
        ) + 2,
    }));
    worksheet["!cols"] = colWidths;

    XLSX.writeFile(workbook, `${filename}.xlsx`);
}
