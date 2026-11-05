import { useEffect, useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useParams } from "react-router"
import { AlertCircle, CheckCircle2, Database, RefreshCw, Search, ServerCog } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { Input } from "@/components/ui/input"
import { useI18n } from "@/i18n/i18n-provider"
import { useAppDispatch } from "@/store/hooks"
import { pushToast } from "@/store"
import { TenantPageHeading } from "../../components/tenant-page-heading"
import { getTenantFeature } from "./tenant-feature-registry"
import {
  fetchTenantFeatureRecords,
  getTenantFeatureListEndpoint,
  getTenantFeatureWriteEndpoint,
  saveTenantFeatureRecord,
  type TenantFeatureRecord,
} from "./tenant-feature-api"
import { TenantFeatureForm } from "./tenant-feature-form"

const PAGE_SIZE = 10
const hiddenKeys = new Set(["id", "_id", "tenantId", "tenant_id", "createdAt", "updatedAt", "created_at", "updated_at"])
function humanize(value: string) {
  return value.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[_-]/g, " ").replace(/^./, (letter) => letter.toUpperCase())
}
function displayValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "—"
  if (typeof value === "boolean") return value ? "Yes" : "No"
  if (Array.isArray(value)) return value.map((item) => typeof item === "object" ? JSON.stringify(item) : String(item)).join(", ")
  if (typeof value === "object") return JSON.stringify(value)
  return String(value)
}
function recordId(record: TenantFeatureRecord, index: number) {
  const id = record.id ?? record._id ?? record.uuid ?? record.email ?? record.code
  return typeof id === "string" || typeof id === "number" ? String(id) : String(index)
}

export function TenantFeaturePage() {
  const { feature: featureParam, section } = useParams()
  const { locale } = useI18n()
  const ar = locale === "ar"
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()
  const key = section ? featureParam + "/" + section : featureParam || ""
  const feature = getTenantFeature(key)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(PAGE_SIZE)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [search])

  const listEndpoint = feature ? getTenantFeatureListEndpoint(feature) : undefined
  const writeEndpoint = feature ? getTenantFeatureWriteEndpoint(feature) : undefined
  const queryKey = ["tenant-feature", key, page, perPage, debouncedSearch] as const
  const listQuery = useQuery({
    queryKey,
    queryFn: () => {
      if (!listEndpoint) throw new Error("This feature has no collection endpoint.")
      return fetchTenantFeatureRecords(listEndpoint, {
        page,
        per_page: perPage,
        search: debouncedSearch || undefined,
      })
    },
    enabled: Boolean(feature && listEndpoint),
    staleTime: 30_000,
  })
  const saveMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => {
      if (!writeEndpoint) throw new Error("This feature does not support direct updates.")
      return saveTenantFeatureRecord(writeEndpoint, payload)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tenant-feature", key] })
      dispatch(pushToast({
        id: crypto.randomUUID(),
        kind: "success",
        title: ar ? "تم الحفظ بنجاح" : "Saved successfully",
        description: ar ? "تم تحديث بيانات المؤسسة." : "The organization data has been updated.",
      }))
    },
  })

  const records = listQuery.data?.records ?? []
  const columns = useMemo<DataTableColumn<TenantFeatureRecord>[]>(() => {
    const sample = records[0]
    if (!sample) return []
    const keys = Object.keys(sample).filter((field) => !hiddenKeys.has(field)).slice(0, 6)
    const preferred = ["name", "displayName", "title", "email", "invoiceNumber", "code", "status"]
    keys.sort((a, b) => {
      const ai = preferred.indexOf(a)
      const bi = preferred.indexOf(b)
      return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi)
    })
    return keys.map((field) => ({
      id: field,
      header: humanize(field),
      cell: (record) => <span className="block max-w-[260px] truncate text-sm" title={displayValue(record[field])}>{displayValue(record[field])}</span>,
    }))
  }, [records])

  if (!feature) {
    return <Card><CardContent className="p-10 text-center"><h2 className="text-lg font-semibold">{ar ? "الصفحة غير موجودة" : "Page not found"}</h2><p className="mt-2 text-sm text-muted-foreground">{key}</p></CardContent></Card>
  }

  const title = feature.title[ar ? "ar" : "en"]
  const description = feature.description[ar ? "ar" : "en"]
  const paginationData = listQuery.data?.pagination
  const total = paginationData?.total
  const currentPage = paginationData?.page ?? page
  const currentPerPage = paginationData?.per_page ?? perPage
  const pagination = listEndpoint ? {
    page: currentPage,
    perPage: currentPerPage,
    total: total ?? records.length,
    totalKnown: typeof total === "number",
    hasNext: typeof paginationData?.total_pages === "number"
      ? currentPage < paginationData.total_pages
      : typeof total === "number"
        ? currentPage * currentPerPage < total
        : records.length >= currentPerPage,
  } : undefined

  return (
    <div className="space-y-7">
      <TenantPageHeading eyebrow={feature.eyebrow[ar ? "ar" : "en"]} title={title} description={description} />

      <section className="grid gap-4 md:grid-cols-3">
        <StatusCard icon={ServerCog} label={ar ? "مصدر البيانات" : "Data source"} value={listEndpoint ? (ar ? "واجهة API" : "API endpoint") : (ar ? "إجراءات مخصصة" : "Custom workflow")} description={listEndpoint?.path ?? (ar ? "تعتمد هذه الوحدة على إجراءات مخصصة." : "This module uses dedicated actions.")} />
        <StatusCard icon={Database} label={ar ? "نطاق البيانات" : "Data boundary"} value="Tenant-scoped" description={ar ? "الطلبات تستخدم جلسة المؤسسة الحالية ولا تقبل معرف مؤسسة من الواجهة." : "Requests use the active tenant session; tenant identity is not accepted from page input."} />
        <StatusCard icon={CheckCircle2} label={ar ? "حالة الطلب" : "Request state"} value={listQuery.isSuccess ? (ar ? "متصل" : "Connected") : listQuery.isError ? (ar ? "تعذر الاتصال" : "Request failed") : (ar ? "جاهز للتحميل" : "Ready to load")} description={ar ? "يتم عرض الحالة الفعلية للطلب." : "Reflects the actual API request state."} />
      </section>

      {feature.capabilities.length > 0 && (
        <Card><CardContent className="p-5 sm:p-6">
          <h2 className="font-semibold">{ar ? "نطاق الوحدة" : "Feature scope"}</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {feature.capabilities.map((item, index) => <div key={index} className="flex gap-3 rounded-xl border p-3"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600"/><p className="text-sm leading-6">{item[ar ? "ar" : "en"]}</p></div>)}
          </div>
        </CardContent></Card>
      )}

      {listEndpoint && (
        <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          <div className="flex flex-col gap-3 border-b p-5 lg:flex-row lg:items-center lg:justify-between">
            <div><h2 className="font-semibold">{ar ? "السجلات" : "Records"}</h2><p className="mt-1 text-xs text-muted-foreground">{ar ? "البيانات محملة من واجهة المؤسسة الحالية." : "Records loaded from the active tenant API."}</p></div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative"><Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={ar ? "بحث..." : "Search records..."} className="ps-9 sm:w-64"/></div>
              <Button type="button" variant="outline" onClick={() => listQuery.refetch()} disabled={listQuery.isFetching}><RefreshCw className={"me-2 size-4 " + (listQuery.isFetching ? "animate-spin" : "")}/>{ar ? "تحديث" : "Refresh"}</Button>
            </div>
          </div>
          {listQuery.isError && <div role="alert" className="mx-5 mt-4 flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"><AlertCircle className="mt-0.5 size-4 shrink-0"/><span>{listQuery.error instanceof Error ? listQuery.error.message : (ar ? "تعذر تحميل البيانات" : "Unable to load records")}</span></div>}
          <DataTable
            columns={columns}
            data={records}
            getRowId={recordId}
            isLoading={listQuery.isLoading}
            loadingLabel={ar ? "جارٍ تحميل البيانات..." : "Loading records..."}
            emptyState={<div className="px-6 py-16 text-center"><Database className="mx-auto size-9 text-muted-foreground/40"/><p className="mt-3 font-semibold">{ar ? "لا توجد سجلات" : "No records found"}</p><p className="mt-1 text-sm text-muted-foreground">{ar ? "ستظهر البيانات هنا بعد تحميلها من الباك." : "Records will appear here when returned by the API."}</p></div>}
            pagination={pagination}
            onPageChange={setPage}
            onPerPageChange={(size) => { setPerPage(size); setPage(1) }}
          />
        </section>
      )}

      {writeEndpoint && feature.fields?.length && feature.schemaKey && (
        <TenantFeatureForm feature={feature} onSave={(payload) => saveMutation.mutateAsync(payload)} />
      )}

      {!listEndpoint && !writeEndpoint && (
        <Card><CardContent className="p-8 text-center"><Database className="mx-auto size-8 text-muted-foreground"/><p className="mt-3 font-semibold">{ar ? "إجراءات هذه الوحدة" : "Module actions"}</p><p className="mt-1 text-sm text-muted-foreground">{feature.note?.[ar ? "ar" : "en"] ?? (ar ? "لم يتم تعريف عملية قائمة لهذه الوحدة في عقد الـ API." : "No collection operation is defined for this module in the API contract.")}</p></CardContent></Card>
      )}
    </div>
  )
}

function StatusCard({ icon: Icon, label, value, description }: {
  icon: typeof ServerCog
  label: string
  value: string
  description: string
}) {
  return <Card><CardContent className="p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs text-muted-foreground">{label}</p><p className="mt-2 text-lg font-semibold">{value}</p></div><span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5"/></span></div><p className="mt-3 break-all text-xs leading-5 text-muted-foreground">{description}</p></CardContent></Card>
}
