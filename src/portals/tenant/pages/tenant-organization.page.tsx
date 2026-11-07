import { useEffect, useMemo, useState, type FormEvent } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Building2, Globe2, ImagePlus, Mail, MapPin, Pencil, Phone, ShieldCheck, X } from "lucide-react"
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
import { getMyTenantAccess, getTenantGeo, tenantApi, updateTenantProfile } from "../api/tenant-api"
import { appEnv } from "@/config/env"
import { tenantProfileSchema, getTenantFieldErrors } from "../features/shared/tenant-feature-schemas"

type ProfileForm = {
  displayName: string; legalName: string; businessType: string; description: string; industry: string
  contactEmail: string; contactPhone: string; alternatePhone: string; whatsapp: string; website: string; countryId: string; governorateId: string; cityId: string; districtId: string
  addressLine1: string; addressLine2: string; building: string; floor: string; unit: string; landmark: string; postalCode: string; taxNumber: string; vatNumber: string
  commercialRegistrationNumber: string; primaryColor: string; locale: string; currency: string
  timezone: string; dateFormat: string; weekStartsOn: string
}
const emptyForm: ProfileForm = {
  displayName: "", legalName: "", businessType: "single_clinic", description: "", industry: "aesthetic_medicine",
  contactEmail: "", contactPhone: "", alternatePhone: "", whatsapp: "", website: "", countryId: "", governorateId: "", cityId: "", districtId: "", addressLine1: "", addressLine2: "", building: "", floor: "", unit: "", landmark: "", postalCode: "",
  taxNumber: "", vatNumber: "", commercialRegistrationNumber: "", primaryColor: "#6d4aff",
  locale: "en", currency: "EGP", timezone: "Africa/Cairo", dateFormat: "YYYY-MM-DD", weekStartsOn: "6",
}
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
  const legal = profile.legal && typeof profile.legal === "object" ? profile.legal as Record<string, unknown> : {}
  const branding = profile.branding && typeof profile.branding === "object" ? profile.branding as Record<string, unknown> : {}
  const preferences = profile.preferences && typeof profile.preferences === "object" ? profile.preferences as Record<string, unknown> : {}
  return {
    ...emptyForm,
    displayName: String(profile.displayName ?? profile.name ?? ""),
    legalName: String(profile.legalName ?? ""),
    businessType: String(profile.businessType ?? "single_clinic"),
    description: String(profile.description ?? ""),
    industry: String(profile.industry ?? ""),
    contactEmail: String(contact.email ?? ""), contactPhone: String(contact.phone ?? ""), alternatePhone: String(contact.alternatePhone ?? ""), whatsapp: String(contact.whatsapp ?? ""), website: String(contact.website ?? ""),
    countryId: String(address.countryId ?? ""), governorateId: String(address.governorateId ?? ""), cityId: String(address.cityId ?? ""), districtId: String(address.districtId ?? ""),
    addressLine1: String(address.addressLine1 ?? ""), addressLine2: String(address.addressLine2 ?? ""), building: String(address.building ?? ""), floor: String(address.floor ?? ""), unit: String(address.unit ?? ""), landmark: String(address.landmark ?? ""), postalCode: String(address.postalCode ?? ""),
    taxNumber: String(legal.taxNumber ?? ""), vatNumber: String(legal.vatNumber ?? ""),
    commercialRegistrationNumber: String(legal.commercialRegistrationNumber ?? ""),
    primaryColor: String(branding.primaryColor ?? "#6d4aff"),
    locale: String(preferences.locale ?? "en"), currency: String(preferences.currency ?? "EGP"),
    timezone: String(preferences.timezone ?? "Africa/Cairo"), dateFormat: String(preferences.dateFormat ?? "YYYY-MM-DD"),
    weekStartsOn: String(preferences.weekStartsOn ?? 6),
  }
}
function assetUrl(path?: string) {
  if (!path) return ""
  try { return new URL(path, appEnv.apiBaseUrl).toString() } catch { return path }
}
function fileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error("Unable to read image file."))
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Unable to read image file."))
    reader.readAsDataURL(file)
  })
}
function ProfileField({ label, value, error, onChange, type = "text", required = false, maxLength }: {
  label: string; value: string; error?: string; onChange: (value: string) => void
  type?: "text" | "email" | "tel" | "url"; required?: boolean; maxLength?: number
}) {
  return <div><Label>{label}{required ? " *" : ""}</Label><Input type={type} value={value} maxLength={maxLength} onChange={event => onChange(event.target.value)} className="mt-2" aria-invalid={Boolean(error)}/>{error && <p className="mt-1 text-xs text-destructive">{error}</p>}</div>
}
function ProfileValue({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 break-words text-sm font-semibold">{value}</p></div>
}

export function TenantOrganizationPage() {
  const { context, refreshContext } = useOutletContext<TenantOutletContext>()
  const { locale } = useI18n()
  const ar = locale === "ar"
  const accessQuery = useQuery({ queryKey: ["tenant-access-me"], queryFn: getMyTenantAccess, staleTime: 60_000 })
  const canWrite = Boolean(accessQuery.data?.grants.some(grant => grant.permission === "organization.manage" && grant.scope === "tenant"))
  const isTenantOwner = accessQuery.data?.role === "tenant_owner"
  const client = useQueryClient()
  const tenant = context?.tenant
  const [values, setValues] = useState<ProfileForm>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState("")
  const [editOpen, setEditOpen] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState("")
  const [coverPreview, setCoverPreview] = useState("")

  const profileQuery = useQuery({
    queryKey: ["tenant-organization-profile"],
    queryFn: async () => readEnvelope((await tenantApi.get("/tenant/profile")).data),
    staleTime: 30_000,
    enabled: canWrite,
  })
  const profile = profileQuery.data ?? (tenant as unknown as Record<string, unknown> | undefined) ?? {}
  const branding = (profile.branding && typeof profile.branding === "object" ? profile.branding : tenant?.branding) as { logoUrl?: string; coverImageUrl?: string; primaryColor?: string } | undefined
  useEffect(() => { setValues(toForm(profile)); setLogoPreview(assetUrl(branding?.logoUrl)); setCoverPreview(assetUrl(branding?.coverImageUrl)) }, [profile, branding?.logoUrl, branding?.coverImageUrl])

  const countriesQuery = useQuery({ queryKey: ["tenant-geo", "countries"], queryFn: () => getTenantGeo("countries"), enabled: canWrite, staleTime: 300_000 })
  const governoratesQuery = useQuery({
    queryKey: ["tenant-geo", "governorates", values.countryId],
    queryFn: () => getTenantGeo("governorates", { country_id: values.countryId }),
    enabled: editOpen && Boolean(values.countryId), staleTime: 300_000,
  })
  const districtsQuery = useQuery({
    queryKey: ["tenant-geo", "districts", values.countryId, values.governorateId, values.cityId],
    queryFn: () => getTenantGeo("districts", { country_id: values.countryId, governorate_id: values.governorateId, city_id: values.cityId }),
    enabled: editOpen && Boolean(values.countryId) && Boolean(values.governorateId) && Boolean(values.cityId), staleTime: 300_000,
  })
  const citiesQuery = useQuery({
    queryKey: ["tenant-geo", "cities", values.countryId, values.governorateId],
    queryFn: () => getTenantGeo("cities", { country_id: values.countryId, governorate_id: values.governorateId }),
    enabled: editOpen && Boolean(values.countryId) && Boolean(values.governorateId), staleTime: 300_000,
  })
  const countryOptions = countriesQuery.data ?? []
  const governorateOptions = governoratesQuery.data ?? []
  const cityOptions = citiesQuery.data ?? []
  const districtOptions = districtsQuery.data ?? []
  const countryName = useMemo(() => {
    const country = countryOptions.find(item => item.id === String((profile.address as Record<string, unknown> | undefined)?.countryId ?? ""))
    return ar ? country?.name_ar || country?.name_en || "" : country?.name_en || ""
  }, [countryOptions, profile, ar])

  const mutation = useMutation({
    mutationFn: async (payload: ProfileForm) => {
      const [logoBase64, coverImageBase64] = await Promise.all([
        logoFile ? fileAsDataUrl(logoFile) : Promise.resolve(""),
        coverFile ? fileAsDataUrl(coverFile) : Promise.resolve(""),
      ])
      const contact = {
        ...(payload.contactEmail.trim() ? { email: payload.contactEmail.trim() } : {}),
        phone: payload.contactPhone.trim(),
        alternatePhone: payload.alternatePhone.trim(),
        whatsapp: payload.whatsapp.trim(),
        ...(payload.website.trim() ? { website: payload.website.trim() } : {}),
      }
      const address = {
        ...(payload.countryId ? { countryId: payload.countryId } : {}),
        ...(payload.governorateId ? { governorateId: payload.governorateId } : {}),
        ...(payload.cityId ? { cityId: payload.cityId } : {}),
        ...(payload.districtId ? { districtId: payload.districtId } : {}),
        addressLine1: payload.addressLine1.trim(),
        addressLine2: payload.addressLine2.trim(),
        building: payload.building.trim(),
        floor: payload.floor.trim(),
        unit: payload.unit.trim(),
        landmark: payload.landmark.trim(),
        postalCode: payload.postalCode.trim(),
      }
      return updateTenantProfile({
        displayName: payload.displayName.trim(),
        businessType: payload.businessType,
        description: payload.description.trim(),
        industry: payload.industry.trim(),
        ...(Object.keys(contact).length ? { contact } : {}),
        ...(Object.keys(address).length ? { address } : {}),
        ...(isTenantOwner ? {
          legalName: payload.legalName.trim(),
          legal: {
            taxNumber: payload.taxNumber.trim(),
            vatNumber: payload.vatNumber.trim(),
            commercialRegistrationNumber: payload.commercialRegistrationNumber.trim(),
          },
        } : {}),
        branding: {
          primaryColor: payload.primaryColor,
          ...(logoBase64 ? { logoBase64 } : {}),
          ...(coverImageBase64 ? { coverImageBase64 } : {}),
        },
        preferences: {
          locale: payload.locale, currency: payload.currency, timezone: payload.timezone,
          dateFormat: payload.dateFormat, weekStartsOn: Number(payload.weekStartsOn),
        },
      })
    },
    onSuccess: async updatedProfile => {
      setFormError(""); setErrors({}); setLogoFile(null); setCoverFile(null)
      client.setQueryData(["tenant-organization-profile"], readEnvelope(updatedProfile))
      await refreshContext()
      setEditOpen(false)
    },
    onError: error => setFormError(error instanceof Error ? error.message : (ar ? "تعذر حفظ بيانات المؤسسة." : "Unable to save organization profile.")),
  })

  function update<K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) {
    setValues(current => ({ ...current, [key]: value }))
    setErrors(current => ({ ...current, [key]: "" }))
    setFormError("")
  }
  function openEditor() {
    setValues(toForm(profile)); setErrors({}); setFormError("")
    setLogoFile(null); setCoverFile(null)
    setLogoPreview(assetUrl(branding?.logoUrl)); setCoverPreview(assetUrl(branding?.coverImageUrl))
    setEditOpen(true)
  }
  function closeEditor(open: boolean) {
    if (mutation.isPending) return
    setEditOpen(open)
    if (!open) { setValues(toForm(profile)); setErrors({}); setFormError(""); setLogoFile(null); setCoverFile(null) }
  }
  function selectImage(kind: "logo" | "cover", file?: File) {
    if (!file) return
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setFormError(ar ? "استخدم صورة PNG أو JPEG أو WebP." : "Use a PNG, JPEG or WebP image.")
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setFormError(ar ? "الحد الأقصى لحجم الصورة 2 ميجابايت." : "The maximum image size is 2 MB.")
      return
    }
    void fileAsDataUrl(file).then(preview => {
      if (kind === "logo") { setLogoFile(file); setLogoPreview(preview) }
      else { setCoverFile(file); setCoverPreview(preview) }
    }).catch(error => setFormError(error instanceof Error ? error.message : "Unable to preview image."))
    setFormError("")
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const result = tenantProfileSchema.safeParse(values)
    if (!result.success) { setErrors(getTenantFieldErrors(result.error, ar ? "ar" : "en")); return }
        mutation.mutate(values)
  }

  const summary = [
    { label: ar ? "الاسم التجاري" : "Display name", value: values.displayName, icon: Building2 },
    { label: ar ? "الاسم القانوني" : "Legal name", value: String(profile.legalName ?? ""), icon: ShieldCheck },
    { label: ar ? "البريد الإلكتروني" : "Email", value: String((profile.contact as Record<string, unknown> | undefined)?.email ?? ""), icon: Mail },
    { label: ar ? "رقم الهاتف" : "Phone", value: String((profile.contact as Record<string, unknown> | undefined)?.phone ?? ""), icon: Phone },
    { label: ar ? "الموقع الإلكتروني" : "Website", value: String((profile.contact as Record<string, unknown> | undefined)?.website ?? ""), icon: Globe2 },
    { label: ar ? "الدولة" : "Country", value: countryName, icon: MapPin },
  ]
  const copy = {
    eyebrow: ar ? "إدارة المؤسسة" : "ORGANIZATION MANAGEMENT",
    title: ar ? "ملف المؤسسة" : "Organization profile",
    description: ar ? "إدارة الهوية القانونية والتجارية والعلامة التجارية وبيانات التواصل والعنوان والتفضيلات الافتراضية." : "Manage legal and business identity, branding, contact details, registered address and organization defaults.",
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
  }
  return <div className="space-y-7">
    <TenantPageHeading eyebrow={copy.eyebrow} title={copy.title} description={copy.description}/>
    <Card className="overflow-hidden border-white bg-white">
      <div className="relative flex h-32 items-center justify-center overflow-hidden bg-gradient-to-r from-[#211936] via-[#46316e] to-[#9274d5]">{branding?.coverImageUrl && <img src={branding.coverImageUrl} alt="" className="h-full w-full object-cover"/>}</div>
      <CardContent className="-mt-9 p-6">
        <div className="mb-6 flex items-end gap-4"><span className="grid size-[76px] shrink-0 place-items-center overflow-hidden rounded-2xl border-4 border-white bg-white text-violet-700 shadow-sm">{branding?.logoUrl ? <img src={branding.logoUrl} alt="" className="size-full object-contain"/> : <Building2 className="size-8"/>}</span><div className="min-w-0 pb-1"><h2 className="truncate text-xl font-semibold">{String(profile.displayName ?? tenant?.name ?? "—")}</h2><p className="mt-1 text-xs text-muted-foreground">{tenant?.slug || "—"}</p></div></div>
        {profileQuery.isLoading ? <p className="py-6 text-center text-sm text-muted-foreground">{copy.loading}</p> : profileQuery.isError ? <p role="alert" className="text-sm text-destructive">{profileQuery.error instanceof Error ? profileQuery.error.message : (ar ? "تعذر تحميل الملف." : "Unable to load profile.")}</p> : <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{summary.map(item => { const Icon = item.icon; return <div key={item.label} className="rounded-xl border bg-slate-50/70 p-4"><div className="flex items-center gap-2 text-xs font-medium text-muted-foreground"><Icon className="size-4"/>{item.label}</div><p className="mt-3 break-words text-sm font-semibold">{item.value || "—"}</p></div> })}</div>}
        <div className="mt-5 grid gap-4 border-t pt-5 sm:grid-cols-3">
          <ProfileValue label={ar ? "نوع المؤسسة" : "Business type"} value={localizedValue(profile.businessType ?? tenant?.businessType, ar)}/>
          <ProfileValue label={ar ? "الصناعة" : "Industry"} value={localizedValue(profile.industry ?? tenant?.industry, ar)}/>
          <ProfileValue label={ar ? "حالة الحساب" : "Account status"} value={localizedValue(profile.status ?? tenant?.status, ar)}/>
        </div>
        {Boolean(profile.description) && <p className="mt-4 max-w-4xl whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{String(profile.description)}</p>}
      </CardContent>
    </Card>
    {accessQuery.isError && <p role="alert" className="text-sm text-destructive">{accessQuery.error instanceof Error ? accessQuery.error.message : (ar ? "تعذر التحقق من صلاحيات المؤسسة." : "Unable to verify organization permissions.")}</p>}
    {canWrite && <div className="flex justify-end"><Button type="button" onClick={openEditor} disabled={profileQuery.isLoading}><Pencil className="me-2 size-4"/>{ar ? "تعديل بيانات المؤسسة" : "Edit organization"}</Button></div>}
    <Dialog open={editOpen} onOpenChange={closeEditor}>
      <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto">
        <DialogHeader><DialogTitle>{ar ? "تعديل بيانات المؤسسة" : "Edit organization details"}</DialogTitle><DialogDescription>{ar ? "يتم حفظ التغييرات على المؤسسة النشطة مع الحفاظ على الإعدادات غير المعدلة." : "Changes are saved to the active organization while preserving settings you do not change."}</DialogDescription></DialogHeader>
        <form onSubmit={submit} noValidate className="space-y-7">
          <section className="space-y-4"><div><h3 className="font-semibold">{ar ? "الهوية التجارية" : "Business identity"}</h3><p className="text-xs text-muted-foreground">{ar ? "البيانات التعريفية والتجارية للمؤسسة." : "Organization identity and business details."}</p></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <ProfileField label={copy.displayName} value={values.displayName} error={errors.displayName} onChange={value => update("displayName", value)} required maxLength={160}/>
              {isTenantOwner && <ProfileField label={copy.legalName} value={values.legalName} error={errors.legalName} onChange={value => update("legalName", value)} maxLength={200}/>}
              <div><Label>{copy.businessType} *</Label><Select value={values.businessType} onValueChange={value => update("businessType", value)}><SelectTrigger className="mt-2" aria-invalid={Boolean(errors.businessType)}><SelectValue placeholder={copy.choose}/></SelectTrigger><SelectContent><SelectItem value="single_clinic">{ar ? "عيادة واحدة" : "Single clinic"}</SelectItem><SelectItem value="clinic_group">{ar ? "مجموعة عيادات" : "Clinic group"}</SelectItem><SelectItem value="medical_center">{ar ? "مركز طبي" : "Medical center"}</SelectItem></SelectContent></Select>{errors.businessType && <p className="mt-1 text-xs text-destructive">{errors.businessType}</p>}</div>
              <ProfileField label={ar ? "الصناعة" : "Industry"} value={values.industry} error={errors.industry} onChange={value => update("industry", value)} maxLength={100}/>
              <div className="sm:col-span-2"><Label>{ar ? "وصف المؤسسة" : "Organization description"}</Label><Textarea value={values.description} maxLength={2000} onChange={event => update("description", event.target.value)} className="mt-2 min-h-24" aria-invalid={Boolean(errors.description)}/>{errors.description && <p className="mt-1 text-xs text-destructive">{errors.description}</p>}</div>
            </div>
          </section>
          <section className="space-y-4 border-t pt-5"><div><h3 className="font-semibold">{ar ? "بيانات التواصل والعنوان" : "Contact & registered address"}</h3></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <ProfileField label={copy.email} type="email" value={values.contactEmail} error={errors.contactEmail} onChange={value => update("contactEmail", value)}/>
              <ProfileField label={copy.phone} type="tel" value={values.contactPhone} error={errors.contactPhone} onChange={value => update("contactPhone", value)}/>
              <ProfileField label={ar ? "رقم الهاتف البديل" : "Alternate phone"} type="tel" value={values.alternatePhone} error={errors.alternatePhone} onChange={value => update("alternatePhone", value)}/>
              <ProfileField label="WhatsApp" type="tel" value={values.whatsapp} error={errors.whatsapp} onChange={value => update("whatsapp", value)}/>
              <ProfileField label={copy.website} type="url" value={values.website} error={errors.website} onChange={value => update("website", value)}/>
              <p className="text-xs text-muted-foreground sm:col-span-2">{ar ? "ملاحظة: واجهة API الحالية لا تدعم مسح البريد الإلكتروني أو الموقع؛ ترك أي منهما فارغاً يحافظ على القيمة المحفوظة." : "Note: the current API does not support clearing email or website; leaving either blank preserves its saved value."}</p>
              <div><Label>{copy.country}</Label><Select value={values.countryId} onValueChange={value => { setValues(current => ({ ...current, countryId: value, governorateId: "", cityId: "", districtId: "" })); setErrors(current => ({ ...current, countryId: "", governorateId: "", cityId: "", districtId: "" })) }}><SelectTrigger className="mt-2"><SelectValue placeholder={countriesQuery.isLoading ? (ar ? "جارٍ التحميل..." : "Loading...") : copy.choose}/></SelectTrigger><SelectContent>{countryOptions.map(item => <SelectItem key={item.id} value={item.id}>{ar ? item.name_ar || item.name_en : item.name_en}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>{copy.governorate}</Label><Select value={values.governorateId} onValueChange={value => { setValues(current => ({ ...current, governorateId: value, cityId: "", districtId: "" })); setErrors(current => ({ ...current, governorateId: "", cityId: "", districtId: "" })) }} disabled={!values.countryId || governoratesQuery.isLoading}><SelectTrigger className="mt-2"><SelectValue placeholder={!values.countryId ? (ar ? "اختر الدولة أولاً" : "Choose a country first") : copy.choose}/></SelectTrigger><SelectContent>{governorateOptions.map(item => <SelectItem key={item.id} value={item.id}>{ar ? item.name_ar || item.name_en : item.name_en}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>{copy.city}</Label><Select value={values.cityId} onValueChange={value => { setValues(current => ({ ...current, cityId: value, districtId: "" })); setErrors(current => ({ ...current, cityId: "", districtId: "" })) }} disabled={!values.governorateId || citiesQuery.isLoading}><SelectTrigger className="mt-2"><SelectValue placeholder={!values.governorateId ? (ar ? "اختر المحافظة أولاً" : "Choose a governorate first") : copy.choose}/></SelectTrigger><SelectContent>{cityOptions.map(item => <SelectItem key={item.id} value={item.id}>{ar ? item.name_ar || item.name_en : item.name_en}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>{copy.district}</Label><Select value={values.districtId} onValueChange={value => update("districtId", value)} disabled={!values.cityId || districtsQuery.isLoading}><SelectTrigger className="mt-2"><SelectValue placeholder={!values.cityId ? (ar ? "اختر المدينة أولاً" : "Choose a city first") : copy.choose}/></SelectTrigger><SelectContent>{districtOptions.map(item => <SelectItem key={item.id} value={item.id}>{ar ? item.name_ar || item.name_en : item.name_en}</SelectItem>)}</SelectContent></Select></div>
              <ProfileField label={copy.address} value={values.addressLine1} error={errors.addressLine1} onChange={value => update("addressLine1", value)} maxLength={255}/>
              <ProfileField label={ar ? "العنوان التفصيلي" : "Address line 2"} value={values.addressLine2} error={errors.addressLine2} onChange={value => update("addressLine2", value)} maxLength={255}/>
              <ProfileField label={ar ? "المبنى" : "Building"} value={values.building} error={errors.building} onChange={value => update("building", value)} maxLength={100}/>
              <ProfileField label={ar ? "الدور" : "Floor"} value={values.floor} error={errors.floor} onChange={value => update("floor", value)} maxLength={50}/>
              <ProfileField label={ar ? "الوحدة" : "Unit"} value={values.unit} error={errors.unit} onChange={value => update("unit", value)} maxLength={50}/>
              <ProfileField label={ar ? "علامة مميزة" : "Landmark"} value={values.landmark} error={errors.landmark} onChange={value => update("landmark", value)} maxLength={255}/>
              <ProfileField label={ar ? "الرمز البريدي" : "Postal code"} value={values.postalCode} error={errors.postalCode} onChange={value => update("postalCode", value)} maxLength={30}/>
              {(countriesQuery.isError || governoratesQuery.isError || citiesQuery.isError || districtsQuery.isError) && <p role="alert" className="text-sm text-destructive sm:col-span-2">{ar ? "تعذر تحميل خيارات الموقع الجغرافي." : "Unable to load geographic options."}</p>}
            </div>
          </section>
          {isTenantOwner && <section className="space-y-4 border-t pt-5"><div><h3 className="font-semibold">{ar ? "الهوية القانونية والضريبية" : "Legal & tax identity"}</h3><p className="text-xs text-muted-foreground">{ar ? "تعديل هذه البيانات متاح لمالك المؤسسة فقط." : "Only the tenant owner can edit these legal identity fields."}</p></div>
            <div className="grid gap-4 sm:grid-cols-2"><ProfileField label={ar ? "رقم التسجيل التجاري" : "Commercial registration number"} value={values.commercialRegistrationNumber} error={errors.commercialRegistrationNumber} onChange={value => update("commercialRegistrationNumber", value)} maxLength={100}/><ProfileField label={ar ? "الرقم الضريبي" : "Tax number"} value={values.taxNumber} error={errors.taxNumber} onChange={value => update("taxNumber", value)} maxLength={100}/><ProfileField label={ar ? "رقم ضريبة القيمة المضافة" : "VAT number"} value={values.vatNumber} error={errors.vatNumber} onChange={value => update("vatNumber", value)} maxLength={100}/></div>
          </section>}
          <section className="space-y-4 border-t pt-5"><div><h3 className="font-semibold">{ar ? "العلامة التجارية" : "Branding"}</h3><p className="text-xs text-muted-foreground">{ar ? "صور PNG أو JPEG أو WebP بحد أقصى 2 ميجابايت لكل صورة." : "PNG, JPEG or WebP images up to 2 MB each."}</p></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>{ar ? "شعار المؤسسة" : "Organization logo"}</Label><div className="mt-2 flex items-center gap-3"><div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl border bg-muted">{logoPreview ? <img src={logoPreview} alt="" className="size-full object-contain"/> : <ImagePlus className="size-6 text-muted-foreground"/>}</div><Input type="file" accept="image/png,image/jpeg,image/webp" className="max-w-full" onChange={event => selectImage("logo", event.target.files?.[0])}/>{logoFile && <Button type="button" size="icon" variant="ghost" onClick={() => { setLogoFile(null); setLogoPreview(assetUrl(branding?.logoUrl)) }}><X className="size-4"/></Button>}</div></div>
              <div><Label>{ar ? "صورة الغلاف" : "Cover image"}</Label><div className="mt-2 flex items-center gap-3"><div className="grid h-16 min-w-24 flex-1 place-items-center overflow-hidden rounded-xl border bg-muted">{coverPreview ? <img src={coverPreview} alt="" className="size-full object-cover"/> : <ImagePlus className="size-6 text-muted-foreground"/>}</div><Input type="file" accept="image/png,image/jpeg,image/webp" onChange={event => selectImage("cover", event.target.files?.[0])}/>{coverFile && <Button type="button" size="icon" variant="ghost" onClick={() => { setCoverFile(null); setCoverPreview(assetUrl(branding?.coverImageUrl)) }}><X className="size-4"/></Button>}</div></div>
              <div><Label>{ar ? "اللون الأساسي" : "Primary color"}</Label><div className="mt-2 flex items-center gap-3"><Input type="color" value={values.primaryColor} onChange={event => update("primaryColor", event.target.value)} className="h-11 w-16 p-1"/><Input value={values.primaryColor} maxLength={7} onChange={event => update("primaryColor", event.target.value)} aria-invalid={Boolean(errors.primaryColor)}/></div>{errors.primaryColor && <p className="mt-1 text-xs text-destructive">{errors.primaryColor}</p>}</div>
            </div>
          </section>
          <section className="space-y-4 border-t pt-5"><div><h3 className="font-semibold">{ar ? "التفضيلات الافتراضية للمؤسسة" : "Organization defaults"}</h3><p className="text-xs text-muted-foreground">{ar ? "تُستخدم هذه القيم كإعدادات افتراضية للمؤسسة ولا تستبدل إعدادات المناطق الزمنية الخاصة بالعيادات والفروع." : "These defaults apply at organization level; clinic and branch timezones remain independent."}</p></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>{ar ? "لغة المؤسسة" : "Organization language"}</Label><Select value={values.locale} onValueChange={value => update("locale", value)}><SelectTrigger className="mt-2"><SelectValue/></SelectTrigger><SelectContent>{!["en", "ar"].includes(values.locale) && <SelectItem value={values.locale}>{values.locale}</SelectItem>}<SelectItem value="en">English</SelectItem><SelectItem value="ar">العربية</SelectItem></SelectContent></Select></div>
              <div><Label>{ar ? "العملة الافتراضية" : "Default currency"}</Label><Select value={values.currency} onValueChange={value => update("currency", value)}><SelectTrigger className="mt-2"><SelectValue/></SelectTrigger><SelectContent>{!["EGP", "SAR", "AED", "USD"].includes(values.currency) && <SelectItem value={values.currency}>{values.currency}</SelectItem>}<SelectItem value="EGP">EGP — Egyptian Pound</SelectItem><SelectItem value="SAR">SAR — Saudi Riyal</SelectItem><SelectItem value="AED">AED — UAE Dirham</SelectItem><SelectItem value="USD">USD — US Dollar</SelectItem></SelectContent></Select></div>
              <ProfileField label={ar ? "المنطقة الزمنية (IANA)" : "Timezone (IANA)"} value={values.timezone} error={errors.timezone} onChange={value => update("timezone", value)}/>
              <div><Label>{ar ? "تنسيق التاريخ" : "Date format"}</Label><Select value={values.dateFormat} onValueChange={value => update("dateFormat", value)}><SelectTrigger className="mt-2"><SelectValue/></SelectTrigger><SelectContent>{!["YYYY-MM-DD", "DD/MM/YYYY", "MM/DD/YYYY"].includes(values.dateFormat) && <SelectItem value={values.dateFormat}>{values.dateFormat}</SelectItem>}<SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem><SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem><SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem></SelectContent></Select></div>
              <div><Label>{ar ? "بداية الأسبوع" : "Week starts on"}</Label><Select value={values.weekStartsOn} onValueChange={value => update("weekStartsOn", value)}><SelectTrigger className="mt-2"><SelectValue/></SelectTrigger><SelectContent>{[["0","Sunday","الأحد"],["1","Monday","الاثنين"],["2","Tuesday","الثلاثاء"],["3","Wednesday","الأربعاء"],["4","Thursday","الخميس"],["5","Friday","الجمعة"],["6","Saturday","السبت"]].map(([value,en,arLabel]) => <SelectItem key={value} value={value}>{ar ? arLabel : en}</SelectItem>)}</SelectContent></Select></div>
            </div>
          </section>
          {formError && <p role="alert" className="text-sm text-destructive">{formError}</p>}
          <DialogFooter className="border-t pt-4"><Button type="button" variant="outline" disabled={mutation.isPending} onClick={() => closeEditor(false)}>{ar ? "إلغاء" : "Cancel"}</Button><Button type="submit" disabled={mutation.isPending || profileQuery.isLoading}>{mutation.isPending ? (ar ? "جارٍ الحفظ..." : "Saving...") : copy.save}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
}
