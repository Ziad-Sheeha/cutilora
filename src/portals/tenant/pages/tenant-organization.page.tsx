import { useEffect, useMemo, useState, type FormEvent } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Building2, Globe2, Mail, MapPin, Pencil, Phone, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useI18n } from "@/i18n/i18n-provider"
import { TenantPageHeading } from "../components/tenant-page-heading"
import type { TenantOutletContext } from "../layout/tenant-layout"
import { useOutletContext } from "react-router"
import { getTenantGeo, tenantApi, updateTenantProfile } from "../api/tenant-api"
import { canManageOrganization } from "../auth/tenant-permissions"
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
  const record = current && typeof current === "object" ? current as Record<string, unknown> : {}
  const nested = record.profile ?? record.tenant
  return nested && typeof nested === "object" ? nested as Record<string, unknown> : record
}
function localizedValue(value: unknown, ar: boolean) {
  const key = String(value ?? "").toLowerCase()
  const values: Record<string, [string, string]> = {
    single_clinic: ["Single clinic", "عيادة واحدة"], clinic_group: ["Clinic group", "مجموعة عيادات"], medical_center: ["Medical center", "مركز طبي"],
    aesthetic_medicine: ["Aesthetic medicine", "الطب التجميلي"], active: ["Active", "نشط"], inactive: ["Inactive", "غير نشط"],
    suspended: ["Suspended", "موقوف"], pending: ["Pending", "قيد الانتظار"], trial: ["Trial", "تجريبي"],
  }
  return values[key]?.[ar ? 1 : 0] ?? String(value ?? "—").replaceAll("_", " ")
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
  const canWrite = canManageOrganization()
  const isTenantOwner = context?.access.role === "tenant_owner"
  const client = useQueryClient()
  const tenant = context?.tenant
  const [values, setValues] = useState<ProfileForm>(() => toForm((tenant ?? {}) as unknown as Record<string, unknown>))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState("")
  const [editOpen, setEditOpen] = useState(false)
  const profileQuery = useQuery({
    queryKey: ["tenant-organization-profile"],
    queryFn: async () => {
      const response = await tenantApi.get("/tenant/profile")
      return readEnvelope(response.data)
    },
    staleTime: 30_000,
  })
  const profile = profileQuery.data ?? (tenant as unknown as Record<string, unknown> | undefined) ?? {}
  const branding = (profile.branding && typeof profile.branding === "object" ? profile.branding : tenant?.branding) as { logoUrl?: string; coverImageUrl?: string } | undefined
  useEffect(() => { setValues(toForm(profile)) }, [profile])
  const countriesQuery = useQuery({ queryKey: ["tenant-geo", "countries"], queryFn: () => getTenantGeo("countries"), staleTime: 300_000 })
  const citiesQuery = useQuery({
    queryKey: ["tenant-geo", "cities", values.countryId],
    queryFn: () => getTenantGeo("cities", { country_id: values.countryId }),
    enabled: Boolean(values.countryId),
    staleTime: 300_000,
  })
  const countryOptions = countriesQuery.data ?? []
  const cityOptions = citiesQuery.data ?? []
  const countryName = useMemo(() => { const country = countryOptions.find(item => item.id === values.countryId); return ar ? country?.name_ar || country?.name_en || "" : country?.name_en || "" }, [countryOptions, values.countryId, ar])
  const mutation = useMutation({
    mutationFn: async (payload: ProfileForm) => updateTenantProfile({
      displayName: payload.displayName,
      ...(isTenantOwner ? { legalName: payload.legalName } : {}),
      businessType: payload.businessType,
      contact: {
        ...(payload.contactEmail.trim() ? { email: payload.contactEmail.trim() } : {}),
        ...(payload.contactPhone.trim() ? { phone: payload.contactPhone.trim() } : {}),
        ...(payload.website.trim() ? { website: payload.website.trim() } : {}),
      },
      address: {
        ...(payload.countryId ? { countryId: payload.countryId } : {}),
        ...(payload.cityId ? { cityId: payload.cityId } : {}),
        ...(payload.addressLine1.trim() ? { addressLine1: payload.addressLine1.trim() } : {}),
      },
    }),
    onSuccess: async () => {
      setFormError("")
      setErrors({})
      await Promise.all([client.invalidateQueries({ queryKey: ["tenant-organization-profile"] }), refresh()])
      setEditOpen(false)
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
    medical: ar ? "مركز طبي" : "Medical center",
  }
  return <div className="space-y-7">
    <TenantPageHeading eyebrow={copy.eyebrow} title={copy.title} description={copy.description}/>
    <Card className="overflow-hidden border-white bg-white">
      <div className="flex h-24 items-center justify-center overflow-hidden bg-gradient-to-r from-[#211936] via-[#46316e] to-[#9274d5]">{branding?.coverImageUrl && <img src={branding.coverImageUrl} alt="" className="h-full w-full object-contain" />}</div>
      <CardContent className="-mt-8 p-6">
        <div className="mb-6 flex items-end gap-4"><span className="grid size-[72px] place-items-center overflow-hidden rounded-2xl border-4 border-white bg-white text-violet-700 shadow-sm">{branding?.logoUrl ? <img src={branding.logoUrl} alt="" className="size-full object-contain"/> : <Building2 className="size-8"/>}</span><div className="pb-1"><h2 className="text-xl font-semibold">{values.displayName || tenant?.name || "—"}</h2><p className="mt-1 text-xs text-muted-foreground">{tenant?.slug || "—"}</p></div></div>
        {profileQuery.isLoading ? <p className="py-6 text-center text-sm text-muted-foreground">{copy.loading}</p> : profileQuery.isError ? <p role="alert" className="text-sm text-destructive">{profileQuery.error instanceof Error ? profileQuery.error.message : (ar ? "تعذر تحميل الملف." : "Unable to load profile.")}</p> : <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{summary.map(item => { const Icon = item.icon; return <div key={item.label} className="rounded-xl border bg-slate-50/70 p-4"><div className="flex items-center gap-2 text-xs font-medium text-muted-foreground"><Icon className="size-4"/>{item.label}</div><p className="mt-3 break-words text-sm font-semibold">{item.value || "—"}</p></div> })}</div>}
        <div className="mt-5 grid gap-4 border-t pt-5 sm:grid-cols-3">
          <ProfileValue label={ar ? "نوع المؤسسة" : "Business type"} value={localizedValue(profile.businessType ?? tenant?.businessType, ar)}/>
          <ProfileValue label={ar ? "الصناعة" : "Industry"} value={localizedValue(profile.industry ?? tenant?.industry, ar)}/>
          <ProfileValue label={ar ? "حالة الحساب" : "Account status"} value={localizedValue(profile.status ?? tenant?.status, ar)}/>
        </div>
      </CardContent>
    </Card>
    {canWrite && <div className="flex justify-end">
      <Button type="button" onClick={() => { setValues(toForm(profile)); setErrors({}); setFormError(""); setEditOpen(true) }}><Pencil className="me-2 size-4"/>{ar ? "تعديل بيانات المؤسسة" : "Edit organization"}</Button>
    </div>}
    <Dialog open={editOpen} onOpenChange={(open) => { if (!mutation.isPending) { setEditOpen(open); if (!open) { setValues(toForm(profile)); setErrors({}); setFormError("") } } }}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader><DialogTitle>{ar ? "تعديل بيانات المؤسسة" : "Edit organization details"}</DialogTitle><DialogDescription>{ar ? "يتم حفظ التغييرات على ملف المؤسسة النشط." : "Changes are saved to the active organization's profile."}</DialogDescription></DialogHeader>
      <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
        <ProfileField label={copy.displayName} value={values.displayName} error={errors.displayName} onChange={value => update("displayName", value)}/>
        {isTenantOwner && <ProfileField label={copy.legalName} value={values.legalName} error={errors.legalName} onChange={value => update("legalName", value)} required={false}/>}
        <div><Label>{copy.businessType} *</Label><Select value={values.businessType} onValueChange={value => update("businessType", value)}><SelectTrigger className="mt-2" aria-invalid={Boolean(errors.businessType)}><SelectValue placeholder={copy.choose}/></SelectTrigger><SelectContent><SelectItem value="single_clinic">{copy.single}</SelectItem><SelectItem value="clinic_group">{copy.group}</SelectItem><SelectItem value="medical_center">{copy.medical}</SelectItem></SelectContent></Select>{errors.businessType && <p className="mt-1 text-xs text-destructive">{errors.businessType}</p>}</div>
        <ProfileField label={copy.email} type="email" value={values.contactEmail} error={errors.contactEmail} onChange={value => update("contactEmail", value)} required={false}/>
        <ProfileField label={copy.phone} type="tel" value={values.contactPhone} error={errors.contactPhone} onChange={value => update("contactPhone", value)} required={false}/>
        <ProfileField label={copy.website} value={values.website} error={errors.website} onChange={value => update("website", value)} required={false}/>
        <div><Label>{copy.country}</Label><Select value={values.countryId} onValueChange={value => { update("countryId", value); update("cityId", "") }}><SelectTrigger className="mt-2" aria-invalid={Boolean(errors.countryId)}><SelectValue placeholder={countriesQuery.isLoading ? (ar ? "جارٍ التحميل..." : "Loading...") : copy.choose}/></SelectTrigger><SelectContent>{countryOptions.map(item => <SelectItem key={item.id} value={item.id}>{ar ? item.name_ar || item.name_en : item.name_en}</SelectItem>)}</SelectContent></Select>{errors.countryId && <p className="mt-1 text-xs text-destructive">{errors.countryId}</p>}</div>
        <div><Label>{copy.city}</Label><Select value={values.cityId} onValueChange={value => update("cityId", value)} disabled={!values.countryId || citiesQuery.isLoading}><SelectTrigger className="mt-2" aria-invalid={Boolean(errors.cityId)}><SelectValue placeholder={!values.countryId ? (ar ? "اختر الدولة أولاً" : "Choose a country first") : copy.choose}/></SelectTrigger><SelectContent>{cityOptions.map(item => <SelectItem key={item.id} value={item.id}>{ar ? item.name_ar || item.name_en : item.name_en}</SelectItem>)}</SelectContent></Select>{errors.cityId && <p className="mt-1 text-xs text-destructive">{errors.cityId}</p>}</div>
        <div className="sm:col-span-2"><Label>{copy.address}</Label><Textarea value={values.addressLine1} onChange={event => update("addressLine1", event.target.value)} className="mt-2" aria-invalid={Boolean(errors.addressLine1)}/>{errors.addressLine1 && <p className="mt-1 text-xs text-destructive">{errors.addressLine1}</p>}</div>
        {(countriesQuery.isError || citiesQuery.isError) && <p role="alert" className="text-sm text-destructive sm:col-span-2">{ar ? "تعذر تحميل خيارات الموقع الجغرافي. حدّث الصفحة وحاول مرة أخرى." : "Unable to load location options. Refresh the page and try again."}</p>}
        {formError && <p role="alert" className="text-sm text-destructive sm:col-span-2">{formError}</p>}
        {mutation.isSuccess && !formError && <p role="status" className="text-sm text-emerald-700 sm:col-span-2">{ar ? "تم حفظ بيانات المؤسسة بنجاح." : "Organization profile saved successfully."}</p>}
        <DialogFooter className="sm:col-span-2">
          <Button type="button" variant="outline" disabled={mutation.isPending} onClick={() => { setValues(toForm(profile)); setErrors({}); setFormError(""); setEditOpen(false) }}>{ar ? "إلغاء" : "Cancel"}</Button>
          <Button type="submit" disabled={mutation.isPending || profileQuery.isLoading}>{mutation.isPending ? (ar ? "جارٍ الحفظ..." : "Saving...") : copy.save}</Button>
        </DialogFooter>
      </form>
      </DialogContent>
    </Dialog>
  </div>
}
function ProfileField({ label, value, error, onChange, type = "text", required = true }: { label: string; value: string; error?: string; onChange: (value: string) => void; type?: "text" | "email" | "tel"; required?: boolean }) {
  return <div><Label>{label}{required ? " *" : ""}</Label><Input type={type} value={value} onChange={event => onChange(event.target.value)} className="mt-2" aria-invalid={Boolean(error)}/>{error && <p className="mt-1 text-xs text-destructive">{error}</p>}</div>
}
function ProfileValue({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-sm font-semibold capitalize">{value}</p></div>
}
