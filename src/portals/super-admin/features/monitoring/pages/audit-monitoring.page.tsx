import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Activity, AlertCircle, AlertTriangle, Clock3,
  Database, Eye, FilterX, ListFilter, RefreshCw, Search, ShieldCheck, Signal,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { SelectMenu, SelectMenuContent, SelectMenuItem, SelectMenuTrigger, SelectMenuValue } from "@/components/ui/select-menu"
import { DatePicker } from "@/components/ui/date-picker"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Spinner } from "@/components/ui/spinner"
import { Skeleton } from "@/components/ui/skeleton"
import { useI18n } from "@/i18n/i18n-provider"
import { monitoringApi, type MonitoringLog, type MonitoringStats, type MonitoringTimelinePoint } from "../api/monitoring.api"
import { MonitoringTimeline, type TimelineEvent } from "../components/monitoring-timeline"

const DEFAULT_LIMIT = 10

const copy = {
  en: {
    eyebrow: "PLATFORM OBSERVABILITY", title: "Audit & security", description: "Monitor platform activity, inspect system events and investigate operational issues.",
    refresh: "Refresh", refreshing: "Refreshing…", overview: "Overview", logs: "Event logs", timeline: "Activity timeline",
    total: "Total events", errors: "Errors", warnings: "Warnings", categories: "Categories", eventVolume: "Event volume",
    byLevel: "Events by level", byCategory: "Events by category", recentActivity: "Recent activity", live: "Live monitoring",
    search: "Search message, path, module…", allLevels: "All levels", allCategories: "All categories", allModules: "All modules",
    allStatuses: "All status codes", from: "From", to: "To", clear: "Clear filters", time: "Timestamp", level: "Level",
    category: "Category", module: "Module", message: "Event", status: "HTTP status", actor: "Actor", actions: "Actions",
    viewDetails: "View details", details: "Event details", detailsDescription: "Structured event payload returned by the monitoring API.",
    noLogs: "No events match these filters.", noTimeline: "No timeline activity for this period.", loading: "Loading monitoring data…",
    loadError: "Monitoring data could not be loaded.", retry: "Try again", noMessage: "No message provided", raw: "Raw event payload",
    request: "Request", response: "Response", metadata: "Metadata", duration: "Duration", endpoint: "Endpoint",
    all: "All", info: "Info", warning: "Warning", error: "Error", success: "Success", statusHint: "Filter by HTTP response status",
    period: "Selected period", lastUpdated: "Auto-refreshes every 30 seconds", noData: "No data", dailyEvents: "Events per day", dailyErrors: "Errors",
  },
  ar: {
    eyebrow: "مراقبة المنصة", title: "سجل التدقيق والأمان", description: "راقب نشاط المنصة وأحداث النظام وافحص المشكلات التشغيلية.",
    refresh: "تحديث", refreshing: "جارٍ التحديث…", overview: "نظرة عامة", logs: "سجل الأحداث", timeline: "الخط الزمني",
    total: "إجمالي الأحداث", errors: "الأخطاء", warnings: "التحذيرات", categories: "التصنيفات", eventVolume: "حجم الأحداث",
    byLevel: "الأحداث حسب المستوى", byCategory: "الأحداث حسب التصنيف", recentActivity: "النشاط الأخير", live: "مراقبة مباشرة",
    search: "ابحث بالرسالة أو المسار أو الوحدة…", allLevels: "كل المستويات", allCategories: "كل التصنيفات", allModules: "كل الوحدات",
    allStatuses: "كل أكواد الحالة", from: "من", to: "إلى", clear: "مسح الفلاتر", time: "التوقيت", level: "المستوى",
    category: "التصنيف", module: "الوحدة", message: "الحدث", status: "حالة HTTP", actor: "المنفذ", actions: "الإجراءات",
    viewDetails: "عرض التفاصيل", details: "تفاصيل الحدث", detailsDescription: "بيانات الحدث التفصيلية الواردة من واجهة المراقبة.",
    noLogs: "لا توجد أحداث مطابقة للفلاتر.", noTimeline: "لا يوجد نشاط في الخط الزمني خلال هذه الفترة.", loading: "جارٍ تحميل بيانات المراقبة…",
    loadError: "تعذر تحميل بيانات المراقبة.", retry: "إعادة المحاولة", noMessage: "لا توجد رسالة", raw: "بيانات الحدث الخام",
    request: "الطلب", response: "الاستجابة", metadata: "بيانات إضافية", duration: "المدة", endpoint: "المسار",
    all: "الكل", info: "معلومات", warning: "تحذير", error: "خطأ", success: "نجاح", statusHint: "تصفية حسب كود استجابة HTTP",
    period: "الفترة المحددة", lastUpdated: "تحديث تلقائي كل 30 ثانية", noData: "لا توجد بيانات", dailyEvents: "الأحداث يوميًا", dailyErrors: "الأخطاء",
  },
} as const

function toIso(value: string, end = false) {
  if (!value) return undefined
  const date = new Date(`${value}T${end ? "23:59:59.999" : "00:00:00.000"}`)
  return date.toISOString()
}

function formatDate(value: string, locale: string) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  }).format(date)
}

function levelClass(level: string) {
  if (["error", "fatal", "critical"].includes(level)) return "border-error/20 bg-error/10 text-error"
  if (["warn", "warning"].includes(level)) return "border-warning/20 bg-warning/10 text-warning"
  if (level === "success") return "border-success/20 bg-success/10 text-success"
  return "border-primary/15 bg-primary/10 text-primary"
}

function StatCard({ title, value, icon: Icon, note, tone = "primary", loading = false }: {
  title: string; value: string | number; icon: typeof Activity; note: string; tone?: string; loading?: boolean
}) {
  const toneClass = tone === "error" ? "bg-error/10 text-error" : tone === "warning" ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary"
  return <Card className="relative overflow-hidden">
    <CardContent className="flex items-start justify-between gap-3 p-5">
      <div className="min-w-0">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {loading ? <Skeleton className="mt-2 h-9 w-24" /> : <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">{value.toLocaleString()}</p>}
        <p className="mt-2 text-xs text-muted-foreground">{note}</p>
      </div>
      <span className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${toneClass}`}>
        <Icon className="size-5" />
      </span>
    </CardContent>
  </Card>
}

function MiniBars({ data, locale }: { data: MonitoringStats["timeline"]; locale: string }) {
  const max = Math.max(1, ...data.map((item) => item.count))
  if (!data.length) return <div className="flex h-36 items-center justify-center text-sm text-muted-foreground">—</div>
  return <div className="flex h-36 items-end gap-2 pt-3">
    {data.map((item) => <div key={item.date} className="group flex min-w-0 flex-1 flex-col items-center justify-end gap-2">
      <div className="relative flex h-28 w-full items-end justify-center overflow-hidden rounded-t-lg bg-muted/60">
        <div className="w-full rounded-t-md bg-primary/75 transition-all group-hover:bg-primary" style={{ height: `${Math.max(4, item.count / max * 100)}%` }} />
        {item.errors > 0 && <div className="absolute bottom-0 w-full bg-error" style={{ height: `${item.errors / max * 100}%` }} />}
      </div>
      <span className="max-w-full truncate text-[10px] text-muted-foreground">{item.date ? new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", { day: "2-digit", month: "short" }).format(new Date(item.date)) : "—"}</span>
    </div>)}
  </div>
}

function DailyTimeline({ points, locale, emptyLabel, eventsLabel, errorsLabel }: { points: MonitoringTimelinePoint[]; locale: string; emptyLabel: string; eventsLabel: string; errorsLabel: string }) {
  if (!points.length) return <div className="flex min-h-40 items-center justify-center text-sm text-muted-foreground">{emptyLabel}</div>
  return <div className="space-y-3">
    {points.map((point) => <div key={point.date} className="flex flex-wrap items-center gap-3 rounded-xl border border-border/70 p-3">
      <div className="min-w-28 flex-1"><p className="text-sm font-semibold">{point.date ? new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(point.date)) : "—"}</p></div>
      <div className="flex items-center gap-1.5 text-sm"><Activity className="size-4 text-primary" /><span className="font-semibold tabular-nums">{point.count.toLocaleString()}</span><span className="text-xs text-muted-foreground">{eventsLabel}</span></div>
      <div className="flex items-center gap-1.5 text-sm"><AlertCircle className="size-4 text-error" /><span className="font-semibold tabular-nums">{point.errors.toLocaleString()}</span><span className="text-xs text-muted-foreground">{errorsLabel}</span></div>
    </div>)}
  </div>
}

function Distribution({ title, rows, empty }: { title: string; rows: MonitoringStats["byLevel"]; empty: string }) {
  const total = rows.reduce((sum, item) => sum + item.count, 0)
  return <Card>
    <CardHeader className="pb-3"><CardTitle className="text-base">{title}</CardTitle></CardHeader>
    <CardContent className="space-y-4">
      {rows.length ? rows.map((row) => <div key={row.name} className="space-y-2">
        <div className="flex justify-between gap-3 text-sm"><span className="font-medium capitalize">{row.name}</span><span className="tabular-nums text-muted-foreground">{row.count.toLocaleString()} <span className="text-xs">({total ? Math.round(row.count / total * 100) : 0}%)</span></span></div>
        <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${total ? row.count / total * 100 : 0}%` }} /></div>
      </div>) : <p className="py-6 text-center text-sm text-muted-foreground">{empty}</p>}
    </CardContent>
  </Card>
}

export function AuditMonitoringPage() {
  const { locale, direction } = useI18n()
  const t = copy[locale]
  const [tab, setTab] = useState<"overview" | "logs" | "timeline">("overview")
  const [search, setSearch] = useState("")
  const [level, setLevel] = useState("")
  const [category, setCategory] = useState("")
  const [module, setModule] = useState("")
  const [statusCode, setStatusCode] = useState("")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(DEFAULT_LIMIT)
  const [selected, setSelected] = useState<MonitoringLog | null>(null)
  const fromIso = toIso(from)
  const toIsoValue = toIso(to, true)

  const viewQuery = useQuery({
    queryKey: ["platform-monitoring", "view", fromIso, toIsoValue],
    queryFn: () => monitoringApi.view(fromIso, toIsoValue),
    refetchInterval: 30_000,
  })
  const statsQuery = useQuery({
    queryKey: ["platform-monitoring", "stats", fromIso, toIsoValue],
    queryFn: () => monitoringApi.stats(fromIso, toIsoValue),
    refetchInterval: 30_000,
  })
  const logsQuery = useQuery({
    queryKey: ["platform-monitoring", "logs", page, limit, search, level, category, module, statusCode, fromIso, toIsoValue],
    queryFn: () => monitoringApi.logs({
      page, limit, search: search.trim() || undefined, level: level || undefined,
      category: category || undefined, module: module || undefined, statusCode: statusCode || undefined,
      from: fromIso, to: toIsoValue,
    }),
    refetchInterval: 30_000,
  })
  const timelineQuery = useQuery({
    queryKey: ["platform-monitoring", "timeline", fromIso, toIsoValue],
    queryFn: () => monitoringApi.timeline(fromIso, toIsoValue),
    refetchInterval: 30_000,
  })
  const detailQuery = useQuery({
    queryKey: ["platform-monitoring", "detail", selected?.id],
    queryFn: () => monitoringApi.detail(selected!.id),
    enabled: Boolean(selected?.id),
  })

  const stats = statsQuery.data ?? viewQuery.data
  const logs = logsQuery.data?.items ?? []
  const timelinePoints = timelineQuery.data?.length ? timelineQuery.data : stats?.timeline ?? []
  const hasError = viewQuery.isError && statsQuery.isError && logsQuery.isError
  const errorMessage = [viewQuery.error, statsQuery.error, logsQuery.error].find(Boolean)
  const errorText = errorMessage instanceof Error && errorMessage.message === "UNAUTHENTICATED"
    ? (locale === "ar" ? "انتهت صلاحية الجلسة، سجل الدخول مرة أخرى." : "Your session expired. Please sign in again.")
    : t.loadError

  const columns = useMemo<DataTableColumn<MonitoringLog>[]>(() => [
    { id: "event", header: t.message, cell: (row) => <div className="min-w-52 max-w-md"><p className="truncate text-sm font-semibold">{row.message}</p><p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">{row.method} {row.path}</p></div> },
    { id: "level", header: t.level, cell: (row) => <span className={`inline-flex rounded-lg border px-2.5 py-1 text-[11px] font-bold uppercase ${levelClass(row.level)}`}>{row.level}</span> },
    { id: "category", header: t.category, cell: (row) => <span className="text-sm capitalize">{row.category}</span> },
    { id: "module", header: t.module, cell: (row) => <span className="text-sm">{row.module}</span> },
    { id: "status", header: t.status, cell: (row) => <span className={`font-mono text-xs font-semibold ${String(row.statusCode).startsWith("5") ? "text-error" : String(row.statusCode).startsWith("4") ? "text-warning" : "text-muted-foreground"}`}>{row.statusCode}</span> },
    { id: "actor", header: t.actor, cell: (row) => <span className="text-sm">{row.actor}</span> },
    { id: "actions", header: t.actions, headerClassName: "text-end", cell: (row) => <div className="flex justify-end"><Button variant="ghost" size="sm" onClick={() => setSelected(row)}><Eye className="size-4" />{t.viewDetails}</Button></div> },
  ], [t])

  const recentEvents: TimelineEvent[] = logs.slice(0, 5).map((log) => ({
    id: log.id, date: log.timestamp, level: log.level, category: log.category, message: log.message, module: log.module,
  }))

  function clearFilters() {
    setSearch(""); setLevel(""); setCategory(""); setModule(""); setStatusCode(""); setFrom(""); setTo(""); setPage(1)
  }
  function refresh() {
    return Promise.all([viewQuery.refetch(), statsQuery.refetch(), logsQuery.refetch(), timelineQuery.refetch()])
  }

  return <div className="space-y-6" dir={direction}>
    <header className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
      <div className="flex items-start gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"><ShieldCheck className="size-6" /></span>
        <div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">{t.eyebrow}</p><h1 className="mt-1 text-2xl font-semibold tracking-tight">{t.title}</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">{t.description}</p></div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-2 rounded-xl border bg-card px-3 py-2 text-xs font-medium text-muted-foreground"><span className="size-2 animate-pulse rounded-full bg-success" />{t.live}</span>
        <Button variant="outline" onClick={refresh} disabled={viewQuery.isFetching || statsQuery.isFetching || logsQuery.isFetching}>{!(viewQuery.isFetching || statsQuery.isFetching || logsQuery.isFetching) && <RefreshCw className="size-4" />}{viewQuery.isFetching || statsQuery.isFetching || logsQuery.isFetching ? t.refreshing : t.refresh}</Button>
      </div>
    </header>

    <div className="flex flex-wrap items-center justify-between gap-3">
      <Tabs value={tab} onValueChange={(value) => setTab(value as typeof tab)}>
        <TabsList>
          <TabsTrigger value="overview">{t.overview}</TabsTrigger>
          <TabsTrigger value="logs">{t.logs}</TabsTrigger>
          <TabsTrigger value="timeline">{t.timeline}</TabsTrigger>
        </TabsList>
      </Tabs>
      <p className="flex items-center gap-2 text-xs text-muted-foreground"><Signal className="size-3.5" />{t.lastUpdated}</p>
    </div>

    {hasError && <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-error/25 bg-error/5 px-4 py-3 text-sm text-error"><span className="flex items-center gap-2"><AlertCircle className="size-4" />{errorText}</span><Button size="sm" variant="outline" onClick={refresh}>{t.retry}</Button></div>}

    {(tab === "overview" || tab === "logs") && <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard title={t.total} value={stats?.total ?? 0} icon={Database} note={t.period} loading={viewQuery.isLoading && statsQuery.isLoading} />
      <StatCard title={t.errors} value={stats?.byLevel.filter((x) => ["error", "fatal", "critical"].includes(x.name.toLowerCase())).reduce((sum, x) => sum + x.count, 0) ?? 0} icon={AlertCircle} note={t.byLevel} tone="error" loading={viewQuery.isLoading && statsQuery.isLoading} />
      <StatCard title={t.warnings} value={stats?.byLevel.filter((x) => ["warn", "warning"].includes(x.name.toLowerCase())).reduce((sum, x) => sum + x.count, 0) ?? 0} icon={AlertTriangle} note={t.byLevel} tone="warning" loading={viewQuery.isLoading && statsQuery.isLoading} />
      <StatCard title={t.categories} value={stats?.byCategory.length ?? 0} icon={ListFilter} note={t.byCategory} loading={viewQuery.isLoading && statsQuery.isLoading} />
    </section>}

    {tab === "overview" && <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
      <Card><CardHeader className="pb-2"><CardTitle className="text-base">{t.eventVolume}</CardTitle><CardDescription>{t.period}</CardDescription></CardHeader><CardContent><MiniBars data={stats?.timeline ?? []} locale={locale} /></CardContent></Card>
      <Distribution title={t.byLevel} rows={stats?.byLevel ?? []} empty={t.noData} />
      <Distribution title={t.byCategory} rows={stats?.byCategory ?? []} empty={t.noData} />
      <Card><CardHeader className="pb-2"><CardTitle className="text-base">{t.recentActivity}</CardTitle><CardDescription>{t.logs}</CardDescription></CardHeader><CardContent><MonitoringTimeline events={recentEvents} locale={locale} emptyLabel={logsQuery.isLoading ? t.loading : t.noLogs} /></CardContent></Card>
    </div>}

    {(tab === "logs" || tab === "timeline") && <Card>
      <CardHeader className="gap-3 border-b pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2"><div><CardTitle className="text-base">{tab === "logs" ? t.logs : t.timeline}</CardTitle><CardDescription className="mt-1">{t.period}</CardDescription></div>
          <Button size="sm" variant="ghost" onClick={clearFilters}><FilterX className="size-4" />{t.clear}</Button>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {tab === "logs" && <>
          <div className="relative sm:col-span-2 xl:col-span-2"><Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="ps-9" placeholder={t.search} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} /></div>
          <SelectMenu value={level || "__all__"} onValueChange={(value) => { setLevel(value === "__all__" ? "" : value); setPage(1) }}>
            <SelectMenuTrigger aria-label={t.level}><SelectMenuValue placeholder={t.allLevels} /></SelectMenuTrigger>
            <SelectMenuContent><SelectMenuItem value="__all__">{t.allLevels}</SelectMenuItem><SelectMenuItem value="info">Info</SelectMenuItem><SelectMenuItem value="warn">Warning</SelectMenuItem><SelectMenuItem value="error">Error</SelectMenuItem><SelectMenuItem value="fatal">Fatal</SelectMenuItem></SelectMenuContent>
          </SelectMenu>
          <SelectMenu value={category || "__all__"} onValueChange={(value) => { setCategory(value === "__all__" ? "" : value); setPage(1) }}>
            <SelectMenuTrigger aria-label={t.category}><SelectMenuValue placeholder={t.allCategories} /></SelectMenuTrigger>
            <SelectMenuContent><SelectMenuItem value="__all__">{t.allCategories}</SelectMenuItem>{(stats?.byCategory ?? []).map((item) => <SelectMenuItem key={item.name} value={item.name}>{item.name}</SelectMenuItem>)}</SelectMenuContent>
          </SelectMenu>
          <Input placeholder={t.allModules} value={module} onChange={(e) => { setModule(e.target.value); setPage(1) }} />
          <SelectMenu value={statusCode || "__all__"} onValueChange={(value) => { setStatusCode(value === "__all__" ? "" : value); setPage(1) }}>
            <SelectMenuTrigger aria-label={t.status}><SelectMenuValue placeholder={t.allStatuses} /></SelectMenuTrigger>
            <SelectMenuContent><SelectMenuItem value="__all__">{t.allStatuses}</SelectMenuItem>{["200", "201", "204", "301", "304", "400", "401", "403", "404", "405", "409", "422", "429", "500", "502", "503", "504"].map((status) => <SelectMenuItem key={status} value={status}>{status}</SelectMenuItem>)}</SelectMenuContent>
          </SelectMenu>
          </>}
          <div className="flex min-w-0 items-center gap-2 rounded-xl border border-border/70 bg-muted/30 px-3 py-2"><span className="shrink-0 text-xs font-semibold text-muted-foreground">{t.from}</span><DatePicker className="h-10 min-w-0 flex-1 bg-card" value={from} onChange={(value) => { setFrom(value); setPage(1) }} placeholder={t.from} locale={locale} dir={direction} maxDate={to ? new Date(to + "T00:00:00") : undefined} /></div>
          <div className="flex min-w-0 items-center gap-2 rounded-xl border border-border/70 bg-muted/30 px-3 py-2"><span className="shrink-0 text-xs font-semibold text-muted-foreground">{t.to}</span><DatePicker className="h-10 min-w-0 flex-1 bg-card" value={to} onChange={(value) => { setTo(value); setPage(1) }} placeholder={t.to} locale={locale} dir={direction} minDate={from ? new Date(from + "T00:00:00") : undefined} /></div>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-4">
        {tab === "logs" ? <DataTable columns={columns} data={logs} getRowId={(row) => row.id} isLoading={logsQuery.isLoading} loadingLabel={t.loading} emptyState={<div className="p-12 text-center text-sm text-muted-foreground"><Activity className="mx-auto mb-3 size-8 opacity-40" />{t.noLogs}</div>} pagination={logsQuery.data ? { page: logsQuery.data.page, perPage: logsQuery.data.limit, total: logsQuery.data.total, totalKnown: logsQuery.data.totalKnown, hasNext: logsQuery.data.hasNext } : undefined} onPageChange={setPage} onPerPageChange={(next) => { setLimit(next); setPage(1) }} /> :
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]"><div><DailyTimeline points={timelinePoints} locale={locale} emptyLabel={timelineQuery.isLoading ? t.loading : t.noTimeline} eventsLabel={t.dailyEvents} errorsLabel={t.dailyErrors} /></div><aside className="rounded-xl bg-muted/40 p-4"><p className="mb-3 text-sm font-semibold">{t.eventVolume}</p><MiniBars data={stats?.timeline ?? []} locale={locale} /></aside></div>}
      </CardContent>
    </Card>}

    {tab === "overview" && <Card><CardHeader className="pb-2"><div className="flex items-center gap-2"><Clock3 className="size-4 text-primary" /><CardTitle className="text-base">{t.timeline}</CardTitle></div></CardHeader><CardContent><DailyTimeline points={timelinePoints} locale={locale} emptyLabel={timelineQuery.isLoading ? t.loading : t.noTimeline} eventsLabel={t.dailyEvents} errorsLabel={t.dailyErrors} /></CardContent></Card>}

    <Dialog open={Boolean(selected)} onOpenChange={(open) => { if (!open) setSelected(null) }}>
      <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
        <DialogHeader><DialogTitle>{t.details}</DialogTitle><DialogDescription>{t.detailsDescription}</DialogDescription></DialogHeader>
        {detailQuery.isLoading ? <div className="flex min-h-40 items-center justify-center"><Spinner label={t.loading} /></div> : selected && <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2"><span className={`rounded-lg border px-2.5 py-1 text-xs font-bold uppercase ${levelClass(detailQuery.data?.level ?? selected.level)}`}>{detailQuery.data?.level ?? selected.level}</span><span className="rounded-lg bg-muted px-2.5 py-1 text-xs">{detailQuery.data?.category ?? selected.category}</span><span className="text-xs text-muted-foreground">{formatDate(detailQuery.data?.timestamp ?? selected.timestamp, locale)}</span></div>
          <div><p className="text-sm font-semibold">{detailQuery.data?.message ?? selected.message}</p><p className="mt-1 font-mono text-xs text-muted-foreground">{detailQuery.data?.method ?? selected.method} {detailQuery.data?.path ?? selected.path}</p></div>
          <div className="grid gap-3 sm:grid-cols-2"><div className="rounded-xl border p-3"><p className="text-xs text-muted-foreground">{t.actor}</p><p className="mt-1 text-sm font-medium">{detailQuery.data?.actor ?? selected.actor}</p></div><div className="rounded-xl border p-3"><p className="text-xs text-muted-foreground">{t.status}</p><p className="mt-1 font-mono text-sm font-semibold">{detailQuery.data?.statusCode ?? selected.statusCode}</p></div><div className="rounded-xl border p-3"><p className="text-xs text-muted-foreground">{t.module}</p><p className="mt-1 text-sm font-medium">{detailQuery.data?.module ?? selected.module}</p></div><div className="rounded-xl border p-3"><p className="text-xs text-muted-foreground">{t.duration}</p><p className="mt-1 text-sm font-medium">{detailQuery.data?.duration ?? selected.duration}</p></div></div>
          <div><p className="mb-2 text-sm font-semibold">{t.raw}</p><pre className="max-h-72 overflow-auto rounded-xl bg-muted p-4 text-xs leading-5" dir="ltr">{JSON.stringify(detailQuery.data?.raw ?? selected.raw, null, 2)}</pre></div>
        </div>}
      </DialogContent>
    </Dialog>
  </div>
}
