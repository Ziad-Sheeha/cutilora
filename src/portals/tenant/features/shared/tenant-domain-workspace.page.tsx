import { useState, type FormEvent } from "react"
import { useQueries, useMutation, useQueryClient } from "@tanstack/react-query"
import { Activity, Check, Copy, Eye, LoaderCircle, Plus, RefreshCw, RotateCw, Search, Send, ShieldCheck, Trash2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import type { TenantFeatureDefinition, TenantFeatureEndpoint, TenantFeatureField } from "./tenant-feature.types"
import type { Branch, Clinic } from "../../types/tenant.types"
import { getTenantFieldErrors, validateTenantFeatureForm, type TenantFeatureSchemaKey } from "./tenant-feature-schemas"

type Row = Record<string, unknown> & { id?: string; _id?: string; uuid?: string }
type Resource = { endpoint: TenantFeatureEndpoint; rows: Row[]; summary: Record<string, unknown> | null; pagination?: { page?: number; per_page?: number; total?: number; total_pages?: number } }
type SelectedOperation = { endpoint: TenantFeatureEndpoint; row: Row }
const hidden = new Set(["id", "_id", "uuid", "tenantId", "tenant_id", "createdAt", "updatedAt", "created_at", "updated_at", "deletedAt"])
const sensitive = /password|token|secret|credential|authorization|signature|^(api.?key|client.?secret|private.?key)$/i
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
    for (const key of ["items", "records", "results", "rows", "data", "permissions", "users", "memberships", "roles", "invitations", "templates", "invoices", "reports", "sessions", "events", "branches", "documents", "activity"]) {
      if (Array.isArray(record[key])) return record[key] as Row[]
    }
    return [record as Row]
  }
  return []
}
function rowId(row: Row) {
  const value = row.id ?? row._id ?? row.uuid ?? row.membershipId ?? row.userId ?? row.invoiceId ?? row.reportId ?? row.auditEventId ?? row.sessionId
  return value === undefined || value === null ? "" : String(value)
}
function label(value: string, ar: boolean) {
  const known: Record<string, [string, string]> = {
    "Users directory": ["Users", "المستخدمون"], "Organization memberships": ["Memberships", "العضويات"],
    "List invitations": ["Invitations", "الدعوات"], "Roles directory": ["Roles", "الأدوار"],
    "Permission catalogue": ["Available permissions", "الصلاحيات المتاحة"], "Read organization defaults": ["Organization policies", "سياسات المؤسسة"],
    "List shared templates": ["Shared templates", "القوالب المشتركة"], "Consolidated summary": ["Financial summary", "الملخص المالي"],
    "Clinic comparison": ["Clinic comparison", "مقارنة العيادات"], "Revenue trends": ["Revenue trends", "اتجاهات الإيرادات"],
    "Expense breakdown": ["Expense breakdown", "تحليل المصروفات"], "Consolidated reports": ["Financial reports", "التقارير المالية"],
    "Current subscription": ["Current subscription", "الاشتراك الحالي"], "Entitlement usage": ["Plan usage", "استهلاك الخطة"],
    "Cutilora invoices": ["Invoices", "الفواتير"], "Connected providers": ["Connected services", "الخدمات المتصلة"],
    "Webhook endpoints": ["Webhooks", "روابط Webhook"], "Available group reports": ["Available reports", "التقارير المتاحة"],
    "Audit timeline": ["Audit timeline", "سجل التدقيق"], "Read preferences": ["Workspace preferences", "تفضيلات مساحة العمل"],
    "Read notification preferences": ["Notification preferences", "تفضيلات الإشعارات"], "Active sessions": ["Active sessions", "الجلسات النشطة"],
    "Security events": ["Security events", "أحداث الأمان"], "Clinic details": ["Clinic profile", "ملف العيادة"],
    "Clinic branches": ["Clinic branches", "فروع العيادة"], "Assigned users": ["Assigned members", "الأعضاء المعينون"],
    "Clinic settings and overrides": ["Clinic settings", "إعدادات العيادة"], "Clinic documents": ["Clinic documents", "مستندات العيادة"],
    "Clinic activity": ["Clinic activity", "نشاط العيادة"],
    "Update membership status and role": ["Update membership", "تعديل العضوية"],
    "Assign clinic and branch scopes": ["Assign access scope", "تحديد نطاق الوصول"],
    "Invoice details": ["Invoice details", "تفاصيل الفاتورة"],
    "Download invoice": ["Download invoice", "تنزيل الفاتورة"],
    "Read organization profile": ["Organization profile", "ملف المؤسسة"],
    "Read weekly schedule": ["Weekly schedule", "جدول العمل الأسبوعي"],
    "List holidays and closures": ["Holidays and closures", "العطلات والإغلاقات"],
    "Update branch settings": ["Branch settings", "إعدادات الفرع"],
    "Update preferences": ["Update preferences", "تحديث التفضيلات"],
    "Update notification preferences": ["Update notification preferences", "تحديث تفضيلات الإشعارات"],
    "Revoke session": ["Revoke session", "إنهاء الجلسة"],
    "Report data": ["Report details", "تفاصيل التقرير"],
    "Generate export": ["Generate export", "إنشاء تصدير"],
    "Audit event details": ["Audit event details", "تفاصيل حدث التدقيق"],
    "Export filtered audit events": ["Export audit events", "تصدير أحداث التدقيق"],
    "Update verification status": ["Update verification", "تحديث حالة التحقق"],
    "Get authorized signed download URL": ["Secure download", "تنزيل آمن"],
    "Update clinic settings and overrides": ["Update clinic settings", "تحديث إعدادات العيادة"],
    "Replace role grants": ["Update role permissions", "تحديث صلاحيات الدور"],
    "Effective current-user access": ["My effective access", "صلاحياتي الفعلية"],
    "Update organization defaults": ["Update policies", "تحديث السياسات"],
    "Preview selected rollout": ["Preview changes", "معاينة التغييرات"],
    "Apply confirmed rollout": ["Apply changes", "تطبيق التغييرات"],
    "Create template": ["Create template", "إنشاء قالب"],
    "Template details": ["Template details", "تفاصيل القالب"],
    "Update template": ["Update template", "تحديث القالب"],
    "Publish template": ["Publish template", "نشر القالب"],
    "Submit plan change request": ["Request plan change", "طلب تغيير الخطة"],
    "Connect provider": ["Connect provider", "ربط مزود الخدمة"],
    "Update integration": ["Update integration", "تحديث التكامل"],
    "Register webhook": ["Register webhook", "تسجيل Webhook"],
    "List documents": ["Documents", "المستندات"],
    "Upload document metadata/file": ["Upload document", "رفع مستند"],
    "Document details": ["Document details", "تفاصيل المستند"],
    "Replace document file": ["Replace document", "استبدال المستند"],
    "Archive document": ["Archive document", "أرشفة المستند"],
    "Update clinic profile": ["Update clinic profile", "تحديث ملف العيادة"],
    "Create holiday or exception": ["Add holiday or exception", "إضافة عطلة أو استثناء"],
    "Assign branch manager": ["Assign branch manager", "تعيين مدير الفرع"],
  }
  const pair = known[value]
  return pair ? pair[ar ? 1 : 0] : value
}
function humanize(key: string, ar: boolean) {
  const dictionary: Record<string, [string, string]> = {
    name: ["Name", "الاسم"], email: ["Email", "البريد الإلكتروني"], status: ["Status", "الحالة"], role: ["Role", "الدور"],
    scope: ["Scope", "نطاق الصلاحية"], lastActivityAt: ["Last activity", "آخر نشاط"], displayName: ["Display name", "الاسم التجاري"],
    legalName: ["Legal name", "الاسم القانوني"], amount: ["Amount", "المبلغ"], currency: ["Currency", "العملة"],
    invoiceNumber: ["Invoice", "رقم الفاتورة"], provider: ["Provider", "مزود الخدمة"], category: ["Category", "التصنيف"],
    date: ["Date", "التاريخ"], expiresAt: ["Expires", "تاريخ الانتهاء"], plan: ["Plan", "الخطة"],
    renewalDate: ["Renewal", "تاريخ التجديد"], isActive: ["Active", "نشط"], clinicName: ["Clinic", "العيادة"],
    branchName: ["Branch", "الفرع"], action: ["Action", "الإجراء"], actor: ["Performed by", "المنفذ"], module: ["Module", "الوحدة"],
  }
  if (dictionary[key]) return dictionary[key][ar ? 1 : 0]
  return key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[_-]/g, " ").replace(/^./, x => x.toUpperCase())
}
function display(value: unknown, ar: boolean) {
  if (value === null || value === undefined || value === "") return "—"
  if (typeof value === "boolean") return value ? (ar ? "نعم" : "Yes") : (ar ? "لا" : "No")
  if (Array.isArray(value)) return value.map(item => typeof item === "object" ? JSON.stringify(item) : String(item)).join(", ")
  if (typeof value === "object") return ar ? "تفاصيل إضافية" : "Additional details"
  return String(value)
}
function resolvePath(path: string, row?: Row) {
  return path.replace(/\{([^}]+)\}/g, (_match, token: string) => {
    const aliases: Record<string, unknown> = {
      id: row?.id ?? row?._id ?? row?.uuid ?? row?.invoiceId ?? row?.reportId ?? row?.auditEventId ?? row?.sessionId, membershipId: row?.membershipId ?? row?.membership_id ?? row?.id ?? row?._id,
      userId: row?.userId ?? row?.user_id ?? row?.id ?? row?._id, reportKey: row?.key ?? row?.reportKey ?? row?.id,
      webhookId: row?.id ?? row?._id,
    }
    const value = aliases[token] ?? row?.[token]
    return encodeURIComponent(value === undefined || value === null ? "" : String(value))
  })
}
function operationLabel(endpoint: TenantFeatureEndpoint, ar: boolean) {
  const localized: Record<string, [string, string]> = {
    "Create invitation": ["Send invitation", "إرسال دعوة"], "Revoke invitation": ["Revoke invitation", "إلغاء الدعوة"],
    "Update membership status and role": ["Update membership", "تعديل العضوية"], "Assign clinic and branch scopes": ["Assign access scope", "تحديد نطاق الوصول"],
    "Create role": ["Create role", "إنشاء دور"], "Update role": ["Update role", "تحديث الدور"], "Replace role grants": ["Save permissions", "حفظ الصلاحيات"],
    "Update organization defaults": ["Save policies", "حفظ السياسات"], "Preview selected rollout": ["Preview changes", "معاينة التغييرات"],
    "Apply confirmed rollout": ["Apply changes", "تطبيق التغييرات"], "Create template": ["Create template", "إنشاء قالب"],
    "Update template": ["Update template", "تحديث القالب"], "Submit plan change request": ["Request plan change", "طلب تغيير الخطة"],
    "Connect provider": ["Connect provider", "ربط مزود الخدمة"], "Update integration": ["Update integration", "تحديث التكامل"],
    "Register webhook": ["Register webhook", "تسجيل Webhook"], "Generate export": ["Generate report", "إنشاء تقرير"],
    "Export filtered audit events": ["Export audit log", "تصدير سجل التدقيق"], "Update clinic profile": ["Save clinic profile", "حفظ ملف العيادة"],
    "Update clinic settings and overrides": ["Save clinic settings", "حفظ إعدادات العيادة"],
  }
  if (localized[endpoint.purpose]) return localized[endpoint.purpose][ar ? 1 : 0]
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
  if (p.includes("assign")) return ar ? "تعيين" : "Assign"
  return endpoint.purpose
}

export function TenantDomainWorkspacePage({ feature, clinicId, clinics = [], branches = [] }: { feature: TenantFeatureDefinition; clinicId?: string; clinics?: Clinic[]; branches?: Branch[] }) {
  const { locale } = useI18n()
  const ar = locale === "ar"
  const client = useQueryClient()
  const [values, setValues] = useState<Record<string, string>>({})
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [actorFilter, setActorFilter] = useState("")
  const [moduleFilter, setModuleFilter] = useState("")
  const [formError, setFormError] = useState("")
  const [oneTimeCredential, setOneTimeCredential] = useState("")
  const [success, setSuccess] = useState("")
  const [confirm, setConfirm] = useState<{ endpoint: TenantFeatureEndpoint; row?: Row } | null>(null)
  const [details, setDetails] = useState<{ title: string; data: unknown } | null>(null)
  const [selectedOperation, setSelectedOperation] = useState<SelectedOperation | null>(null)
  const [permissionText, setPermissionText] = useState("")
  const [selectedClinicIds, setSelectedClinicIds] = useState<string[]>([])
  const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>([])
  const [invitationClinicIds, setInvitationClinicIds] = useState<string[]>([])
  const [invitationBranchIds, setInvitationBranchIds] = useState<string[]>([])
  const [pendingPreview, setPendingPreview] = useState<{ payload: Record<string, unknown>; preview: Record<string, unknown> } | null>(null)
  const getEndpoints = feature.endpoints.filter(endpoint => endpoint.method === "GET" && !endpoint.path.includes("{"))
  const writeEndpoints = feature.endpoints.filter(endpoint => endpoint.method !== "GET")
  const resourcesQuery = useQueries({
    queries: getEndpoints.map(endpoint => ({
      queryKey: ["tenant-domain", feature.key, endpoint.path, search, page, perPage, dateFrom, dateTo, actorFilter, moduleFilter],
      queryFn: async () => {
        const response = await tenantApi.get(apiPath(endpoint.path), { params: {
          page, per_page: perPage, search: search.trim() || undefined,
          ...(feature.key === "governance" || feature.key === "finance" ? { from: dateFrom || undefined, to: dateTo || undefined } : {}),
          ...(feature.key === "governance" ? { actorId: actorFilter || undefined, module: moduleFilter || undefined } : {}),
        } })
        const envelope = response.data && typeof response.data === "object" ? response.data as Record<string, unknown> : {}
        const nestedEnvelope = envelope.data && typeof envelope.data === "object" ? envelope.data as Record<string, unknown> : {}
        const meta = (envelope.pagination ?? envelope.meta ?? nestedEnvelope.pagination ?? nestedEnvelope.meta) as Record<string, unknown> | undefined
        const pagination = meta ? {
          page: Number(meta.page ?? meta.current_page) || undefined,
          per_page: Number(meta.per_page ?? meta.perPage) || undefined,
          total: Number(meta.total) || undefined,
          total_pages: Number(meta.total_pages ?? meta.last_page) || undefined,
        } : undefined
        const data = unwrap(response.data)
        const isSummaryResource = /summary|subscription|configuration|preferences/.test(endpoint.path)
        const record = data && typeof data === "object" && !Array.isArray(data) ? data as Record<string, unknown> : null
        const nestedSummary = record?.summary && typeof record.summary === "object" ? record.summary as Record<string, unknown> : null
        const summary = record ? { ...record, ...(nestedSummary ?? {}) } : null
        const rows = isSummaryResource && record && !Array.isArray(record.items) && !Array.isArray(record.records) ? [] : toRows(data)
        return { rows, summary, pagination }
      },
      enabled: !(dateFrom && dateTo && dateFrom > dateTo),
      staleTime: 20_000,
    })),
  })
  const resources: Resource[] = getEndpoints.map((endpoint, index) => ({
    endpoint, rows: resourcesQuery[index]?.data?.rows ?? [], summary: resourcesQuery[index]?.data?.summary ?? null, pagination: resourcesQuery[index]?.data?.pagination,
  }))
  const busy = resourcesQuery.some(query => query.isLoading)
  const hasError = resourcesQuery.find(query => query.isError)?.error

  const operation = useMutation({
    mutationFn: async ({ endpoint, row, payload }: { endpoint: TenantFeatureEndpoint; row?: Row; payload?: Record<string, unknown> }) => {
      const path = resolvePath(endpoint.path, row)
      if (/\{[^}]+\}/.test(path) || path.includes("/undefined")) throw new Error(ar ? "تعذر تحديد السجل المطلوب." : "The target record could not be identified.")
      const response = await tenantApi.request({ method: endpoint.method, url: apiPath(path), data: payload })
      return response.data
    },
    onSuccess: async (data, variables) => {
      setFormError("")
      setSuccess(ar ? "تم تنفيذ العملية بنجاح." : "The operation completed successfully.")
      setConfirm(null)
      setSelectedOperation(null)
      if (feature.key === "configuration" && variables.endpoint.path.endsWith("/apply")) setPendingPreview(null)
      await client.invalidateQueries({ queryKey: ["tenant-domain", feature.key] })
      const result = unwrap(data) as { url?: string; downloadUrl?: string; exportUrl?: string; secret?: string; apiKey?: string; token?: string; credential?: string; credentials?: { apiKey?: string } } | undefined
      const url = result?.url ?? result?.downloadUrl ?? result?.exportUrl
      if (url && /download|export/i.test(variables.endpoint.purpose)) window.open(url, "_blank", "noopener,noreferrer")
      const issuedCredential = result?.secret ?? result?.apiKey ?? result?.token ?? result?.credential ?? result?.credentials?.apiKey
      if (issuedCredential && /connect|rotate|register/i.test(variables.endpoint.purpose)) setOneTimeCredential(issuedCredential)
    },
    onError: error => {
      setSuccess("")
      setFormError(error instanceof Error ? error.message : (ar ? "تعذر تنفيذ العملية." : "The operation could not be completed."))
    },
  })

  const fields = feature.fields ?? []
  const rootWriteEndpoints = writeEndpoints.filter(endpoint => !endpoint.path.includes("{") && ["POST", "PATCH", "PUT"].includes(endpoint.method) && !(feature.key === "configuration" && endpoint.path.endsWith("/apply")))
  function fieldsFor(endpoint: TenantFeatureEndpoint): TenantFeatureField[] {
    if (feature.key === "integrations" && endpoint.path.includes("/integrations")) {
      return [
        ...fields,
        ...(values.scope === "clinic" ? [{ name: "clinicId", label: "Clinic", type: "select" as const, required: true, options: clinics.map(clinic => ({ label: clinic.name, value: clinic._id })) }] : []),
      ]
    }
    if (feature.key === "clinic-workspace" && endpoint.path.endsWith("/settings")) return [
      { name: "timezone", label: "Timezone", type: "text", required: true },
      { name: "defaultLocale", label: "Default language", type: "select", required: true, options: [{ label: "English", value: "en" }, { label: "العربية", value: "ar" }] },
      { name: "defaultCurrency", label: "Default currency", type: "select", required: true, options: [{ label: "EGP", value: "EGP" }, { label: "SAR", value: "SAR" }, { label: "AED", value: "AED" }, { label: "USD", value: "USD" }] },
      { name: "cancellationWindowHours", label: "Cancellation notice (hours)", type: "number", required: true },
    ]
    if (feature.key === "users" && endpoint.path.includes("/memberships/")) return [
      { name: "role", label: "Organization role", type: "select", required: true, options: [{ label: "Tenant admin", value: "tenant_admin" }, { label: "Organization manager", value: "organization_manager" }, { label: "Clinic manager", value: "clinic_manager" }, { label: "Branch manager", value: "branch_manager" }, { label: "Read-only analyst", value: "read_only_analyst" }] },
      { name: "status", label: "Membership status", type: "select", required: true, options: [{ label: "Active", value: "active" }, { label: "Suspended", value: "suspended" }] },
    ]
    if (feature.key === "subscription" && endpoint.path.endsWith("/change-request")) return [
      { name: "requestedPlan", label: "Requested plan", type: "select", required: true, options: [{ label: "Starter", value: "starter" }, { label: "Growth", value: "growth" }, { label: "Enterprise", value: "enterprise" }] },
      { name: "billingCycle", label: "Billing cycle", type: "select", required: true, options: [{ label: "Monthly", value: "monthly" }, { label: "Yearly", value: "yearly" }] },
      { name: "reason", label: "Reason", type: "textarea" },
    ]
    if (feature.key === "integrations" && endpoint.path.endsWith("/webhooks")) return [
      { name: "name", label: "Webhook name", type: "text", required: true },
      { name: "url", label: "HTTPS endpoint URL", type: "url", required: true },
      { name: "events", label: "Subscribed events", type: "textarea", required: true },
    ]
    if (feature.key === "governance" && endpoint.path.endsWith("/exports")) return [
      { name: "from", label: "From date", type: "date" }, { name: "to", label: "To date", type: "date" },
      { name: "actorId", label: "Actor", type: "text" }, { name: "action", label: "Action", type: "text" },
      { name: "module", label: "Module", type: "text" },
    ]
    if (feature.key === "insights" && endpoint.path.endsWith("/exports")) return [
      { name: "from", label: "From date", type: "date" }, { name: "to", label: "To date", type: "date" },
      { name: "format", label: "Export format", type: "select", required: true, options: [{ label: "Excel", value: "xlsx" }, { label: "CSV", value: "csv" }, { label: "PDF", value: "pdf" }] },
    ]
    return fields
  }
  function columnsFor(rows: Row[]): DataTableColumn<Row>[] {
    const keys = Object.keys(rows[0] ?? {}).filter(key => !hidden.has(key) && !sensitive.test(key)).slice(0, 7)
    const preferred = ["name", "displayName", "email", "role", "status", "plan", "amount", "createdAt"]
    keys.sort((a, b) => {
      const ai = preferred.indexOf(a), bi = preferred.indexOf(b)
      return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi)
    })
    return keys.map(key => ({ id: key, header: humanize(key, ar), cell: row => <span className="block max-w-[240px] truncate text-sm" title={display(row[key], ar)}>{display(row[key], ar)}</span> }))
  }
  async function openDetails(endpoint: TenantFeatureEndpoint, row: Row) {
    try {
      const response = await tenantApi.get(apiPath(resolvePath(endpoint.path, row)))
      const data = unwrap(response.data)
      setDetails({ title: label(endpoint.purpose, ar), data })
    } catch (error) {
      setFormError(error instanceof Error ? error.message : (ar ? "تعذر تحميل التفاصيل." : "Unable to load details."))
    }
  }
  async function submitForm(event: FormEvent<HTMLFormElement>, endpoint: TenantFeatureEndpoint, row?: Row) {
    event.preventDefault()
    setFormError("")
    const activeFields = fieldsFor(endpoint)
    if (feature.key === "roles" && /permissions/i.test(endpoint.path)) {
      const permissions = permissionText.split(/[\n,]/).map(value => value.trim()).filter(Boolean)
      if (!permissions.length) { setFormError(ar ? "اختر صلاحية واحدة على الأقل." : "Select at least one permission."); return }
      await operation.mutateAsync({ endpoint, row, payload: { permissions } })
      return
    }
    if (feature.key === "users" && /scopes/i.test(endpoint.path)) {
      await operation.mutateAsync({ endpoint, row, payload: { clinicIds: selectedClinicIds, branchIds: selectedBranchIds } })
      return
    }
    const customPayload = (feature.key === "subscription" && endpoint.path.endsWith("/change-request")) ||
      (feature.key === "integrations" && endpoint.path.endsWith("/webhooks")) ||
      (feature.key === "governance" && endpoint.path.endsWith("/exports")) ||
      (feature.key === "insights" && endpoint.path.endsWith("/exports")) ||
      (feature.key === "users" && (endpoint.path.includes("/memberships/") || /scopes/i.test(endpoint.path)))
    if (feature.schemaKey && !customPayload) {
      const validation = validateTenantFeatureForm(feature.schemaKey as TenantFeatureSchemaKey, values)
      if (!validation.success) {
        const fieldErrors = getTenantFieldErrors(validation.error, ar ? "ar" : "en")
        setFormError(Object.values(fieldErrors)[0] ?? (ar ? "راجع البيانات المدخلة." : "Review the entered values."))
        return
      }
    }
    const missing = activeFields.find(field => field.required && !String(values[field.name] ?? "").trim())
    if (missing) { setFormError(ar ? "أكمل كل الحقول المطلوبة." : "Complete all required fields."); return }
    if (feature.key === "invitations" && values.scope === "clinic" && invitationClinicIds.length === 0) {
      setFormError(ar ? "اختر عيادة واحدة على الأقل." : "Select at least one clinic.")
      return
    }
    if (feature.key === "invitations" && values.scope === "branch" && invitationBranchIds.length === 0) {
      setFormError(ar ? "اختر فرعاً واحداً على الأقل." : "Select at least one branch.")
      return
    }
    const payload: Record<string, unknown> = Object.fromEntries(activeFields.filter(field => values[field.name] !== undefined && values[field.name] !== "").map(field => [
      field.name,
      field.type === "number" ? Number(values[field.name]) : ["true", "false"].includes(values[field.name]) ? values[field.name] === "true" : values[field.name],
    ]))
    if (feature.key === "invitations") {
      if (values.scope === "clinic") payload.clinicIds = invitationClinicIds
      if (values.scope === "branch") payload.branchIds = invitationBranchIds
    }
    if (feature.key === "integrations" && endpoint.path.includes("/integrations")) {
      const apiKey = payload.apiKey
      delete payload.apiKey
      if (apiKey) payload.credentials = { apiKey }
      if (values.scope !== "clinic") delete payload.clinicId
    }
    const result = await operation.mutateAsync({ endpoint, row, payload })
    if (feature.key === "invitations") {
      setInvitationClinicIds([])
      setInvitationBranchIds([])
    }
    if (feature.key === "configuration" && endpoint.path.endsWith("/preview-apply")) {
      const preview = unwrap(result)
      setPendingPreview({ payload, preview: preview && typeof preview === "object" ? preview as Record<string, unknown> : {} })
    }
    setValues({})
    setPermissionText("")
  }

  const readActions = feature.endpoints.filter(endpoint => endpoint.method === "GET" && endpoint.path.includes("{"))
  const rowActions = writeEndpoints.filter(endpoint => endpoint.path.includes("{"))
  const permissionRows = resources.find(resource => resource.endpoint.path.endsWith("/permissions"))?.rows ?? []
  const selectedPermissions = permissionText.split(",").map(value => value.trim()).filter(Boolean)

  return (
    <div className="space-y-6">
      <TenantPageHeading eyebrow={feature.eyebrow[ar ? "ar" : "en"]} title={feature.title[ar ? "ar" : "en"]} description={feature.description[ar ? "ar" : "en"]} />
      {oneTimeCredential && <Card className="border-amber-300 bg-amber-50/50"><CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-end"><div className="min-w-0 flex-1"><p className="text-sm font-semibold">{ar ? "بيانات اتصال جديدة — احفظها الآن" : "New connection credential — save it now"}</p><p className="mt-1 text-xs text-muted-foreground">{ar ? "لن يتم عرض هذه القيمة مرة أخرى بعد إغلاق هذا التنبيه." : "This value will not be shown again after dismissing this notice."}</p><Input type="password" readOnly value={oneTimeCredential} className="mt-2 font-mono"/></div><Button type="button" variant="outline" onClick={() => { void navigator.clipboard?.writeText(oneTimeCredential) }}><Copy className="me-2 size-4"/>{ar ? "نسخ" : "Copy"}</Button><Button type="button" variant="ghost" onClick={() => setOneTimeCredential("")}>{ar ? "إغلاق" : "Dismiss"}</Button></CardContent></Card>}
      {(formError || success) && <div role={formError ? "alert" : "status"} className={formError ? "rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive" : "rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"}>{formError || success}</div>}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm"><Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/><Input value={search} onChange={event => { setSearch(event.target.value); setPage(1) }} placeholder={ar ? "ابحث في البيانات..." : "Search workspace data..."} className="ps-9"/></div>
          <Button variant="outline" onClick={() => void client.invalidateQueries({ queryKey: ["tenant-domain", feature.key] })} disabled={busy}><RefreshCw className={`me-2 size-4 ${busy ? "animate-spin" : ""}`}/>{ar ? "تحديث البيانات" : "Refresh data"}</Button>
        </div>
        {(feature.key === "governance" || feature.key === "finance") && <div className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-2 xl:grid-cols-4">
          <div><Label>{ar ? "من تاريخ" : "From date"}</Label><Input type="date" value={dateFrom} onChange={event => { setDateFrom(event.target.value); setPage(1) }} className="mt-2"/></div>
          <div><Label>{ar ? "إلى تاريخ" : "To date"}</Label><Input type="date" value={dateTo} onChange={event => { setDateTo(event.target.value); setPage(1) }} className="mt-2"/></div>
          {feature.key === "governance" && <>
            <div><Label>{ar ? "المنفذ" : "Actor"}</Label><Input value={actorFilter} onChange={event => { setActorFilter(event.target.value); setPage(1) }} className="mt-2"/></div>
            <div><Label>{ar ? "الوحدة" : "Module"}</Label><Input value={moduleFilter} onChange={event => { setModuleFilter(event.target.value); setPage(1) }} className="mt-2"/></div>
          </>}
          {dateFrom && dateTo && dateFrom > dateTo && <p role="alert" className="text-xs text-destructive sm:col-span-2 xl:col-span-4">{ar ? "يجب أن يكون تاريخ البداية قبل تاريخ النهاية." : "The start date must be on or before the end date."}</p>}
        </div>}
      </div>
      {feature.key === "clinic-workspace" && !clinicId && <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">{ar ? "اختر عيادة من محدد السياق بالأعلى لعرض مساحة إدارتها." : "Choose a clinic from the context selector above to open its management workspace."}</CardContent></Card>}
      {hasError && <p role="alert" className="text-sm text-destructive">{hasError instanceof Error ? hasError.message : (ar ? "تعذر تحميل بعض البيانات." : "Some data could not be loaded.")}</p>}
      {resources.map((resource, index) => {
        const rows = resource.rows
        const matchingReadActions = readActions.filter(endpoint => endpoint.path.startsWith(resource.endpoint.path + "/"))
        const matchingRowActions = rowActions.filter(endpoint => endpoint.path.startsWith(resource.endpoint.path + "/"))
        const isSummary = /summary|subscription|configuration|preferences/.test(resource.endpoint.path)
        const summaryEntries = Object.entries(resource.summary ?? {}).filter(([key, value]) => !hidden.has(key) && !sensitive.test(key) && value !== null && typeof value !== "object").slice(0, 12)
        return (
          <Card key={resource.endpoint.path}>
            <CardContent className="p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div><h2 className="font-semibold">{label(resource.endpoint.purpose, ar)}</h2><p className="mt-1 text-xs text-muted-foreground">{ar ? `${rows.length} سجل` : `${rows.length} records`}</p></div>
                {isSummary && <Activity className="size-5 text-muted-foreground"/>}
              </div>
              {isSummary && summaryEntries.length > 0 && <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{summaryEntries.map(([key, value]) => <div key={key} className="rounded-xl border bg-muted/20 p-3"><p className="text-xs text-muted-foreground">{humanize(key, ar)}</p><p className="mt-1 break-words text-lg font-semibold">{display(value, ar)}</p></div>)}</div>}
              {rows.length > 0 ? <DataTable
                columns={columnsFor(rows)}
                data={rows}
                getRowId={row => rowId(row) || JSON.stringify(row)}
                isLoading={resourcesQuery[index]?.isLoading}
                loadingLabel={ar ? "جارٍ التحميل..." : "Loading..."}
                emptyState={<p className="py-8 text-center text-sm text-muted-foreground">{ar ? "لا توجد بيانات." : "No data available."}</p>}
                pagination={resource.pagination?.total !== undefined ? {
                  page: resource.pagination.page ?? page,
                  perPage: resource.pagination.per_page ?? perPage,
                  total: resource.pagination.total,
                  totalKnown: true,
                  hasNext: resource.pagination.total_pages !== undefined
                    ? (resource.pagination.page ?? page) < resource.pagination.total_pages
                    : (resource.pagination.page ?? page) * (resource.pagination.per_page ?? perPage) < resource.pagination.total,
                } : undefined}
                onPageChange={setPage}
                onPerPageChange={size => { setPerPage(size); setPage(1) }}
              /> : !isSummary && !resourcesQuery[index]?.isLoading ? <p className="rounded-xl border border-dashed py-8 text-center text-sm text-muted-foreground">{ar ? "لا توجد سجلات حالياً." : "No records yet."}</p> : null}
              {matchingReadActions.length > 0 && rows.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{rows.slice(0, 8).flatMap(row => matchingReadActions.map(endpoint => <Button key={endpoint.path + rowId(row)} size="sm" variant="outline" onClick={() => {
                if (/download/i.test(endpoint.purpose)) {
                  void tenantApi.get(apiPath(resolvePath(endpoint.path, row))).then(response => {
                    const result = unwrap(response.data) as { url?: string; downloadUrl?: string }
                    const url = result?.url ?? result?.downloadUrl
                    if (url) window.open(url, "_blank", "noopener,noreferrer")
                    else setFormError(ar ? "رابط التنزيل غير متاح." : "The download link is unavailable.")
                  }).catch(error => setFormError(error instanceof Error ? error.message : (ar ? "تعذر التنزيل." : "Unable to download.")))
                } else void openDetails(endpoint, row)
              }}><Eye className="me-2 size-3.5"/>{/download/i.test(endpoint.purpose) ? (ar ? "تنزيل" : "Download") : (ar ? "تفاصيل" : "Details")} · {String(row.name ?? row.email ?? rowId(row)).slice(0, 20)}</Button>))}</div>}
              {matchingRowActions.length > 0 && rows.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{rows.slice(0, 12).flatMap(row => matchingRowActions.map(endpoint => <Button key={endpoint.path + rowId(row)} size="sm" variant={endpoint.method === "DELETE" || /revoke|disconnect/i.test(endpoint.purpose) ? "destructive" : "outline"} disabled={!rowId(row) && !row.membershipId && !row.userId || operation.isPending} onClick={() => {
                if (endpoint.method === "PATCH" || endpoint.method === "PUT" || (endpoint.method === "POST" && endpoint.path.endsWith("/exports"))) {
                  setSelectedOperation({ endpoint, row })
                  setValues(Object.fromEntries(Object.entries(row).filter(([key, value]) => typeof value === "string" || typeof value === "number").map(([key, value]) => [key, String(value)])))
                  setPermissionText(Array.isArray(row.permissions) ? row.permissions.map(String).join(", ") : "")
                  setSelectedClinicIds(Array.isArray(row.clinicIds ?? row.clinic_ids) ? ((row.clinicIds ?? row.clinic_ids) as unknown[]).map(String) : [])
                  setSelectedBranchIds(Array.isArray(row.branchIds ?? row.branch_ids) ? ((row.branchIds ?? row.branch_ids) as unknown[]).map(String) : [])
                } else if (endpoint.method === "DELETE" || /revoke|disconnect/i.test(endpoint.purpose)) setConfirm({ endpoint, row })
                else {
                  const payload = /membership status/i.test(endpoint.purpose) ? { status: String(row.status ?? "").toLowerCase() === "active" ? "suspended" : "active" } : undefined
                  void operation.mutateAsync({ endpoint, row, payload })
                }
              }}>{operation.isPending ? <LoaderCircle className="me-2 size-3.5 animate-spin"/> : /resend/i.test(endpoint.purpose) ? <Send className="me-2 size-3.5"/> : /rotate/i.test(endpoint.purpose) ? <RotateCw className="me-2 size-3.5"/> : endpoint.method === "DELETE" ? <Trash2 className="me-2 size-3.5"/> : <ShieldCheck className="me-2 size-3.5"/>}{operationLabel(endpoint, ar)} · {String(row.name ?? row.email ?? rowId(row)).slice(0, 18)}</Button>))}</div>}
            </CardContent>
          </Card>
        )
      })}
      {rootWriteEndpoints.map(endpoint => {
        const activeFields = fieldsFor(endpoint)
        return <Card key={endpoint.path}><CardContent className="p-5">
          <div className="mb-4 flex items-center gap-2"><Plus className="size-5 text-primary"/><h2 className="font-semibold">{operationLabel(endpoint, ar)} · {feature.title[ar ? "ar" : "en"]}</h2></div>
          <form onSubmit={event => void submitForm(event, endpoint)} className="grid gap-4 sm:grid-cols-2">
            {activeFields.map(field => <div key={field.name} className={field.type === "textarea" ? "sm:col-span-2" : ""}>
              <Label htmlFor={`tenant-op-${feature.key}-${endpoint.path}-${field.name}`}>{ar ? ({
                email: "البريد الإلكتروني", role: "الدور", scope: "نطاق الوصول", expiresAt: "تاريخ الانتهاء", name: "الاسم",
                description: "الوصف", defaultLocale: "اللغة الافتراضية", defaultCurrency: "العملة الافتراضية",
                cancellationWindowHours: "مهلة الإلغاء بالساعات", category: "التصنيف", durationMinutes: "المدة بالدقائق",
                bufferMinutes: "الفاصل بالدقائق", billingName: "الاسم القانوني للفوترة", billingEmail: "بريد الفوترة",
                taxNumber: "الرقم الضريبي", provider: "مزود الخدمة", locale: "اللغة", currency: "العملة", timezone: "المنطقة الزمنية",
                apiKey: "مفتاح API (اختياري)", clinicId: "العيادة",
                emailEnabled: "إشعارات البريد الإلكتروني", inAppEnabled: "إشعارات داخل التطبيق", securityAlerts: "تنبيهات الأمان",
                billingAlerts: "تنبيهات الفوترة", membershipAlerts: "تنبيهات العضويات", requestedPlan: "الخطة المطلوبة",
                billingCycle: "دورة الفوترة", reason: "سبب الطلب", url: "رابط HTTPS", events: "الأحداث المشترك بها",
                from: "من تاريخ", to: "إلى تاريخ", actorId: "المنفذ", action: "الإجراء", module: "الوحدة",
              } as Record<string, string>)[field.name] ?? field.label : field.label}{field.required ? " *" : ""}</Label>
              {field.type === "select" ? <Select value={values[field.name] ?? ""} onValueChange={value => setValues(current => ({ ...current, [field.name]: value }))}><SelectTrigger id={`tenant-op-${feature.key}-${field.name}`}><SelectValue placeholder={ar ? "اختر..." : "Select..."}/></SelectTrigger><SelectContent>{field.options?.map(option => <SelectItem key={option.value} value={option.value}>{ar ? ({
                tenant_admin: "مسؤول المؤسسة", organization_manager: "مدير المؤسسة", read_only_analyst: "محلل للقراءة فقط",
                clinic_manager: "مدير عيادة", branch_manager: "مدير فرع", tenant: "المؤسسة بالكامل", clinic: "عيادات محددة", branch: "فروع محددة",
                en: "الإنجليزية", ar: "العربية", EGP: "جنيه مصري", SAR: "ريال سعودي", AED: "درهم إماراتي", USD: "دولار أمريكي",
                whatsapp: "واتساب", sms: "رسائل SMS", email: "البريد الإلكتروني", calendar: "التقويم", payment: "الدفع",
                true: "مفعل", false: "معطل", starter: "المبتدئة", growth: "النمو", enterprise: "المؤسسات", monthly: "شهري", yearly: "سنوي",
                aesthetic: "طب تجميلي", dermatology: "جلدية", beauty_center: "مركز تجميل", xlsx: "Excel", csv: "CSV", pdf: "PDF",
              } as Record<string, string>)[option.value] ?? option.label : option.label}</SelectItem>)}</SelectContent></Select>
              : field.type === "textarea" ? <Textarea id={`tenant-op-${feature.key}-${field.name}`} value={values[field.name] ?? ""} onChange={event => setValues(current => ({ ...current, [field.name]: event.target.value }))}/>
              : <Input id={`tenant-op-${feature.key}-${field.name}`} type={field.type ?? "text"} value={values[field.name] ?? ""} onChange={event => setValues(current => ({ ...current, [field.name]: event.target.value }))}/>}
            </div>)}
            {feature.key === "invitations" && values.scope === "clinic" && <div className="sm:col-span-2"><Label>{ar ? "العيادات المسموح بها" : "Allowed clinics"}</Label><div className="mt-2 grid gap-2 rounded-xl border p-3 sm:grid-cols-2">{clinics.map(clinic => <label key={clinic._id} className="flex items-center gap-2 text-sm"><Checkbox checked={invitationClinicIds.includes(clinic._id)} onChange={event => setInvitationClinicIds(current => event.target.checked ? [...new Set([...current, clinic._id])] : current.filter(id => id !== clinic._id))}/>{clinic.name}</label>)}</div></div>}
            {feature.key === "invitations" && values.scope === "branch" && <div className="sm:col-span-2"><Label>{ar ? "الفروع المسموح بها" : "Allowed branches"}</Label><div className="mt-2 grid gap-2 rounded-xl border p-3 sm:grid-cols-2">{branches.map(branch => <label key={branch._id} className="flex items-center gap-2 text-sm"><Checkbox checked={invitationBranchIds.includes(branch._id)} onChange={event => setInvitationBranchIds(current => event.target.checked ? [...new Set([...current, branch._id])] : current.filter(id => id !== branch._id))}/>{branch.name}</label>)}</div></div>}
            <div className="flex flex-wrap items-center gap-2 sm:col-span-2"><Button type="submit" disabled={operation.isPending}>{operation.isPending ? <LoaderCircle className="me-2 size-4 animate-spin"/> : <Check className="me-2 size-4"/>}{operationLabel(endpoint, ar)}</Button><Button type="button" variant="outline" onClick={() => setValues({})}>{ar ? "مسح الحقول" : "Clear fields"}</Button></div>
          </form>
        </CardContent></Card>
      })}
      {feature.key === "configuration" && pendingPreview && (() => {
        const applyEndpoint = writeEndpoints.find(endpoint => endpoint.method === "POST" && endpoint.path.endsWith("/apply"))
        const previewEntries = Object.entries(pendingPreview.preview).filter(([key, value]) => !sensitive.test(key) && value !== null && typeof value !== "object")
        return <Card><CardContent className="p-5">
          <div className="mb-4"><h2 className="font-semibold">{ar ? "مراجعة التغييرات قبل التطبيق" : "Review changes before applying"}</h2><p className="mt-1 text-sm text-muted-foreground">{ar ? "تم إنشاء معاينة للتغييرات. راجع النطاق والتأثير قبل اعتمادها." : "A change preview is ready. Review its scope and impact before confirming."}</p></div>
          {previewEntries.length > 0 && <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{previewEntries.map(([key, value]) => <div key={key} className="rounded-xl border p-3"><p className="text-xs text-muted-foreground">{humanize(key, ar)}</p><p className="mt-1 font-semibold">{display(value, ar)}</p></div>)}</div>}
          <Button disabled={!applyEndpoint || operation.isPending} onClick={() => { if (applyEndpoint) void operation.mutateAsync({ endpoint: applyEndpoint, payload: pendingPreview.payload }) }}>{operation.isPending ? <LoaderCircle className="me-2 size-4 animate-spin"/> : <Check className="me-2 size-4"/>}{ar ? "اعتماد وتطبيق التغييرات" : "Confirm and apply changes"}</Button>
        </CardContent></Card>
      })()}
      {selectedOperation && <Card><CardContent className="p-5">
        <div className="mb-4 flex items-center justify-between gap-3"><div><h2 className="font-semibold">{operationLabel(selectedOperation.endpoint, ar)}</h2><p className="mt-1 text-xs text-muted-foreground">{String(selectedOperation.row.name ?? selectedOperation.row.email ?? rowId(selectedOperation.row))}</p></div><Button variant="ghost" size="sm" onClick={() => setSelectedOperation(null)}><XCircle className="me-2 size-4"/>{ar ? "إغلاق" : "Close"}</Button></div>
        <form onSubmit={event => void submitForm(event, selectedOperation.endpoint, selectedOperation.row)} className="grid gap-4 sm:grid-cols-2">
          {feature.key === "roles" && /permissions/i.test(selectedOperation.endpoint.path) ? <div className="sm:col-span-2"><Label>{ar ? "صلاحيات الدور" : "Role permissions"}</Label>{permissionRows.length ? <div className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{permissionRows.map(permission => {
              const code = String(permission.key ?? permission.code ?? permission.name ?? permission.id ?? permission._id ?? "")
              const title = String(permission.label ?? permission.name ?? permission.description ?? code)
              return code ? <label key={code} className="flex items-start gap-2 rounded-lg border p-3 text-sm"><Checkbox checked={selectedPermissions.includes(code)} onChange={event => setPermissionText(current => {
                const selected = current.split(",").map(value => value.trim()).filter(Boolean)
                const next = event.target.checked ? [...new Set([...selected, code])] : selected.filter(value => value !== code)
                return next.join(", ")
              })}/><span><span className="font-medium">{title}</span>{title !== code && <span className="mt-1 block text-xs text-muted-foreground">{code}</span>}</span></label> : null
            })}</div> : <Textarea value={permissionText} onChange={event => setPermissionText(event.target.value)} rows={4} placeholder={ar ? "أدخل معرفات الصلاحيات مفصولة بفواصل" : "Enter permission keys separated by commas"}/>}</div> :
            feature.key === "users" && /scopes/i.test(selectedOperation.endpoint.path) ? <>
              <div><Label>{ar ? "العيادات المسموح بها" : "Allowed clinics"}</Label><div className="mt-2 space-y-2 rounded-xl border p-3">{clinics.map(clinic => <label key={clinic._id} className="flex items-center gap-2 text-sm"><Checkbox checked={selectedClinicIds.includes(clinic._id)} onChange={event => setSelectedClinicIds(current => event.target.checked ? [...new Set([...current, clinic._id])] : current.filter(id => id !== clinic._id))}/>{clinic.name}</label>)}</div></div>
              <div><Label>{ar ? "الفروع المسموح بها" : "Allowed branches"}</Label><div className="mt-2 space-y-2 rounded-xl border p-3">{branches.map(branch => <label key={branch._id} className="flex items-center gap-2 text-sm"><Checkbox checked={selectedBranchIds.includes(branch._id)} onChange={event => setSelectedBranchIds(current => event.target.checked ? [...new Set([...current, branch._id])] : current.filter(id => id !== branch._id))}/>{branch.name}</label>)}</div></div>
            </> : fieldsFor(selectedOperation.endpoint).map(field => <div key={field.name}><Label>{ar ? ({ name: "الاسم", description: "الوصف", scope: "نطاق الوصول", from: "من تاريخ", to: "إلى تاريخ", format: "صيغة التصدير" } as Record<string, string>)[field.name] ?? field.label : field.label}</Label>{field.type === "select" ? <Select value={values[field.name] ?? ""} onValueChange={value => setValues(current => ({ ...current, [field.name]: value }))}><SelectTrigger><SelectValue placeholder={ar ? "اختر..." : "Select..."}/></SelectTrigger><SelectContent>{field.options?.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select> : <Input type={field.type ?? "text"} value={values[field.name] ?? ""} onChange={event => setValues(current => ({ ...current, [field.name]: event.target.value }))}/>}</div>)}
          <div className="sm:col-span-2"><Button type="submit" disabled={operation.isPending}>{operation.isPending ? <LoaderCircle className="me-2 size-4 animate-spin"/> : <Check className="me-2 size-4"/>}{ar ? "حفظ التغييرات" : "Save changes"}</Button></div>
        </form>
      </CardContent></Card>}
      {details && <Card><CardContent className="p-5"><div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">{details.title}</h2><Button size="sm" variant="ghost" onClick={() => setDetails(null)}><XCircle className="me-2 size-4"/>{ar ? "إغلاق" : "Close"}</Button></div><div className="grid gap-3 sm:grid-cols-2">{Object.entries(details.data && typeof details.data === "object" ? details.data as Record<string, unknown> : { value: details.data }).filter(([key]) => !sensitive.test(key) && !hidden.has(key)).map(([key, value]) => <div key={key} className="rounded-xl border p-3"><p className="text-xs text-muted-foreground">{humanize(key, ar)}</p><p className="mt-1 break-words text-sm font-medium">{display(value, ar)}</p></div>)}</div></CardContent></Card>}
      <ConfirmDialog open={Boolean(confirm)} title={confirm ? operationLabel(confirm.endpoint, ar) : ""} description={ar ? "هل أنت متأكد من تنفيذ هذا الإجراء؟ قد يؤثر على وصول المستخدم أو اتصال الخدمة." : "Are you sure you want to perform this action? It may affect user access or a connected service."} confirmLabel={confirm ? operationLabel(confirm.endpoint, ar) : (ar ? "تأكيد" : "Confirm")} destructive isLoading={operation.isPending} onOpenChange={open => { if (!open) setConfirm(null) }} onConfirm={() => { if (confirm) void operation.mutateAsync({ endpoint: confirm.endpoint, row: confirm.row }) }}/>
    </div>
  )
}
