import type { ReactNode } from "react"
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  X,
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useI18n } from "@/i18n/i18n-provider"
import { SelectMenu, SelectMenuContent, SelectMenuItem, SelectMenuTrigger, SelectMenuValue } from "@/components/ui/select-menu"

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
  /** Controlled selection. When omitted, selection controls are not rendered. */
  selectedRowIds?: string[]
  onSelectionChange?: (selectedIds: string[]) => void
  /** Optional page-specific actions displayed in the floating bulk-action bar. */
  bulkActions?: ReactNode
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
  selectedRowIds,
  onSelectionChange,
  bulkActions,
}: DataTableProps<T>) {
  const { locale } = useI18n()
  const isArabic = locale === "ar"
  const selectionEnabled = selectedRowIds !== undefined && onSelectionChange !== undefined
  const selectedSet = new Set(selectedRowIds ?? [])
  const pageIds = data.map(getRowId)
  const selectedOnPage = pageIds.filter((id) => selectedSet.has(id)).length
  const allPageSelected = pageIds.length > 0 && selectedOnPage === pageIds.length
  const somePageSelected = selectedOnPage > 0 && !allPageSelected
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
  const buttonClass = "inline-flex size-9 items-center justify-center rounded-xl border border-border/70 bg-background text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
  const checkboxClass = "size-[17px] cursor-pointer rounded border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"

  function togglePage(checked: boolean) {
    if (!onSelectionChange) return
    if (checked) {
      onSelectionChange(Array.from(new Set([...(selectedRowIds ?? []), ...pageIds])))
    } else {
      onSelectionChange((selectedRowIds ?? []).filter((id) => !pageIds.includes(id)))
    }
  }

  return (
    <div className="w-full">
      <div className="overflow-x-auto px-1">
        <Table className={tableClassName}>
          <TableHeader>
            <TableRow className="border-0 bg-muted/55 hover:bg-muted/55">
              {selectionEnabled && (
                <TableHead className="h-11 w-12 rounded-s-xl px-4">
                  <input
                    type="checkbox"
                    className={checkboxClass}
                    checked={allPageSelected}
                    ref={(element) => {
                      if (element) element.indeterminate = somePageSelected
                    }}
                    onChange={(event) => togglePage(event.target.checked)}
                    aria-label={isArabic ? "تحديد كل صفوف الصفحة" : "Select all rows on page"}
                    aria-checked={somePageSelected ? "mixed" : allPageSelected}
                  />
                </TableHead>
              )}
              {displayColumns.map((column, index) => (
                <TableHead
                  key={column.id}
                  className={`h-11 whitespace-nowrap px-4 text-[11px] font-bold tracking-wide text-muted-foreground ${index === displayColumns.length - 1 ? "last:rounded-e-xl" : ""} ${column.headerClassName ?? ""}`}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="[&_tr:last-child]:border-b-0">
            {data.map((row, rowIndex) => {
              const rowId = getRowId(row)
              const isSelected = selectedSet.has(rowId)
              return (
                <TableRow
                  key={rowId}
                  data-state={isSelected ? "selected" : undefined}
                  className={`group border-0 transition-colors hover:bg-primary/[0.035] ${rowIndex % 2 === 1 ? "bg-muted/[0.28]" : "bg-background"} ${isSelected ? "bg-primary/[0.055] hover:bg-primary/[0.075]" : ""}`}
                >
                  {selectionEnabled && (
                    <TableCell className="w-12 px-4 py-3.5">
                      <input
                        type="checkbox"
                        className={checkboxClass}
                        checked={isSelected}
                        onChange={(event) => {
                          const next = event.target.checked
                            ? [...(selectedRowIds ?? []), rowId]
                            : (selectedRowIds ?? []).filter((id) => id !== rowId)
                          onSelectionChange?.(Array.from(new Set(next)))
                        }}
                        aria-label={isArabic ? "تحديد الصف" : "Select row"}
                      />
                    </TableCell>
                  )}
                  {displayColumns.map((column) => (
                    <TableCell key={column.id} className={`px-4 py-3.5 align-middle ${column.cellClassName ?? ""}`}>
                      {column.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {pagination && onPageChange && onPerPageChange && (
        <footer className="mt-2 flex flex-col gap-3 border-t border-border/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>{isArabic ? "عدد الصفوف" : "Rows per page"}</span>
              <SelectMenu value={String(pagination.perPage)} onValueChange={(value) => onPerPageChange(Number(value))}>
                <SelectMenuTrigger className="h-9 w-[88px] rounded-lg" aria-label={isArabic ? "عدد الصفوف في الصفحة" : "Rows per page"}><SelectMenuValue /></SelectMenuTrigger>
                <SelectMenuContent align="end">{[10, 25, 50, 100].map((size) => <SelectMenuItem key={size} value={String(size)}>{size}</SelectMenuItem>)}</SelectMenuContent>
              </SelectMenu>
            </div>
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
            <div className="flex items-center gap-1.5">
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

      {selectionEnabled && selectedSet.size > 0 && (
        <div
          className="fixed inset-x-4 bottom-5 z-50 mx-auto flex w-fit max-w-[calc(100vw-2rem)] flex-wrap items-center justify-center gap-3 rounded-2xl border border-white/10 bg-[#20202b] px-4 py-3 text-white shadow-2xl shadow-black/20 sm:inset-x-auto sm:bottom-7 sm:gap-4 sm:rounded-full sm:px-5"
          role="region"
          aria-label={isArabic ? "إجراءات الصفوف المحددة" : "Selected rows actions"}
        >
          <button
            type="button"
            onClick={() => onSelectionChange?.([])}
            className="inline-flex size-8 items-center justify-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white"
            aria-label={isArabic ? "إلغاء التحديد" : "Clear selection"}
          >
            <X className="size-5" />
          </button>
          <span className="whitespace-nowrap text-sm font-semibold">
            <span className="me-2 rounded-full bg-white/15 px-2.5 py-1 tabular-nums">{selectedSet.size}</span>
            {isArabic ? "عنصر محدد" : "items selected"}
          </span>
          {bulkActions}
        </div>
      )}
    </div>
  )
}
