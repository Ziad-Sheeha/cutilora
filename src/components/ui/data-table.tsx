import { useMemo, type ReactNode } from "react"
import { Download, FileSpreadsheet, FileText, LoaderCircle } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"

export interface DataTableColumn<T> {
  id: string
  header: ReactNode
  cell: (row: T) => ReactNode
  headerClassName?: string
  cellClassName?: string
}

interface AuditableRecord {
  created_at?: string | null
  updated_at?: string | null
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  getRowId: (row: T) => string
  isLoading?: boolean
  emptyState: ReactNode
  loadingLabel: string
  createdAtLabel?: string
  updatedAtLabel?: string
  exportPdfLabel?: string
  exportExcelLabel?: string
  locale?: string
  tableClassName?: string
}

function formatDate(value: string | null | undefined, locale: string): ReactNode {
  if (!value) return <span className="text-muted-foreground">—</span>
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return <span className="text-muted-foreground">—</span>
  return <time dateTime={value} className="block whitespace-nowrap text-xs tabular-nums text-foreground/80">{new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(date)}</time>
}

/** Shared responsive table with consistent audit metadata and future export affordances. */
export function DataTable<T>({
  columns, data, getRowId, isLoading = false, emptyState, loadingLabel,
  createdAtLabel = "Created", updatedAtLabel = "Updated",
  exportPdfLabel = "PDF", exportExcelLabel = "Excel", locale = "en", tableClassName,
}: DataTableProps<T>) {
  const hasAuditFields = data.some((row) => {
    const item = row as T & AuditableRecord
    return item.created_at !== undefined || item.updated_at !== undefined
  })
  const visibleColumns = useMemo(() => {
    if (!hasAuditFields) return columns
    return [
      ...columns,
      { id: "created_at", header: createdAtLabel, cell: (row: T) => formatDate((row as T & AuditableRecord).created_at, locale), headerClassName: "min-w-40", cellClassName: "min-w-40" },
      { id: "updated_at", header: updatedAtLabel, cell: (row: T) => formatDate((row as T & AuditableRecord).updated_at, locale), headerClassName: "min-w-40", cellClassName: "min-w-40" },
    ]
  }, [columns, hasAuditFields, createdAtLabel, updatedAtLabel, locale])

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-end gap-2 border-b border-border/70 bg-muted/10 px-4 py-3">
        <span className="me-auto hidden items-center gap-2 text-xs text-muted-foreground sm:inline-flex"><Download className="size-3.5" />{exportPdfLabel} / {exportExcelLabel}</span>
        <Button type="button" size="sm" variant="outline" disabled title="Export will be enabled when the API supports it" className="h-8 gap-1.5 text-xs"><FileText className="size-3.5" />{exportPdfLabel}</Button>
        <Button type="button" size="sm" variant="outline" disabled title="Export will be enabled when the API supports it" className="h-8 gap-1.5 text-xs"><FileSpreadsheet className="size-3.5" />{exportExcelLabel}</Button>
      </div>
      {isLoading ? (
        <div className="flex min-h-56 items-center justify-center gap-3 text-sm text-muted-foreground" role="status">
          <LoaderCircle className="size-5 animate-spin text-primary" />{loadingLabel}
        </div>
      ) : data.length === 0 ? (
        <div className="p-10 sm:p-14">{emptyState}</div>
      ) : (
        <div className="overflow-x-auto">
          <Table className={tableClassName}>
            <TableHeader>
              <TableRow className="border-b bg-muted/35 hover:bg-muted/35">
                {visibleColumns.map((column) => <TableHead key={column.id} className={`h-12 whitespace-nowrap px-5 text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground ${column.headerClassName ?? ""}`}>{column.header}</TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={getRowId(row)} className="group border-b border-border/60 transition-colors hover:bg-primary/[0.025]">
                  {visibleColumns.map((column) => <TableCell key={column.id} className={`px-5 py-4 align-middle ${column.cellClassName ?? ""}`}>{column.cell(row)}</TableCell>)}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
