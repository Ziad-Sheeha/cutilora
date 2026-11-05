import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router"
import { Building2, CheckCircle2, CircleAlert, Clock3, Plus, RefreshCw, Search, Users2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { SelectMenu, SelectMenuContent, SelectMenuItem, SelectMenuTrigger, SelectMenuValue } from "@/components/ui/select-menu"
import { useI18n } from "@/i18n/i18n-provider"
import { useTenants } from "../hooks/use-tenants"
import type { Tenant } from "../types/tenant.types"
import { TenantMetricCard } from "../components/tenant-metric-card"
import { TenantStatusBadge } from "../components/tenant-status-badge"
import { resolveAssetUrl } from "@/shared/utils/resolve-asset-url"
import { AppImage } from "@/shared/components/media/app-image"

const PAGE_SIZE = 10
function titleCase(value: string) { return value.replace(/[_-]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) }
function dateLabel(value: string | null, locale: string) {
  if (!value) return "—"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date)
}
export function TenantsPage() {
  const { locale } = useI18n()
  const navigate = useNavigate()
  const ar = locale === "ar"
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [status, setStatus] = useState("")
  const [plan, setPlan] = useState("")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(PAGE_SIZE)
  const list = useTenants({ page, perPage, search: debouncedSearch, status, plan })
  const records = list.data?.items ?? []
  const pagination = list.data ? { page: list.data.page, perPage: list.data.perPage, total: list.data.total, totalKnown: list.data.totalKnown, hasNext: list.data.hasNext } : undefined

  useEffect(() => {
    const timer = window.setTimeout(() => { setDebouncedSearch(search.trim()); setPage(1) }, 350)
    return () => window.clearTimeout(timer)
  }, [search])
  useEffect(() => { setPage(1) }, [status, plan])

  const statusCounts = list.data?.statusCounts ?? {}
  const activeCount = statusCounts.active ?? 0
  const pendingCount = statusCounts.pending ?? 0
  const suspendedCount = (statusCounts.suspended ?? 0) + (statusCounts.inactive ?? 0)

  const columns = useMemo<DataTableColumn<Tenant>[]>(() => [
    { id: "tenant", header: ar ? "المؤسسة" : "Organization", cell: (tenant) => <div className="flex min-w-[210px] items-center gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-primary/[0.06] text-primary">{tenant.branding.logoUrl ? <AppImage src={resolveAssetUrl(tenant.branding.logoUrl)} alt={tenant.displayName || tenant.name} className="size-full rounded-xl" imageClassName="size-full rounded-xl object-cover" fallback={<Building2 className="size-5"/>}/> : <Building2 className="size-5"/>}</span><div className="min-w-0"><Link to={"/super-admin/tenants/" + encodeURIComponent(tenant.id)} className="block truncate font-semibold text-foreground hover:text-primary">{tenant.displayName || tenant.name || "—"}</Link><p className="mt-0.5 truncate text-xs text-muted-foreground">{tenant.slug || "—"}</p></div></div> },
    { id: "business", header: ar ? "نوع النشاط" : "Business type", cell: (tenant) => <div><p className="text-sm font-medium">{titleCase(tenant.businessType)}</p><p className="mt-0.5 text-xs text-muted-foreground">{titleCase(tenant.industry || "—")}</p></div> },
    { id: "plan", header: ar ? "الخطة" : "Plan", cell: (tenant) => <span className="rounded-lg border bg-muted/50 px-2.5 py-1 text-xs font-semibold">{titleCase(tenant.plan || "unassigned")}</span> },
    { id: "status", header: ar ? "الحالة" : "Status", cell: (tenant) => <TenantStatusBadge status={tenant.status}/> },
    { id: "contact", header: ar ? "التواصل" : "Contact", cell: (tenant) => <div className="min-w-[160px]"><p className="truncate text-sm">{tenant.contact.email || "—"}</p><p className="mt-0.5 text-xs text-muted-foreground">{tenant.contact.phone || "—"}</p></div> },
    { id: "created", header: ar ? "تاريخ الإنشاء" : "Created", cell: (tenant) => <span className="whitespace-nowrap text-xs tabular-nums text-muted-foreground">{dateLabel(tenant.createdAt, locale)}</span> },
    { id: "actions", header: ar ? "الإجراءات" : "Actions", headerClassName: "text-end", cell: (tenant) => <div className="flex justify-end"><Link to={"/super-admin/tenants/" + encodeURIComponent(tenant.id)} className="rounded-lg border px-3 py-1.5 text-xs font-semibold transition hover:border-primary/40 hover:bg-primary/5">{ar ? "عرض الملف" : "View profile"}</Link></div> },
  ], [ar, locale])

  const labels = ar
    ? { eyebrow: "إدارة المؤسسات", title: "العملاء والمؤسسات", description: "إدارة مؤسسات العملاء وملفاتهم وحالة حساباتهم واشتراكاتهم من مساحة تحكم واحدة.", add: "إضافة مؤسسة", total: "إجمالي المؤسسات", active: "نشطة في الصفحة", pending: "بانتظار الإعداد", paused: "متوقفة", directory: "دليل المؤسسات", directoryHint: "ابحث وصنّف المؤسسات للوصول إلى ملف كل عميل.", search: "ابحث بالاسم أو الرابط التعريفي...", allStatus: "كل الحالات", allPlans: "كل الخطط", loading: "جارٍ تحميل المؤسسات...", noRecords: "لا توجد مؤسسات مطابقة", noRecordsHint: "جرّب تغيير البحث أو الفلاتر.",  }
    : { eyebrow: "ORGANIZATION MANAGEMENT", title: "Tenants & organizations", description: "Manage customer organizations, account health, ownership details and subscription relationships from one command center.", add: "Create tenant", total: "Total organizations", active: "Active on page", pending: "Pending setup", paused: "Paused", directory: "Tenant directory", directoryHint: "Search and segment organizations, then open a dedicated tenant workspace.", search: "Search by name or slug...", allStatus: "All statuses", allPlans: "All plans", loading: "Loading tenants...", noRecords: "No matching organizations", noRecordsHint: "Try adjusting your search or filters.",  }

  return <div dir={ar ? "rtl" : "ltr"} className="space-y-7">
    <header className="relative overflow-hidden rounded-[28px] border border-[#282344] bg-[#151329] p-6 text-white shadow-xl shadow-violet-950/5 sm:p-8">
      <div className="pointer-events-none absolute -end-20 -top-28 size-80 rounded-full bg-violet-500/20 blur-3xl"/>
      <div className="pointer-events-none absolute bottom-[-100px] start-[35%] size-64 rounded-full bg-indigo-500/10 blur-3xl"/>
      <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div className="max-w-2xl"><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-violet-300">{labels.eyebrow}</p><h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-[38px]">{labels.title}</h1><p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">{labels.description}</p></div><Button onClick={() => navigate("/super-admin/tenants/new")} className="shrink-0 bg-violet-500 text-white hover:bg-violet-400"><Plus className="size-4"/>{labels.add}</Button></div>
      <div className="relative mt-7 flex flex-wrap items-center gap-2 text-xs text-slate-400"><span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Platform / Organization / Tenants</span><span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-emerald-200">Live API</span></div>
    </header>

    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <TenantMetricCard icon={Building2} label={labels.total} value={list.data ? list.data.totalTenants.toLocaleString(ar ? "ar-EG" : "en-US") : "—"} hint={ar ? "حسب نتائج الـ API" : "Reported by the API"} tone="violet"/>
      <TenantMetricCard icon={CheckCircle2} label={labels.active} value={String(activeCount)} hint={ar ? "من إجمالي المؤسسات" : "Across all organizations"} tone="emerald"/>
      <TenantMetricCard icon={Clock3} label={labels.pending} value={String(pendingCount)} hint={ar ? "من إجمالي المؤسسات" : "Across all organizations"} tone="amber"/>
      <TenantMetricCard icon={CircleAlert} label={labels.paused} value={String(suspendedCount)} hint={ar ? "من إجمالي المؤسسات" : "Across all organizations"} tone="rose"/>
    </section>

    <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="flex flex-col gap-4 border-b p-5 lg:flex-row lg:items-center lg:justify-between"><div><div className="flex items-center gap-2"><Users2 className="size-4 text-primary"/><h2 className="font-semibold">{labels.directory}</h2></div><p className="mt-1 text-xs text-muted-foreground">{labels.directoryHint}</p></div><div className="grid gap-2 sm:grid-cols-[minmax(210px,1fr)_150px_130px_auto]"><div className="relative"><Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={labels.search} className="ps-9"/></div><SelectMenu value={status || "all"} onValueChange={(value) => setStatus(value === "all" ? "" : value)}><SelectMenuTrigger><SelectMenuValue placeholder={labels.allStatus}/></SelectMenuTrigger><SelectMenuContent><SelectMenuItem value="all">{labels.allStatus}</SelectMenuItem>{(list.data?.availableStatuses ?? []).map((value) => <SelectMenuItem key={value} value={value}>{titleCase(value)}</SelectMenuItem>)}</SelectMenuContent></SelectMenu><SelectMenu value={plan || "all"} onValueChange={(value) => setPlan(value === "all" ? "" : value)}><SelectMenuTrigger><SelectMenuValue placeholder={labels.allPlans}/></SelectMenuTrigger><SelectMenuContent><SelectMenuItem value="all">{labels.allPlans}</SelectMenuItem>{(list.data?.availablePlans ?? []).map((value) => <SelectMenuItem key={value} value={value}>{titleCase(value)}</SelectMenuItem>)}</SelectMenuContent></SelectMenu><Button type="button" variant="outline" size="icon" onClick={() => list.refetch()} disabled={list.isFetching} aria-label={ar ? "تحديث" : "Refresh"}><RefreshCw className={"size-4 " + (list.isFetching ? "animate-spin" : "")}/></Button></div></div>
      {list.error && <div role="alert" className="mx-5 mt-4 rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-rose-600">{list.error instanceof Error ? list.error.message : "Request failed"}</div>}
      <DataTable columns={columns} data={records} getRowId={(tenant) => tenant.id} isLoading={list.isLoading} loadingLabel={labels.loading} emptyState={<div className="px-6 py-16 text-center"><Building2 className="mx-auto size-9 text-muted-foreground/40"/><p className="mt-3 font-semibold">{labels.noRecords}</p><p className="mt-1 text-sm text-muted-foreground">{labels.noRecordsHint}</p></div>} pagination={pagination} onPageChange={setPage} onPerPageChange={(size) => { setPerPage(size); setPage(1) }}/>
    </section>

      </div>
}
