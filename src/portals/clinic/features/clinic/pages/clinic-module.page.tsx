import { useMemo, useState, type FormEvent } from "react"
import { useLocation, Link } from "react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AlertCircle, Database, Eye, Pencil, Plus, RefreshCw, Search, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { pushToast } from "@/store"
import { useI18n } from "@/i18n/i18n-provider"
import { isArabicText, isEnglishText } from "@/shared/validation/language-validation"
import {
  createClinicModuleRecord,
  deleteClinicModuleRecord,
  fetchClinicModuleRecords,
  getClinicModuleConfig,
  getClinicModuleFields,
  updateClinicModuleRecord,
  type ClinicModuleField,
  type ClinicModuleKey,
  type ClinicRecord,
} from "../api/clinic-module.api"

const PAGE_SIZE = 10
const internalFields = new Set(["id", "_id", "tenantId", "tenant_id", "clinicId", "clinic_id", "branchId", "branch_id"])
function titleCase(value: string) {
  return value.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[_-]/g, " ").replace(/^./, (letter) => letter.toUpperCase())
}
function valueText(value: unknown) {
  if (value === null || value === undefined || value === "") return "—"
  if (typeof value === "boolean") return value ? "Yes" : "No"
  if (Array.isArray(value)) return value.map((item) => typeof item === "object" ? JSON.stringify(item) : String(item)).join(", ")
  if (typeof value === "object") return JSON.stringify(value)
  return String(value)
}
function rowId(record: ClinicRecord) {
  const id = record.id ?? record._id ?? record.uuid ?? record.code
  return typeof id === "string" || typeof id === "number" ? String(id) : JSON.stringify(record)
}

export function ClinicModulePage() {
  const slug = useLocation().pathname.split("/").filter(Boolean).at(-1) ?? "patients"
  const key = slug as ClinicModuleKey
  const config = getClinicModuleConfig(key)
  const fields = getClinicModuleFields(key)
  const { t, locale } = useI18n()
  const ar = locale === "ar"
  const moduleText = t.clinic.modules[slug as keyof typeof t.clinic.modules] ?? t.clinic.modules.patients
  const ui = t.clinic.ui
  const dispatch = useAppDispatch()
  const branchId = useAppSelector((state) => state.ui.currentBranchId)
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(PAGE_SIZE)
  const [formOpen, setFormOpen] = useState(false)
  const [viewRecord, setViewRecord] = useState<ClinicRecord | null>(null)
  const [editing, setEditing] = useState<ClinicRecord | null>(null)
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState("")

  const recordsQuery = useQuery({
    queryKey: ["clinic-module", key, branchId],
    queryFn: () => fetchClinicModuleRecords(key),
    enabled: Boolean(config),
    staleTime: 30_000,
  })
  const createMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => createClinicModuleRecord(key, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["clinic-module", key] })
      setFormOpen(false)
      dispatch(pushToast({ id: crypto.randomUUID(), kind: "success", title: ar ? "تم إنشاء السجل" : "Record created" }))
    },
  })
  const updateMutation = useMutation({
    mutationFn: ({ id, payload, recordType }: { id: string; payload: Record<string, unknown>; recordType?: string }) => updateClinicModuleRecord(key, id, payload, recordType),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["clinic-module", key] })
      setFormOpen(false)
      dispatch(pushToast({ id: crypto.randomUUID(), kind: "success", title: ar ? "تم حفظ التعديلات" : "Changes saved" }))
    },
  })
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteClinicModuleRecord(key, id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["clinic-module", key] })
      dispatch(pushToast({ id: crypto.randomUUID(), kind: "success", title: ar ? "تم حذف السجل" : "Record deleted" }))
    },
  })

  const allRecords = recordsQuery.data ?? []
  const statuses = useMemo(() => Array.from(new Set(allRecords.map((record) => String(record.status ?? "")).filter(Boolean))).sort(), [allRecords])
  const filtered = useMemo(() => allRecords.filter((record) => {
    const matchesSearch = !search.trim() || Object.values(record).map(valueText).join(" ").toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())
    const matchesStatus = statusFilter === "all" || String(record.status ?? "") === statusFilter
    return matchesSearch && matchesStatus
  }), [allRecords, search, statusFilter])
  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage))
  const pageRows = useMemo(() => filtered.slice((page - 1) * perPage, page * perPage), [filtered, page, perPage])
  const columns = useMemo<DataTableColumn<ClinicRecord>[]>(() => {
    const sample = allRecords[0]
    if (!sample) return []
    const preferred = ["name", "firstName", "title", "email", "status", "scheduledAt", "createdAt"]
    const keys = Object.keys(sample).filter((field) => !internalFields.has(field) && typeof sample[field] !== "object").slice(0, 6)
    keys.sort((a, b) => {
      const ai = preferred.indexOf(a)
      const bi = preferred.indexOf(b)
      return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi)
    })
    const dataColumns: DataTableColumn<ClinicRecord>[] = keys.map((field) => ({
      id: field,
      header: titleCase(field),
      cell: (record: ClinicRecord) => <span className="block max-w-[260px] truncate text-sm" title={valueText(record[field])}>{valueText(record[field])}</span>,
    }))
    dataColumns.push({
      id: "actions",
      header: ar ? "الإجراءات" : "Actions",
      cell: (record: ClinicRecord) => (
        <div className="flex items-center justify-end gap-1">
          <Button size="icon" variant="ghost" onClick={() => setViewRecord(record)} aria-label={ar ? "عرض" : "View"}><Eye className="size-4"/></Button>
          {config?.update && <Button size="icon" variant="ghost" onClick={() => openEdit(record)} aria-label={ar ? "تعديل" : "Edit"}><Pencil className="size-4"/></Button>}
          {config?.remove && <Button size="icon" variant="ghost" disabled={deleteMutation.isPending} onClick={() => void removeRecord(record)} aria-label={ar ? "حذف" : "Delete"}><Trash2 className="size-4 text-destructive"/></Button>}
        </div>
      ),
      cellClassName: "text-end",
    })
    return dataColumns
  }, [allRecords, ar, config, deleteMutation.isPending])

  function openCreate() {
    setEditing(null)
    setFormValues(key === "team" ? { recordType: "employee" } : {})
    setFormError("")
    setFormOpen(true)
  }
  function openEdit(record: ClinicRecord) {
    setEditing(record)
    const values: Record<string, string> = {}
    fields.forEach((field) => {
      const value = record[field.name]
      values[field.name] = value === null || value === undefined ? "" : String(value)
    })
    if (key === "team") values.recordType = record.recordType ?? "employee"
    setFormValues(values)
    setFormError("")
    setFormOpen(true)
  }
  async function removeRecord(record: ClinicRecord) {
    const id = rowId(record, 0)
    try {
      await deleteMutation.mutateAsync(id)
    } catch (error) {
      dispatch(pushToast({ id: crypto.randomUUID(), kind: "error", title: ar ? "تعذر حذف السجل" : "Unable to delete record", description: error instanceof Error ? error.message : undefined }))
    }
  }
  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const missing = fields.find((field) => field.required && !formValues[field.name]?.trim())
    if (missing) {
      setFormError((ar ? "الحقل مطلوب: " : "Required field: ") + fieldLabel(missing))
      return
    }
    const neutral = /email|phone|date|time|price|currency|duration|minutes|number|count|session|gender|language|validity|amount|invoice|id|code|url|timezone/i
    const invalid = fields.find((field) => {
      const value = formValues[field.name]?.trim()
      if (!value || field.type && field.type !== "text" && field.type !== "textarea" || neutral.test(field.name)) return false
      return ar ? !isArabicText(value) : !isEnglishText(value)
    })
    if (invalid) {
      setFormError(ar ? "استخدم الحروف العربية في الحقول النصية عند اختيار العربية." : "Use English letters in text fields when English is selected.")
      return
    }
    const payload = Object.fromEntries(fields.filter((field) => formValues[field.name] !== "").map((field) => [
      field.name,
      field.type === "number" ? Number(formValues[field.name]) : formValues[field.name],
    ]))
    try {
      if (editing) await updateMutation.mutateAsync({ id: rowId(editing, 0), payload, recordType: editing.recordType })
      else await createMutation.mutateAsync(payload)
    } catch (error) {
      setFormError(error instanceof Error ? error.message : (ar ? "تعذر حفظ البيانات" : "Unable to save record"))
    }
  }
  function fieldLabel(field: ClinicModuleField) {
    const arabic: Record<string, string> = {
      firstName: "الاسم الأول", lastName: "اسم العائلة", patientId: "معرف المريض", providerId: "معرف مقدم الخدمة",
      serviceId: "معرف الخدمة", branchId: "معرف الفرع", scheduledAt: "موعد الحجز", notes: "ملاحظات",
      name: "الاسم", categoryId: "معرف التصنيف", durationMinutes: "المدة بالدقائق", price: "السعر",
      currency: "العملة", description: "الوصف", validityDays: "مدة الصلاحية بالأيام", email: "البريد الإلكتروني",
      phone: "الهاتف", dateOfBirth: "تاريخ الميلاد", gender: "النوع", code: "الكود", slug: "المعرف المختصر",
      address: "العنوان", timezone: "المنطقة الزمنية", recordType: "نوع السجل", jobTitle: "المسمى الوظيفي",
    }
    return ar ? arabic[field.name] ?? field.label : field.label
  }
  const isSaving = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground"><span>{ui.breadcrumbClinic}</span><span>/</span><span>{ui.workspace}</span><span>/</span><span className="text-foreground">{moduleText.title}</span></div>
          <h1 className="text-2xl font-bold tracking-tight">{moduleText.title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{moduleText.description}</p>
        </div>
        {config?.create && <Button onClick={openCreate}><Plus className="me-2 size-4"/>{moduleText.add}</Button>}
      </header>

      {!config ? (
        <Card><CardContent className="p-8 text-center"><Database className="mx-auto size-9 text-muted-foreground"/><h2 className="mt-3 font-semibold">{ar ? "مسار API غير محدد لهذه الصفحة" : "No collection API contract for this page"}</h2><p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{key === "clinical-records" ? (ar ? "افتح سجل المريض من صفحة المرضى؛ السجلات الطبية مرتبطة بمريض محدد ولا يتم عرضها كقائمة عامة." : "Open a patient's chart from Patient Management. Clinical records are patient-scoped and are not exposed as an unscoped directory.") : (ar ? "لم يتم تعريف endpoint لهذه الوحدة في بطاقات Frontend الحالية. لن أعرض بيانات تجريبية أو أرسل طلباً لمسار غير متفق عليه." : "The current Frontend Trello cards do not define an endpoint for this module. No demo data or guessed API requests are used.")}</p>{key === "clinical-records" && <Link to="/clinic/patients" className="mt-4 inline-flex text-sm font-semibold text-primary">{ar ? "الانتقال إلى المرضى" : "Go to patients"}</Link>}</CardContent></Card>
      ) : (
        <>
          {formOpen && <Card className="border-primary/20"><CardContent className="p-5 sm:p-6"><div className="mb-5 flex items-center justify-between"><div><h2 className="font-semibold">{editing ? (ar ? "تعديل السجل" : "Edit record") : moduleText.add}</h2><p className="mt-1 text-xs text-muted-foreground">{ar ? "سيتم حفظ البيانات في نطاق العيادة الحالي." : "Changes are saved within the active clinic scope."}</p></div><Button variant="ghost" onClick={() => setFormOpen(false)}>{ar ? "إغلاق" : "Close"}</Button></div><form onSubmit={submitForm} noValidate className="grid gap-4 sm:grid-cols-2">{fields.map((field) => <div key={field.name} className={field.type === "textarea" ? "sm:col-span-2" : ""}><Label htmlFor={"clinic-module-" + field.name}>{fieldLabel(field)}{field.required && <span className="ms-1 text-destructive">*</span>}</Label>{field.name === "recordType" ? <Select value={formValues[field.name] ?? "employee"} onValueChange={(value) => setFormValues((current) => ({ ...current, [field.name]: value }))}><SelectTrigger id={"clinic-module-" + field.name}><SelectValue/></SelectTrigger><SelectContent><SelectItem value="employee">{ar ? "موظف" : "Employee"}</SelectItem><SelectItem value="provider">{ar ? "مقدم خدمة" : "Provider"}</SelectItem></SelectContent></Select> : field.type === "textarea" ? <Textarea id={"clinic-module-" + field.name} value={formValues[field.name] ?? ""} onChange={(event) => setFormValues((current) => ({ ...current, [field.name]: event.target.value }))}/> : <Input id={"clinic-module-" + field.name} type={field.type ?? "text"} value={formValues[field.name] ?? ""} required={field.required} onChange={(event) => setFormValues((current) => ({ ...current, [field.name]: event.target.value }))}/>}</div>)}{formError && <p role="alert" className="rounded-lg bg-destructive/5 px-3 py-2 text-sm text-destructive sm:col-span-2">{formError}</p>}<div className="flex gap-2 sm:col-span-2"><Button type="submit" loading={isSaving} disabled={isSaving}>{ar ? "حفظ" : "Save"}</Button><Button type="button" variant="outline" onClick={() => setFormOpen(false)} disabled={isSaving}>{ar ? "إلغاء" : "Cancel"}</Button></div></form></CardContent></Card>}

          <section className="overflow-hidden rounded-2xl border bg-card">
            <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-semibold">{moduleText.list}</h2><p className="mt-1 text-xs text-muted-foreground">{filtered.length} {ui.records}</p></div><div className="flex flex-col gap-2 sm:flex-row"><div className="relative"><Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/><Input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder={ui.searchPlaceholder} className="ps-9 sm:w-64"/></div><Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setPage(1) }}><SelectTrigger aria-label={ui.filters} className="sm:w-48"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">{ar ? "كل الحالات" : "All statuses"}</SelectItem>{statuses.map((status) => <SelectItem key={status} value={status}>{t.clinic.statuses[status as keyof typeof t.clinic.statuses] ?? status}</SelectItem>)}</SelectContent></Select><Button type="button" variant="outline" onClick={() => recordsQuery.refetch()} disabled={recordsQuery.isFetching}><RefreshCw className={"me-2 size-4 " + (recordsQuery.isFetching ? "animate-spin" : "")}/>{ar ? "تحديث" : "Refresh"}</Button></div></div>
            {recordsQuery.isError && <div role="alert" className="mx-5 mt-4 flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"><AlertCircle className="mt-0.5 size-4 shrink-0"/>{recordsQuery.error instanceof Error ? recordsQuery.error.message : (ar ? "تعذر تحميل البيانات" : "Unable to load data")}</div>}
            <DataTable columns={columns} data={pageRows} getRowId={rowId} isLoading={recordsQuery.isLoading} loadingLabel={ar ? "جارٍ تحميل البيانات..." : "Loading records..."} emptyState={<div className="px-6 py-14 text-center"><Database className="mx-auto size-8 text-muted-foreground/40"/><p className="mt-3 font-semibold">{ui.noRecords}</p><p className="mt-1 text-sm text-muted-foreground">{ar ? "لا توجد بيانات مطابقة في العيادة الحالية." : "No matching records were returned for the active clinic."}</p></div>} pagination={{ page, perPage, total: filtered.length, totalKnown: true, hasNext: page < pageCount }} onPageChange={setPage} onPerPageChange={(size) => { setPerPage(size); setPage(1) }}/>
          </section>
        </>
      )}

      {viewRecord && <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setViewRecord(null) }}><Card className="max-h-[85vh] w-full max-w-2xl overflow-y-auto shadow-2xl"><CardContent className="p-6"><div className="mb-5 flex items-center justify-between"><h2 className="font-semibold">{ar ? "تفاصيل السجل" : "Record details"}</h2><Button variant="outline" onClick={() => setViewRecord(null)}>{ar ? "إغلاق" : "Close"}</Button></div><dl className="grid gap-3 sm:grid-cols-2">{Object.entries(viewRecord).filter(([field]) => !internalFields.has(field)).map(([field, value]) => <div key={field} className="rounded-xl border p-3"><dt className="text-xs text-muted-foreground">{titleCase(field)}</dt><dd className="mt-1 break-words text-sm font-medium">{valueText(value)}</dd></div>)}</dl></CardContent></Card></div>}
    </div>
  )
}
