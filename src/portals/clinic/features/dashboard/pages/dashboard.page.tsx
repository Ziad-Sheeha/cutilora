import { useMemo } from "react"
import { Link } from "react-router"
import { useQuery } from "@tanstack/react-query"
import { CalendarCheck, CircleDollarSign, Clock3, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { StatCard } from "@/shared/components/stat-card"
import { useI18n } from "@/i18n/i18n-provider"
import { useAppSelector } from "@/store/hooks"
import { fetchClinicModuleRecords, type ClinicRecord } from "@/portals/clinic/features/clinic/api/clinic-module.api"
import { AppointmentsTable } from "@/portals/clinic/features/dashboard/components/appointments-table"

function dateOf(record: ClinicRecord) {
  const value = record.scheduledAt ?? record.startsAt ?? record.appointmentAt ?? record.date
  if (typeof value !== "string") return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}
function amountOf(record: ClinicRecord) {
  const value = record.totalAmount ?? record.grandTotal ?? record.amount ?? record.total
  return typeof value === "number" && Number.isFinite(value) ? value : 0
}
export function DashboardPage() {
  const { t, locale } = useI18n()
  const d = t.dashboard
  const branchId = useAppSelector((state) => state.ui.currentBranchId)
  const appointmentsQuery = useQuery({ queryKey: ["clinic-module", "appointments", branchId], queryFn: () => fetchClinicModuleRecords("appointments"), staleTime: 30_000 })
  const patientsQuery = useQuery({ queryKey: ["clinic-module", "patients", branchId], queryFn: () => fetchClinicModuleRecords("patients"), staleTime: 60_000 })
  const salesQuery = useQuery({ queryKey: ["clinic-module", "billing", branchId], queryFn: () => fetchClinicModuleRecords("billing"), staleTime: 30_000 })
  const appointments = appointmentsQuery.data ?? []
  const patients = patientsQuery.data ?? []
  const sales = salesQuery.data ?? []
  const now = new Date()
  const todayCount = useMemo(() => appointments.filter((item) => {
    const date = dateOf(item)
    return date?.toDateString() === now.toDateString()
  }).length, [appointments, now.toDateString()])
  const pendingCount = appointments.filter((item) => ["pending", "requested", "awaiting_confirmation"].includes(String(item.status ?? "").toLowerCase())).length
  const monthlyRevenue = sales.filter((item) => {
    const date = dateOf(item) ?? (typeof item.createdAt === "string" ? new Date(item.createdAt) : null)
    return date && !Number.isNaN(date.getTime()) && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  }).reduce((sum, item) => sum + amountOf(item), 0)
  const currency = typeof sales[0]?.currency === "string" ? sales[0].currency : "EGP"
  const revenueLabel = new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-EG", { style: "currency", currency, maximumFractionDigits: 0 }).format(monthlyRevenue)
  const loading = appointmentsQuery.isLoading || patientsQuery.isLoading || salesQuery.isLoading
  const error = appointmentsQuery.error ?? patientsQuery.error ?? salesQuery.error

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-sm font-medium text-primary">{new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", { dateStyle: "full" }).format(now)}</p><h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{d.greeting}</h1><p className="mt-2 text-sm text-muted-foreground">{d.intro}</p></div>
        <Link to="/clinic/appointments" className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">+ {d.newAppointment}</Link>
      </div>

      {error && <div role="alert" className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error instanceof Error ? error.message : (locale === "ar" ? "تعذر تحميل بيانات لوحة التحكم" : "Unable to load dashboard data")}</div>}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={d.appointmentsToday} value={loading ? "—" : String(todayCount)} change="" helper={locale === "ar" ? "من بيانات المواعيد" : "From appointment records"} icon={CalendarCheck}/>
        <StatCard label={d.totalPatients} value={loading ? "—" : patients.length.toLocaleString(locale === "ar" ? "ar-EG" : "en-US")} change="" helper={locale === "ar" ? "سجلات المرضى بالعيادة" : "Clinic patient records"} icon={Users}/>
        <StatCard label={d.revenueMonth} value={loading ? "—" : revenueLabel} change="" helper={locale === "ar" ? "من سجلات المبيعات الحالية" : "From current sales records"} icon={CircleDollarSign}/>
        <StatCard label={d.pendingConfirmations} value={loading ? "—" : String(pendingCount).padStart(2, "0")} change="" helper={d.needAttention} icon={Clock3}/>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.8fr)]">
        <AppointmentsTable/>
        <Card><CardContent className="p-5">
          <h2 className="font-semibold">{d.performance}</h2>
          <p className="mt-1 text-xs text-muted-foreground">{locale === "ar" ? "ملخص فعلي من سجلات المبيعات" : "Live summary from sales records"}</p>
          <p className="mt-8 text-xs text-muted-foreground">{d.monthlyRevenue}</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums">{loading ? "—" : revenueLabel}</p>
          <div className="mt-6 grid grid-cols-2 gap-3 border-t pt-5">
            <div><p className="text-xs text-muted-foreground">{locale === "ar" ? "عدد المبيعات" : "Sales records"}</p><p className="mt-1 text-xl font-semibold">{loading ? "—" : sales.length}</p></div>
            <div><p className="text-xs text-muted-foreground">{locale === "ar" ? "المواعيد المحملة" : "Appointments loaded"}</p><p className="mt-1 text-xl font-semibold">{loading ? "—" : appointments.length}</p></div>
          </div>
          <p className="mt-5 text-xs leading-5 text-muted-foreground">{locale === "ar" ? "لا يتم عرض نسب نمو أو مقارنة تاريخية إلا عند توفر بيانات الفترات السابقة من الـ API." : "Growth percentages and historical comparisons are omitted until prior-period data is available from the API."}</p>
        </CardContent></Card>
      </div>
    </div>
  )
}
