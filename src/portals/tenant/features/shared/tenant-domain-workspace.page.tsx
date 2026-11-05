import { useState, type FormEvent } from "react"
import { useQueries, useMutation, useQueryClient } from "@tanstack/react-query"
import { Activity, Check, Eye, LoaderCircle, Plus, RefreshCw, RotateCw, Send, ShieldCheck, Trash2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useI18n } from "@/i18n/i18n-provider"
import { tenantApi } from "../../api/tenant-api"
import { TenantPageHeading } from "../../components/tenant-page-heading"
import { ConfirmDialog } from "@/shared/components/dialogs/confirm-dialog"
import type { TenantFeatureDefinition, TenantFeatureEndpoint } from "./tenant-feature.types"

type Row = Record<string, unknown> & { id?: string; _id?: string; uuid?: string }
type Resource = { endpoint: TenantFeatureEndpoint; rows: Row[]; summary: Record<string, unknown> | null }
const hidden = new Set(["id", "_id", "uuid", "tenantId", "tenant_id", "createdAt", "updatedAt", "created_at", "updated_at", "deletedAt"])
const apiPath = (path: string) => path.replace(/^\/api\/v1/, "")
function unwrap(value: unknown): unknown {
  let current = value
  for (let i = 0; i < 3; i += 1) {
    if (!current || typeof current !== "object" || !("data" in current)) break
    current = (current as { data: unknown }).data
  }
  return current
}
function toRows(value: unknown): Row[] {
  const data = unwrap(value)
  if (Array.isArray(data)) return data as Row[]
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>
    for (const key of ["items", "records", "results", "rows", "data"]) {
      if (Array.isArray(record[key])) return record[key] as Row[]
    }
    return [record as Row]
  }
  return []
}
function rowId(row: Row) {
  const value = row.id ?? row._id ?? row.uuid ?? row.membershipId ?? row.userId ?? row.invoiceId
  return value === undefined || value === null ? "" : String(value)
}
function label(value: string, ar: boolean) {
  const known: Record<string, [string, string]> = {
    "Users directory": ["Users", "المستخدمون"],
    "List invitations": ["Invitations", "الدعوات"],
    "Roles directory": ["Roles", "الأدوار"],
    "Permission catalogue": ["Available permissions", "الصلاحيات المتاحة"],
    "Read organization defaults": ["Organization policies", "سياسات المؤسسة"],
    "List shared templates": ["Shared templates", "القوالب المشتركة"],
    "Consolidated summary": ["Financial summary", "الملخص المالي"],
    "Clinic comparison": ["Clinic comparison", "مقارنة العيادات"],
    "Revenue trends": ["Revenue trends", "اتجاهات الإيرادات"],
    "Expense breakdown": ["Expense breakdown", "تحليل المصروفات"],
    "Consolidated reports": ["Financial reports", "التقارير المالية"],
    "Current subscription": ["Current subscription", "الاشتراك الحالي"],
    "Entitlement usage": ["Plan usage", "استهلاك الخطة"],
    "Cutilora invoices": ["Invoices", "الفواتير"],
    "Connected providers": ["Connected services", "الخدمات المتصلة"],
    "Webhook endpoints": ["Webhooks", "روابط Webhook"],
    "Available group reports": ["Available reports", "التقارير المتاحة"],
    "Audit timeline": ["Audit timeline", "سجل التدقيق"],
    "Read preferences": ["Workspace preferences", "تفضيلات مساحة العمل"],
    "Read notification preferences": ["Notification preferences", "تفضيلات الإشعارات"],
    "Active sessions": ["Active sessions", "الجلسات النشطة"],
    "Security events": ["Security events", "أحداث الأمان"],
    "Clinic details": ["Clinic profile", "ملف العيادة"],
    "Clinic branches": ["Clinic branches", "فروع العيادة"],
    "Assigned users": ["Assigned members", "الأعضاء المعينون"],
    "Clinic settings and overrides": ["Clinic settings", "إعدادات العيادة"],
    "Clinic documents": ["Clinic documents", "مستندات العيادة"],
    "Clinic activity": ["Clinic activity", "نشاط العيادة"],
  }
  const pair = known[value]
  return pair ? pair[ar ? 1 : 0] : value
}
function humanize(key: string, ar: boolean) {
  const dictionary: Record<string, [string, string]> = {
    name: ["Name", "الاسم"], email: ["Email", "البريد الإلكتروني"], status: ["Status", "الحالة"],
    role: ["Role", "الدور"], scope: ["Scope", "نطاق الصلاحية"], createdAt: ["Created", "تاريخ الإنشاء"],
    updatedAt: ["Updated", "آخر تحديث"], lastActivityAt: ["Last activity", "آخر نشاط"],
    displayName: ["Display name", "الاسم التجاري"], legalName: ["Legal name", "الاسم القانوني"],
    amount: ["Amount", "المبلغ"], currency: ["Currency", "العملة"], invoiceNumber: ["Invoice", "رقم الفاتورة"],
    provider: ["Provider", "مزود الخدمة"], category: ["Category", "التصنيف"], date: ["Date", "التاريخ"],
    expiresAt: ["Expires", "تاريخ الانتهاء"], plan: ["Plan", "الخطة"], renewalDate: ["Renewal", "تاريخ التجديد"],
    isActive: ["Active", "نشط"], clinicName: ["Clinic", "العيادة"], branchName: ["Branch", "الفرع"],
    action: ["Action", "الإجراء"], actor: ["Performed by", "المنفذ"], module: ["Module", "الوحدة"],
  }
  if (dictionary[key]) return dictionary[key][ar ? 1 : 0]
  return key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[_-]/g, " ").replace(/^./, x => x.toUpperCase())
}
function display(value: unknown, ar: boolean) {
  if (value === null || value === undefined || value === "") return "—"
  if (typeof value === "boolean") return value ? (ar ? "نعم" : "Yes") : (ar ? "لا" : "No")
  if (Array.isArray(value)) return value.map(item => typeof item === "object" ? JSON.stringify(item) : String(item)).join(", ")
  if (typeof value === "object") return JSON.stringify(value)
  return String(value)
}
function resolvePath(path: string, row?: Row) {
  return path.replace(/\{([^}]+)\}/g, (_match, token: string) => {
    const aliases: Record<string, unknown> = {
      id: row?.id ?? row?._id ?? row?.uuid,
      membershipId: row?.membershipId ?? row?.membership_id ?? row?.id ?? row?._id,
      userId: row?.userId ?? row?.user_id ?? row?.id ?? row?._id,
      reportKey: row?.key ?? row?.reportKey ?? row?.id,
      webhookId: row?.id ?? row?._id,
    }
    const value = aliases[token] ?? row?.[token]
    return encodeURIComponent(value === undefined || value === null ? "" : String(value))
  })
}
function operationLabel(endpoint: TenantFeatureEndpoint, ar: boolean) {
  const p = endpoint.purpose.toLowerCase()
  if (p.includes("resend")) return ar ? "إعادة الإرسال" : "Resend"
  if (p.includes("revoke")) return ar ? "إلغاء" : "Revoke"
  if (p.includes("publish")) return ar ? "نشر" : "Publish"
  if (p.includes("rotate")) return ar ? "تدوير بيانات الاتصال" : "Rotate credentials"
  if (p.includes("disconnect")) return ar ? "فصل الاتصال" : "Disconnect"
  if (p.includes("export")) return ar ? "تصدير" : "Export"
  if (p.includes("download")) return ar ? "تنزيل" : "Download"
  if (p.includes("update")) return ar ? "تحديث" : "Update"
  if (p.includes("create")) return ar ? "إنشاء" : "Create"
  if (p.includes("replace")) return ar ? "استبدال" : "Replace"
  return endpoint.purpose
}

export function TenantDomainWorkspacePage({ feature }: { feature: TenantFeatureDefinition }) {
  const { locale } = useI18n()
  const ar = locale === "ar"
  const client = useQueryClient()
  const [values, setValues] = useState<Record<string, string>>({})
  const [payloadText, setPayloadText] = useState("{}")
  const [formError, setFormError] = useState("")
  const [success, setSuccess] = useState("")
  const [confirm, setConfirm] = useState<{ endpoint: TenantFeatureEndpoint; row?: Row } | null>(null)
  const [details, setDetails] = useState<{ title: string; data: unknown } | null>(null)
  const getEndpoints = feature.endpoints.filter(endpoint => endpoint.method === "GET" && !endpoint.path.includes("{"))
  const writeEndpoints = feature.endpoints.filter(endpoint => endpoint.method !== "GET")
  const resourcesQuery = useQueries({
    queries: getEndpoints.map(endpoint => ({
      queryKey: ["tenant-domain", feature.key, endpoint.path],
      queryFn: async () => {
        const response = await tenantApi.get(apiPath(endpoint.path), { params: { per_page: 100 } })
        const data = unwrap(response.data)
        const rows = toRows(data)
        const summary = data && typeof data === "object" && !Array.isArray(data) ? data as Record<string, unknown> : null
        return { rows, summary }
      },
      staleTime: 20_000,
    })),
  })
  const resources: Resource[] = getEndpoints.map((endpoint, index) => ({
    endpoint,
    rows: resourcesQuery[index]?.data?.rows ?? [],
    summary: resourcesQuery[index]?.data?.summary ?? null,
  }))
  const busy = resourcesQuery.some(query => query.isLoading)
  const hasError = resourcesQuery.find(query => query.isError)?.error

  const operation = useMutation({
    mutationFn: async ({ endpoint, row, payload }: { endpoint: TenantFeatureEndpoint; row?: Row; payload?: Record<string, unknown> }) => {
      const path = resolvePath(endpoint.path, row)
      if (path.includes("//") || path.includes("/undefined")) throw new Error(ar ? "تعذر تحديد السجل المطلوب." : "The target record could not be identified.")
      const response = await tenantApi.request({
        method: endpoint.method,
        url: apiPath(path),
        data: payload,
      })
      return response.data
    },
    onSuccess: async (_data, variables) => {
      setFormError("")
      setSuccess(ar ? "تم تنفيذ العملية بنجاح." : "The operation completed successfully.")
      setConfirm(null)
      await client.invalidateQueries({ queryKey: ["tenant-domain", feature.key] })
      const result = _data as { url?: string; downloadUrl?: string; exportUrl?: string } | undefined
      const downloadUrl = result?.url ?? result?.downloadUrl ?? result?.exportUrl
      if (downloadUrl && /download|export/i.test(variables.endpoint.purpose)) window.open(downloadUrl, "_blank", "noopener,noreferrer")
    },
    onError: error => {
      setSuccess("")
      setFormError(error instanceof Error ? error.message : (ar ? "تعذر تنفيذ العملية." : "The operation could not be completed."))
    },
  })

  const formEndpoint = writeEndpoints.find(endpoint => !endpoint.path.includes("{") && ["POST", "PATCH", "PUT"].includes(endpoint.method))
  const fields = feature.fields ?? []
  const columnsFor = (rows: Row[]): DataTableColumn<Row>[] => {
    const keys = Object.keys(rows[0] ?? {}).filter(key => !hidden.has(key)).slice(0, 7)
    const preferred = ["name", "displayName", "email", "role", "status", "plan", "amount", "createdAt"]
    keys.sort((a, b) => {
      const ai = preferred.indexOf(a), bi = preferred.indexOf(b)
      return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi)
    })
    return keys.map(key => ({
      id: key,
      header: humanize(key, ar),
      cell: row => <span className="block max-w-[240px] truncate text-sm" title={display(row[key], ar)}>{display(row[key], ar)}</span>,
    }))
  }

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!formEndpoint) return
    setFormError("")
    let payload: Record<string, unknown>
    try {
      payload = fields.length
        ? Object.fromEntries(fields.filter(field => values[field.name] !== undefined && values[field.name] !== "").map(field => [field.name, field.type === "number" ? Number(values[field.name]) : values[field.name]]))
        : JSON.parse(payloadText) as Record<string, unknown>
      if (fields.some(field => field.required && !String(values[field.name] ?? "").trim())) {
        setFormError(ar ? "أكمل كل الحقول المطلوبة." : "Complete all required fields.")
        return
      }
    } catch {
      setFormError(ar ? "صيغة البيانات غير صحيحة." : "The submitted data is not valid.")
      return
    }
    await operation.mutateAsync({ endpoint: formEndpoint, payload })
    setValues({})
  }

  async function openDetails(endpoint: TenantFeatureEndpoint, row: Row) {
    try {
      const response = await tenantApi.get(apiPath(resolvePath(endpoint.path, row)))
      setDetails({ title: label(endpoint.purpose, ar), data: unwrap(response.data) })
    } catch (error) {
      setFormError(error instanceof Error ? error.message : (ar ? "تعذر تحميل التفاصيل." : "Unable to load details."))
    }
  }

  const readActions = feature.endpoints.filter(endpoint => endpoint.method === "GET" && endpoint.path.includes("{"))
  const rowActions = writeEndpoints.filter(endpoint => endpoint.path.includes("{"))
  const showGenericPayload = !fields.length && Boolean(formEndpoint)

  return (
    <div className="space-y-6">
      <TenantPageHeading eyebrow={feature.eyebrow[ar ? "ar" : "en"]} title={feature.title[ar ? "ar" : "en"]} description={feature.description[ar ? "ar" : "en"]} />
      {(formError || success) && <div role={formError ? "alert" : "status"} className={formError ? "rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive" : "rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"}>{formError || success}</div>}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{ar ? "البيانات مرتبطة بالمؤسسة النشطة." : "Data is scoped to the active organization."}</p>
        <Button variant="outline" onClick={() => void client.invalidateQueries({ queryKey: ["tenant-domain", feature.key] })} disabled={busy}><RefreshCw className={`me-2 size-4 ${busy ? "animate-spin" : ""}`}/>{ar ? "تحديث البيانات" : "Refresh data"}</Button>
      </div>
      {hasError && <p role="alert" className="text-sm text-destructive">{hasError instanceof Error ? hasError.message : (ar ? "تعذر تحميل بعض البيانات." : "Some data could not be loaded.")}</p>}
      {resources.map((resource, index) => {
        const rows = resource.rows
        const isSummary = resource.endpoint.path.includes("/summary") || resource.endpoint.path.endsWith("/subscription") || resource.endpoint.path.endsWith("/configuration") || resource.endpoint.path.endsWith("/preferences")
        const summaryEntries = Object.entries(resource.summary ?? {}).filter(([key, value]) => !hidden.has(key) && value !== null && typeof value !== "object").slice(0, 12)
        return (
          <Card key={resource.endpoint.path}>
            <CardContent className="p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div><h2 className="font-semibold">{label(resource.endpoint.purpose, ar)}</h2><p className="mt-1 text-xs text-muted-foreground">{ar ? `${rows.length} سجل` : `${rows.length} records`}</p></div>
                {isSummary && <Activity className="size-5 text-muted-foreground"/>}
              </div>
              {isSummary && summaryEntries.length > 0 && (
                <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {summaryEntries.map(([key, value]) => <div key={key} className="rounded-xl border bg-muted/20 p-3"><p className="text-xs text-muted-foreground">{humanize(key, ar)}</p><p className="mt-1 break-words text-lg font-semibold">{display(value, ar)}</p></div>)}
                </div>
              )}
              {rows.length > 0 ? (
                <DataTable columns={columnsFor(rows)} data={rows} getRowId={(row) => rowId(row) || JSON.stringify(row)} isLoading={resourcesQuery[index]?.isLoading} loadingLabel={ar ? "جارٍ التحميل..." : "Loading..."} emptyState={<p className="py-8 text-center text-sm text-muted-foreground">{ar ? "لا توجد بيانات." : "No data available."}</p>}/>
              ) : !isSummary && !resourcesQuery[index]?.isLoading ? (
                <p className="rounded-xl border border-dashed py-8 text-center text-sm text-muted-foreground">{ar ? "لا توجد سجلات حالياً." : "No records yet."}</p>
              ) : null}
              {readActions.length > 0 && rows.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{rows.slice(0, 8).flatMap(row => readActions.map(endpoint => <Button key={endpoint.path + rowId(row)} size="sm" variant="outline" onClick={() => {
                if (/download/i.test(endpoint.purpose)) {
                  void tenantApi.get(apiPath(resolvePath(endpoint.path, row))).then(response => {
                    const result = unwrap(response.data) as { url?: string; downloadUrl?: string }
                    const url = result?.url ?? result?.downloadUrl
                    if (url) window.open(url, "_blank", "noopener,noreferrer")
                    else setFormError(ar ? "رابط التنزيل غير متاح." : "The download link is unavailable.")
                  }).catch(error => setFormError(error instanceof Error ? error.message : (ar ? "تعذر التنزيل." : "Unable to download.")))
                } else void openDetails(endpoint, row)
              }}><Eye className="me-2 size-3.5"/>{/download/i.test(endpoint.purpose) ? (ar ? "تنزيل" : "Download") : (ar ? "تفاصيل" : "Details")} · {String(row.name ?? row.email ?? rowId(row)).slice(0, 20)}</Button>))}</div>}
              {rowActions.length > 0 && rows.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {rows.slice(0, 12).flatMap(row => rowActions.map(endpoint => (
                    <Button key={endpoint.path + rowId(row)} size="sm" variant={endpoint.method === "DELETE" || /revoke|disconnect/i.test(endpoint.purpose) ? "destructive" : "outline"} disabled={!rowId(row) && !row.membershipId && !row.userId || operation.isPending} onClick={() => {
                      const risky = endpoint.method === "DELETE" || /revoke|disconnect/i.test(endpoint.purpose)
                      if (risky) setConfirm({ endpoint, row })
                      else {
                        const payload = /membership status/i.test(endpoint.purpose) ? { status: String(row.status ?? "").toLowerCase() === "active" ? "suspended" : "active" } : undefined
                        void operation.mutateAsync({ endpoint, row, payload })
                      }
                    }}>{operation.isPending ? <LoaderCircle className="me-2 size-3.5 animate-spin"/> : /resend/i.test(endpoint.purpose) ? <Send className="me-2 size-3.5"/> : /rotate/i.test(endpoint.purpose) ? <RotateCw className="me-2 size-3.5"/> : endpoint.method === "DELETE" ? <Trash2 className="me-2 size-3.5"/> : <ShieldCheck className="me-2 size-3.5"/>}{operationLabel(endpoint, ar)} · {String(row.name ?? row.email ?? rowId(row)).slice(0, 18)}</Button>
                  )))}
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
      {formEndpoint && (
        <Card>
          <CardContent className="p-5">
            <div className="mb-4 flex items-center gap-2"><Plus className="size-5 text-primary"/><h2 className="font-semibold">{operationLabel(formEndpoint, ar)} · {feature.title[ar ? "ar" : "en"]}</h2></div>
            <form onSubmit={submitForm} className="grid gap-4 sm:grid-cols-2">
              {fields.map(field => <div key={field.name} className={field.type === "textarea" ? "sm:col-span-2" : ""}>
                <Label htmlFor={`tenant-op-${field.name}`}>{ar ? ({
                  email: "البريد الإلكتروني", role: "الدور", scope: "نطاق الوصول", expiresAt: "تاريخ الانتهاء",
                  name: "الاسم", description: "الوصف", defaultLocale: "اللغة الافتراضية", defaultCurrency: "العملة الافتراضية",
                  cancellationWindowHours: "مهلة الإلغاء بالساعات", category: "التصنيف", durationMinutes: "المدة بالدقائق",
                  bufferMinutes: "الفاصل بالدقائق", billingName: "الاسم القانوني للفوترة", billingEmail: "بريد الفوترة",
                  taxNumber: "الرقم الضريبي", provider: "مزود الخدمة", locale: "اللغة", currency: "العملة", timezone: "المنطقة الزمنية",
                } as Record<string, string>)[field.name] ?? field.label : field.label}{field.required ? " *" : ""}</Label>
                {field.type === "select" ? <Select value={values[field.name] ?? ""} onValueChange={value => setValues(current => ({ ...current, [field.name]: value }))}><SelectTrigger id={`tenant-op-${field.name}`}><SelectValue placeholder={ar ? "اختر..." : "Select..."}/></SelectTrigger><SelectContent>{field.options?.map(option => <SelectItem key={option.value} value={option.value}>{ar ? ({
                  tenant_admin: "مسؤول المؤسسة", organization_manager: "مدير المؤسسة", read_only_analyst: "محلل للقراءة فقط",
                  clinic_manager: "مدير عيادة", branch_manager: "مدير فرع", tenant: "المؤسسة بالكامل", clinic: "عيادات محددة", branch: "فروع محددة",
                  en: "الإنجليزية", ar: "العربية", EGP: "جنيه مصري", SAR: "ريال سعودي", AED: "درهم إماراتي", USD: "دولار أمريكي",
                  whatsapp: "واتساب", sms: "رسائل SMS", email: "البريد الإلكتروني", calendar: "التقويم", payment: "الدفع",
                } as Record<string, string>)[option.value] ?? option.label : option.label}</SelectItem>)}</SelectContent></Select>
                : field.type === "textarea" ? <Textarea id={`tenant-op-${field.name}`} value={values[field.name] ?? ""} onChange={event => setValues(current => ({ ...current, [field.name]: event.target.value }))}/>
                : <Input id={`tenant-op-${field.name}`} type={field.type ?? "text"} value={values[field.name] ?? ""} onChange={event => setValues(current => ({ ...current, [field.name]: event.target.value }))}/>}
              </div>)}
              {showGenericPayload && <div className="sm:col-span-2"><Label>{ar ? "بيانات العملية" : "Operation data"}</Label><Textarea value={payloadText} onChange={event => setPayloadText(event.target.value)} rows={5} className="mt-2 font-mono text-xs"/></div>}
              <div className="flex flex-wrap items-center gap-2 sm:col-span-2"><Button type="submit" disabled={operation.isPending}>{operation.isPending ? <LoaderCircle className="me-2 size-4 animate-spin"/> : <Check className="me-2 size-4"/>}{operationLabel(formEndpoint, ar)}</Button><Button type="button" variant="outline" onClick={() => setValues({})}>{ar ? "مسح الحقول" : "Clear fields"}</Button></div>
            </form>
          </CardContent>
        </Card>
      )}
      {details && <Card><CardContent className="p-5"><div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">{details.title}</h2><Button size="sm" variant="ghost" onClick={() => setDetails(null)}><XCircle className="me-2 size-4"/>{ar ? "إغلاق" : "Close"}</Button></div><pre className="max-h-96 overflow-auto rounded-xl bg-muted p-4 text-xs" dir="ltr">{JSON.stringify(details.data, null, 2)}</pre></CardContent></Card>}
      <ConfirmDialog open={Boolean(confirm)} title={confirm ? operationLabel(confirm.endpoint, ar) : ""} description={ar ? "هل أنت متأكد من تنفيذ هذا الإجراء؟ قد يؤثر على وصول المستخدم أو اتصال الخدمة." : "Are you sure you want to perform this action? It may affect user access or a connected service."} confirmLabel={confirm ? operationLabel(confirm.endpoint, ar) : (ar ? "تأكيد" : "Confirm")} destructive isLoading={operation.isPending} onOpenChange={open => { if (!open) setConfirm(null) }} onConfirm={() => { if (confirm) void operation.mutateAsync({ endpoint: confirm.endpoint, row: confirm.row }) }}/>
    </div>
  )
}
