import type { ReactNode } from "react"
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
} from "lucide-react"
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
  pagination?: {
    page: number
    perPage: number
    total: number
    totalKnown: boolean
    hasNext: boolean
  }
  onPageChange?: (page: number) => void
  onPerPageChange?: (perPage: number) => void
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

/** Shared table presentation. Data fetching and pagination state remain owned by each page. */
export function DataTable<T>({
  columns,
  data,
  getRowId,
  isLoading = false,
  emptyState,
  loadingLabel,
  tableClassName,
  pagination,
  onPageChange,
  onPerPageChange,
}: DataTableProps<T>) {
  const { locale } = useI18n()
  const isArabic = locale === "ar"
  const hasCreatedAt = data.some((row) => Boolean(timestampOf(row, "created_at", "createdAt")))
  const hasUpdatedAt = data.some((row) => Boolean(timestampOf(row, "updated_at", "updatedAt")))

  // System metadata is inserted before the actions column, which must always remain last.
  const actionColumns = columns.filter((column) => column.id === "actions")
  const regularColumns = columns.filter((column) => column.id !== "actions")
  const displayColumns: DataTableColumn<T>[] = [
    ...regularColumns,
    ...(hasCreatedAt ? [{
      id: "created-at",
      header: isArabic ? "تاريخ الإنشاء" : "Created at",
      cell: (row: T) => <time className="whitespace-nowrap text-xs font-medium tabular-nums text-muted-foreground">{formatTimestamp(timestampOf(row, "created_at", "createdAt"), locale)}</time>,
      headerClassName: "whitespace-nowrap",
    }] : []),
    ...(hasUpdatedAt ? [{
      id: "updated-at",
      header: isArabic ? "آخر تحديث" : "Updated at",
      cell: (row: T) => <time className="whitespace-nowrap text-xs font-medium tabular-nums text-muted-foreground">{formatTimestamp(timestampOf(row, "updated_at", "updatedAt"), locale)}</time>,
      headerClassName: "whitespace-nowrap",
    }] : []),
    ...actionColumns,
  ]

  if (isLoading) {
    return <div className="flex min-h-56 items-center justify-center gap-3 text-sm text-muted-foreground" role="status"><LoaderCircle className="size-5 animate-spin text-primary" />{loadingLabel}</div>
  }

  if (data.length === 0) return <>{emptyState}</>

  const firstItem = pagination ? (pagination.page - 1) * pagination.perPage + 1 : 1
  const lastItem = firstItem + data.length - 1
  const pageCount = pagination?.totalKnown
    ? Math.max(1, Math.ceil(pagination.total / pagination.perPage))
    : undefined
  const buttonClass = "inline-flex size-9 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <Table className={tableClassName}>
          <TableHeader>
            <TableRow className="border-b border-border/70 bg-muted/30 hover:bg-muted/30">
              {displayColumns.map((column) => (
                <TableHead key={column.id} className={`h-12 whitespace-nowrap px-5 text-[11px] font-semibold tracking-wide text-muted-foreground ${column.headerClassName ?? ""}`}>{column.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={getRowId(row)} className="border-b border-border/50 transition-colors hover:bg-muted/35">
                {displayColumns.map((column) => (
                  <TableCell key={column.id} className={`px-5 py-3.5 align-middle ${column.cellClassName ?? ""}`}>{column.cell(row)}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pagination && onPageChange && onPerPageChange && (
        <footer className="flex flex-col gap-3 border-t border-border/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <label className="flex items-center gap-2">
              <span>{isArabic ? "عدد الصفوف" : "Rows per page"}</span>
              <select
                value={pagination.perPage}
                onChange={(event) => onPerPageChange(Number(event.target.value))}
                className="h-9 rounded-lg border border-border bg-card px-2 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                aria-label={isArabic ? "عدد الصفوف في الصفحة" : "Rows per page"}
              >
                {[10, 25, 50, 100].map((size) => <option key={size} value={size}>{size}</option>)}
              </select>
            </label>
            <span className="tabular-nums">
              {isArabic ? "عرض" : "Showing"} {firstItem}–{lastItem}
              {pagination.totalKnown ? ` ${isArabic ? "من" : "of"} ${pagination.total}` : ""}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <span className="text-xs font-medium text-muted-foreground">
              {isArabic ? "صفحة" : "Page"} {pagination.page}
              {pageCount ? ` ${isArabic ? "من" : "of"} ${pageCount}` : ""}
            </span>
            <div className="flex items-center gap-1">
              {pagination.totalKnown && (
                <button type="button" className={buttonClass} onClick={() => onPageChange(1)} disabled={pagination.page <= 1} aria-label={isArabic ? "أول صفحة" : "First page"}>
                  {isArabic ? <ChevronLast className="size-4" /> : <ChevronFirst className="size-4" />}
                </button>
              )}
              <button type="button" className={buttonClass} onClick={() => onPageChange(Math.max(1, pagination.page - 1))} disabled={pagination.page <= 1} aria-label={isArabic ? "الصفحة السابقة" : "Previous page"}>
                {isArabic ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
              </button>
              <button type="button" className={buttonClass} onClick={() => onPageChange(pagination.page + 1)} disabled={!pagination.hasNext} aria-label={isArabic ? "الصفحة التالية" : "Next page"}>
                {isArabic ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
              </button>
              {pagination.totalKnown && (
                <button type="button" className={buttonClass} onClick={() => onPageChange(pageCount ?? 1)} disabled={pagination.page >= (pageCount ?? 1)} aria-label={isArabic ? "آخر صفحة" : "Last page"}>
                  {isArabic ? <ChevronFirst className="size-4" /> : <ChevronLast className="size-4" />}
                </button>
              )}
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}
