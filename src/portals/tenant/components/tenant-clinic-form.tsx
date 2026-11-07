import { useEffect, useState, type FormEvent } from "react"
import { Building2, Contact, MapPin, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { PhoneNumberField } from "@/components/ui/phone-number-field"
import { phoneCountries } from "@/components/ui/phone-country-data"
import { useI18n } from "@/i18n/i18n-provider"
import { clinicFormSchema, getTenantFieldErrors } from "../features/shared/tenant-feature-schemas"
import { getTenantGeo } from "../api/tenant-api"
import type { Clinic } from "../types/tenant.types"

type GeoOption = { id: string; name_en: string; name_ar?: string | null }
type Values = {
  name: string; code: string; clinicType: string; description: string; specialties: string
  email: string; phone: string; alternatePhone: string; whatsapp: string; website: string
  countryId: string; governorateId: string; cityId: string; districtId: string
  addressLine1: string; addressLine2: string; building: string; floor: string; unit: string; landmark: string; postalCode: string
  timezone: string; locale: string; currency: string; primaryColor: string; openingDate: string
}
type Props = { clinic?: Clinic | null; onCancel: () => void; onSave: (payload: Record<string, unknown>) => Promise<void> }
function phoneParts(raw?: string) {
  const value = String(raw ?? "").trim()
  const country = phoneCountries.filter(item => value.startsWith(item.dial)).sort((a, b) => b.dial.length - a.dial.length)[0]
  return { code: country?.dial ?? "+20", local: country ? value.slice(country.dial.length) : value }
}
function toInternationalPhone(local: string, code: string) {
  const digits = local.replace(/\\D/g, "").replace(/^0+/, "")
  return digits ? `${code}${digits}` : ""
}
const empty: Values = {
  name: "", code: "", clinicType: "aesthetic", description: "", specialties: "",
  email: "", phone: "", alternatePhone: "", whatsapp: "", website: "",
  countryId: "", governorateId: "", cityId: "", districtId: "",
  addressLine1: "", addressLine2: "", building: "", floor: "", unit: "", landmark: "", postalCode: "",
  timezone: "Africa/Cairo", locale: "en", currency: "EGP", primaryColor: "#0f766e", openingDate: "",
}
function fromClinic(clinic?: Clinic | null): Values {
  if (!clinic) return empty
  return {
    ...empty, name: clinic.name || "", code: clinic.code || "", clinicType: clinic.clinicType || "aesthetic",
    description: clinic.description || "", specialties: clinic.specialties?.join(", ") || "",
    email: clinic.contact?.email || "", phone: phoneParts(clinic.contact?.phone).local,
    alternatePhone: phoneParts(clinic.contact?.alternatePhone).local, whatsapp: phoneParts(clinic.contact?.whatsapp).local, website: clinic.contact?.website || "",
    countryId: clinic.address?.countryId || "", governorateId: clinic.address?.governorateId || "",
    cityId: clinic.address?.cityId || "", districtId: clinic.address?.districtId || "",
    addressLine1: clinic.address?.addressLine1 || "", addressLine2: clinic.address?.addressLine2 || "",
    building: clinic.address?.building || "", floor: clinic.address?.floor || "", unit: clinic.address?.unit || "",
    landmark: clinic.address?.landmark || "", postalCode: clinic.address?.postalCode || "",
    timezone: clinic.timezone || "Africa/Cairo", locale: clinic.preferences?.locale || "en",
    currency: clinic.preferences?.currency || "EGP", primaryColor: clinic.branding?.primaryColor || "#0f766e",
    openingDate: clinic.openingDate ? clinic.openingDate.slice(0, 10) : "",
  }
}

export function TenantClinicForm({ clinic, onCancel, onSave }: Props) {
  const { locale } = useI18n()
  const ar = locale === "ar"
  const [values, setValues] = useState<Values>(() => fromClinic(clinic))
  const [phoneCodes, setPhoneCodes] = useState(() => ({ phone: phoneParts(clinic?.contact?.phone).code, alternatePhone: phoneParts(clinic?.contact?.alternatePhone).code, whatsapp: phoneParts(clinic?.contact?.whatsapp).code }))
  const [countries, setCountries] = useState<GeoOption[]>([])
  const [governorates, setGovernorates] = useState<GeoOption[]>([])
  const [cities, setCities] = useState<GeoOption[]>([])
  const [districts, setDistricts] = useState<GeoOption[]>([])
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState("")

  useEffect(() => { setValues(fromClinic(clinic)); setPhoneCodes({ phone: phoneParts(clinic?.contact?.phone).code, alternatePhone: phoneParts(clinic?.contact?.alternatePhone).code, whatsapp: phoneParts(clinic?.contact?.whatsapp).code }); setErrors({}); setServerError("") }, [clinic])
  useEffect(() => { getTenantGeo("countries").then(setCountries).catch(cause => setServerError(cause.message)) }, [])
  useEffect(() => {
    if (!values.countryId) { setGovernorates([]); return }
    getTenantGeo("governorates", { country_id: values.countryId }).then(setGovernorates).catch(cause => setServerError(cause.message))
  }, [values.countryId])
  useEffect(() => {
    if (!values.governorateId) { setCities([]); return }
    getTenantGeo("cities", { governorate_id: values.governorateId }).then(setCities).catch(cause => setServerError(cause.message))
  }, [values.governorateId])
  useEffect(() => {
    if (!values.cityId) { setDistricts([]); return }
    getTenantGeo("districts", { city_id: values.cityId }).then(setDistricts).catch(cause => setServerError(cause.message))
  }, [values.cityId])

  const copy = ar ? {
    identity: "هوية العيادة", identityHint: "الاسم والتصنيف والتخصصات التي تميز الكيان الطبي.",
    name: "اسم العيادة", code: "كود العيادة", type: "نوع العيادة", description: "نبذة تعريفية", specialties: "التخصصات (افصل بينها بفاصلة)",
    contact: "بيانات التواصل", email: "البريد الإلكتروني", phone: "الهاتف الرئيسي", alternate: "هاتف بديل", whatsapp: "واتساب", website: "الموقع الإلكتروني",
    location: "العنوان والموقع", country: "الدولة", governorate: "المحافظة", city: "المدينة", district: "الحي",
    line1: "العنوان", line2: "تفاصيل إضافية", building: "المبنى", floor: "الدور", unit: "الوحدة", landmark: "علامة مميزة", postal: "الرمز البريدي",
    defaults: "إعدادات العيادة", timezone: "المنطقة الزمنية", locale: "لغة العيادة", currency: "العملة", color: "اللون الأساسي", opening: "تاريخ الافتتاح",
    choose: "اختر", save: clinic ? "حفظ التعديلات" : "إنشاء العيادة", cancel: "إلغاء"
  } : {
    identity: "Clinic identity", identityHint: "The name, classification and specialties that define this medical entity.",
    name: "Clinic name", code: "Clinic code", type: "Clinic type", description: "Description", specialties: "Specialties (comma separated)",
    contact: "Contact information", email: "Business email", phone: "Primary phone", alternate: "Alternate phone", whatsapp: "WhatsApp", website: "Website",
    location: "Address & location", country: "Country", governorate: "Governorate", city: "City", district: "District",
    line1: "Address line 1", line2: "Address line 2", building: "Building", floor: "Floor", unit: "Unit", landmark: "Landmark", postal: "Postal code",
    defaults: "Clinic defaults", timezone: "Timezone", locale: "Clinic language", currency: "Currency", color: "Brand color", opening: "Opening date",
    choose: "Select", save: clinic ? "Save changes" : "Create clinic", cancel: "Cancel"
  }

  function update<K extends keyof Values>(key: K, value: Values[K]) {
    setValues(current => ({
      ...current, [key]: value,
      ...(key === "countryId" ? { governorateId: "", cityId: "", districtId: "" } : {}),
      ...(key === "governorateId" ? { cityId: "", districtId: "" } : {}),
      ...(key === "cityId" ? { districtId: "" } : {}),
    }))
    setErrors(current => ({ ...current, [key]: "" }))
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const validation = clinicFormSchema.safeParse(values)
    if (!validation.success) { setErrors(getTenantFieldErrors(validation.error, ar ? "ar" : "en")); return }
    setSaving(true); setErrors({}); setServerError("")
    const contact = Object.fromEntries([
      ["email", values.email], ["phone", values.phone], ["alternatePhone", values.alternatePhone],
      ["whatsapp", values.whatsapp], ["website", values.website],
    ].filter(([, value]) => String(value).trim()).map(([key, value]) => [key, String(value).trim()]))
    const address = Object.fromEntries([
      ["countryId", values.countryId], ["governorateId", values.governorateId], ["cityId", values.cityId],
      ["districtId", values.districtId], ["addressLine1", values.addressLine1], ["addressLine2", values.addressLine2],
      ["building", values.building], ["floor", values.floor], ["unit", values.unit], ["landmark", values.landmark], ["postalCode", values.postalCode],
    ].filter(([, value]) => String(value).trim()).map(([key, value]) => [key, String(value).trim()]))
    try {
      await onSave({
        name: values.name.trim(), ...(values.code.trim() ? { code: values.code.trim().toUpperCase() } : {}),
        clinicType: values.clinicType, description: values.description.trim(),
        specialties: values.specialties.split(",").map(item => item.trim()).filter(Boolean),
        contact, address, timezone: values.timezone.trim(),
        preferences: { timezone: values.timezone.trim(), locale: values.locale, currency: values.currency, supportedLanguages: ["en", "ar"] },
        branding: { primaryColor: values.primaryColor },
        ...(values.openingDate ? { openingDate: new Date(`${values.openingDate}T00:00:00.000Z`).toISOString() } : { openingDate: null }),
      })
    } catch (cause) {
      setServerError(cause instanceof Error ? cause.message : (ar ? "تعذر حفظ العيادة." : "Unable to save clinic."))
    } finally { setSaving(false) }
  }

  const nameOf = (item: GeoOption) => ar ? item.name_ar || item.name_en : item.name_en
  return <form noValidate onSubmit={submit} className="space-y-5">
    <Card className="rounded-2xl border-slate-200/80 shadow-sm"><CardContent className="space-y-4 p-5">
      <Section icon={Building2} title={copy.identity} hint={copy.identityHint}/>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={copy.name} required error={errors.name}><Input value={values.name} maxLength={160} onChange={event => update("name", event.target.value)}/></Field>
        <Field label={copy.code} error={errors.code}><Input value={values.code} maxLength={30} onChange={event => update("code", event.target.value.toUpperCase())} placeholder="e.g. CLN-01"/></Field>
        <Field label={copy.type} required error={errors.clinicType}><Select value={values.clinicType} onValueChange={value => update("clinicType", value)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>
          {["dermatology", "aesthetic", "beauty", "medical_center", "other"].map((value, index) => <SelectItem key={value} value={value}>{(ar ? ["جلدية", "تجميل", "جمال", "مركز طبي", "أخرى"] : ["Dermatology", "Aesthetic", "Beauty", "Medical center", "Other"])[index]}</SelectItem>)}
        </SelectContent></Select></Field>
        <Field label={copy.description} error={errors.description}><Input value={values.description} maxLength={2000} onChange={event => update("description", event.target.value)}/></Field>
        <div className="sm:col-span-2"><Field label={copy.specialties}><Input value={values.specialties} onChange={event => update("specialties", event.target.value)} placeholder={ar ? "ليزر، جلدية، عناية بالبشرة" : "Laser, dermatology, skin care"}/></Field></div>
      </div>
    </CardContent></Card>

    <Card className="rounded-2xl border-slate-200/80 shadow-sm"><CardContent className="space-y-4 p-5">
      <Section icon={Contact} title={copy.contact}/>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={copy.email} error={errors.email}><Input type="email" value={values.email} onChange={event => update("email", event.target.value)}/></Field>
        <div><PhoneNumberField id="clinic-phone" label={copy.phone} value={values.phone} phoneCode={phoneCodes.phone} onChange={value => update("phone", value)} onPhoneCodeChange={value => setPhoneCodes(current => ({ ...current, phone: value }))} required={false}/>{errors.phone && <FieldError>{errors.phone}</FieldError>}</div>
        <div><PhoneNumberField id="clinic-alternate-phone" label={copy.alternate} value={values.alternatePhone} phoneCode={phoneCodes.alternatePhone} onChange={value => update("alternatePhone", value)} onPhoneCodeChange={value => setPhoneCodes(current => ({ ...current, alternatePhone: value }))}/>{errors.alternatePhone && <FieldError>{errors.alternatePhone}</FieldError>}</div>
        <div><PhoneNumberField id="clinic-whatsapp" label={copy.whatsapp} value={values.whatsapp} phoneCode={phoneCodes.whatsapp} onChange={value => update("whatsapp", value)} onPhoneCodeChange={value => setPhoneCodes(current => ({ ...current, whatsapp: value }))}/>{errors.whatsapp && <FieldError>{errors.whatsapp}</FieldError>}</div>
        <div className="sm:col-span-2"><Field label={copy.website} error={errors.website}><Input type="url" value={values.website} onChange={event => update("website", event.target.value)} placeholder="https://"/></Field></div>
      </div>
    </CardContent></Card>

    <Card className="rounded-2xl border-slate-200/80 shadow-sm"><CardContent className="space-y-4 p-5">
      <Section icon={MapPin} title={copy.location}/>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <GeoSelect label={copy.country} value={values.countryId} options={countries} disabled={false} onChange={value => update("countryId", value)} choose={copy.choose} nameOf={nameOf}/>
        <GeoSelect label={copy.governorate} value={values.governorateId} options={governorates} disabled={!values.countryId} onChange={value => update("governorateId", value)} choose={copy.choose} nameOf={nameOf}/>
        <GeoSelect label={copy.city} value={values.cityId} options={cities} disabled={!values.governorateId} onChange={value => update("cityId", value)} choose={copy.choose} nameOf={nameOf}/>
        <GeoSelect label={copy.district} value={values.districtId} options={districts} disabled={!values.cityId} onChange={value => update("districtId", value)} choose={copy.choose} nameOf={nameOf}/>
        <Field label={copy.line1}><Input value={values.addressLine1} onChange={event => update("addressLine1", event.target.value)}/></Field>
        <Field label={copy.line2}><Input value={values.addressLine2} onChange={event => update("addressLine2", event.target.value)}/></Field>
        <Field label={copy.building}><Input value={values.building} onChange={event => update("building", event.target.value)}/></Field>
        <Field label={copy.floor}><Input value={values.floor} onChange={event => update("floor", event.target.value)}/></Field>
        <Field label={copy.unit}><Input value={values.unit} onChange={event => update("unit", event.target.value)}/></Field>
        <Field label={copy.landmark}><Input value={values.landmark} onChange={event => update("landmark", event.target.value)}/></Field>
        <Field label={copy.postal}><Input value={values.postalCode} onChange={event => update("postalCode", event.target.value)}/></Field>
      </div>
    </CardContent></Card>

    <Card className="rounded-2xl border-slate-200/80 shadow-sm"><CardContent className="space-y-4 p-5">
      <Section icon={Settings2} title={copy.defaults}/>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={copy.timezone} required error={errors.timezone}><Input value={values.timezone} onChange={event => update("timezone", event.target.value)} placeholder="Africa/Cairo"/></Field>
        <Field label={copy.opening}><DatePicker value={values.openingDate} onChange={value => update("openingDate", value)} locale={ar ? "ar" : "en"} dir={ar ? "rtl" : "ltr"} placeholder={copy.choose}/></Field>
        <Field label={copy.locale}><Select value={values.locale} onValueChange={value => update("locale", value)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="en">English</SelectItem><SelectItem value="ar">العربية</SelectItem></SelectContent></Select></Field>
        <Field label={copy.currency}><Select value={values.currency} onValueChange={value => update("currency", value)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{["EGP", "SAR", "AED", "USD"].map(value => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select></Field>
        <Field label={copy.color}><div className="flex h-10 items-center gap-3 rounded-xl border border-input px-3"><Input type="color" value={values.primaryColor} onChange={event => update("primaryColor", event.target.value)} className="h-7 w-10 cursor-pointer border-0 p-0"/><span className="text-sm font-medium text-slate-600">{values.primaryColor.toUpperCase()}</span></div></Field>
      </div>
    </CardContent></Card>

    {serverError && <FieldError className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm">{serverError}</FieldError>}
    <div className="flex justify-end gap-2 border-t border-slate-200 pt-4"><Button type="button" variant="outline" onClick={onCancel} disabled={saving}>{copy.cancel}</Button><Button type="submit" loading={saving} className="min-w-36">{copy.save}</Button></div>
  </form>
}

function Section({ icon: Icon, title, hint }: { icon: typeof Building2; title: string; hint?: string }) {
  return <div className="flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-700"><Icon className="size-4"/></span><div><h3 className="text-sm font-semibold text-slate-900">{title}</h3>{hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}</div></div>
}
function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}{required && <span className="ms-1 text-rose-500">*</span>}</Label>{children}{error && <FieldError>{error}</FieldError>}</div>
}
type GeoSelectProps = { label: string; value: string; options: GeoOption[]; disabled: boolean; onChange: (value: string) => void; choose: string; nameOf: (item: GeoOption) => string }
function GeoSelect({ label, value, options, disabled, onChange, choose, nameOf }: GeoSelectProps) {
  return <Field label={label}><Select value={value || "__none__"} disabled={disabled} onValueChange={selected => onChange(selected === "__none__" ? "" : selected)}><SelectTrigger><SelectValue placeholder={choose}/></SelectTrigger><SelectContent><SelectItem value="__none__">{choose}</SelectItem>{options.map(option => <SelectItem key={option.id} value={option.id}>{nameOf(option)}</SelectItem>)}</SelectContent></Select></Field>
}
