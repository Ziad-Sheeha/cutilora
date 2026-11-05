import { Link, useOutletContext } from "react-router"
import { useQuery } from "@tanstack/react-query"
import { Activity, AlertTriangle, ArrowUpRight, Building2, CheckCircle2, Clock3, MapPinned, ShieldCheck, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { useI18n } from "@/i18n/i18n-provider"
import { tenantApi } from "../api/tenant-api"
import type { TenantOutletContext } from "../layout/tenant-layout"

type DashboardRecord = Record<string, unknown> & { id?: string; _id?: string; title?: string; message?: string; action?: string; actor?: string; module?: string; createdAt?: string }
function unwrap(value: unknown): unknown {
  let current = value
  for (let i = 0; i < 3; i += 1) {
    if (!current || typeof current !== "object" || !("data" in current)) break
    current = (current as { data: unknown }).data
  }
  return current
}
function rowsOf(value: unknown): DashboardRecord[] {
  const data = unwrap(value)
  if (Array.isArray(data)) return data as DashboardRecord[]
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>
    for (const key of ["items", "records", "activity", "alerts", "data"]) if (Array.isArray(record[key])) return record[key] as DashboardRecord[]
  }
  return []
}
function formatValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "—"
  if (typeof value === "boolean") return value ? "Yes" : "No"
  return String(value)
}
function statusText(value: unknown, ar: boolean) {
  const key = String(value ?? "").toLowerCase()
  const labels: Record<string, [string, string]> = {
    active: ["Active", "نشط"], inactive: ["Inactive", "غير نشط"], suspended: ["Suspended", "موقوف"],
    pending: ["Pending", "قيد الانتظار"], trial: ["Trial", "تجريبي"], expired: ["Expired", "منتهي"],
  }
  return labels[key]?.[ar ? 1 : 0] ?? formatValue(value)
}
function businessTypeText(value: unknown, ar: boolean) {
  const key = String(value ?? "").toLowerCase()
  const labels: Record<string, [string, string]> = {
    single_clinic: ["Single clinic", "عيادة واحدة"], clinic_group: ["Clinic group", "مجموعة عيادات"],
    beauty_center: ["Beauty center", "مركز تجميل"],
  }
  return labels[key]?.[ar ? 1 : 0] ?? String(value ?? "organization").replaceAll("_", " ")
}

export function TenantOverviewPage() {
  const { context, clinics } = useOutletContext<TenantOutletContext>()
  const { locale } = useI18n()
  const ar = locale === "ar"
  const tenant = context?.tenant
  const summaryQuery = useQuery({
    queryKey: ["tenant-dashboard-summary"],
    queryFn: async () => unwrap((await tenantApi.get("/tenant/dashboard/summary")).data) as Record<string, unknown>,
    staleTime: 30_000,
  })
  const activityQuery = useQuery({
    queryKey: ["tenant-dashboard-activity"],
    queryFn: async () => rowsOf((await tenantApi.get("/tenant/dashboard/activity", { params: { per_page: 8 } })).data),
    staleTime: 30_000,
  })
  const alertsQuery = useQuery({
    queryKey: ["tenant-dashboard-alerts"],
    queryFn: async () => rowsOf((await tenantApi.get("/tenant/dashboard/alerts", { params: { per_page: 6 } })).data),
    staleTime: 30_000,
  })
  const summary = summaryQuery.data?.summary && typeof summaryQuery.data.summary === "object"
    ? { ...summaryQuery.data, ...(summaryQuery.data.summary as Record<string, unknown>) }
    : summaryQuery.data ?? {}
  const metricDefinitions = [
    { key: "totalClinics", label: ar ? "إجمالي العيادات" : "Total clinics", fallback: clinics.length, icon: Building2 },
    { key: "activeClinics", label: ar ? "العيادات النشطة" : "Active clinics", icon: CheckCircle2 },
    { key: "totalBranches", label: ar ? "إجمالي الفروع" : "Total branches", icon: MapPinned },
    { key: "activeUsers", label: ar ? "المستخدمون النشطون" : "Active users", icon: Users },
    { key: "pendingInvitations", label: ar ? "الدعوات المعلقة" : "Pending invitations", icon: Clock3 },
    { key: "expiringDocuments", label: ar ? "مستندات قاربت على الانتهاء" : "Expiring documents", icon: AlertTriangle },
  ]
  const metrics = metricDefinitions.filter(metric => summary[metric.key] !== undefined || metric.fallback !== undefined)
  const activityColumns: DataTableColumn<DashboardRecord>[] = [
    { id: "action", header: ar ? "النشاط" : "Activity", cell: row => <span className="font-medium">{String(row.action ?? row.title ?? row.message ?? "—")}</span> },
    { id: "actor", header: ar ? "بواسطة" : "By", cell: row => formatValue(row.actor ?? row.userName) },
    { id: "module", header: ar ? "الوحدة" : "Area", cell: row => formatValue(row.module ?? row.resource) },
    { id: "createdAt", header: ar ? "التاريخ" : "Date", cell: row => row.createdAt ? new Date(String(row.createdAt)).toLocaleString(ar ? "ar-EG" : "en-GB") : "—" },
  ]
  const cards = [
    { label: ar ? "العيادات" : "Clinics", value: String(clinics.length), hint: ar ? "العيادات المسجلة في مؤسستك" : "Clinics registered to your organization", icon: Building2, href: "/tenant/clinics" },
    { label: ar ? "الفروع" : "Branches", value: ar ? "حسب العيادة المحددة" : "By selected clinic", hint: ar ? "اختر عيادة لعرض فروعها" : "Select a clinic to view its branches", icon: MapPinned, href: "/tenant/branches" },
    { label: ar ? "حالة المؤسسة" : "Organization status", value: statusText(tenant?.status, ar), hint: ar ? "حالة حساب المؤسسة" : "Your organization account status", icon: ShieldCheck, href: "/tenant/organization" },
  ]

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[28px] bg-[#211936] p-7 text-white shadow-[0_22px_60px_rgba(35,25,58,.16)] sm:p-10">
        <div className="absolute -end-16 -top-28 size-80 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-violet-200"><span className="size-1.5 rounded-full bg-emerald-400" />{ar ? "مساحة إدارة المؤسسة" : "ORGANIZATION COMMAND CENTER"}</p>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">{ar ? "أهلاً بك في " : "Welcome to "}{tenant?.displayName || tenant?.name || (ar ? "مؤسستك" : "your organization")}</h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-white/60">{ar ? "تابع العيادات التابعة لمؤسستك، ونظّم مواقع العمل من مساحة واحدة مصممة لنمو أعمالك." : "Oversee your clinics and keep every location connected from one workspace built to scale."}</p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.06] p-4"><span className="grid size-11 place-items-center rounded-xl bg-white/10"><Building2 className="size-5 text-violet-200"/></span><div><p className="text-[10px] uppercase tracking-wider text-white/45">{ar ? "نوع المؤسسة" : "BUSINESS TYPE"}</p><p className="mt-1 text-sm font-semibold capitalize">{businessTypeText(tenant?.businessType, ar)}</p></div></div>
        </div>
      </section>

      {summaryQuery.isError && <p role="alert" className="text-sm text-destructive">{summaryQuery.error instanceof Error ? summaryQuery.error.message : (ar ? "تعذر تحميل مؤشرات المؤسسة." : "Unable to load organization metrics.")}</p>}
      {metrics.length > 0 && <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{metrics.map(metric => { const Icon = metric.icon; return <Card key={metric.key}><CardContent className="flex items-center gap-4 p-5"><span className="grid size-11 place-items-center rounded-xl bg-violet-50 text-violet-700"><Icon className="size-5"/></span><div><p className="text-xs text-muted-foreground">{metric.label}</p><p className="mt-1 text-2xl font-semibold tabular-nums">{formatValue(summary[metric.key] ?? metric.fallback)}</p></div></CardContent></Card> })}</section>}

      <section className="grid gap-4 md:grid-cols-3">
        {cards.map(item => { const Icon = item.icon; return <Link key={item.href} to={item.href} className="group"><Card className="h-full border-white bg-white transition-all hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg"><CardContent className="p-5"><div className="flex items-start justify-between"><span className="grid size-11 place-items-center rounded-2xl bg-violet-50 text-violet-700"><Icon className="size-5"/></span><ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"/></div><p className="mt-6 text-sm text-muted-foreground">{item.label}</p><p className="mt-1 text-2xl font-semibold capitalize tracking-tight">{item.value}</p><p className="mt-2 text-xs leading-5 text-muted-foreground">{item.hint}</p></CardContent></Card></Link> })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.4fr_.8fr]">
        <Card className="border-white bg-white"><CardContent className="p-6"><div className="flex items-center justify-between gap-3"><div><h3 className="font-semibold">{ar ? "العيادات التابعة للمؤسسة" : "Your clinics"}</h3><p className="mt-1 text-xs text-muted-foreground">{ar ? "نظرة سريعة على مواقعك التشغيلية" : "A quick view of your operating locations"}</p></div><Link to="/tenant/clinics" className="text-xs font-semibold text-primary">{ar ? "إدارة العيادات" : "Manage clinics"}</Link></div>
          {clinics.length ? <div className="mt-5 divide-y">{clinics.slice(0, 5).map(clinic => <div key={clinic._id} className="flex items-center gap-3 py-3"><span className="grid size-10 place-items-center rounded-xl bg-slate-100 text-slate-600"><Building2 className="size-4"/></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{clinic.name}</span><span className="mt-1 block text-xs text-muted-foreground">{clinic.slug || clinic.code || "—"}</span></span><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">{statusText(clinic.status, ar)}</span></div>)}</div> : <div className="mt-5 rounded-2xl border border-dashed p-8 text-center"><Building2 className="mx-auto size-7 text-muted-foreground/50"/><p className="mt-3 text-sm font-semibold">{ar ? "لا توجد عيادات بعد" : "No clinics yet"}</p><p className="mt-1 text-xs text-muted-foreground">{ar ? "أضف أول عيادة لبدء تنظيم مؤسستك." : "Add your first clinic to start organizing your organization."}</p><Link to="/tenant/clinics" className="mt-4 inline-flex h-9 items-center justify-center rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">{ar ? "إضافة عيادة" : "Add clinic"}</Link></div>}
        </CardContent></Card>
        <Card className="border-white bg-white"><CardContent className="p-6"><div className="mb-4 flex items-center gap-2"><AlertTriangle className="size-5 text-amber-600"/><h3 className="font-semibold">{ar ? "التنبيهات" : "Organization alerts"}</h3></div>{alertsQuery.isError && <p role="alert" className="text-sm text-destructive">{alertsQuery.error instanceof Error ? alertsQuery.error.message : (ar ? "تعذر تحميل التنبيهات." : "Unable to load alerts.")}</p>}{alertsQuery.isLoading ? <p className="py-6 text-center text-sm text-muted-foreground">{ar ? "جارٍ تحميل التنبيهات..." : "Loading alerts..."}</p> : (alertsQuery.data ?? []).length ? <div className="space-y-3">{(alertsQuery.data ?? []).map((alert,index) => <div key={String(alert.id ?? alert._id ?? index)} className="rounded-xl border p-3"><p className="text-sm font-semibold">{String(alert.title ?? alert.message ?? "—")}</p>{alert.description && <p className="mt-1 text-xs text-muted-foreground">{String(alert.description)}</p>}</div>)}</div> : <p className="py-8 text-center text-sm text-muted-foreground">{ar ? "لا توجد تنبيهات حالياً." : "No active alerts."}</p>}</CardContent></Card>
      </section>

      <Card><CardContent className="p-5 sm:p-6"><div className="mb-4 flex items-center gap-2"><Activity className="size-5 text-primary"/><div><h3 className="font-semibold">{ar ? "آخر نشاط للمؤسسة" : "Recent organization activity"}</h3><p className="mt-1 text-xs text-muted-foreground">{ar ? "أحدث الأحداث المسجلة عبر العيادات والفروع." : "Latest events across your clinics and branches."}</p></div></div>{activityQuery.isError && <p role="alert" className="mb-3 text-sm text-destructive">{activityQuery.error instanceof Error ? activityQuery.error.message : (ar ? "تعذر تحميل النشاط." : "Unable to load activity.")}</p>}<DataTable columns={activityColumns} data={activityQuery.data ?? []} getRowId={row => String(row.id ?? row._id ?? row.createdAt ?? JSON.stringify(row))} isLoading={activityQuery.isLoading} loadingLabel={ar ? "جارٍ تحميل النشاط..." : "Loading activity..."} emptyState={<p className="py-10 text-center text-sm text-muted-foreground">{ar ? "لا توجد أحداث مسجلة حتى الآن." : "No organization activity has been recorded yet."}></p>}/></CardContent></Card>
    </div>
  )
}
