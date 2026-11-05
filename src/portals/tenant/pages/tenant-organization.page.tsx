import { useEffect, useMemo, useState, type FormEvent } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Building2, Globe2, Mail, MapPin, Phone, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useI18n } from "@/i18n/i18n-provider"
import { TenantPageHeading } from "../components/tenant-page-heading"
import type { TenantOutletContext } from "../layout/tenant-layout"
import { useOutletContext } from "react-router"
import { getTenantGeo, tenantApi, updateTenantProfile } from "../api/tenant-api"
import { tenantProfileSchema, getTenantFieldErrors } from "../features/shared/tenant-feature-schemas"

type ProfileForm = {
  displayName: string; legalName: string; businessType: string; contactEmail: string; contactPhone: string;
  website: string; countryId: string; cityId: string; addressLine1: string;
}
const emptyForm: ProfileForm = { displayName: "", legalName: "", businessType: "single_clinic", contactEmail: "", contactPhone: "", website: "", countryId: "", cityId: "", addressLine1: "" }
function readEnvelope(value: unknown): Record<string, unknown> {
  let current = value
  for (let i = 0; i < 3; i += 1) {
    if (!current || typeof current !== "object" || !("data" in current)) break
    current = (current as { data: unknown }).data
  }
  return current && typeof current === "object" ? current as Record<string, unknown> : {}
}
function toForm(profile: Record<string, unknown>): ProfileForm {
  const contact = profile.contact && typeof profile.contact === "object" ? profile.contact as Record<string, unknown> : {}
  const address = profile.address && typeof profile.address === "object" ? profile.address as Record<string, unknown> : {}
  return {
    displayName: String(profile.displayName ?? profile.name ?? ""),
    legalName: String(profile.legalName ?? ""),
    businessType: String(profile.businessType ?? "single_clinic"),
    contactEmail: String(contact.email ?? profile.contactEmail ?? ""),
    contactPhone: String(contact.phone ?? profile.contactPhone ?? ""),
    website: String(contact.website ?? profile.website ?? ""),
    countryId: String(address.countryId ?? profile.countryId ?? ""),
    cityId: String(address.cityId ?? profile.cityId ?? ""),
    addressLine1: String(address.addressLine1 ?? profile.addressLine1 ?? ""),
  }
}

export function TenantOrganizationPage() {
  const { context, refresh } = useOutletContext<TenantOutletContext>()
  const { locale } = useI18n()
  const ar = locale === "ar"
  const client = useQueryClient()
  const tenant = context?.tenant
  const [values, setValues] = useState<ProfileForm>(() => toForm((tenant ?? {}) as unknown as Record<string, unknown>))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState("")
  const profileQuery = useQuery({
    queryKey: ["tenant-organization-profile"],
    queryFn: async () => {
      const response = await tenantApi.get("/tenant/profile")
      return readEnvelope(response.data)
    },
    staleTime: 30_000,
  })
  const profile = profileQuery.data ?? (tenant as unknown as Record<string, unknown> | undefined) ?? {}
  useEffect(() => { setValues(toForm(profile)) }, [profile])
  const countriesQuery = useQuery({ queryKey: ["tenant-geo", "countries"], queryFn: () => getTenantGeo("countries"), staleTime: 300_000 })
  const citiesQuery = useQuery({
    queryKey: ["tenant-geo", "cities", values.countryId],
    queryFn: () => getTenantGeo("cities", { countryId: values.countryId }),
    enabled: Boolean(values.countryId),
    staleTime: 300_000,
  })
  const countryOptions = countriesQuery.data ?? []
  const cityOptions = citiesQuery.data ?? []
  const countryName = useMemo(() => countryOptions.find(item => item.id === values.countryId)?.name_en ?? "", [countryOptions, values.countryId])
  const mutation = useMutation({
    mutationFn: async (payload: ProfileForm) => updateTenantProfile({
      displayName: payload.displayName,
      legalName: payload.legalName,
      businessType: payload.businessType,
      contact: { email: payload.contactEmail, phone: payload.contactPhone, website: payload.website },
      address: { countryId: payload.countryId, cityId: payload.cityId, addressLine1: payload.addressLine1 },
    }),
    onSuccess: async () => {
      setFormError("")
      setErrors({})
      await Promise.all([client.invalidateQueries({ queryKey: ["tenant-organization-profile"] }), refresh()])
    },
    onError: error => setFormError(error instanceof Error ? error.message : (ar ? "تعذر حفظ بيانات المؤسسة." : "Unable to save organization profile.")),
  })
  function update<K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) {
    setValues(current => ({ ...current, [key]: value }))
    setErrors(current => ({ ...current, [key]: "" }))
    setFormError("")
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const result = tenantProfileSchema.safeParse(values)
    if (!result.success) {
      setErrors(getTenantFieldErrors(result.error, ar ? "ar" : "en"))
      return
    }
    mutation.mutate(values)
  }
  const summary = [
    { label: ar ? "الاسم التجاري" : "Display name", value: values.displayName, icon: Building2 },
    { label: ar ? "الاسم القانوني" : "Legal name", value: values.legalName, icon: ShieldCheck },
    { label: ar ? "البريد الإلكتروني" : "Email", value: values.contactEmail, icon: Mail },
    { label: ar ? "رقم الهاتف" : "Phone", value: values.contactPhone, icon: Phone },
    { label: ar ? "الموقع الإلكتروني" : "Website", value: values.website, icon: Globe2 },
    { label: ar ? "الدولة" : "Country", value: countryName, icon: MapPin },
  ]
  const copy = {
    eyebrow: ar ? "إدارة المؤسسة" : "ORGANIZATION MANAGEMENT",
    title: ar ? "ملف المؤسسة" : "Organization profile",
    description: ar ? "إدارة الهوية القانونية والتجارية وبيانات التواصل والعنوان المسجل للمؤسسة." : "Manage the organization's legal and display identity, contact details and registered address.",
    save: ar ? "حفظ التغييرات" : "Save changes",
    loading: ar ? "جارٍ تحميل البيانات..." : "Loading organization profile...",
    businessType: ar ? "نوع المؤسسة" : "Organization type",
    displayName: ar ? "الاسم التجاري" : "Display name",
    legalName: ar ? "الاسم القانوني" : "Legal name",
    email: ar ? "البريد الإلكتروني الأساسي" : "Primary email",
    phone: ar ? "رقم الهاتف الأساسي" : "Primary phone",
    website: ar ? "الموقع الإلكتروني" : "Website",
    country: ar ? "الدولة" : "Country",
    city: ar ? "المدينة" : "City",
    address: ar ? "العنوان المسجل" : "Registered address",
    choose: ar ? "اختر..." : "Select...",
    single: ar ? "عيادة واحدة" : "Single clinic",
    group: ar ? "مجموعة عيادات" : "Clinic group",
    beauty: ar ? "مركز تجميل" : "Beauty center",
  }
  return <div className="space-y-7">
    <TenantPageHeading eyebrow={copy.eyebrow} title={copy.title} description={copy.description}/>
    <Card className="overflow-hidden border-white bg-white">
      <div className="h-24 bg-gradient-to-r from-[#211936] via-[#46316e] to-[#9274d5]"/>
      <CardContent className="-mt-8 p-6">
        <div className="mb-6 flex items-end gap-4"><span className="grid size-[72px] place-items-center rounded-2xl border-4 border-white bg-violet-100 text-violet-700 shadow-sm"><Building2 className="size-8"/></span><div className="pb-1"><h2 className="text-xl font-semibold">{values.displayName || tenant?.name || "—"}</h2><p className="mt-1 text-xs text-muted-foreground">{tenant?.slug || "—"}</p></div></div>
        {profileQuery.isLoading ? <p className="py-6 text-center text-sm text-muted-foreground">{copy.loading}</p> : profileQuery.isError ? <p role="alert" className="text-sm text-destructive">{profileQuery.error instanceof Error ? profileQuery.error.message : (ar ? "تعذر تحميل الملف." : "Unable to load profile.")}</p> : <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{summary.map(item => { const Icon = item.icon; return <div key={item.label} className="rounded-xl border bg-slate-50/70 p-4"><div className="flex items-center gap-2 text-xs font-medium text-muted-foreground"><Icon className="size-4"/>{item.label}</div><p className="mt-3 break-words text-sm font-semibold">{item.value || "—"}</p></div> })}</div>}
        <div className="mt-5 grid gap-4 border-t pt-5 sm:grid-cols-3">
          <ProfileValue label={ar ? "نوع المؤسسة" : "Business type"} value={String(profile.businessType ?? tenant?.businessType ?? "—").replaceAll("_", " ")}/>
          <ProfileValue label={ar ? "الصناعة" : "Industry"} value={String(profile.industry ?? tenant?.industry ?? "—")}/>
          <ProfileValue label={ar ? "حالة الحساب" : "Account status"} value={String(profile.status ?? tenant?.status ?? "—")}/>
        </div>
      </CardContent>
    </Card>
    <Card><CardContent className="p-5 sm:p-6">
      <div className="mb-5"><h2 className="font-semibold">{ar ? "تعديل بيانات المؤسسة" : "Edit organization details"}</h2><p className="mt-1 text-sm text-muted-foreground">{ar ? "يتم حفظ التغييرات على ملف المؤسسة النشط." : "Changes are saved to the active organization's profile."}</p></div>
      <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
        <ProfileField label={copy.displayName} value={values.displayName} error={errors.displayName} onChange={value => update("displayName", value)}/>
        <ProfileField label={copy.legalName} value={values.legalName} error={errors.legalName} onChange={value => update("legalName", value)}/>
        <div><Label>{copy.businessType} *</Label><Select value={values.businessType} onValueChange={value => update("businessType", value)}><SelectTrigger className="mt-2"><SelectValue placeholder={copy.choose}/></SelectTrigger><SelectContent><SelectItem value="single_clinic">{copy.single}</SelectItem><SelectItem value="clinic_group">{copy.group}</SelectItem><SelectItem value="beauty_center">{copy.beauty}</SelectItem></SelectContent></Select></div>
        <ProfileField label={copy.email} type="email" value={values.contactEmail} error={errors.contactEmail} onChange={value => update("contactEmail", value)}/>
        <ProfileField label={copy.phone} type="tel" value={values.contactPhone} error={errors.contactPhone} onChange={value => update("contactPhone", value)}/>
        <ProfileField label={copy.website} value={values.website} error={errors.website} onChange={value => update("website", value)}/>
        <div><Label>{copy.country} *</Label><Select value={values.countryId} onValueChange={value => { update("countryId", value); update("cityId", "") }}><SelectTrigger className="mt-2"><SelectValue placeholder={countriesQuery.isLoading ? (ar ? "جارٍ التحميل..." : "Loading...") : copy.choose}/></SelectTrigger><SelectContent>{countryOptions.map(item => <SelectItem key={item.id} value={item.id}>{ar ? item.name_ar || item.name_en : item.name_en}</SelectItem>)}</SelectContent></Select>{errors.countryId && <p className="mt-1 text-xs text-destructive">{errors.countryId}</p>}</div>
        <div><Label>{copy.city} *</Label><Select value={values.cityId} onValueChange={value => update("cityId", value)} disabled={!values.countryId || citiesQuery.isLoading}><SelectTrigger className="mt-2"><SelectValue placeholder={!values.countryId ? (ar ? "اختر الدولة أولاً" : "Choose a country first") : copy.choose}/></SelectTrigger><SelectContent>{cityOptions.map(item => <SelectItem key={item.id} value={item.id}>{ar ? item.name_ar || item.name_en : item.name_en}</SelectItem>)}</SelectContent></Select>{errors.cityId && <p className="mt-1 text-xs text-destructive">{errors.cityId}</p>}</div>
        <div className="sm:col-span-2"><Label>{copy.address} *</Label><Textarea value={values.addressLine1} onChange={event => update("addressLine1", event.target.value)} className="mt-2" aria-invalid={Boolean(errors.addressLine1)}/>{errors.addressLine1 && <p className="mt-1 text-xs text-destructive">{errors.addressLine1}</p>}</div>
        {formError && <p role="alert" className="text-sm text-destructive sm:col-span-2">{formError}</p>}
        {mutation.isSuccess && !formError && <p role="status" className="text-sm text-emerald-700 sm:col-span-2">{ar ? "تم حفظ بيانات المؤسسة بنجاح." : "Organization profile saved successfully."}</p>}
        <div className="flex justify-end sm:col-span-2"><Button type="submit" disabled={mutation.isPending || profileQuery.isLoading}>{mutation.isPending ? (ar ? "جارٍ الحفظ..." : "Saving...") : copy.save}</Button></div>
      </form>
    </CardContent></Card>
  </div>
}
function ProfileField({ label, value, error, onChange, type = "text" }: { label: string; value: string; error?: string; onChange: (value: string) => void; type?: "text" | "email" | "tel" }) {
  return <div><Label>{label} *</Label><Input type={type} value={value} onChange={event => onChange(event.target.value)} className="mt-2" aria-invalid={Boolean(error)}/>{error && <p className="mt-1 text-xs text-destructive">{error}</p>}</div>
}
function ProfileValue({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-sm font-semibold capitalize">{value}</p></div>
}
