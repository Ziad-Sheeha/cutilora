import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useOutletContext } from "react-router"
import { Clock3, MapPin, MapPinned, Pencil, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { TenantBranchForm } from "../components/tenant-branch-form"
import { TenantEmptyState } from "../components/tenant-empty-state"
import { TenantPageHeading } from "../components/tenant-page-heading"
import { TenantStatusPill } from "../components/tenant-status-pill"
import { createBranch, getBranches, updateBranch } from "../api/tenant-api"
import { canManageOrganization } from "../auth/tenant-permissions"
import type { Branch } from "../types/tenant.types"
import type { TenantOutletContext } from "../layout/tenant-layout"
import { useI18n } from "@/i18n/i18n-provider"

export function TenantBranchesPage() {
  const { context, clinics } = useOutletContext<TenantOutletContext>()
  const { locale } = useI18n()
  const ar = locale === "ar"
  const canWrite = canManageOrganization()
  const queryClient = useQueryClient()
  const [formOpen, setFormOpen] = useState(false)
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const clinicId = context?.access.clinicId || context?.clinic?._id || ""
  const clinicName = context?.clinic?.name || clinics.find((clinic) => clinic._id === clinicId)?.name

  const copy = ar
    ? {
        eyebrow: "إدارة المواقع",
        title: "الفروع",
        description: "نظّم مواقع كل عيادة وتابع الفروع التابعة لها.",
        add: "إضافة فرع",
        clinic: "العيادة الحالية",
        choose: "اختر عيادة أولاً",
        chooseDescription: "اختر عيادة من القائمة بالأعلى لعرض فروعها.",
        empty: "لا توجد فروع لهذه العيادة بعد",
        emptyDescription: "يمكنك إضافة أول فرع لهذه العيادة.",
        count: "فرع",
        search: "ابحث باسم الفرع أو المعرّف...",
      }
    : {
        eyebrow: "LOCATION MANAGEMENT",
        title: "Branches",
        description: "Organize each clinic location and manage its branches.",
        add: "Add branch",
        clinic: "Active clinic",
        choose: "Choose a clinic first",
        chooseDescription: "Select a clinic from the header to view its branches.",
        empty: "No branches for this clinic yet",
        emptyDescription: "Create the first branch for this clinic.",
        count: "branches",
        search: "Search branches by name or slug...",
      }

  const branchesQuery = useQuery({
    queryKey: ["tenant-branches", clinicId],
    queryFn: () => getBranches(clinicId),
    enabled: Boolean(clinicId),
    staleTime: 30_000,
  })
  const branches = branchesQuery.data ?? []
  const loading = branchesQuery.isLoading
  const errorMessage = branchesQuery.error instanceof Error ? branchesQuery.error.message : ""


  const filteredBranches = branches.filter(branch => [branch.name, branch.slug, branch.address, branch.status].some(value => String(value ?? "").toLowerCase().includes(search.trim().toLowerCase())))

  function openCreateForm() {
    setEditingBranch(null)
    setError("")
    setFormOpen(true)
  }

  function openEditForm(branch: Branch) {
    setEditingBranch(branch)
    setError("")
    setFormOpen(true)
  }

  async function saveBranch(payload: Record<string, unknown>) {
    setError("")
    try {
      if (editingBranch) await updateBranch(editingBranch._id, { ...payload, clinicId })
      else await createBranch({ ...payload, clinicId })
      await queryClient.invalidateQueries({ queryKey: ["tenant-branches", clinicId] })
      setFormOpen(false)
      setEditingBranch(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : (ar ? "تعذر حفظ الفرع" : "Unable to save branch"))
      throw cause
    }
  }

  return (
    <div className="space-y-7">
      <TenantPageHeading
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        action={
          canWrite ? <Button disabled={!clinicId} onClick={openCreateForm}>
            <Plus className="size-4" />
            {copy.add}
          </Button> : undefined
        }
      />

      {!clinicId ? (
        <Card className="border-dashed bg-white">
          <CardContent className="flex min-h-64 items-center justify-center p-8">
            <TenantEmptyState icon={MapPinned} title={copy.choose} description={copy.chooseDescription} />
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center gap-3 rounded-2xl border bg-white p-4">
            <span className="grid size-10 place-items-center rounded-xl bg-violet-50 text-violet-700">
              <MapPinned className="size-5" />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{copy.clinic}</p>
              <p className="mt-1 text-sm font-semibold">{clinicName || "—"}</p>
            </div>
          </div>

          {canWrite && formOpen && <TenantBranchForm branch={editingBranch} onCancel={() => { setFormOpen(false); setEditingBranch(null) }} onSave={saveBranch} />}
          {(error || errorMessage) && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error || errorMessage}</p>}

          <Card className="border-white bg-white">
            <CardContent className="p-6">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-semibold">{ar ? "فروع العيادة" : "Clinic branches"}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{branches.length} {copy.count}</p>
                </div>
                <div className="relative w-full sm:max-w-xs"><Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/><Input value={search} onChange={event => setSearch(event.target.value)} placeholder={copy.search} className="ps-9"/></div>
              </div>

              {loading ? (
                <p className="py-12 text-center text-sm text-muted-foreground">{ar ? "جارٍ التحميل…" : "Loading branches…"}</p>
              ) : filteredBranches.length ? (
                <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
                  {filteredBranches.map((branch) => (
                    <article key={branch._id} className="rounded-2xl border p-4">
                      <div className="flex items-center gap-3">
                        <span className="grid size-10 place-items-center rounded-xl bg-violet-50 text-violet-700">
                          <MapPin className="size-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{branch.name}</p>
                          <p className="mt-1 truncate text-xs text-muted-foreground">{branch.slug}</p>
                        </div>
                        <TenantStatusPill status={branch.status || "active"} />
                        {canWrite && <Button type="button" size="icon" variant="ghost" onClick={() => openEditForm(branch)} aria-label={ar ? "تعديل الفرع" : "Edit branch"}><Pencil className="size-4"/></Button>}
                      </div>
                      <p className="mt-4 flex items-center gap-2 border-t pt-3 text-xs text-muted-foreground">
                        <Clock3 className="size-3.5" />
                        {branch.timezone || "Africa/Cairo"}
                      </p>
                    </article>
                  ))}
                </div>
              ) : (
                <TenantEmptyState
                  icon={MapPinned}
                  title={search ? (ar ? "لا توجد نتائج مطابقة" : "No matching branches") : copy.empty}
                  description={search ? (ar ? "جرّب البحث باسم أو معرّف مختلف." : "Try another branch name or slug.") : copy.emptyDescription}
                  action={canWrite ? <Button size="sm" onClick={openCreateForm}>{copy.add}</Button> : undefined}
                />
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
