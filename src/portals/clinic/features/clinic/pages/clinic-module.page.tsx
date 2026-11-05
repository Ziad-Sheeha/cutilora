import { useMemo, useState } from "react"
import { Link, useLocation } from "react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AlertCircle, Database, Eye, Pencil, Plus, RefreshCw, Search, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ConfirmDialog } from "@/shared/components/dialogs/confirm-dialog"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { pushToast } from "@/store"
import { useI18n } from "@/i18n/i18n-provider"
import { createClinicModuleRecord, deleteClinicModuleRecord, fetchClinicModuleRecords, getClinicModuleConfig, getClinicModuleFields, updateClinicModuleRecord, type ClinicModuleKey, type ClinicRecord } from "../api/clinic-module.api"
import { ClinicModuleForm } from "../components/clinic-module-form"
import { ClinicModuleRecordDialog } from "../components/clinic-module-record-dialog"
import { clinicModuleColumnLabel, clinicModuleStatusLabel, clinicModuleText } from "../components/clinic-module.i18n"

const MODULE_KEYS: readonly ClinicModuleKey[] = ["appointments", "patients", "clinical-records", "services", "packages", "billing", "team", "reports", "notifications", "branches", "settings"]
const INTERNAL_FIELDS = new Set(["id", "_id", "uuid", "tenantId", "tenant_id", "clinicId", "clinic_id", "branchId", "branch_id"])

function isModuleKey(value: string): value is ClinicModuleKey {
  return MODULE_KEYS.includes(value as ClinicModuleKey)
}
function recordId(record: ClinicRecord): string {
  const id = record.id ?? record._id ?? record.uuid ?? record.code
  return typeof id === "string" || typeof id === "number" ? String(id) : JSON.stringify(record)
}
function displayValue(value: unknown, locale: "ar" | "en"): string {
  if (value === null || value === undefined || value === "") return "—"
  if (typeof value === "boolean") return value ? (locale === "ar" ? "نعم" : "Yes") : (locale === "ar" ? "لا" : "No")
  if (Array.isArray(value)) return value.map((item) => displayValue(item, locale)).join("، ")
  return typeof value === "object" ? JSON.stringify(value) : String(value)
}
function errorText(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback
}

export function ClinicModulePage() {
  const slug = useLocation().pathname.split("/").filter(Boolean).at(-1) ?? "patients"
  const validKey = isModuleKey(slug)
  const key = validKey ? slug : "patients"
  const config = validKey ? getClinicModuleConfig(key) : undefined
  const fields = getClinicModuleFields(key)
  const { t, locale } = useI18n()
  const ar = locale === "ar"
  const moduleText = t.clinic.modules[key]
  const ui = t.clinic.ui
  const dispatch = useAppDispatch()
  const branchId = useAppSelector((state) => state.ui.currentBranchId)
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [editing, setEditing] = useState<ClinicRecord | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [viewRecord, setViewRecord] = useState<ClinicRecord | null>(null)
  const [deleteRecord, setDeleteRecord] = useState<ClinicRecord | null>(null)

  const recordsQuery = useQuery({
    queryKey: ["clinic-module", key, branchId],
    queryFn: () => fetchClinicModuleRecords(key),
    enabled: Boolean(config),
    staleTime: 30000,
  })
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["clinic-module", key] })
  const createMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => createClinicModuleRecord(key, payload),
    onSuccess: async () => {
      await invalidate()
      setFormOpen(false)
      setEditing(null)
      dispatch(pushToast({ id: crypto.randomUUID(), kind: "success", title: clinicModuleText("createSuccess", locale) }))
    },
  })
  const updateMutation = useMutation({
    mutationFn: (input: { id: string; payload: Record<string, unknown>; recordType?: string }) => updateClinicModuleRecord(key, input.id, input.payload, input.recordType),
    onSuccess: async () => {
      await invalidate()
      setFormOpen(false)
      setEditing(null)
      dispatch(pushToast({ id: crypto.randomUUID(), kind: "success", title: clinicModuleText("updateSuccess", locale) }))
    },
  })
  const deleteMutation = useMutation({
    mutationFn: (record: ClinicRecord) => deleteClinicModuleRecord(key, recordId(record)),
    onSuccess: async () => {
      await invalidate()
      setDeleteRecord(null)
      dispatch(pushToast({ id: crypto.randomUUID(), kind: "success", title: clinicModuleText("deleteSuccess", locale) }))
    },
  })

  const records = recordsQuery.data ?? []
  const statuses = useMemo(() => Array.from(new Set(records.map((record) => String(record.status ?? "")).filter(Boolean))).sort(), [records])
  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    return records.filter((record) => {
      const matchesSearch = !query || Object.entries(record).filter(([field]) => !INTERNAL_FIELDS.has(field)).map(([, value]) => displayValue(value, locale)).join(" ").toLocaleLowerCase().includes(query)
      return matchesSearch && (statusFilter === "all" || String(record.status ?? "") === statusFilter)
    })
  }, [records, search, statusFilter, locale])
  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage))
  const currentPage = Math.min(page, pageCount)
  const pageRows = useMemo(() => filtered.slice((currentPage - 1) * perPage, currentPage * perPage), [filtered, currentPage, perPage])

  function openCreate() { setEditing(null); setFormOpen(true) }
  function openEdit(record: ClinicRecord) { setEditing(record); setFormOpen(true) }

  async function saveRecord(payload: Record<string, unknown>) {
    try {
      if (editing) await updateMutation.mutateAsync({ id: recordId(editing), payload, recordType: editing.recordType })
      else await createMutation.mutateAsync(payload)
    } catch (error) {
      dispatch(pushToast({ id: crypto.randomUUID(), kind: "error", title: errorText(error, clinicModuleText("saveError", locale)) }))
      throw error
    }
  }
  async function confirmDelete() {
    if (!deleteRecord) return
    try { await deleteMutation.mutateAsync(deleteRecord) }
    catch (error) { dispatch(pushToast({ id: crypto.randomUUID(), kind: "error", title: errorText(error, clinicModuleText("delete", locale)) })) }
  }

  const columns = useMemo<DataTableColumn<ClinicRecord>[]>(() => {
    const sample = records[0]
    if (!sample) return []
    const preferred = ["name", "firstName", "title", "email", "status", "scheduledAt", "createdAt", "created_at"]
    const keys = Object.keys(sample).filter((field) => !INTERNAL_FIELDS.has(field) && typeof sample[field] !== "object")
    keys.sort((a, b) => {
      const ai = preferred.indexOf(a)
      const bi = preferred.indexOf(b)
      return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi)
    })
    const result: DataTableColumn<ClinicRecord>[] = keys.slice(0, 6).map((field) => ({
      id: field,
      header: clinicModuleColumnLabel(field, locale),
      cell: (record) => {
        const value = record[field]
        const text = field === "status" ? clinicModuleStatusLabel(String(value ?? ""), locale) : displayValue(value, locale)
        return <span className="block max-w-[260px] truncate text-sm" title={text}>{text}</span>
      },
    }))
    result.push({
      id: "actions",
      header: clinicModuleText("actions", locale),
      headerClassName: "text-end",
      cellClassName: "text-end",
      cell: (record) => <div className="flex items-center justify-end gap-1">
        <Button type="button" size="icon" variant="ghost" onClick={() => setViewRecord(record)} aria-label={clinicModuleText("view", locale)} title={clinicModuleText("view", locale)}><Eye className="size-4" /></Button>
        {config?.update && <Button type="button" size="icon" variant="ghost" onClick={() => openEdit(record)} aria-label={clinicModuleText("edit", locale)} title={clinicModuleText("edit", locale)}><Pencil className="size-4" /></Button>}
        {config?.remove && <Button type="button" size="icon" variant="ghost" disabled={deleteMutation.isPending} onClick={() => setDeleteRecord(record)} aria-label={clinicModuleText("delete", locale)} title={clinicModuleText("delete", locale)}><Trash2 className="size-4 text-destructive" /></Button>}
      </div>,
    })
    return result
  }, [records, locale, config, deleteMutation.isPending])

  const saving = createMutation.isPending || updateMutation.isPending

  return <div className="space-y-6">
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div className="min-w-0">
        <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground"><span>{ui.breadcrumbClinic}</span><span>/</span><span>{ui.workspace}</span><span>/</span><span className="text-foreground">{moduleText.title}</span></div>
        <h1 className="text-2xl font-bold tracking-tight">{moduleText.title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{moduleText.description}</p>
      </div>
      {config?.create && <Button type="button" onClick={openCreate}><Plus className="me-2 size-4" />{moduleText.add}</Button>}
    </header>

    {!config ? <Card><CardContent className="p-8 text-center">
      <Database className="mx-auto size-9 text-muted-foreground" />
      <h2 className="mt-3 font-semibold">{clinicModuleText("noData", locale)}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{key === "clinical-records" ? clinicModuleText("clinicalRecordsDescription", locale) : clinicModuleText("noDataDescription", locale)}</p>
      {key === "clinical-records" && <Button asChild variant="outline" className="mt-4"><Link to="/clinic/patients">{clinicModuleText("goToPatients", locale)}</Link></Button>}
    </CardContent></Card> : <>
      {formOpen && <ClinicModuleForm key={editing ? recordId(editing) : "new"} fields={fields} record={editing} title={editing ? clinicModuleText("editTitle", locale) : moduleText.add} isSaving={saving} onCancel={() => { setFormOpen(false); setEditing(null) }} onSubmit={saveRecord} />}
      <section className="overflow-hidden rounded-2xl border bg-card">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="font-semibold">{moduleText.list}</h2><p className="mt-1 text-xs text-muted-foreground">{filtered.length} {ui.records}</p></div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder={clinicModuleText("search", locale)} aria-label={clinicModuleText("search", locale)} className="ps-9 pe-9 sm:w-64" />
              {search && <Button type="button" size="icon" variant="ghost" className="absolute end-1 top-1/2 size-8 -translate-y-1/2" onClick={() => { setSearch(""); setPage(1) }} aria-label={ui.clearFilters}><X className="size-4" /></Button>}
            </div>
            <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setPage(1) }}>
              <SelectTrigger aria-label={ui.filters} className="sm:w-48"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">{clinicModuleText("allStatuses", locale)}</SelectItem>{statuses.map((status) => <SelectItem key={status} value={status}>{clinicModuleStatusLabel(status, locale)}</SelectItem>)}</SelectContent>
            </Select>
            <Button type="button" variant="outline" onClick={() => void recordsQuery.refetch()} disabled={recordsQuery.isFetching}><RefreshCw className={"me-2 size-4 " + (recordsQuery.isFetching ? "animate-spin" : "")} />{clinicModuleText("refresh", locale)}</Button>
          </div>
        </div>
        {recordsQuery.isError && <div role="alert" className="mx-5 mt-4 flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"><AlertCircle className="mt-0.5 size-4 shrink-0" />{errorText(recordsQuery.error, clinicModuleText("loadError", locale))}</div>}
        <DataTable columns={columns} data={pageRows} getRowId={recordId} isLoading={recordsQuery.isLoading} loadingLabel={clinicModuleText("loading", locale)} emptyState={<div className="px-6 py-14 text-center"><Database className="mx-auto size-8 text-muted-foreground/40" /><p className="mt-3 font-semibold">{clinicModuleText("empty", locale)}</p><p className="mt-1 text-sm text-muted-foreground">{clinicModuleText("emptyDescription", locale)}</p></div>} pagination={{ page: currentPage, perPage, total: filtered.length, totalKnown: true, hasNext: currentPage < pageCount }} onPageChange={setPage} onPerPageChange={(size) => { setPerPage(size); setPage(1) }} />
      </section>
    </>}

    <ClinicModuleRecordDialog record={viewRecord} onOpenChange={(open) => { if (!open) setViewRecord(null) }} />
    <ConfirmDialog open={Boolean(deleteRecord)} title={clinicModuleText("deleteTitle", locale)} description={clinicModuleText("deleteDescription", locale)} confirmLabel={clinicModuleText("confirmDelete", locale)} cancelLabel={clinicModuleText("cancel", locale)} destructive isLoading={deleteMutation.isPending} onOpenChange={(open) => { if (!open && !deleteMutation.isPending) setDeleteRecord(null) }} onConfirm={() => void confirmDelete()} />
  </div>
}
