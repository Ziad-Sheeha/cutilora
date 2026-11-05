import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { ArrowLeft, ArrowRight, Building2, Check, ChevronRight, Landmark, MapPin, Settings2, Sparkles, UserRound, ClipboardCheck, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useI18n } from "@/i18n/i18n-provider"
import { pushToast, store } from "@/store"
import { useTenant, useTenantMutations } from "../hooks/use-tenants"
import { TenantReviewPanel } from "../components/tenant-review-panel"
import { TenantContactSection, TenantIdentitySection, TenantLegalBrandingSection, TenantLocationSection, TenantOwnerSection, TenantPreferencesSection } from "../components/tenant-form-sections"
import { emptyTenantForm, formToPayload, tenantToForm, type TenantFormValues } from "../types/tenant-form.types"
import type { Tenant } from "../types/tenant.types"

const baseStepIcons = [Building2, UserRound, MapPin, Landmark, Settings2]

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
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [savedTenant, setSavedTenant] = useState<Tenant | null>(null)
  const saving = mutations.create.isPending || mutations.updateProfile.isPending
  const steps = isEdit ? ["identity", "contact", "location", "legal", "preferences", "review"] as const : ["identity", "contact", "location", "legal", "preferences", "owner", "review"] as const
  const stepIcons = isEdit ? [...baseStepIcons, ClipboardCheck] : [...baseStepIcons, UserRound, ClipboardCheck]
  const finalStep = steps.length - 1

  useEffect(() => {
    if (tenantQuery.data && isEdit) { setValues(tenantToForm(tenantQuery.data)); setHighestUnlockedStep(5) }
  }, [tenantQuery.data, isEdit])

  const copy = useMemo(() => ar ? {
    back: "العودة للمؤسسات", createTitle: "إنشاء مؤسسة جديدة", editTitle: "تعديل بيانات المؤسسة",
    createDescription: "أنشئ ملف المؤسسة من خلال خطوات واضحة. يمكنك مراجعة كل جزء قبل الحفظ.",
    editDescription: "حدّث بيانات المؤسسة مع الحفاظ على تقسيم واضح لكل مجموعة من المعلومات.",
    identity: "الهوية الأساسية", identityHint: "اسم المؤسسة وهويتها القانونية ونوع نشاطها.",
    contact: "بيانات التواصل", contactHint: "قنوات التواصل الرسمية الخاصة بالمؤسسة.",
    owner: "حساب مدير المؤسسة", ownerHint: "أنشئ حساب المستخدم المسؤول الذي سيستطيع تسجيل الدخول وإدارة المؤسسة.", ownerName: "اسم المستخدم", ownerEmail: "بريد تسجيل الدخول", ownerPassword: "كلمة المرور", ownerConfirm: "تأكيد كلمة المرور", passwordWeak: "ضعيفة", passwordFair: "متوسطة", passwordGood: "جيدة", passwordStrong: "قوية", passwordRules: "استخدم كلمة مرور من 12 إلى 128 حرفًا.", passwordMismatch: "كلمتا المرور غير متطابقتين.",
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
    uploadHint: "PNG, JPG or WebP · بحد أقصى 2MB", upload: "رفع صورة", replace: "استبدال الصورة", remove: "حذف الصورة", invalidImage: "صيغة الصورة غير مدعومة. استخدم PNG أو JPG أو WebP.", readImageError: "تعذرت قراءة الصورة. حاول اختيار ملف آخر.", imageTooLarge: "حجم الصورة يجب ألا يتجاوز 2MB.", preview: "معاينة الصورة", requiredFields: "أكمل الحقول المطلوبة المميزة بعلامة النجمة قبل المتابعة.", done: "تم", successTitle: "تم حفظ المؤسسة بنجاح", successDescription: "تم حفظ البيانات بنجاح. يمكنك المتابعة إلى صفحة تفاصيل المؤسسة.", edit: "تعديل", empty: "لا توجد بيانات مدخلة.", invalidCoordinates: "الإحداثيات يجب أن تكون أرقامًا ضمن النطاق الصحيح.", invalidEmail: "أدخل بريدًا إلكترونيًا صحيحًا.", invalidUrl: "أدخل رابطًا صحيحًا يبدأ بـ https:// أو http://.", duplicatePhone: "رقم الهاتف الأساسي والبديل يجب أن يكونا مختلفين.", invalidPhone: "أدخل رقم هاتف صحيحًا من 7 إلى 15 رقمًا."
  } : {
    back: "Back to tenants", createTitle: "Create a tenant", editTitle: "Edit tenant profile",
    createDescription: "Build the organization profile through focused steps. Review each section before saving.",
    editDescription: "Update the organization profile with every information group kept clearly separated.",
    identity: "Organization identity", identityHint: "The organization's name, legal identity and operating model.",
    contact: "Contact information", contactHint: "Official communication channels for this organization.",
    owner: "Organization owner account", ownerHint: "Create the user account that will sign in and manage this organization.", ownerName: "Owner full name", ownerEmail: "Login email", ownerPassword: "Password", ownerConfirm: "Confirm password", passwordWeak: "Weak", passwordFair: "Fair", passwordGood: "Good", passwordStrong: "Strong", passwordRules: "Use a password between 12 and 128 characters.", passwordMismatch: "Passwords do not match.",
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
    uploadHint: "PNG, JPG or WebP · Up to 2MB", upload: "Upload image", replace: "Replace image", remove: "Remove image", invalidImage: "Unsupported image format. Use PNG, JPG or WebP.", readImageError: "The image could not be read. Try another file.", imageTooLarge: "Image size must not exceed 2MB.", preview: "Image preview", requiredFields: "Complete the required fields marked with an asterisk before continuing.", done: "Done", successTitle: "Tenant saved successfully", successDescription: "Your changes have been saved successfully. Continue to the tenant details page.", edit: "Edit", empty: "No information provided.", invalidCoordinates: "Coordinates must be valid numbers within the supported range.", invalidEmail: "Enter a valid email address.", invalidUrl: "Enter a valid URL starting with https:// or http://.", duplicatePhone: "The primary and alternate phone numbers must be different.", invalidPhone: "Enter a valid phone number containing 7 to 15 digits."
  }, [ar])

  const stepLabels = ar
    ? ["البيانات الأساسية", "التواصل", "العنوان", "القانوني والعلامة", "التفضيلات", ...(!isEdit ? ["حساب المدير"] : []), "المراجعة"]
    : ["Basics", "Contact", "Location", "Legal & branding", "Preferences", ...(!isEdit ? ["Owner account"] : []), "Review"]

  function update<K extends "contact" | "address" | "legal" | "branding" | "preferences">(section: K, key: string, value: string) {
    setValues((current) => ({
      ...current,
      [section]: { ...(current[section] as Record<string, unknown>), [key]: value },
    } as TenantFormValues))
  }
  function updateOwner(key: keyof TenantFormValues["owner"], value: string) { setValues((current) => ({ ...current, owner: { ...current.owner, [key]: value } })) }
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
      const primaryPhone = values.contact.phone.replace(/\D/g, "").replace(/^0/, "")
      const alternatePhone = values.contact.alternatePhone.replace(/\D/g, "").replace(/^0/, "")
      const whatsappPhone = values.contact.whatsapp.replace(/\D/g, "").replace(/^0/, "")
      if ([primaryPhone, alternatePhone, whatsappPhone].some((number) => number && (number.length < 7 || number.length > 15))) return [copy.invalidPhone]
      if (primaryPhone && alternatePhone && primaryPhone === alternatePhone) return [copy.duplicatePhone]
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
    if (index === 5 && !isEdit) {
      const password = values.owner.password
      if (!values.owner.name.trim() || !values.owner.email.trim() || !password || !values.owner.passwordConfirmation) return [copy.requiredFields]
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.owner.email.trim())) return [copy.invalidEmail]
      if (password.length < 12 || password.length > 128) return [copy.passwordRules]
      if (password !== values.owner.passwordConfirmation) return [copy.passwordMismatch]
    }
    return []
  }

  function continueToNextStep() {
    const errors = validateStep(step)
    if (errors.length) {
      if (step === 0) {
        const missingId = !values.name.trim() ? "tenant-name" : !values.businessType.trim() ? "tenant-business-type" : "tenant-industry"
        document.getElementById(missingId)?.focus()
      }
      store.dispatch(pushToast({ id: crypto.randomUUID(), kind: "error", title: errors[0] }))
      return
    }
    setHighestUnlockedStep((current) => Math.max(current, step + 1))
    setStep((current) => Math.min(steps.length - 1, current + 1))
  }

  async function submitTenant() {
    if (step !== finalStep || saving) return
    const invalidStep = steps.slice(0, finalStep).findIndex((_, index) => validateStep(index).length > 0)
    if (invalidStep >= 0) { setStep(invalidStep); store.dispatch(pushToast({ id: crypto.randomUUID(), kind: "error", title: validateStep(invalidStep)[0] })); return }
    const payload = formToPayload(values)
    try {
      const saved = isEdit ? await mutations.updateProfile.mutateAsync({ id: tenantId, payload: (({ owner: _owner, ...profile }) => profile)(payload) }) : await mutations.create.mutateAsync(payload)
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
    <TenantIdentitySection key="identity" values={values} copy={copy} ar={ar} updateTop={updateTop}/>,
    <TenantContactSection key="contact" values={values} copy={copy} ar={ar} update={update}/>,
    <TenantLocationSection key="location" values={values} copy={copy} ar={ar} update={update} updateLocation={updateLocation}/>,
    <TenantLegalBrandingSection key="legal" values={values} copy={copy} ar={ar} update={update}/>,
    <TenantPreferencesSection key="preferences" values={values} copy={copy} ar={ar} update={update} toggleLanguage={toggleLanguage}/>,
  ]

  return (
    <div dir={dir} className="mx-auto w-full min-w-0 max-w-[1180px] space-y-5 overflow-x-clip pb-8 sm:space-y-6">
      <Link to="/super-admin/tenants" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-primary"><ArrowLeft className="size-4"/>{copy.back}</Link>
      <header className="relative min-w-0 overflow-hidden rounded-2xl border border-[#282344] bg-[#151329] px-4 py-5 text-white shadow-xl sm:rounded-[28px] sm:px-8 sm:py-7">
        <div className="pointer-events-none absolute -end-16 -top-28 size-72 rounded-full bg-violet-500/20 blur-3xl"/>
        <div className="relative flex items-start gap-4"><span className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-violet-200"><Sparkles className="size-5"/></span><div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-300">CUTILORA / PLATFORM / TENANTS</p><h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{isEdit ? copy.editTitle : copy.createTitle}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{isEdit ? copy.editDescription : copy.createDescription}</p></div></div>
      </header>
      <div className="grid min-w-0 items-start gap-4 lg:grid-cols-[248px_minmax(0,1fr)] lg:gap-5">
        <nav aria-label={ar ? "أقسام النموذج" : "Form sections"} className="flex min-w-0 gap-2 overflow-x-auto rounded-2xl border bg-card p-2 lg:sticky lg:top-5 lg:block lg:space-y-1">
          <div className="px-3 pb-3 pt-2"><p className="text-xs font-semibold text-muted-foreground">{copy.stepOf} {step + 1} / {steps.length}</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: ((step + 1) / steps.length * 100) + "%" }}/></div></div>
          {steps.map((item, index) => { const Icon = stepIcons[index] ?? Building2; const locked = index > highestUnlockedStep; return <Button key={item} type="button" disabled={locked || saving} variant={step === index ? "secondary" : "ghost"} onClick={() => setStep(index)} className={"flex h-auto min-w-[168px] shrink-0 justify-start gap-2 rounded-xl px-3 py-2.5 text-start lg:w-full " + (step === index ? "bg-primary/10 text-primary hover:bg-primary/15" : locked ? "cursor-not-allowed text-muted-foreground/40" : "text-muted-foreground hover:bg-muted hover:text-foreground")}><span className={"flex size-9 shrink-0 items-center justify-center rounded-lg " + (step === index ? "bg-primary text-primary-foreground" : "bg-muted")}><Icon className="size-4"/></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{stepLabels[index]}</span><span className="mt-0.5 block text-[11px] opacity-70">{locked ? (ar ? "أكمل الخطوة السابقة" : "Complete previous step") : index + 1 + " / " + steps.length}</span></span>{index < highestUnlockedStep ? <Check className="size-4"/> : <ChevronRight className="size-4 opacity-50"/>}</Button> })}
        </nav>
        <form onSubmit={(event) => event.preventDefault()} className="min-w-0 space-y-5">
          <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wider text-primary">{copy.stepOf} {step + 1}</p><h2 className="mt-1 text-xl font-semibold">{stepLabels[step]}</h2></div><span className="rounded-full border bg-card px-3 py-1.5 text-xs text-muted-foreground">{step + 1} / {steps.length}</span></div>
          {step === 0 && <p className="text-xs text-muted-foreground"><span className="text-destructive">*</span> {ar ? "الحقول المطلوبة" : "Required fields"}</p>}
          {step < 5 ? sectionContent[step] : !isEdit && step === 5 ? <TenantOwnerSection values={values} copy={copy} ar={ar} updateOwner={updateOwner}/> : <TenantReviewPanel values={values} ar={ar} onEdit={setStep} labels={{identity:copy.identity,contact:copy.contact,location:copy.location,legal:copy.legal,preferences:copy.preferences,owner:copy.owner,edit:copy.edit,empty:copy.empty}}/>}
          {step === 4 && <p className="rounded-xl border border-primary/15 bg-primary/[0.04] px-4 py-3 text-xs leading-5 text-muted-foreground">{copy.review}</p>}
          <div className="flex flex-col-reverse justify-between gap-3 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center">
            <Button type="button" variant="outline" onClick={() => step === 0 ? navigate("/super-admin/tenants") : setStep((current) => current - 1)} disabled={saving}><ArrowLeft className="size-4"/>{step === 0 ? copy.back : copy.previous}</Button>
            {step < finalStep
              ? <Button type="button" onClick={continueToNextStep}>{copy.next}<ArrowRight className="size-4"/></Button>
              : <Button type="button" loading={saving} disabled={saving} onClick={() => setConfirmOpen(true)}><ShieldAlert className="size-4"/>{saving ? copy.saving : isEdit ? copy.save : copy.create}</Button>}
          </div>
        </form>
      </div>
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-2xl">
          <DialogHeader>
            <div className="mb-2 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><ShieldAlert className="size-6"/></div>
            <DialogTitle>{isEdit ? (ar ? "تأكيد حفظ التعديلات" : "Confirm profile changes") : (ar ? "تأكيد إنشاء المؤسسة" : "Confirm tenant creation")}</DialogTitle>
            <DialogDescription>{isEdit ? (ar ? "هل تريد حفظ التعديلات على بيانات هذه المؤسسة؟" : "Are you sure you want to save these changes to this tenant?") : (ar ? "سيتم إنشاء المؤسسة وحساب المدير بالبيانات التي أدخلتها. هل تريد المتابعة؟" : "This will create the tenant and its owner account using the information you entered. Do you want to continue?")}</DialogDescription>
          </DialogHeader>
          <div className="rounded-xl border bg-muted/30 p-3"><p className="text-sm font-semibold">{values.displayName || values.name || (ar ? "مؤسسة جديدة" : "New tenant")}</p>{!isEdit && <p className="mt-1 break-all text-xs text-muted-foreground">{values.owner.email}</p>}</div>
          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => setConfirmOpen(false)}>{ar ? "مراجعة البيانات" : "Go back"}</Button>
            <Button type="button" className="w-full sm:w-auto" loading={saving} disabled={saving} onClick={() => { setConfirmOpen(false); void submitTenant() }}>{isEdit ? (ar ? "تأكيد الحفظ" : "Confirm changes") : (ar ? "تأكيد الإنشاء" : "Confirm creation")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
          <DialogFooter><Button type="button" className="w-full sm:w-auto" onClick={() => navigate("/super-admin/tenants/" + encodeURIComponent(savedTenant?.id || tenantId))}>{copy.done}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
