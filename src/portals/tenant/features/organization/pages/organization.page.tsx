import { useEffect, useState, type FormEvent } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Building2, Globe2, ImagePlus, Mail, MapPin, Pencil, Phone, ShieldCheck, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { PhoneNumberField } from "@/components/ui/phone-number-field"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useI18n } from "@/i18n/i18n-provider"
import { TenantPageHeading } from "@/portals/tenant/components/tenant-page-heading"
import type { TenantOutletContext } from "@/portals/tenant/layout/tenant-layout"
import { useOutletContext } from "react-router"
import { getMyTenantAccess, getTenantGeo, tenantApi, updateTenantProfile } from "@/portals/tenant/api/tenant-api"
import { tenantProfileSchema, getTenantFieldErrors } from "@/portals/tenant/features/shared/tenant-feature-schemas"
import { assetUrl, emptyForm, fileAsDataUrl, localizedValue, phoneParts, readEnvelope, toForm, toInternationalPhone, type ProfileForm } from "@/portals/tenant/features/organization/utils/profile-form.utils"
import { ProfileField } from "@/portals/tenant/features/organization/components/profile-field"

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
  const [phoneCodes, setPhoneCodes] = useState({ phone: "+20", alternatePhone: "+20", whatsapp: "+20" })
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
  useEffect(() => { setValues(toForm(profile)); const contact = profile.contact && typeof profile.contact === "object" ? profile.contact as Record<string, unknown> : {}; setPhoneCodes({ phone: phoneParts(contact.phone).code, alternatePhone: phoneParts(contact.alternatePhone).code, whatsapp: phoneParts(contact.whatsapp).code }); setLogoPreview(assetUrl(branding?.logoUrl)); setCoverPreview(assetUrl(branding?.coverImageUrl)) }, [profile, branding?.logoUrl, branding?.coverImageUrl])

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
  const mutation = useMutation({
    mutationFn: async (payload: ProfileForm) => {
      const [logoBase64, coverImageBase64] = await Promise.all([
        logoFile ? fileAsDataUrl(logoFile) : Promise.resolve(""),
        coverFile ? fileAsDataUrl(coverFile) : Promise.resolve(""),
      ])
      const contact = {
        ...(payload.contactEmail.trim() ? { email: payload.contactEmail.trim() } : {}),
        phone: toInternationalPhone(payload.contactPhone, phoneCodes.phone),
        alternatePhone: toInternationalPhone(payload.alternatePhone, phoneCodes.alternatePhone),
        whatsapp: toInternationalPhone(payload.whatsapp, phoneCodes.whatsapp),
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
    governorate: ar ? "المحافظة" : "Governorate",
    city: ar ? "المدينة" : "City",
    district: ar ? "الحي" : "District",
    address: ar ? "العنوان المسجل" : "Registered address",
    choose: ar ? "اختر..." : "Select...",
  }
  const contact = (profile.contact && typeof profile.contact === "object" ? profile.contact : {}) as Record<string, unknown>
  const address = (profile.address && typeof profile.address === "object" ? profile.address : {}) as Record<string, unknown>
  const legal = (profile.legal && typeof profile.legal === "object" ? profile.legal : {}) as Record<string, unknown>
  const preferences = (profile.preferences && typeof profile.preferences === "object" ? profile.preferences : {}) as Record<string, unknown>
  const logoUrl = assetUrl(branding?.logoUrl)
  const coverUrl = assetUrl(branding?.coverImageUrl)
  const display = (value: unknown) => value === null || value === undefined || value === "" ? "—" : String(value)
  const weekDay = Number(preferences.weekStartsOn ?? 0)
  const weekDays = ar ? ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"] : ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const detailGroups: Array<{ title: string; description: string; items: Array<[string, unknown]> }> = [
    { title: ar ? "الهوية القانونية والتجارية" : "Business & legal identity", description: ar ? "بيانات التسجيل والتصنيف الخاصة بالمؤسسة" : "Registered identity and business classification", items: [
      [ar ? "الاسم التجاري" : "Display name", profile.displayName ?? profile.name],
      [ar ? "الاسم القانوني" : "Legal name", profile.legalName],
      [ar ? "الاسم المسجل" : "Registered name", profile.name],
      [ar ? "المعرّف المختصر" : "Workspace slug", profile.slug],
      [ar ? "نوع المؤسسة" : "Business type", localizedValue(profile.businessType, ar)],
      [ar ? "النشاط" : "Industry", localizedValue(profile.industry, ar)],
      [ar ? "الحالة" : "Account status", localizedValue(profile.status, ar)],
      [ar ? "الوصف" : "Description", profile.description],
      [ar ? "رقم السجل التجاري" : "Commercial registration", legal.commercialRegistrationNumber],
      [ar ? "الرقم الضريبي" : "Tax number", legal.taxNumber],
      [ar ? "رقم ضريبة القيمة المضافة" : "VAT number", legal.vatNumber],
    ] },
    { title: ar ? "بيانات التواصل" : "Contact information", description: ar ? "قنوات التواصل الرسمية للمؤسسة" : "Official organization contact channels", items: [
      ["Email", contact.email], [ar ? "الهاتف الأساسي" : "Primary phone", contact.phone],
      [ar ? "الهاتف البديل" : "Alternate phone", contact.alternatePhone], ["WhatsApp", contact.whatsapp],
      [ar ? "الموقع الإلكتروني" : "Website", contact.website],
    ] },
    { title: ar ? "العنوان المسجل" : "Registered address", description: ar ? "تفاصيل الموقع والعنوان البريدي" : "Geographic and postal address details", items: [
      [ar ? "الدولة (المعرّف)" : "Country ID", address.countryId], [ar ? "المحافظة (المعرّف)" : "Governorate ID", address.governorateId],
      [ar ? "المدينة (المعرّف)" : "City ID", address.cityId], [ar ? "الحي (المعرّف)" : "District ID", address.districtId],
      [ar ? "العنوان" : "Address line 1", address.addressLine1], [ar ? "العنوان الإضافي" : "Address line 2", address.addressLine2],
      [ar ? "المبنى" : "Building", address.building], [ar ? "الدور" : "Floor", address.floor],
      [ar ? "الوحدة" : "Unit", address.unit], [ar ? "علامة مميزة" : "Landmark", address.landmark],
      [ar ? "الرمز البريدي" : "Postal code", address.postalCode],
      [ar ? "خط العرض" : "Latitude", address.latitude], [ar ? "خط الطول" : "Longitude", address.longitude],
    ] },
    { title: ar ? "تفضيلات المؤسسة" : "Organization preferences", description: ar ? "الإعدادات الافتراضية للغة والتوقيت والتنسيق" : "Default language, currency and regional settings", items: [
      [ar ? "اللغة" : "Locale", preferences.locale], [ar ? "العملات" : "Currency", preferences.currency],
      [ar ? "المنطقة الزمنية" : "Timezone", preferences.timezone], [ar ? "تنسيق التاريخ" : "Date format", preferences.dateFormat],
      [ar ? "بداية الأسبوع" : "Week starts on", weekDays[weekDay] ?? display(preferences.weekStartsOn)],
      [ar ? "اللغات المدعومة" : "Supported languages", Array.isArray(preferences.supportedLanguages) ? preferences.supportedLanguages.join(" · ") : "—"],
    ] },
  ]
  return <div className="space-y-7">
    <TenantPageHeading eyebrow={copy.eyebrow} title={copy.title} description={copy.description}/>
    <Card className="overflow-hidden border-border/70 bg-white shadow-sm">
      <div className="relative h-44 overflow-hidden bg-gradient-to-r from-[#171326] via-[#43316c] to-[#9274d5] sm:h-56">
        {coverUrl ? <img crossOrigin="anonymous" src={coverUrl} alt={ar ? "غلاف المؤسسة" : "Organization cover"} className="absolute inset-0 size-full object-cover" onError={event => { event.currentTarget.style.display = "none" }}/> : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10"/>
        <div className="absolute bottom-4 end-5 flex items-center gap-2 rounded-full border border-white/25 bg-black/20 px-3 py-1.5 text-xs font-medium text-white backdrop-blur"><span className="size-2 rounded-full bg-emerald-400"/>{localizedValue(profile.status ?? tenant?.status, ar)}</div>
      </div>
      <CardContent className="relative px-5 pb-6 sm:px-7">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex min-w-0 items-end gap-4">
            <div className="-mt-12 grid size-24 shrink-0 place-items-center overflow-hidden rounded-2xl border-4 border-white bg-white shadow-lg ring-1 ring-black/5">
              {logoUrl ? <img crossOrigin="anonymous" src={logoUrl} alt={ar ? "شعار المؤسسة" : "Organization logo"} className="size-full object-contain p-2" onError={event => { event.currentTarget.style.display = "none" }}/> : <Building2 className="size-9 text-violet-600"/>}
            </div>
            <div className="min-w-0 pb-1">
              <p className="text-[11px] font-semibold uppercase tracking-[.18em] text-violet-600">{ar ? "مساحة المؤسسة" : "ORGANIZATION WORKSPACE"}</p>
              <h2 className="mt-1 truncate text-2xl font-bold tracking-tight text-slate-950">{display(profile.displayName ?? tenant?.displayName ?? profile.name)}</h2>
              <p className="mt-1 text-sm text-muted-foreground">@{display(profile.slug ?? tenant?.slug)} <span className="mx-1">·</span> {display(profile._id ?? tenant?._id)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium text-muted-foreground">
            <span className="size-3 rounded-sm border" style={{ backgroundColor: String(branding?.primaryColor ?? "#6d4aff") }}/>
            {ar ? "لون العلامة" : "Brand color"} <span className="font-mono text-foreground">{display(branding?.primaryColor)}</span>
          </div>
        </div>
        {profileQuery.isLoading ? <p className="py-8 text-center text-sm text-muted-foreground">{copy.loading}</p> : profileQuery.isError ? <p role="alert" className="mt-6 text-sm text-destructive">{profileQuery.error instanceof Error ? profileQuery.error.message : (ar ? "تعذر تحميل الملف." : "Unable to load profile.")}</p> : (
          <div className="mt-7 space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: ar ? "نوع المؤسسة" : "Business type", value: localizedValue(profile.businessType, ar), icon: Building2 },
                { label: ar ? "النشاط" : "Industry", value: localizedValue(profile.industry, ar), icon: ShieldCheck },
                { label: ar ? "البريد الرسمي" : "Business email", value: display(contact.email), icon: Mail },
                { label: ar ? "الهاتف الأساسي" : "Primary phone", value: display(contact.phone), icon: Phone },
              ].map(item => { const Icon = item.icon; return <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground"><Icon className="size-4"/>{item.label}</div><p className="mt-2 break-words text-sm font-semibold text-slate-900">{item.value}</p></div> })}
            </div>
            {detailGroups.map(group => (
              <section key={group.title} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4">
                  <h3 className="text-sm font-bold text-slate-900">{group.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{group.description}</p>
                </div>
                <div className="grid gap-px bg-slate-100 sm:grid-cols-2 xl:grid-cols-3">
                  {group.items.map(([label, value]) => <div key={label} className="min-w-0 bg-white px-5 py-3.5">
                    <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
                    <p className="mt-1.5 break-words text-sm font-semibold leading-6 text-slate-800">{display(value)}</p>
                  </div>)}
                </div>
              </section>
            ))}
            <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
              <h3 className="text-sm font-bold text-slate-900">{ar ? "سياق مساحة العمل" : "Workspace context"}</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  [ar ? "الدور الحالي" : "Current role", context?.access?.role],
                  [ar ? "نطاق الصلاحية" : "Access scope", context?.access?.scope],
                  [ar ? "العيادة النشطة" : "Active clinic", context?.clinic?.name],
                  [ar ? "الفرع النشط" : "Active branch", context?.branch?.name],
                  [ar ? "معرّف المؤسسة" : "Tenant ID", context?.access?.tenantId],
                  [ar ? "معرّف العيادة" : "Clinic ID", context?.access?.clinicId],
                  [ar ? "معرّف الفرع" : "Branch ID", context?.access?.branchId],
                ].map(([label, value]) => <div key={String(label)}><p className="text-[11px] text-muted-foreground">{label}</p><p className="mt-1 break-all text-xs font-semibold text-slate-800">{display(value)}</p></div>)}
              </div>
            </section>
          </div>
        )}
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
              <div><PhoneNumberField id="tenant-primary-phone" label={copy.phone} value={values.contactPhone} phoneCode={phoneCodes.phone} onChange={value => update("contactPhone", value)} onPhoneCodeChange={value => setPhoneCodes(current => ({ ...current, phone: value }))}/>{errors.contactPhone && <p className="mt-1 text-xs text-destructive">{errors.contactPhone}</p>}</div>
              <div><PhoneNumberField id="tenant-alternate-phone" label={ar ? "رقم الهاتف البديل" : "Alternate phone"} value={values.alternatePhone} phoneCode={phoneCodes.alternatePhone} onChange={value => update("alternatePhone", value)} onPhoneCodeChange={value => setPhoneCodes(current => ({ ...current, alternatePhone: value }))}/>{errors.alternatePhone && <p className="mt-1 text-xs text-destructive">{errors.alternatePhone}</p>}</div>
              <div><PhoneNumberField id="tenant-whatsapp" label="WhatsApp" value={values.whatsapp} phoneCode={phoneCodes.whatsapp} onChange={value => update("whatsapp", value)} onPhoneCodeChange={value => setPhoneCodes(current => ({ ...current, whatsapp: value }))}/>{errors.whatsapp && <p className="mt-1 text-xs text-destructive">{errors.whatsapp}</p>}</div>
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
