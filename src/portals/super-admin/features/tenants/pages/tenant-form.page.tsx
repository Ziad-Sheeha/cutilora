import { useEffect, useMemo, useState, type FormEvent } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { ArrowLeft, ArrowRight, Building2, Check, ChevronRight, Landmark, MapPin, Settings2, ShieldCheck, Sparkles, UserRound, ClipboardCheck, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SelectMenu, SelectMenuContent, SelectMenuItem, SelectMenuTrigger, SelectMenuValue } from "@/components/ui/select-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useI18n } from "@/i18n/i18n-provider"
import { pushToast, store } from "@/store"
import { GeoSearchSelect } from "@/portals/super-admin/features/geo-location/components/geo-search-select"
import { useTenant, useTenantMutations } from "../hooks/use-tenants"
import { TenantFormField } from "../components/tenant-form-field"
import { TenantFormSection } from "../components/tenant-form-section"
import { TenantImageUpload } from "../components/tenant-image-upload"
import { TenantReviewPanel } from "../components/tenant-review-panel"
import { TenantPdfDocument } from "../components/tenant-pdf-document"
import { emptyTenantForm, formToPayload, tenantToForm, type TenantFormValues } from "../types/tenant-form.types"
import type { Tenant } from "../types/tenant.types"

const stepIcons = [Building2, UserRound, MapPin, Landmark, Settings2, ClipboardCheck]
const steps = ["identity", "contact", "location", "legal", "preferences", "review"] as const

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
  const [highestUnlockedStep, setHighestUnlockedStep] = useState(0)
  const [successOpen, setSuccessOpen] = useState(false)
  const [savedTenant, setSavedTenant] = useState<Tenant | null>(null)
  const saving = mutations.create.isPending || mutations.updateProfile.isPending

  useEffect(() => {
    if (tenantQuery.data && isEdit) { setValues(tenantToForm(tenantQuery.data)); setHighestUnlockedStep(5) }
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
    industry: "المجال", description: "وصف المؤسسة",
    email: "البريد الإلكتروني", phone: "رقم الهاتف", alternatePhone: "رقم بديل", whatsapp: "واتساب", website: "الموقع الإلكتروني",
    country: "الدولة", governorate: "المحافظة", city: "المدينة", district: "الحي / المنطقة",
    addressLine1: "العنوان", addressLine2: "تفاصيل إضافية", building: "المبنى", floor: "الدور", unit: "الوحدة",
    landmark: "علامة مميزة", postalCode: "الرمز البريدي", latitude: "خط العرض", longitude: "خط الطول",
    taxNumber: "الرقم الضريبي", vatNumber: "رقم ضريبة القيمة المضافة", commercialRegistrationNumber: "رقم السجل التجاري",
    logoUrl: "الشعار", coverImageUrl: "صورة الغلاف", primaryColor: "اللون الأساسي",
    timezone: "المنطقة الزمنية", locale: "لغة المؤسسة", currency: "العملة", dateFormat: "تنسيق التاريخ", weekStartsOn: "بداية الأسبوع",
    supportedLanguages: "اللغات المدعومة", english: "الإنجليزية", arabic: "العربية",
    next: "التالي", previous: "السابق", create: "إنشاء المؤسسة", save: "حفظ التغييرات", saving: "جارٍ الحفظ...",
    loading: "جارٍ تحميل بيانات المؤسسة...", loadError: "تعذر تحميل بيانات المؤسسة.",
    successCreate: "تم إنشاء المؤسسة بنجاح", successUpdate: "تم تحديث بيانات المؤسسة", error: "تعذر حفظ بيانات المؤسسة",
    stepOf: "الخطوة", review: "مراجعة البيانات قبل الإرسال", choose: "اختر",
    uploadHint: "PNG, JPG or WebP · بحد أقصى 5MB", upload: "رفع صورة", replace: "استبدال الصورة", remove: "حذف الصورة", invalidImage: "صيغة الصورة غير مدعومة. استخدم PNG أو JPG أو WebP.", imageTooLarge: "حجم الصورة يجب ألا يتجاوز 5MB.", preview: "معاينة الصورة", requiredFields: "أكمل الحقول المطلوبة المميزة بعلامة النجمة قبل المتابعة.", done: "تم", downloadPdf: "حفظ كملف PDF", successTitle: "تم حفظ المؤسسة بنجاح", successDescription: "تم حفظ البيانات. يمكنك تنزيل نسخة PDF من ملف المؤسسة أو المتابعة إلى صفحة التفاصيل.", edit: "تعديل", empty: "لا توجد بيانات مدخلة.", invalidCoordinates: "الإحداثيات يجب أن تكون أرقامًا ضمن النطاق الصحيح.", invalidEmail: "أدخل بريدًا إلكترونيًا صحيحًا.", invalidUrl: "أدخل رابطًا صحيحًا يبدأ بـ https:// أو http://."
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
    industry: "Industry", description: "Organization description",
    email: "Email address", phone: "Phone number", alternatePhone: "Alternate phone", whatsapp: "WhatsApp", website: "Website",
    country: "Country", governorate: "Governorate", city: "City", district: "District",
    addressLine1: "Address line 1", addressLine2: "Address line 2", building: "Building", floor: "Floor", unit: "Unit",
    landmark: "Landmark", postalCode: "Postal code", latitude: "Latitude", longitude: "Longitude",
    taxNumber: "Tax number", vatNumber: "VAT number", commercialRegistrationNumber: "Commercial registration number",
    logoUrl: "Logo", coverImageUrl: "Cover image", primaryColor: "Primary brand color",
    timezone: "Timezone", locale: "Organization language", currency: "Currency", dateFormat: "Date format", weekStartsOn: "Week starts on",
    supportedLanguages: "Supported languages", english: "English", arabic: "Arabic",
    next: "Continue", previous: "Previous", create: "Create tenant", save: "Save changes", saving: "Saving...",
    loading: "Loading tenant profile...", loadError: "Could not load tenant profile.",
    successCreate: "Tenant created successfully", successUpdate: "Tenant profile updated", error: "Could not save tenant profile",
    stepOf: "Step", review: "Review all information before submission", choose: "Choose",
    uploadHint: "PNG, JPG or WebP · Up to 5MB", upload: "Upload image", replace: "Replace image", remove: "Remove image", invalidImage: "Unsupported image format. Use PNG, JPG or WebP.", imageTooLarge: "Image size must not exceed 5MB.", preview: "Image preview", requiredFields: "Complete the required fields marked with an asterisk before continuing.", done: "Done", downloadPdf: "Save as PDF", successTitle: "Tenant saved successfully", successDescription: "Your changes have been saved. Save a PDF copy of this tenant profile or continue to its details page.", edit: "Edit", empty: "No information provided.", invalidCoordinates: "Coordinates must be valid numbers within the supported range.", invalidEmail: "Enter a valid email address.", invalidUrl: "Enter a valid URL starting with https:// or http://."
  }, [ar])

  const stepLabels = ar
    ? ["البيانات الأساسية", "التواصل", "العنوان", "القانوني والعلامة", "التفضيلات", "المراجعة"]
    : ["Basics", "Contact", "Location", "Legal & branding", "Preferences", "Review"]

  function update<K extends "contact" | "address" | "legal" | "branding" | "preferences">(section: K, key: keyof TenantFormValues[K], value: string) {
    setValues((current) => ({
      ...current,
      [section]: { ...(current[section] as Record<string, unknown>), [key]: value },
    } as TenantFormValues))
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

  function validateStep(index: number): string[] {
    if (index === 0) return [values.name.trim(), values.businessType.trim(), values.industry.trim()].every(Boolean) ? [] : [copy.requiredFields]
    if (index === 1) {
      if (values.contact.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.contact.email.trim())) return [copy.invalidEmail]
      const website = values.contact.website.trim()
      if (website) { try { const url = new URL(website); if (url.protocol !== "http:" && url.protocol !== "https:") return [copy.invalidUrl] } catch { return [copy.invalidUrl] } }
      return []
    }
    if (index === 2) {
      const latitude = values.address.latitude.trim()
      const longitude = values.address.longitude.trim()
      return (latitude && (!Number.isFinite(Number(latitude)) || Number(latitude) < -90 || Number(latitude) > 90)) || (longitude && (!Number.isFinite(Number(longitude)) || Number(longitude) < -180 || Number(longitude) > 180)) ? [copy.invalidCoordinates] : []
    }
    if (index === 3) {
      const urls = [values.branding.logoUrl, values.branding.coverImageUrl]
      return urls.some((value) => value && !value.startsWith("data:image/") && !/^https?:\/\//i.test(value)) ? [copy.invalidUrl] : []
    }
    if (index === 4) return values.preferences.supportedLanguages.length ? [] : [ar ? "اختر لغة واحدة على الأقل." : "Select at least one supported language."]
    return []
  }

  function continueToNextStep() {
    const errors = validateStep(step)
    if (errors.length) { store.dispatch(pushToast({ id: crypto.randomUUID(), kind: "error", title: errors[0] })); return }
    setHighestUnlockedStep((current) => Math.max(current, step + 1))
    setStep((current) => Math.min(steps.length - 1, current + 1))
  }

  function downloadTenantPdf() {
    const previousTitle = document.title
    document.title = "Cutilora - " + (savedTenant?.name || values.name) + " - Tenant Profile"
    const restoreTitle = () => { document.title = previousTitle; window.removeEventListener("afterprint", restoreTitle) }
    window.addEventListener("afterprint", restoreTitle)
    window.print()
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const invalidStep = steps.slice(0, 5).findIndex((_, index) => validateStep(index).length > 0)
    if (invalidStep >= 0) { setStep(invalidStep); store.dispatch(pushToast({ id: crypto.randomUUID(), kind: "error", title: validateStep(invalidStep)[0] })); return }
    const payload = formToPayload(values)
    try {
      const saved = isEdit ? await mutations.updateProfile.mutateAsync({ id: tenantId, payload }) : await mutations.create.mutateAsync(payload)
      setSavedTenant(saved)
      setSuccessOpen(true)
      store.dispatch(pushToast({ id: crypto.randomUUID(), kind: "success", title: isEdit ? copy.successUpdate : copy.successCreate }))
    } catch (error) {
      store.dispatch(pushToast({ id: crypto.randomUUID(), kind: "error", title: copy.error, description: error instanceof Error ? error.message : undefined }))
    }
  }

  if (isEdit && tenantQuery.isLoading) return <div className="space-y-5"><Skeleton className="h-28 w-full rounded-2xl"/><Skeleton className="h-[560px] w-full rounded-2xl"/></div>
  if (isEdit && (tenantQuery.error || !tenantQuery.data)) return <div className="space-y-4"><Link to={"/super-admin/tenants/" + encodeURIComponent(tenantId)} className="inline-flex items-center gap-2 text-sm font-semibold text-primary"><ArrowLeft className="size-4"/>{copy.back}</Link><div role="alert" className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive">{tenantQuery.error instanceof Error ? tenantQuery.error.message : copy.loadError}</div></div>

  const sectionContent = [
    <TenantFormSection key="identity" title={copy.identity} description={copy.identityHint} icon={Building2}>
      <TenantFormField id="tenant-name" label={copy.name} value={values.name} onChange={(value) => updateTop("name", value)} required autoComplete="organization" />
      <TenantFormField id="tenant-display-name" label={copy.displayName} value={values.displayName} onChange={(value) => updateTop("displayName", value)} />
      <TenantFormField id="tenant-legal-name" label={copy.legalName} value={values.legalName} onChange={(value) => updateTop("legalName", value)} />
      <div className="space-y-2"><Label>{copy.businessType}<span className="ms-1 text-destructive">*</span></Label><SelectMenu value={values.businessType} onValueChange={(value) => updateTop("businessType", value)}><SelectMenuTrigger className={!values.businessType ? "border-destructive ring-1 ring-destructive/20" : ""}><SelectMenuValue placeholder={copy.choose}/></SelectMenuTrigger><SelectMenuContent><SelectMenuItem value="single_clinic">{ar ? "عيادة واحدة" : "Single clinic"}</SelectMenuItem><SelectMenuItem value="clinic_group">{ar ? "مجموعة عيادات" : "Clinic group"}</SelectMenuItem></SelectMenuContent></SelectMenu></div>
      <div className="space-y-2"><Label>{copy.industry}<span className="ms-1 text-destructive">*</span></Label><SelectMenu value={values.industry} onValueChange={(value) => updateTop("industry", value)}><SelectMenuTrigger className={!values.industry ? "border-destructive ring-1 ring-destructive/20" : ""}><SelectMenuValue placeholder={copy.choose}/></SelectMenuTrigger><SelectMenuContent>{values.industry && values.industry !== "aesthetic_medicine" && <SelectMenuItem value={values.industry}>{values.industry}</SelectMenuItem>}<SelectMenuItem value="aesthetic_medicine">{ar ? "الطب التجميلي" : "Aesthetic medicine"}</SelectMenuItem></SelectMenuContent></SelectMenu><p className="text-xs text-muted-foreground">{ar ? "المتاح حاليًا هو المجال المؤكد في بيانات الـ API." : "Only the industry key confirmed by the supplied API data is offered."}</p></div>
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
      <TenantImageUpload id="tenant-logo" label={copy.logoUrl} value={values.branding.logoUrl} onChange={(value) => update("branding", "logoUrl", value)} hint={copy.uploadHint} uploadLabel={copy.upload} replaceLabel={copy.replace} removeLabel={copy.remove} invalidTypeLabel={copy.invalidImage} tooLargeLabel={copy.imageTooLarge} previewLabel={copy.preview}/>
      <TenantImageUpload id="tenant-cover" label={copy.coverImageUrl} value={values.branding.coverImageUrl} onChange={(value) => update("branding", "coverImageUrl", value)} hint={copy.uploadHint} uploadLabel={copy.upload} replaceLabel={copy.replace} removeLabel={copy.remove} invalidTypeLabel={copy.invalidImage} tooLargeLabel={copy.imageTooLarge} previewLabel={copy.preview}/>
      <div className="space-y-3 sm:col-span-2"><Label htmlFor="tenant-primary-color">{copy.primaryColor}</Label><div className="flex flex-wrap items-center gap-3 rounded-2xl border bg-muted/20 p-4"><span className="size-12 rounded-xl border shadow-inner" style={{backgroundColor: values.branding.primaryColor}}/><div className="min-w-0 flex-1"><p className="font-mono text-sm font-semibold">{values.branding.primaryColor.toUpperCase()}</p><p className="text-xs text-muted-foreground">{ar ? "اختر لونًا جاهزًا أو خصص اللون." : "Choose a curated color or open the custom picker."}</p></div><Input id="tenant-primary-color" type="color" value={values.branding.primaryColor} onChange={(event) => update("branding", "primaryColor", event.target.value)} className="h-11 w-16 cursor-pointer p-1"/></div><div className="flex flex-wrap gap-2">{["#2563eb","#6d4aff","#0f766e","#0e7490","#be123c","#b45309","#334155","#111827"].map((color) => <Button key={color} type="button" variant="outline" size="icon" aria-label={color} title={color} onClick={() => update("branding","primaryColor",color)} className={"size-8 rounded-full border-2 p-0 " + (values.branding.primaryColor.toLowerCase() === color ? "ring-2 ring-primary ring-offset-2" : "")} style={{backgroundColor:color}} />)}</div></div>
    </TenantFormSection>,
    <TenantFormSection key="preferences" title={copy.preferences} description={copy.preferencesHint} icon={Settings2}>
      <div className="space-y-2"><Label>{copy.timezone}</Label><SelectMenu value={values.preferences.timezone} onValueChange={(value) => update("preferences", "timezone", value)}><SelectMenuTrigger><SelectMenuValue/></SelectMenuTrigger><SelectMenuContent>{!["Africa/Cairo","Asia/Riyadh","Asia/Dubai","UTC"].includes(values.preferences.timezone) && <SelectMenuItem value={values.preferences.timezone}>{values.preferences.timezone}</SelectMenuItem>}{["Africa/Cairo","Asia/Riyadh","Asia/Dubai","UTC"].map((zone) => <SelectMenuItem key={zone} value={zone}>{zone}</SelectMenuItem>)}</SelectMenuContent></SelectMenu></div>
      <div className="space-y-2"><Label>{copy.locale}</Label><SelectMenu value={values.preferences.locale} onValueChange={(value) => update("preferences", "locale", value)}><SelectMenuTrigger><SelectMenuValue/></SelectMenuTrigger><SelectMenuContent>{!["en","ar"].includes(values.preferences.locale) && <SelectMenuItem value={values.preferences.locale}>{values.preferences.locale}</SelectMenuItem>}<SelectMenuItem value="en">English</SelectMenuItem><SelectMenuItem value="ar">العربية</SelectMenuItem></SelectMenuContent></SelectMenu></div>
      <div className="space-y-2"><Label>{copy.currency}</Label><SelectMenu value={values.preferences.currency} onValueChange={(value) => update("preferences", "currency", value)}><SelectMenuTrigger><SelectMenuValue/></SelectMenuTrigger><SelectMenuContent>{!["EGP","SAR","AED","USD"].includes(values.preferences.currency) && <SelectMenuItem value={values.preferences.currency}>{values.preferences.currency}</SelectMenuItem>}<SelectMenuItem value="EGP">EGP — Egyptian Pound</SelectMenuItem><SelectMenuItem value="SAR">SAR — Saudi Riyal</SelectMenuItem><SelectMenuItem value="AED">AED — UAE Dirham</SelectMenuItem><SelectMenuItem value="USD">USD — US Dollar</SelectMenuItem></SelectMenuContent></SelectMenu></div>
      <div className="space-y-2"><Label>{copy.dateFormat}</Label><SelectMenu value={values.preferences.dateFormat} onValueChange={(value) => update("preferences", "dateFormat", value)}><SelectMenuTrigger><SelectMenuValue/></SelectMenuTrigger><SelectMenuContent>{!["YYYY-MM-DD","DD/MM/YYYY","MM/DD/YYYY"].includes(values.preferences.dateFormat) && <SelectMenuItem value={values.preferences.dateFormat}>{values.preferences.dateFormat}</SelectMenuItem>}<SelectMenuItem value="YYYY-MM-DD">YYYY-MM-DD</SelectMenuItem><SelectMenuItem value="DD/MM/YYYY">DD/MM/YYYY</SelectMenuItem><SelectMenuItem value="MM/DD/YYYY">MM/DD/YYYY</SelectMenuItem></SelectMenuContent></SelectMenu></div>
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
          {steps.map((item, index) => { const Icon = stepIcons[index] ?? Building2; const locked = index > highestUnlockedStep; return <Button key={item} type="button" disabled={locked || saving} variant={step === index ? "secondary" : "ghost"} onClick={() => setStep(index)} className={"flex h-auto w-full justify-start gap-3 rounded-xl px-3 py-3 text-start " + (step === index ? "bg-primary/10 text-primary hover:bg-primary/15" : locked ? "cursor-not-allowed text-muted-foreground/40" : "text-muted-foreground hover:bg-muted hover:text-foreground")}><span className={"flex size-9 shrink-0 items-center justify-center rounded-lg " + (step === index ? "bg-primary text-primary-foreground" : "bg-muted")}><Icon className="size-4"/></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{stepLabels[index]}</span><span className="mt-0.5 block text-[11px] opacity-70">{locked ? (ar ? "أكمل الخطوة السابقة" : "Complete previous step") : index + 1 + " / " + steps.length}</span></span>{index < highestUnlockedStep ? <Check className="size-4"/> : <ChevronRight className="size-4 opacity-50"/>}</Button> })}
        </nav>
        <form onSubmit={submit} className="min-w-0 space-y-5">
          <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wider text-primary">{copy.stepOf} {step + 1}</p><h2 className="mt-1 text-xl font-semibold">{stepLabels[step]}</h2></div><span className="rounded-full border bg-card px-3 py-1.5 text-xs text-muted-foreground">{step + 1} / {steps.length}</span></div>
          {step === 0 && <p className="text-xs text-muted-foreground"><span className="text-destructive">*</span> {ar ? "الحقول المطلوبة" : "Required fields"}</p>}
          {step < 5 ? sectionContent[step] : <TenantReviewPanel values={values} ar={ar} onEdit={setStep} labels={{identity:copy.identity,contact:copy.contact,location:copy.location,legal:copy.legal,preferences:copy.preferences,edit:copy.edit,empty:copy.empty}}/>}
          {step === 4 && <p className="rounded-xl border border-primary/15 bg-primary/[0.04] px-4 py-3 text-xs leading-5 text-muted-foreground">{copy.review}</p>}
          <div className="flex flex-col-reverse justify-between gap-3 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center">
            <Button type="button" variant="outline" onClick={() => step === 0 ? navigate("/super-admin/tenants") : setStep((current) => current - 1)} disabled={saving}><ArrowLeft className="size-4"/>{step === 0 ? copy.back : copy.previous}</Button>
            {step < steps.length - 1
              ? <Button type="button" onClick={continueToNextStep}>{copy.next}<ArrowRight className="size-4"/></Button>
              : <Button type="submit" loading={saving} disabled={saving}><Check className="size-4"/>{saving ? copy.saving : isEdit ? copy.save : copy.create}</Button>}
          </div>
        </form>
      </div>
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="mb-2 flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600"><Check className="size-6"/></div>
            <DialogTitle>{copy.successTitle}</DialogTitle>
            <DialogDescription>{copy.successDescription}</DialogDescription>
          </DialogHeader>
          <div className="rounded-xl border bg-muted/30 p-3">
            <p className="text-sm font-semibold">{savedTenant?.displayName || savedTenant?.name || values.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">{savedTenant?.slug || ""}</p>
          </div>
          <DialogFooter className="sm:flex-row">
            <Button type="button" variant="outline" onClick={downloadTenantPdf}><Download className="size-4"/>{copy.downloadPdf}</Button>
            <Button type="button" onClick={() => navigate("/super-admin/tenants/" + encodeURIComponent(savedTenant?.id || tenantId))}>{copy.done}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {savedTenant && <TenantPdfDocument values={values} slug={savedTenant.slug} locale={locale}/>}
    </div>
  )
}
