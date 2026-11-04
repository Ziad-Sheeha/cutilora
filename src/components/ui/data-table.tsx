import type { ReactNode } from "react"
import { FileSpreadsheet, FileText, LoaderCircle } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useI18n } from "@/i18n/i18n-provider"

export interface DataTableColumn<T> {
  id: string
  header: ReactNode
  cell: (row: T) => ReactNode
  headerClassName?: string
  cellClassName?: string
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  getRowId: (row: T) => string
  isLoading?: boolean
  emptyState: ReactNode
  loadingLabel: string
  tableClassName?: string
}

type TimestampFields = {
  created_at?: string | null
  updated_at?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

function formatTimestamp(value: string | null | undefined, locale: "en" | "ar") {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function timestampOf<T>(row: T, snake: "created_at" | "updated_at", camel: "createdAt" | "updatedAt") {
  const record = row as T & TimestampFields
  return record[snake] ?? record[camel] ?? null
}

/** Shared table presentation with consistent metadata and disabled export affordances until API support exists. */
export function DataTable<T>({
  columns,
  data,
  getRowId,
  isLoading = false,
  emptyState,
  loadingLabel,
  tableClassName,
}: DataTableProps<T>) {
  const { locale } = useI18n()
  const hasCreatedAt = data.some((row) => Boolean(timestampOf(row, "created_at", "createdAt")))
  const hasUpdatedAt = data.some((row) => Boolean(timestampOf(row, "updated_at", "updatedAt")))
  const displayColumns: DataTableColumn<T>[] = [
    ...columns,
    ...(hasCreatedAt ? [{
      id: "created-at",
      header: locale === "ar" ? "تاريخ الإنشاء" : "Created at",
      cell: (row: T) => <time className="whitespace-nowrap text-xs font-medium tabular-nums text-muted-foreground">{formatTimestamp(timestampOf(row, "created_at", "createdAt"), locale)}</time>,
      headerClassName: "whitespace-nowrap",
    }] : []),
    ...(hasUpdatedAt ? [{
      id: "updated-at",
      header: locale === "ar" ? "آخر تحديث" : "Updated at",
      cell: (row: T) => <time className="whitespace-nowrap text-xs font-medium tabular-nums text-muted-foreground">{formatTimestamp(timestampOf(row, "updated_at", "updatedAt"), locale)}</time>,
      headerClassName: "whitespace-nowrap",
    }] : []),
  ]

  if (isLoading) {
    return <div className="flex min-h-56 items-center justify-center gap-3 text-sm text-muted-foreground" role="status"><LoaderCircle className="size-5 animate-spin text-primary" />{loadingLabel}</div>
  }

  if (data.length === 0) return <>{emptyState}</>

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 bg-muted/15 px-4 py-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {locale === "ar" ? "إجراءات البيانات" : "Data actions"}
        </span>
        <div className="flex items-center gap-2">
          <button type="button" disabled title={locale === "ar" ? "سيتاح بعد ربط خدمة التصدير" : "Available when the export API is connected"} className="inline-flex h-9 cursor-not-allowed items-center gap-2 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-muted-foreground opacity-60">
            <FileText className="size-4" /> PDF
          </button>
          <button type="button" disabled title={locale === "ar" ? "سيتاح بعد ربط خدمة التصدير" : "Available when the export API is connected"} className="inline-flex h-9 cursor-not-allowed items-center gap-2 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-muted-foreground opacity-60">
            <FileSpreadsheet className="size-4" /> Excel
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table className={tableClassName}>
          <TableHeader>
            <TableRow className="border-b border-border/70 bg-muted/35 hover:bg-muted/35">
              {displayColumns.map((column) => (
                <TableHead key={column.id} className={`h-12 whitespace-nowrap px-5 text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground ${column.headerClassName ?? ""}`}>{column.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={getRowId(row)} className="border-b border-border/50 transition-colors hover:bg-primary/[0.035]">
                {displayColumns.map((column) => (
                  <TableCell key={column.id} className={`px-5 py-4 align-middle ${column.cellClassName ?? ""}`}>{column.cell(row)}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
