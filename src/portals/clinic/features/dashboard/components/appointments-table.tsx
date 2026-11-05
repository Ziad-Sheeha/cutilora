import { useMemo, useState } from "react"
import { Link } from "react-router"
import { useQuery } from "@tanstack/react-query"
import { ArrowUpRight, CalendarDays } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { useI18n } from "@/i18n/i18n-provider"
import { useAppSelector } from "@/store/hooks"
import { fetchClinicModuleRecords, type ClinicRecord } from "@/portals/clinic/features/clinic/api/clinic-module.api"

function relatedName(value: unknown) {
  if (typeof value === "string") return value
  if (value && typeof value === "object") {
    const row = value as Record<string, unknown>
    return String(row.fullName ?? row.full_name ?? row.name ?? row.displayName ?? row.email ?? "—")
  }
  return "—"
}
function scheduledDate(record: ClinicRecord) {
  const value = record.scheduledAt ?? record.startsAt ?? record.appointmentAt ?? record.date
  if (typeof value !== "string") return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}
function rowId(record: ClinicRecord) {
  const id = record.id ?? record._id ?? record.uuid
  return typeof id === "string" || typeof id === "number" ? String(id) : JSON.stringify(record)
}

export const AppointmentsTable = function AppointmentsTable() {
  const { t, locale } = useI18n()
  const d = t.dashboard
  const branchId = useAppSelector((state) => state.ui.currentBranchId)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(5)
  const query = useQuery({
    queryKey: ["clinic-module", "appointments", branchId],
    queryFn: () => fetchClinicModuleRecords("appointments"),
    staleTime: 30_000,
  })
  const rows = query.data ?? []
  const columns = useMemo<DataTableColumn<ClinicRecord>[]>(() => [
    {
      id: "patient",
      header: d.patient,
      cell: (record) => <span className="font-medium">{relatedName(record.patient ?? record.patientName ?? record.patientId)}</span>,
    },
    {
      id: "service",
      header: d.service,
      cell: (record) => <span className="text-muted-foreground">{relatedName(record.service ?? record.serviceName ?? record.serviceId)}</span>,
    },
    {
      id: "provider",
      header: d.provider,
      cell: (record) => <span className="text-muted-foreground">{relatedName(record.provider ?? record.providerName ?? record.providerId)}</span>,
    },
    {
      id: "scheduledAt",
      header: d.time,
      cell: (record) => {
        const date = scheduledDate(record)
        return <time className="whitespace-nowrap text-xs tabular-nums">{date ? new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", { dateStyle: "medium", timeStyle: "short" }).format(date) : "—"}</time>
      },
    },
    {
      id: "status",
      header: d.status,
      cell: (record) => {
        const status = String(record.status ?? "unknown")
        const label = t.clinic.statuses[status as keyof typeof t.clinic.statuses] ?? status
        return <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold">{label}</span>
      },
    },
  ], [d, locale, t.clinic.statuses])
  const totalPages = Math.max(1, Math.ceil(rows.length / perPage))
  const pageRows = rows.slice((page - 1) * perPage, page * perPage)

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-center justify-between gap-3 border-b px-5 py-4">
          <div><h2 className="font-semibold">{d.upcomingAppointments}</h2><p className="mt-1 text-xs text-muted-foreground">{d.nextVisits}</p></div>
          <Link to="/clinic/appointments" className="inline-flex items-center gap-1 text-xs font-semibold text-primary">{d.viewAll}<ArrowUpRight className="size-3.5"/></Link>
        </div>
        {query.isError && <div role="alert" className="m-4 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{query.error instanceof Error ? query.error.message : (locale === "ar" ? "تعذر تحميل المواعيد" : "Unable to load appointments")}</div>}
        <DataTable
          columns={columns}
          data={pageRows}
          getRowId={rowId}
          isLoading={query.isLoading}
          loadingLabel={locale === "ar" ? "جارٍ تحميل المواعيد..." : "Loading appointments..."}
          emptyState={<div className="px-5 py-12 text-center"><CalendarDays className="mx-auto size-8 text-muted-foreground/40"/><p className="mt-3 text-sm font-semibold">{locale === "ar" ? "لا توجد مواعيد" : "No appointments found"}</p><p className="mt-1 text-xs text-muted-foreground">{locale === "ar" ? "ستظهر المواعيد هنا عند إرجاعها من الخادم." : "Appointments will appear here when returned by the API."}</p></div>}
          pagination={{ page, perPage, total: rows.length, totalKnown: true, hasNext: page < totalPages }}
          onPageChange={setPage}
          onPerPageChange={(size) => { setPerPage(size); setPage(1) }}
        />
      </CardContent>
    </Card>
  )
}
