import { Building2, Globe2, Mail, Phone, ShieldCheck } from "lucide-react"
import { useOutletContext } from "react-router"
import { Card, CardContent } from "@/components/ui/card"
import { useI18n } from "@/i18n/i18n-provider"
import { TenantPageHeading } from "../components/tenant-page-heading"
import { getTenantFeature } from "../features/shared/tenant-feature-registry"
import { TenantFeatureForm } from "../features/shared/tenant-feature-form"
import type { TenantOutletContext } from "../layout/tenant-layout"
import { updateTenantProfile } from "../api/tenant-api"

export function TenantOrganizationPage() {
  const { context, refresh } = useOutletContext<TenantOutletContext>()
  const { locale } = useI18n()
  const ar = locale === "ar"
  const tenant = context?.tenant
  const profileFeature = getTenantFeature("organization-profile")
  const initialValues = {
    displayName: tenant?.displayName || tenant?.name || "",
    legalName: tenant?.legalName || "",
    businessType: tenant?.businessType || "single_clinic",
    contactEmail: tenant?.contact?.email || "",
    contactPhone: tenant?.contact?.phone || "",
    website: tenant?.contact?.website || "",
    countryId: tenant?.address?.countryId || "",
    cityId: tenant?.address?.cityId || "",
    addressLine1: tenant?.address?.addressLine1 || "",
  }

  async function saveProfile(values: Record<string, unknown>) {
    await updateTenantProfile({
      displayName: values.displayName,
      legalName: values.legalName,
      businessType: values.businessType,
      contact: { email: values.contactEmail, phone: values.contactPhone, website: values.website },
      address: { countryId: values.countryId, cityId: values.cityId, addressLine1: values.addressLine1 },
    })
    await refresh()
  }

  const fields = [
    { label: ar ? "الاسم التجاري" : "Display name", value: tenant?.displayName || tenant?.name, icon: Building2 },
    { label: ar ? "الاسم القانوني" : "Legal name", value: tenant?.legalName, icon: ShieldCheck },
    { label: ar ? "البريد الإلكتروني" : "Email", value: tenant?.contact?.email, icon: Mail },
    { label: ar ? "رقم الهاتف" : "Phone", value: tenant?.contact?.phone, icon: Phone },
    { label: ar ? "الموقع الإلكتروني" : "Website", value: tenant?.contact?.website, icon: Globe2 },
  ]

  return (
    <div className="space-y-7">
      <TenantPageHeading
        eyebrow={ar ? "إعدادات المؤسسة" : "ORGANIZATION SETTINGS"}
        title={ar ? "ملف المؤسسة" : "Organization profile"}
        description={
          ar
            ? "راجع بيانات المؤسسة المرتبطة بحسابك."
            : "Review the organization details associated with your account."
        }
      />

      <Card className="overflow-hidden border-white bg-white">
        <div className="h-28 bg-gradient-to-r from-[#211936] via-[#46316e] to-[#9274d5]" />
        <CardContent className="-mt-9 p-6">
          <div className="mb-7 flex items-end gap-4">
            <span className="grid size-[76px] place-items-center rounded-2xl border-4 border-white bg-violet-100 text-violet-700 shadow-sm">
              <Building2 className="size-8" />
            </span>
            <div className="pb-1">
              <h3 className="text-xl font-semibold">
                {tenant?.displayName || tenant?.name || "—"}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">{tenant?.slug || "—"}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((field) => {
              const Icon = field.icon
              return (
                <div key={field.label} className="rounded-xl border bg-slate-50/70 p-4">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Icon className="size-4" />
                    {field.label}
                  </div>
                  <p className="mt-3 break-words text-sm font-semibold">{field.value || "—"}</p>
                </div>
              )
            })}
          </div>

          <div className="mt-5 grid gap-4 border-t pt-5 sm:grid-cols-3">
            <ProfileValue
              label={ar ? "نوع المؤسسة" : "Business type"}
              value={(tenant?.businessType || "—").replaceAll("_", " ")}
            />
            <ProfileValue label={ar ? "الصناعة" : "Industry"} value={tenant?.industry || "—"} />
            <ProfileValue label={ar ? "حالة الحساب" : "Account status"} value={tenant?.status || "—"} />
          </div>
        </CardContent>
      </Card>

      {profileFeature && <TenantFeatureForm feature={profileFeature} initialValues={initialValues} onSave={saveProfile} />}

    </div>
  )
}

function ProfileValue({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold capitalize">{value}</p>
    </div>
  )
}
