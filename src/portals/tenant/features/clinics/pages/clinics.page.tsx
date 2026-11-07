import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useOutletContext } from "react-router"
import { Activity, Building2, CheckCircle2, Plus, Search, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ConfirmDialog } from "@/shared/components/dialogs/confirm-dialog"
import { useI18n } from "@/i18n/i18n-provider"
import { getMyTenantAccess, getClinics, createClinic, updateClinic, activateClinic, deactivateClinic } from "@/portals/tenant/api/tenant-api"
import { TenantClinicForm } from "@/portals/tenant/features/clinics/components/clinic-form"
import { TenantPageHeading } from "@/portals/tenant/components/tenant-page-heading"
import type { TenantOutletContext } from "@/portals/tenant/layout/tenant-layout"
import type { Clinic } from "@/portals/tenant/types/tenant.types"
import { ClinicCard } from "@/portals/tenant/features/clinics/components/clinic-card"
import { ClinicDetailsDialog } from "@/portals/tenant/features/clinics/components/clinic-details-dialog"

const clinicsKey = ["tenant-clinics"] as const
const accessKey = ["tenant-access-me"] as const

export function TenantClinicsPage() {
  const { clinics: initialClinics } = useOutletContext<TenantOutletContext>()
  const { locale } = useI18n()
  const ar = locale === "ar"
  const qc = useQueryClient()
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Clinic | null>(null)
  const [viewing, setViewing] = useState<Clinic | null>(null)
  const [statusTarget, setStatusTarget] = useState<Clinic | null>(null)
  const [error, setError] = useState("")

  const access = useQuery({ queryKey: accessKey, queryFn: getMyTenantAccess, staleTime: 60_000 })
  const canManage = Boolean(access.data?.permissions.includes("clinic.manage") || access.data?.grants.some(grant => (grant.permission === "clinic.manage" || grant.permission === "*") && grant.scope === "tenant"))
  const clinicsQuery = useQuery({ queryKey: clinicsKey, queryFn: getClinics, enabled: canManage, staleTime: 30_000 })
  const clinics = clinicsQuery.data ?? initialClinics

  const saveMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => editing ? updateClinic(editing._id, payload) : createClinic(payload),
    onSuccess: async () => {
      setFormOpen(false)
      setEditing(null)
      setError("")
      await Promise.all([
        qc.invalidateQueries({ queryKey: clinicsKey }),
        qc.invalidateQueries({ queryKey: ["tenant-context"] }),
      ])
    },
    onError: cause => setError(cause instanceof Error ? cause.message : (ar ? "تعذر حفظ العيادة." : "Unable to save clinic.")),
  })
  const statusMutation = useMutation({
    mutationFn: async (clinic: Clinic) => clinic.status === "active" ? deactivateClinic(clinic._id) : activateClinic(clinic._id),
    onSuccess: async () => {
      setStatusTarget(null)
      await qc.invalidateQueries({ queryKey: clinicsKey })
      await qc.invalidateQueries({ queryKey: ["tenant-context"] })
    },
    onError: cause => setError(cause instanceof Error ? cause.message : (ar ? "تعذر تحديث الحالة." : "Unable to update clinic status.")),
  })

  const rows = useMemo(() => clinics.filter(clinic => {
    const query = search.trim().toLocaleLowerCase(ar ? "ar" : "en")
    const matchesSearch = !query || [clinic.name, clinic.code, clinic.slug, clinic.contact?.email, clinic.contact?.phone].some(value => String(value ?? "").toLocaleLowerCase(ar ? "ar" : "en").includes(query))
    return matchesSearch && (status === "all" || clinic.status === status)
  }), [clinics, search, status, ar])
  const activeCount = clinics.filter(clinic => clinic.status === "active").length
  const suspendedCount = clinics.length - activeCount

  const copy = ar ? {
    eyebrow: "إدارة المؤسسة", title: "العيادات", description: "إدارة العلامات والكيانات الطبية التابعة لمؤسستك من مساحة تشغيل واحدة.",
    add: "إضافة عيادة", search: "ابحث بالاسم أو الكود أو بيانات التواصل", all: "كل الحالات", active: "نشطة", suspended: "موقوفة",
    total: "إجمالي العيادات", activeLabel: "عيادات نشطة", suspendedLabel: "موقوفة", list: "دليل العيادات", results: "نتيجة",
    noResults: "لا توجد عيادات مطابقة", noResultsDesc: "جرّب تعديل البحث أو فلتر الحالة.", noClinics: "ابدأ بإضافة أول عيادة", noClinicsDesc: "أنشئ ملفًا مستقلًا لكل كيان طبي تابع لمؤسستك.",
    edit: "تعديل", view: "التفاصيل", activate: "تفعيل", deactivate: "إيقاف", confirmTitle: "تأكيد تغيير الحالة",
    confirmDescription: "سيتم تحديث حالة العيادة. يمكنك تغييرها مرة أخرى لاحقًا.", confirm: "تأكيد", permission: "ليس لديك صلاحية إدارة العيادات.",
    loading: "جارٍ تحميل العيادات...", retry: "إعادة المحاولة"
  } : {
    eyebrow: "ORGANIZATION MANAGEMENT", title: "Clinics", description: "Manage the medical entities and clinic brands owned by your organization from one operating workspace.",
    add: "Add clinic", search: "Search by name, code or contact details", all: "All statuses", active: "Active", suspended: "Suspended",
    total: "Total clinics", activeLabel: "Active clinics", suspendedLabel: "Suspended", list: "Clinic directory", results: "results",
    noResults: "No clinics match your filters", noResultsDesc: "Try adjusting your search or status filter.", noClinics: "Create your first clinic", noClinicsDesc: "Set up a dedicated profile for each medical entity in your organization.",
    edit: "Edit", view: "Details", activate: "Activate", deactivate: "Suspend", confirmTitle: "Confirm status change",
    confirmDescription: "The clinic status will be updated. You can change it again later.", confirm: "Confirm", permission: "You don't have permission to manage clinics.",
    loading: "Loading clinics...", retry: "Retry"
  }

  function openCreate() { setEditing(null); setError(""); setFormOpen(true) }
  function openEdit(clinic: Clinic) { setEditing(clinic); setError(""); setFormOpen(true) }

  return <div className="space-y-7">
    <TenantPageHeading eyebrow={copy.eyebrow} title={copy.title} description={copy.description}
      action={canManage ? <Button onClick={openCreate} className="h-11 rounded-xl px-5 shadow-md shadow-primary/15"><Plus className="me-2 size-4"/>{copy.add}</Button> : undefined}/>
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    {access.isError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{access.error instanceof Error ? access.error.message : "Unable to verify access."}</p>}
    {!access.isLoading && !access.isError && !canManage && <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{copy.permission}</p>}

    <div className="grid gap-3 sm:grid-cols-3">
      <Metric icon={Building2} label={copy.total} value={clinics.length} tone="violet"/>
      <Metric icon={CheckCircle2} label={copy.activeLabel} value={activeCount} tone="emerald"/>
      <Metric icon={Activity} label={copy.suspendedLabel} value={suspendedCount} tone="slate"/>
    </div>

    <Card className="overflow-hidden border-slate-200/80 shadow-sm">
      <CardContent className="space-y-5 p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div><div className="flex items-center gap-2"><span className="grid size-9 place-items-center rounded-xl bg-violet-50 text-violet-700"><Building2 className="size-4"/></span><h3 className="text-lg font-semibold tracking-tight">{copy.list}</h3></div><p className="mt-1 text-sm text-slate-500">{rows.length} {copy.results}</p></div>
          <div className="grid gap-2 sm:grid-cols-[minmax(220px,1fr)_170px]">
            <div className="relative"><Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"/><Input value={search} onChange={event => setSearch(event.target.value)} placeholder={copy.search} className="h-10 rounded-xl border-slate-200 ps-9"/></div>
            <Select value={status} onValueChange={setStatus}><SelectTrigger className="h-10 rounded-xl border-slate-200"><SlidersHorizontal className="me-2 size-4 text-slate-400"/><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">{copy.all}</SelectItem><SelectItem value="active">{copy.active}</SelectItem><SelectItem value="suspended">{copy.suspended}</SelectItem></SelectContent></Select>
          </div>
        </div>
        {clinicsQuery.isLoading && <p className="py-12 text-center text-sm text-slate-500">{copy.loading}</p>}
        {clinicsQuery.isError && <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{clinicsQuery.error instanceof Error ? clinicsQuery.error.message : "Unable to load clinics."}<Button variant="outline" size="sm" className="ms-3" onClick={() => void clinicsQuery.refetch()}>{copy.retry}</Button></div>}
        {!clinicsQuery.isLoading && rows.length > 0 && <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">{rows.map(clinic => <ClinicCard key={clinic._id} clinic={clinic} canManage={canManage} onView={setViewing} onEdit={openEdit} onToggleStatus={setStatusTarget} statusActionLabel={clinic.status === "active" ? copy.deactivate : copy.activate} labels={{ active: copy.active, suspended: copy.suspended, view: copy.view, edit: copy.edit, addressFallback: ar ? "لم يتم إضافة العنوان" : "Address not provided" }}/>)}</div>}
        {!clinicsQuery.isLoading && rows.length === 0 && <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-5 py-14 text-center"><div className="mx-auto grid size-12 place-items-center rounded-2xl bg-white text-violet-700 shadow-sm ring-1 ring-slate-200"><Building2 className="size-5"/></div><h3 className="mt-4 font-semibold text-slate-900">{clinics.length ? copy.noResults : copy.noClinics}</h3><p className="mx-auto mt-1 max-w-md text-sm text-slate-500">{clinics.length ? copy.noResultsDesc : copy.noClinicsDesc}</p>{canManage && clinics.length === 0 && <Button className="mt-5" onClick={openCreate}><Plus className="me-2 size-4"/>{copy.add}</Button>}</div>}
      </CardContent>
    </Card>

    <Dialog open={formOpen} onOpenChange={open => { if (!saveMutation.isPending) setFormOpen(open) }}>
      <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto"><DialogHeader><DialogTitle>{editing ? (ar ? "تعديل بيانات العيادة" : "Edit clinic") : copy.add}</DialogTitle><DialogDescription>{ar ? "أدخل بيانات الكيان الطبي وبيانات التواصل والموقع." : "Provide the clinic identity, contact information and location."}</DialogDescription></DialogHeader>
        <TenantClinicForm clinic={editing} onCancel={() => setFormOpen(false)} onSave={async payload => { await saveMutation.mutateAsync(payload) }}/>
      </DialogContent>
    </Dialog>
    <ClinicDetailsDialog clinic={viewing} open={Boolean(viewing)} onOpenChange={open => { if (!open) setViewing(null) }} locale={ar ? "ar" : "en"}/>
    <ConfirmDialog open={Boolean(statusTarget)} title={copy.confirmTitle} description={copy.confirmDescription} confirmLabel={copy.confirm} destructive={statusTarget?.status === "active"} isLoading={statusMutation.isPending} onOpenChange={open => { if (!open && !statusMutation.isPending) setStatusTarget(null) }} onConfirm={() => { if (statusTarget) statusMutation.mutate(statusTarget) }}/>
  </div>
}

function Metric({ icon: Icon, label, value, tone }: { icon: typeof Building2; label: string; value: number; tone: "violet" | "emerald" | "slate" }) {
  const styles = { violet: "bg-violet-50 text-violet-700 ring-violet-100", emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100", slate: "bg-slate-100 text-slate-600 ring-slate-200" }
  return <Card className="border-slate-200/80 shadow-sm"><CardContent className="flex items-center gap-3 p-4"><span className={`grid size-10 place-items-center rounded-xl ring-1 ${styles[tone]}`}><Icon className="size-5"/></span><div><p className="text-xs font-medium text-slate-500">{label}</p><p className="mt-0.5 text-2xl font-semibold tracking-tight text-slate-900">{value}</p></div></CardContent></Card>
}
