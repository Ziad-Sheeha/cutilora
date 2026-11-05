import { useState } from "react"
import { useOutletContext } from "react-router"
import { Building2, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { TenantClinicCard } from "../components/tenant-clinic-card"
import { TenantClinicForm } from "../components/tenant-clinic-form"
import { TenantEmptyState } from "../components/tenant-empty-state"
import { TenantPageHeading } from "../components/tenant-page-heading"
import { createClinic, updateClinic } from "../api/tenant-api"
import type { Clinic } from "../types/tenant.types"
import type { TenantOutletContext } from "../layout/tenant-layout"
import { useI18n } from "@/i18n/i18n-provider"

export function TenantClinicsPage() {
  const { clinics, refresh } = useOutletContext<TenantOutletContext>()
  const { locale } = useI18n()
  const ar = locale === "ar"
  const [search, setSearch] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [editingClinic, setEditingClinic] = useState<Clinic | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const copy = ar
    ? {
        eyebrow: "إدارة المؤسسة",
        title: "العيادات",
        description: "إدارة العيادات التابعة لمؤسستك من مكان واحد.",
        add: "إضافة عيادة",
        edit: "تعديل",
        search: "ابحث باسم العيادة",
        count: "عيادة",
        saved: "تم حفظ بيانات العيادة بنجاح.",
        empty: "لا توجد عيادات مطابقة",
        emptyDescription: "جرّب تغيير كلمات البحث أو أضف عيادة جديدة لمؤسستك.",
      }
    : {
        eyebrow: "ORGANIZATION MANAGEMENT",
        title: "Clinics",
        description: "Manage every clinic owned by your organization from one place.",
        add: "Add clinic",
        edit: "Edit",
        search: "Search clinics",
        count: "clinics",
        saved: "Clinic details saved successfully.",
        empty: "No matching clinics",
        emptyDescription: "Try another search or add a clinic to your organization.",
      }

  const filteredClinics = clinics.filter((clinic) =>
    clinic.name.toLowerCase().includes(search.toLowerCase()),
  )

  function openCreateForm() {
    setEditingClinic(null)
    setError("")
    setSuccess("")
    setFormOpen(true)
  }

  function openEditForm(clinic: Clinic) {
    setEditingClinic(clinic)
    setError("")
    setSuccess("")
    setFormOpen(true)
  }

  async function saveClinic(payload: Record<string, unknown>) {
    setError("")
    try {
      if (editingClinic) {
        await updateClinic(editingClinic._id, payload)
      } else {
        await createClinic(payload)
      }
      await refresh()
      setFormOpen(false)
      setError("")
      setSuccess(copy.saved)
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unable to save clinic"
      setError(message)
      throw e
    }
  }

  return (
    <div className="space-y-7">
      <TenantPageHeading
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        action={
          <Button onClick={openCreateForm}>
            <Plus className="size-4" />
            {copy.add}
          </Button>
        }
      />

      {success && (
        <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {success}
        </p>
      )}
      {error && !formOpen && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {formOpen && (
        <TenantClinicForm
          clinic={editingClinic}
          onCancel={() => setFormOpen(false)}
          onSave={saveClinic}
        />
      )}

      <Card className="border-white bg-white">
        <CardContent className="p-5 sm:p-6">
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h3 className="font-semibold">{ar ? "كل العيادات" : "All clinics"}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {clinics.length} {copy.count}
              </p>
            </div>
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={copy.search}
                className="ps-9"
              />
            </div>
          </div>

          {filteredClinics.length ? (
            <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
              {filteredClinics.map((clinic) => (
                <TenantClinicCard
                  key={clinic._id}
                  clinic={clinic}
                  onEdit={openEditForm}
                  editLabel={copy.edit}
                />
              ))}
            </div>
          ) : (
            <TenantEmptyState
              icon={Building2}
              title={copy.empty}
              description={copy.emptyDescription}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
