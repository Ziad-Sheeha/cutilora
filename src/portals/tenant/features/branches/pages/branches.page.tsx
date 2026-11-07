import { useMemo, useState } from "react"
import { BranchMetric } from "@/portals/tenant/features/branches/components/branch-metric"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useOutletContext } from "react-router"
import { Activity, Building2, MapPin, Plus, Search, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useI18n } from "@/i18n/i18n-provider"
import { getMyTenantAccess } from "@/portals/tenant/api/tenant-api"
import { getBranches, createBranch, updateBranch, activateBranch, suspendBranch, temporarilyCloseBranch, permanentlyCloseBranch } from "@/portals/tenant/features/branches/api/branches.api"
import { updateTenantContext } from "@/portals/tenant/auth/tenant-session"
import { TenantBranchForm } from "@/portals/tenant/features/branches/components/branch-form"
import { TenantPageHeading } from "@/portals/tenant/components/tenant-page-heading"
import type { TenantOutletContext } from "@/portals/tenant/layout/tenant-layout"
import type { Branch } from "@/portals/tenant/types/tenant.types"
import { BranchCard } from "@/portals/tenant/features/branches/components/branch-card"
import { BranchDetailsDialog } from "@/portals/tenant/features/branches/components/branch-details-dialog"

type LifecycleAction = "activate" | "temporary-close" | "suspend" | "close"
const accessKey = ["tenant-access-me"] as const

export function TenantBranchesPage() {
  const { context, clinics } = useOutletContext<TenantOutletContext>()
  const { locale } = useI18n()
  const ar = locale === "ar"
  const qc = useQueryClient()
  const tenantScoped = context?.access.scope === "tenant"
  const fixedClinicId = context?.access.clinicId || context?.clinic?._id || ""
  const [clinicFilter, setClinicFilter] = useState(fixedClinicId)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Branch | null>(null)
  const [viewing, setViewing] = useState<Branch | null>(null)
  const [lifecycleTarget, setLifecycleTarget] = useState<{ branch: Branch; action: LifecycleAction } | null>(null)
  const [reason, setReason] = useState("")
  const [error, setError] = useState("")

  const access = useQuery({ queryKey: accessKey, queryFn: getMyTenantAccess, staleTime: 60_000 })
  const permissions = access.data?.permissions ?? []
  const grants = access.data?.grants ?? []
  const has = (permission: string) => permissions.includes(permission) || grants.some(grant => (grant.permission === permission || grant.permission === "*") && (grant.scope === "tenant" || grant.scope === "clinic" || grant.scope === "branch"))
  const canRead = has("branch.read")
  const canCreate = has("branch.manage")
  const canEdit = has("branch.update")
  const canLifecycle = has("branch.lifecycle.manage")

  const branchesQuery = useQuery({
    queryKey: ["tenant-branches", clinicFilter || "all"],
    queryFn: () => getBranches(clinicFilter || undefined),
    enabled: canRead,
    staleTime: 20_000,
  })
  const branches = branchesQuery.data ?? []

  const saveMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const targetClinicId = clinicFilter || editing?.clinicId || fixedClinicId
      if (!targetClinicId) throw new Error(ar ? "اختر العيادة أولاً." : "Choose a clinic first.")
      updateTenantContext({ clinicId: targetClinicId, branchId: null })
      return editing ? updateBranch(editing._id, payload) : createBranch(payload)
    },
    onSuccess: async () => {
      setFormOpen(false)
      setEditing(null)
      setError("")
      await qc.invalidateQueries({ queryKey: ["tenant-branches"] })
    },
    onError: cause => setError(cause instanceof Error ? cause.message : (ar ? "تعذر حفظ الفرع." : "Unable to save branch.")),
  })

  const lifecycleMutation = useMutation({
    mutationFn: async () => {
      if (!lifecycleTarget) return
      const { branch, action } = lifecycleTarget
      const targetClinicId = clinicFilter || branch.clinicId || fixedClinicId
      if (targetClinicId) updateTenantContext({ clinicId: targetClinicId, branchId: null })
      if (action === "activate") return activateBranch(branch._id)
      if (action === "suspend") return suspendBranch(branch._id)
      if (action === "temporary-close") return temporarilyCloseBranch(branch._id, reason.trim())
      return permanentlyCloseBranch(branch._id, reason.trim())
    },
    onSuccess: async () => {
      setLifecycleTarget(null)
      setReason("")
      setError("")
      await qc.invalidateQueries({ queryKey: ["tenant-branches"] })
    },
    onError: cause => setError(cause instanceof Error ? cause.message : (ar ? "تعذر تحديث حالة الفرع." : "Unable to update branch lifecycle.")),
  })

  const rows = useMemo(() => branches.filter(branch => {
    const query = search.trim().toLocaleLowerCase(ar ? "ar" : "en")
    const matchesSearch = !query || [branch.name, branch.slug, branch.code, branch.address, branch.contact?.phone].some(value => String(value ?? "").toLocaleLowerCase(ar ? "ar" : "en").includes(query))
    return matchesSearch && (status === "all" || branch.status === status)
  }), [branches, search, status, ar])
  const activeCount = branches.filter(branch => branch.status === "active").length
  const attentionCount = branches.filter(branch => ["draft", "temporarily_closed", "suspended"].includes(branch.status || "")).length
  const clinicName = (clinicId?: string) => clinics.find(clinic => clinic._id === clinicId)?.name || (clinicId === fixedClinicId ? context?.clinic?.name : undefined)

  const copy = ar ? {
    eyebrow: "إدارة المواقع", title: "الفروع", description: "إدارة مواقع التشغيل وحالاتها وربط كل فرع بالعيادة التابعة له.",
    add: "إضافة فرع", allClinics: "كل العيادات", chooseClinic: "اختر العيادة", search: "ابحث باسم الفرع أو الكود أو العنوان",
    allStatuses: "كل الحالات", draft: "مسودة", active: "نشط", temporary: "مغلق مؤقتًا", suspended: "موقوف", closed: "مغلق نهائيًا",
    total: "إجمالي الفروع", activeLabel: "فروع نشطة", attention: "تحتاج متابعة", directory: "دليل الفروع", results: "نتيجة",
    noResults: "لا توجد فروع مطابقة", noResultsDesc: "جرّب تغيير البحث أو فلاتر العرض.", noBranches: "لا توجد فروع بعد", noBranchesDesc: "أضف أول موقع تشغيل للعيادة لبدء تنظيم عملياتك.",
    view: "التفاصيل", edit: "تعديل", activate: "إعادة تفعيل", temporaryClose: "إغلاق مؤقت", suspend: "إيقاف", close: "إغلاق نهائي",
    permission: "ليس لديك صلاحية عرض الفروع.", lifecycleTitle: "تأكيد الإجراء", reason: "سبب الإغلاق", reasonHint: "اكتب سببًا واضحًا (3 إلى 500 حرف).",
    confirm: "تأكيد الإجراء", cancel: "إلغاء", loading: "جارٍ تحميل الفروع...", retry: "إعادة المحاولة"
  } : {
    eyebrow: "LOCATION MANAGEMENT", title: "Branches", description: "Manage operating locations, lifecycle status and each branch's parent clinic.",
    add: "Add branch", allClinics: "All clinics", chooseClinic: "Choose clinic", search: "Search by branch name, code or address",
    allStatuses: "All statuses", draft: "Draft", active: "Active", temporary: "Temporarily closed", suspended: "Suspended", closed: "Permanently closed",
    total: "Total branches", activeLabel: "Active branches", attention: "Needs attention", directory: "Branch directory", results: "results",
    noResults: "No branches match your filters", noResultsDesc: "Try changing your search or filters.", noBranches: "No branches yet", noBranchesDesc: "Add the first operating location to start organizing your clinic operations.",
    view: "Details", edit: "Edit", activate: "Reactivate", temporaryClose: "Temporary close", suspend: "Suspend", close: "Close permanently",
    permission: "You don't have permission to view branches.", lifecycleTitle: "Confirm lifecycle action", reason: "Closure reason", reasonHint: "Provide a clear reason (3–500 characters).",
    confirm: "Confirm action", cancel: "Cancel", loading: "Loading branches...", retry: "Retry"
  }

  const statusOptions = [
    ["all", copy.allStatuses], ["draft", copy.draft], ["active", copy.active],
    ["temporarily_closed", copy.temporary], ["suspended", copy.suspended], ["closed", copy.closed],
  ]

  return <div className="space-y-7">
    <TenantPageHeading eyebrow={copy.eyebrow} title={copy.title} description={copy.description}
      action={canCreate ? <Button onClick={() => { setEditing(null); setError(""); setFormOpen(true) }} disabled={!clinicFilter && tenantScoped} className="h-11 rounded-xl px-5 shadow-md shadow-primary/15"><Plus className="me-2 size-4"/>{copy.add}</Button> : undefined}/>
    {tenantScoped && <div className="flex flex-col gap-2 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-violet-50 text-violet-700"><Building2 className="size-5"/></span><div><p className="text-sm font-semibold text-slate-800">{ar ? "نطاق عرض الفروع" : "Branch directory scope"}</p><p className="text-xs text-slate-500">{ar ? "اعرض كل الفروع أو اختر عيادة محددة." : "View all branches or narrow the directory to one clinic."}</p></div></div><Select value={clinicFilter || "all"} onValueChange={value => setClinicFilter(value === "all" ? "" : value)}><SelectTrigger className="h-10 w-full rounded-xl sm:w-64"><SelectValue placeholder={copy.chooseClinic}/></SelectTrigger><SelectContent><SelectItem value="all">{copy.allClinics}</SelectItem>{clinics.map(clinic => <SelectItem key={clinic._id} value={clinic._id}>{clinic.name}</SelectItem>)}</SelectContent></Select></div>}
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    {access.isError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{access.error instanceof Error ? access.error.message : "Unable to verify permissions."}</p>}
    {!access.isLoading && !access.isError && !canRead && <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{copy.permission}</p>}

    <div className="grid gap-3 sm:grid-cols-3">
      <BranchMetric icon={Store} label={copy.total} value={branches.length}/>
      <BranchMetric icon={MapPin} label={copy.activeLabel} value={activeCount}/>
      <BranchMetric icon={Activity} label={copy.attention} value={attentionCount}/>
    </div>

    <Card className="overflow-hidden border-slate-200/80 shadow-sm"><CardContent className="space-y-5 p-5 sm:p-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end"><div><div className="flex items-center gap-2"><span className="grid size-9 place-items-center rounded-xl bg-violet-50 text-violet-700"><MapPin className="size-4"/></span><h3 className="text-lg font-semibold tracking-tight">{copy.directory}</h3></div><p className="mt-1 text-sm text-slate-500">{rows.length} {copy.results}</p></div>
        <div className="grid gap-2 sm:grid-cols-[minmax(220px,1fr)_190px]"><div className="relative"><Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"/><Input value={search} onChange={event => setSearch(event.target.value)} placeholder={copy.search} className="h-10 rounded-xl border-slate-200 ps-9"/></div><Select value={status} onValueChange={setStatus}><SelectTrigger className="h-10 rounded-xl border-slate-200"><SlidersHorizontal className="me-2 size-4 text-slate-400"/><SelectValue/></SelectTrigger><SelectContent>{statusOptions.map(([value,label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></div>
      </div>
      {branchesQuery.isLoading && <p className="py-12 text-center text-sm text-slate-500">{copy.loading}</p>}
      {branchesQuery.isError && <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{branchesQuery.error instanceof Error ? branchesQuery.error.message : "Unable to load branches."}<Button variant="outline" size="sm" className="ms-3" onClick={() => void branchesQuery.refetch()}>{copy.retry}</Button></div>}
      {!branchesQuery.isLoading && rows.length > 0 && <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">{rows.map(branch => <BranchCard key={branch._id} branch={branch} clinicName={clinicName(branch.clinicId)} canEdit={canEdit} canLifecycle={canLifecycle} onView={setViewing} onEdit={branch => { setEditing(branch); setError(""); setFormOpen(true) }} onLifecycle={(branch, action) => { setLifecycleTarget({ branch, action }); setReason("") }} labels={{ view: copy.view, edit: copy.edit, activate: copy.activate, temporaryClose: copy.temporaryClose, suspend: copy.suspend, close: copy.close, statuses: { draft: copy.draft, active: copy.active, temporarily_closed: copy.temporary, suspended: copy.suspended, closed: copy.closed }, clinicFallback: ar ? "العيادة" : "Clinic", addressFallback: ar ? "لم يتم إضافة العنوان" : "Address not provided" }}/>)}</div>}
      {!branchesQuery.isLoading && rows.length === 0 && <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-5 py-14 text-center"><div className="mx-auto grid size-12 place-items-center rounded-2xl bg-white text-violet-700 shadow-sm ring-1 ring-slate-200"><MapPin className="size-5"/></div><h3 className="mt-4 font-semibold text-slate-900">{branches.length ? copy.noResults : copy.noBranches}</h3><p className="mx-auto mt-1 max-w-md text-sm text-slate-500">{branches.length ? copy.noResultsDesc : copy.noBranchesDesc}</p>{canCreate && clinicFilter && branches.length === 0 && <Button className="mt-5" onClick={() => { setEditing(null); setFormOpen(true) }}><Plus className="me-2 size-4"/>{copy.add}</Button>}</div>}
    </CardContent></Card>

    <Dialog open={formOpen} onOpenChange={open => { if (!saveMutation.isPending) setFormOpen(open) }}><DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto"><DialogHeader><DialogTitle>{editing ? (ar ? "تعديل بيانات الفرع" : "Edit branch") : copy.add}</DialogTitle><DialogDescription>{ar ? "أدخل بيانات الموقع التشغيلي." : "Enter the operating location details."}</DialogDescription></DialogHeader><TenantBranchForm branch={editing} onCancel={() => setFormOpen(false)} onSave={async payload => { await saveMutation.mutateAsync(payload) }}/></DialogContent></Dialog>
    <BranchDetailsDialog branch={viewing} clinicName={clinicName(viewing?.clinicId)} open={Boolean(viewing)} onOpenChange={open => { if (!open) setViewing(null) }} locale={ar ? "ar" : "en"}/>
    <Dialog open={Boolean(lifecycleTarget)} onOpenChange={open => { if (!open && !lifecycleMutation.isPending) setLifecycleTarget(null) }}><DialogContent className="max-w-lg"><DialogHeader><DialogTitle>{copy.lifecycleTitle}</DialogTitle><DialogDescription>{lifecycleTarget?.action === "close" ? (ar ? "الإغلاق النهائي إجراء لا يمكن التراجع عنه." : "Permanent closure is irreversible.") : lifecycleTarget?.action === "temporary-close" ? (ar ? "سيتم إغلاق الفرع مؤقتًا ويمكن إعادة تفعيله لاحقًا." : "The branch will be temporarily closed and can be reactivated later.") : lifecycleTarget?.action === "suspend" ? (ar ? "سيتم إيقاف الفرع مع الاحتفاظ بسجلاته." : "The branch will be suspended while retaining its records.") : (ar ? "سيتم إعادة تفعيل الفرع." : "The branch will be reactivated.")}</DialogDescription></DialogHeader>
      {lifecycleTarget && (lifecycleTarget.action === "temporary-close" || lifecycleTarget.action === "close") && <div className="space-y-2"><Label>{copy.reason} *</Label><Textarea value={reason} onChange={event => setReason(event.target.value)} minLength={3} maxLength={500} placeholder={copy.reasonHint}/></div>}
      <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setLifecycleTarget(null)} disabled={lifecycleMutation.isPending}>{copy.cancel}</Button><Button type="button" variant={lifecycleTarget?.action === "close" ? "destructive" : "default"} loading={lifecycleMutation.isPending} disabled={Boolean(lifecycleTarget && (lifecycleTarget.action === "temporary-close" || lifecycleTarget.action === "close") && reason.trim().length < 3)} onClick={() => lifecycleMutation.mutate()}>{copy.confirm}</Button></div>
    </DialogContent></Dialog>
  </div>
}

