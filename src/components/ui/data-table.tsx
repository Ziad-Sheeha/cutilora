import type { ReactNode } from "react"
import { LoaderCircle } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

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

/** Typed, presentation-only table shared by platform and clinic data modules. */
export function DataTable<T>({
  columns,
  data,
  getRowId,
  isLoading = false,
  emptyState,
  loadingLabel,
  tableClassName,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex min-h-52 items-center justify-center gap-2 text-sm text-muted-foreground" role="status">
        <LoaderCircle className="size-5 animate-spin" />
        {loadingLabel}
      </div>
    )
  }

  if (data.length === 0) return <>{emptyState}</>

  return (
    <Table className={tableClassName}>
      <TableHeader>
        <TableRow className="bg-muted/30 hover:bg-muted/30">
          {columns.map((column) => (
            <TableHead key={column.id} className={column.headerClassName}>{column.header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row) => (
          <TableRow key={getRowId(row)} className="group">
            {columns.map((column) => (
              <TableCell key={column.id} className={column.cellClassName}>{column.cell(row)}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
