import { useEffect, useMemo, useState, type FormEvent } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { ArrowLeft, ArrowRight, Building2, Check, ChevronRight, Landmark, MapPin, Settings2, ShieldCheck, Sparkles, UserRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SelectMenu, SelectMenuContent, SelectMenuItem, SelectMenuTrigger, SelectMenuValue } from "@/components/ui/select-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { useI18n } from "@/i18n/i18n-provider"
import { pushToast, store } from "@/store"
import { GeoSearchSelect } from "@/portals/super-admin/features/geo-location/components/geo-search-select"
import { useTenant, useTenantMutations } from "../hooks/use-tenants"
import { TenantFormField } from "../components/tenant-form-field"
import { TenantFormSection } from "../components/tenant-form-section"
import { emptyTenantForm, formToPayload, tenantToForm, type TenantFormValues } from "../types/tenant-form.types"

const stepIcons = [Building2, UserRound, MapPin, Landmark, Settings2]
const steps = ["identity", "contact", "location", "legal", "preferences"] as const

export function TenantFormPage() {
  const { tenantId = "" } = useParams<{ tenantId: string }>()
  const isEdit = Boolean(tenantId)
  const { locale } = useI18n()
  const ar = locale === "ar"
  const dir = ar ? "rtl" : "ltr"
  const navigate = useNavigate()
  const tenantQuery = useTenant(tenantId)
  const mutations = useTenantMutations()
  const [values, setValues] = useState<TenantFormValues>(emptyTenantForm)
  const [step, setStep] = useState(0)
  const saving = mutations.create.isPending || mutations.updateProfile.isPending

  useEffect(() => {
    if (tenantQuery.data && isEdit) setValues(tenantToForm(tenantQuery.data))
  }, [tenantQuery.data, isEdit])

  const copy = useMemo(() => ar ? {
    back: "العودة للمؤسسات", createTitle: "إنشاء مؤسسة جديدة", editTitle: "تعديل بيانات المؤسسة",
    createDescription: "أنشئ ملف المؤسسة من خلال خطوات واضحة. يمكنك مراجعة كل جزء قبل الحفظ.",
    editDescription: "حدّث بيانات المؤسسة مع الحفاظ على تقسيم واضح لكل مجموعة من المعلومات.",
    identity: "الهوية الأساسية", identityHint: "اسم المؤسسة وهويتها القانونية ونوع نشاطها.",
    contact: "بيانات التواصل", contactHint: "قنوات التواصل الرسمية الخاصة بالمؤسسة.",
    location: "العنوان والموقع", locationHint: "حدد الدولة والمحافظة والمدينة والحي ثم أكمل العنوان.",
    legal: "البيانات القانونية والهوية البصرية", legalHint: "بيانات التسجيل والضرائب وعناصر العلامة التجارية.",
    preferences: "إعدادات المؤسسة", preferencesHint: "المنطقة الزمنية واللغة والعملة وتفضيلات العرض.",
    name: "اسم المؤسسة", displayName: "الاسم الظاهر", legalName: "الاسم القانوني", businessType: "نوع النشاط",
    singleClinic: "عيادة واحدة", clinicGroup: "مجموعة عيادات", industry: "المجال", description: "وصف المؤسسة",
    email: "البريد الإلكتروني", phone: "رقم الهاتف", alternatePhone: "رقم بديل", whatsapp: "واتساب", website: "الموقع الإلكتروني",
    country: "الدولة", governorate: "المحافظة", city: "المدينة", district: "الحي / المنطقة",
    addressLine1: "العنوان", addressLine2: "تفاصيل إضافية", building: "المبنى", floor: "الدور", unit: "الوحدة",
    landmark: "علامة مميزة", postalCode: "الرمز البريدي", latitude: "خط العرض", longitude: "خط الطول",
    taxNumber: "الرقم الضريبي", vatNumber: "رقم ضريبة القيمة المضافة", commercialRegistrationNumber: "رقم السجل التجاري",
    logoUrl: "رابط الشعار", coverImageUrl: "رابط صورة الغلاف", primaryColor: "اللون الأساسي",
    timezone: "المنطقة الزمنية", locale: "لغة المؤسسة", currency: "العملة", dateFormat: "تنسيق التاريخ", weekStartsOn: "بداية الأسبوع",
    supportedLanguages: "اللغات المدعومة", english: "الإنجليزية", arabic: "العربية",
    next: "التالي", previous: "السابق", create: "إنشاء المؤسسة", save: "حفظ التغييرات", saving: "جارٍ الحفظ...",
    required: "مطلوب", optional: "اختياري", loading: "جارٍ تحميل بيانات المؤسسة...", loadError: "تعذر تحميل بيانات المؤسسة.",
    successCreate: "تم إنشاء المؤسسة بنجاح", successUpdate: "تم تحديث بيانات المؤسسة", error: "تعذر حفظ بيانات المؤسسة",
    stepOf: "الخطوة", review: "راجع البيانات ثم احفظ", choose: "اختر", noOwner: "بيانات المالك غير موجودة ضمن مخطط الطلب المرسل؛ لم تتم إضافة حقول غير مؤكدة.",
    invalidCoordinates: "يجب أن تكون الإحداثيات أرقامًا صحيحة."
  } : {
    back: "Back to tenants", createTitle: "Create a tenant", editTitle: "Edit tenant profile",
    createDescription: "Build the organization profile through focused steps. Review each section before saving.",
    editDescription: "Update the organization profile with every information group kept clearly separated.",
    identity: "Organization identity", identityHint: "The organization's name, legal identity and operating model.",
    contact: "Contact information", contactHint: "Official communication channels for this organization.",
    location: "Address & location", locationHint: "Choose the country, governorate, city and district, then complete the address.",
    legal: "Legal & brand identity", legalHint: "Registration and tax details alongside brand assets.",
    preferences: "Organization preferences", preferencesHint: "Timezone, locale, currency and display preferences.",
    name: "Organization name", displayName: "Display name", legalName: "Legal name", businessType: "Business type",
    singleClinic: "Single clinic", clinicGroup: "Clinic group", industry: "Industry", description: "Organization description",
    email: "Email address", phone: "Phone number", alternatePhone: "Alternate phone", whatsapp: "WhatsApp", website: "Website",
    country: "Country", governorate: "Governorate", city: "City", district: "District",
    addressLine1: "Address line 1", addressLine2: "Address line 2", building: "Building", floor: "Floor", unit: "Unit",
    landmark: "Landmark", postalCode: "Postal code", latitude: "Latitude", longitude: "Longitude",
    taxNumber: "Tax number", vatNumber: "VAT number", commercialRegistrationNumber: "Commercial registration number",
    logoUrl: "Logo URL", coverImageUrl: "Cover image URL", primaryColor: "Primary brand color",
    timezone: "Timezone", locale: "Organization language", currency: "Currency", dateFormat: "Date format", weekStartsOn: "Week starts on",
    supportedLanguages: "Supported languages", english: "English", arabic: "Arabic",
    next: "Continue", previous: "Previous", create: "Create tenant", save: "Save changes", saving: "Saving...",
    required: "Required", optional: "Optional", loading: "Loading tenant profile...", loadError: "Could not load tenant profile.",
    successCreate: "Tenant created successfully", successUpdate: "Tenant profile updated", error: "Could not save tenant profile",
    stepOf: "Step", review: "Review your information, then save", choose: "Choose",
    noOwner: "Owner fields are not present in the supplied request schema, so no unverified fields have been added.",
    invalidCoordinates: "Coordinates must be valid numbers."
  }, [ar])

  const stepLabels = ar
    ? ["البيانات الأساسية", "التواصل", "العنوان", "القانوني والعلامة", "التفضيلات"]
    : ["Basics", "Contact", "Location", "Legal & branding", "Preferences"]

  function update<K extends keyof TenantFormValues>(section: K, key: keyof TenantFormValues[K], value: string) {
    setValues((current) => ({ ...current, [section]: { ...current[section], [key]: value } } as TenantFormValues))
  }
  function updateTop(key: "name" | "displayName" | "legalName" | "businessType" | "description" | "industry", value: string) {
    setValues((current) => ({ ...current, [key]: value }))
  }
  function toggleLanguage(language: string, checked: boolean) {
    setValues((current) => ({ ...current, preferences: { ...current.preferences, supportedLanguages: checked ? [...current.preferences.supportedLanguages, language] : current.preferences.supportedLanguages.filter((item) => item !== language) } }))
  }
  function updateLocation(kind: "countryId" | "governorateId" | "cityId" | "districtId", value: string) {
    setValues((current) => ({
      ...current,
      address: {
        ...current.address,
        [kind]: value,
        ...(kind === "countryId" ? { governorateId: "", cityId: "", districtId: "" } : {}),
        ...(kind === "governorateId" ? { cityId: "", districtId: "" } : {}),
        ...(kind === "cityId" ? { districtId: "" } : {}),
      },
    }))
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (values.preferences.supportedLanguages.length === 0) {
      store.dispatch(pushToast({ id: crypto.randomUUID(), kind: "error", title: ar ? "اختر لغة واحدة على الأقل" : "Select at least one supported language" }))
      setStep(4)
      return
    }
    const latitude = values.address.latitude.trim()
    const longitude = values.address.longitude.trim()
    if ((latitude && !Number.isFinite(Number(latitude))) || (longitude && !Number.isFinite(Number(longitude)))) {
      store.dispatch(pushToast({ id: crypto.randomUUID(), kind: "error", title: copy.invalidCoordinates }))
      setStep(2)
      return
    }
    const payload = formToPayload(values)
    try {
      if (isEdit) {
        await mutations.updateProfile.mutateAsync({ id: tenantId, payload })
        store.dispatch(pushToast({ id: crypto.randomUUID(), kind: "success", title: copy.successUpdate }))
        navigate("/super-admin/tenants/" + encodeURIComponent(tenantId))
      } else {
        const created = await mutations.create.mutateAsync(payload)
        store.dispatch(pushToast({ id: crypto.randomUUID(), kind: "success", title: copy.successCreate }))
        navigate("/super-admin/tenants/" + encodeURIComponent(created.id))
      }
    } catch (error) {
      store.dispatch(pushToast({ id: crypto.randomUUID(), kind: "error", title: copy.error, description: error instanceof Error ? error.message : undefined }))
    }
  }

  if (isEdit && tenantQuery.isLoading) return <div className="space-y-5"><Skeleton className="h-28 w-full rounded-2xl"/><Skeleton className="h-[560px] w-full rounded-2xl"/></div>
  if (isEdit && (tenantQuery.error || !tenantQuery.data)) return <div className="space-y-4"><Link to={"/super-admin/tenants/" + encodeURIComponent(tenantId)} className="inline-flex items-center gap-2 text-sm font-semibold text-primary"><ArrowLeft className="size-4"/>{copy.back}</Link><div role="alert" className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive">{tenantQuery.error instanceof Error ? tenantQuery.error.message : copy.loadError}</div></div>

  const ActiveIcon = stepIcons[step]
  const sectionContent = [
    <TenantFormSection key="identity" title={copy.identity} description={copy.identityHint} icon={Building2}>
      <TenantFormField id="tenant-name" label={copy.name} value={values.name} onChange={(value) => updateTop("name", value)} required autoComplete="organization" />
      <TenantFormField id="tenant-display-name" label={copy.displayName} value={values.displayName} onChange={(value) => updateTop("displayName", value)} />
      <TenantFormField id="tenant-legal-name" label={copy.legalName} value={values.legalName} onChange={(value) => updateTop("legalName", value)} />
      <TenantFormField id="tenant-business-type" label={copy.businessType} value={values.businessType} onChange={(value) => updateTop("businessType", value)} required placeholder="single_clinic" hint={ar ? "أدخل القيمة المعتمدة في الـ backend." : "Enter the exact business type key accepted by the backend."}/>
      <TenantFormField id="tenant-industry" label={copy.industry} value={values.industry} onChange={(value) => updateTop("industry", value)} required placeholder="aesthetic_medicine" hint={ar ? "استخدم قيمة المجال المعتمدة من الـ backend." : "Use the industry key accepted by the backend."}/>
      <TenantFormField id="tenant-description" label={copy.description} value={values.description} onChange={(value) => updateTop("description", value)} multiline />
    </TenantFormSection>,
    <TenantFormSection key="contact" title={copy.contact} description={copy.contactHint} icon={UserRound}>
      <TenantFormField id="tenant-email" label={copy.email} type="email" value={values.contact.email} onChange={(value) => update("contact", "email", value)} autoComplete="email"/>
      <TenantFormField id="tenant-phone" label={copy.phone} type="tel" value={values.contact.phone} onChange={(value) => update("contact", "phone", value)} autoComplete="tel"/>
      <TenantFormField id="tenant-alt-phone" label={copy.alternatePhone} type="tel" value={values.contact.alternatePhone} onChange={(value) => update("contact", "alternatePhone", value)}/>
      <TenantFormField id="tenant-whatsapp" label={copy.whatsapp} type="tel" value={values.contact.whatsapp} onChange={(value) => update("contact", "whatsapp", value)}/>
      <TenantFormField id="tenant-website" label={copy.website} type="url" value={values.contact.website} onChange={(value) => update("contact", "website", value)} placeholder="https://"/>
    </TenantFormSection>,
    <TenantFormSection key="location" title={copy.location} description={copy.locationHint} icon={MapPin}>
      <div className="space-y-2"><Label>{copy.country}</Label><GeoSearchSelect kind="countries" value={values.address.countryId} onChange={(value) => updateLocation("countryId", value)} placeholder={copy.choose}/></div>
      <div className="space-y-2"><Label>{copy.governorate}</Label><GeoSearchSelect kind="governorates" value={values.address.governorateId} parentId={values.address.countryId} onChange={(value) => updateLocation("governorateId", value)} placeholder={copy.choose}/></div>
      <div className="space-y-2"><Label>{copy.city}</Label><GeoSearchSelect kind="cities" value={values.address.cityId} parentId={values.address.governorateId} onChange={(value) => updateLocation("cityId", value)} placeholder={copy.choose}/></div>
      <div className="space-y-2"><Label>{copy.district}</Label><GeoSearchSelect kind="districts" value={values.address.districtId} parentId={values.address.cityId} onChange={(value) => updateLocation("districtId", value)} placeholder={copy.choose}/></div>
      <TenantFormField id="tenant-address-1" label={copy.addressLine1} value={values.address.addressLine1} onChange={(value) => update("address", "addressLine1", value)}/>
      <TenantFormField id="tenant-address-2" label={copy.addressLine2} value={values.address.addressLine2} onChange={(value) => update("address", "addressLine2", value)}/>
      <TenantFormField id="tenant-building" label={copy.building} value={values.address.building} onChange={(value) => update("address", "building", value)}/>
      <TenantFormField id="tenant-floor" label={copy.floor} value={values.address.floor} onChange={(value) => update("address", "floor", value)}/>
      <TenantFormField id="tenant-unit" label={copy.unit} value={values.address.unit} onChange={(value) => update("address", "unit", value)}/>
      <TenantFormField id="tenant-landmark" label={copy.landmark} value={values.address.landmark} onChange={(value) => update("address", "landmark", value)}/>
      <TenantFormField id="tenant-postal" label={copy.postalCode} value={values.address.postalCode} onChange={(value) => update("address", "postalCode", value)}/>
      <TenantFormField id="tenant-latitude" label={copy.latitude} type="number" min="-90" max="90" step="any" value={values.address.latitude} onChange={(value) => update("address", "latitude", value)}/>
      <TenantFormField id="tenant-longitude" label={copy.longitude} type="number" min="-180" max="180" step="any" value={values.address.longitude} onChange={(value) => update("address", "longitude", value)}/>
    </TenantFormSection>,
    <TenantFormSection key="legal" title={copy.legal} description={copy.legalHint} icon={ShieldCheck}>
      <TenantFormField id="tenant-tax" label={copy.taxNumber} value={values.legal.taxNumber} onChange={(value) => update("legal", "taxNumber", value)}/>
      <TenantFormField id="tenant-vat" label={copy.vatNumber} value={values.legal.vatNumber} onChange={(value) => update("legal", "vatNumber", value)}/>
      <TenantFormField id="tenant-registration" label={copy.commercialRegistrationNumber} value={values.legal.commercialRegistrationNumber} onChange={(value) => update("legal", "commercialRegistrationNumber", value)}/>
      <div className="hidden sm:block"/>
      <TenantFormField id="tenant-logo" label={copy.logoUrl} type="url" value={values.branding.logoUrl} onChange={(value) => update("branding", "logoUrl", value)} placeholder="https://"/>
      <TenantFormField id="tenant-cover" label={copy.coverImageUrl} type="url" value={values.branding.coverImageUrl} onChange={(value) => update("branding", "coverImageUrl", value)} placeholder="https://"/>
      <div className="space-y-2"><Label htmlFor="tenant-primary-color">{copy.primaryColor}</Label><div className="flex h-11 items-center gap-3 rounded-xl border border-input bg-background px-3"><Input id="tenant-primary-color" type="color" value={values.branding.primaryColor} onChange={(event) => update("branding", "primaryColor", event.target.value)} className="size-7 cursor-pointer border-0 bg-transparent p-0"/><span className="font-mono text-sm text-muted-foreground">{values.branding.primaryColor.toUpperCase()}</span></div></div>
    </TenantFormSection>,
    <TenantFormSection key="preferences" title={copy.preferences} description={copy.preferencesHint} icon={Settings2}>
      <TenantFormField id="tenant-timezone" label={copy.timezone} value={values.preferences.timezone} onChange={(value) => update("preferences", "timezone", value)} placeholder="Africa/Cairo"/>
      <TenantFormField id="tenant-locale" label={copy.locale} value={values.preferences.locale} onChange={(value) => update("preferences", "locale", value)} placeholder="en"/>
      <TenantFormField id="tenant-currency" label={copy.currency} value={values.preferences.currency} onChange={(value) => update("preferences", "currency", value)} placeholder="EGP"/>
      <TenantFormField id="tenant-date-format" label={copy.dateFormat} value={values.preferences.dateFormat} onChange={(value) => update("preferences", "dateFormat", value)} placeholder="YYYY-MM-DD"/>
      <div className="space-y-2"><Label>{copy.weekStartsOn}</Label><SelectMenu value={values.preferences.weekStartsOn} onValueChange={(value) => update("preferences", "weekStartsOn", value)}><SelectMenuTrigger><SelectMenuValue/></SelectMenuTrigger><SelectMenuContent>{(ar ? ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"] : ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]).map((day, index) => <SelectMenuItem key={index} value={String(index)}>{day}</SelectMenuItem>)}</SelectMenuContent></SelectMenu></div>
      <div className="sm:col-span-2 space-y-3"><Label>{copy.supportedLanguages}</Label><div className="flex flex-wrap gap-4 rounded-xl border bg-muted/20 p-4"><Label className="flex cursor-pointer items-center gap-2 text-sm"><Checkbox checked={values.preferences.supportedLanguages.includes("en")} onChange={(event) => toggleLanguage("en", event.target.checked)}/>{copy.english}</Label><Label className="flex cursor-pointer items-center gap-2 text-sm"><Checkbox checked={values.preferences.supportedLanguages.includes("ar")} onChange={(event) => toggleLanguage("ar", event.target.checked)}/>{copy.arabic}</Label></div></div>
    </TenantFormSection>,
  ]

  return (
    <div dir={dir} className="mx-auto max-w-[1180px] space-y-6 pb-8">
      <Link to="/super-admin/tenants" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-primary"><ArrowLeft className="size-4"/>{copy.back}</Link>
      <header className="relative overflow-hidden rounded-[28px] border border-[#282344] bg-[#151329] px-6 py-7 text-white shadow-xl sm:px-8">
        <div className="pointer-events-none absolute -end-16 -top-28 size-72 rounded-full bg-violet-500/20 blur-3xl"/>
        <div className="relative flex items-start gap-4"><span className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-violet-200"><Sparkles className="size-5"/></span><div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-300">CUTILORA / PLATFORM / TENANTS</p><h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{isEdit ? copy.editTitle : copy.createTitle}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{isEdit ? copy.editDescription : copy.createDescription}</p></div></div>
      </header>
      <div className="grid items-start gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        <nav aria-label={ar ? "أقسام النموذج" : "Form sections"} className="rounded-2xl border bg-card p-2 lg:sticky lg:top-5">
          <div className="px-3 pb-3 pt-2"><p className="text-xs font-semibold text-muted-foreground">{copy.stepOf} {step + 1} / {steps.length}</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: ((step + 1) / steps.length * 100) + "%" }}/></div></div>
          {steps.map((item, index) => { const Icon = stepIcons[index] ?? Building2; return <Button key={item} type="button" variant={step === index ? "secondary" : "ghost"} onClick={() => setStep(index)} className={"flex h-auto w-full justify-start gap-3 rounded-xl px-3 py-3 text-start " + (step === index ? "bg-primary/10 text-primary hover:bg-primary/15" : "text-muted-foreground hover:bg-muted hover:text-foreground")}><span className={"flex size-9 shrink-0 items-center justify-center rounded-lg " + (step === index ? "bg-primary text-primary-foreground" : "bg-muted")}><Icon className="size-4"/></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{stepLabels[index]}</span><span className="mt-0.5 block text-[11px] opacity-70">{index + 1} / {steps.length}</span></span>{index < step ? <Check className="size-4"/> : <ChevronRight className="size-4 opacity-50"/>}</Button> })}
        </nav>
        <form onSubmit={submit} className="min-w-0 space-y-5">
          <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wider text-primary">{copy.stepOf} {step + 1}</p><h2 className="mt-1 text-xl font-semibold">{stepLabels[step]}</h2></div><span className="rounded-full border bg-card px-3 py-1.5 text-xs text-muted-foreground">{step + 1} / {steps.length}</span></div>
          {sectionContent[step]}
          {step === 4 && <p className="rounded-xl border border-primary/15 bg-primary/[0.04] px-4 py-3 text-xs leading-5 text-muted-foreground">{copy.review}</p>}
          <div className="flex flex-col-reverse justify-between gap-3 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center">
            <Button type="button" variant="outline" onClick={() => step === 0 ? navigate("/super-admin/tenants") : setStep((current) => current - 1)} disabled={saving}><ArrowLeft className="size-4"/>{step === 0 ? copy.back : copy.previous}</Button>
            {step < steps.length - 1
              ? <Button type="button" onClick={() => setStep((current) => Math.min(steps.length - 1, current + 1))}>{copy.next}<ArrowRight className="size-4"/></Button>
              : <Button type="submit" loading={saving} disabled={saving || !values.name.trim() || !values.industry.trim() || values.preferences.supportedLanguages.length === 0}><Check className="size-4"/>{saving ? copy.saving : isEdit ? copy.save : copy.create}</Button>}
          </div>
        </form>
      </div>
    </div>
  )
}
