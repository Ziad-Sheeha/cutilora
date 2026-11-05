import { useEffect, useState, type FormEvent } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { useI18n } from "@/i18n/i18n-provider"
import { getTenantGeo } from "../api/tenant-api"
import type { Clinic } from "../types/tenant.types"

type GeoOption = { id: string; name_en: string; name_ar?: string | null }
type ClinicFormValues = {
  name: string
  clinicType: string
  description: string
  email: string
  phone: string
  countryId: string
  governorateId: string
  cityId: string
  districtId: string
  addressLine1: string
  timezone: string
}
type Props = {
  clinic?: Clinic | null
  onCancel: () => void
  onSave: (payload: Record<string, unknown>) => Promise<void>
}

const initialValues: ClinicFormValues = {
  name: "",
  clinicType: "aesthetic",
  description: "",
  email: "",
  phone: "",
  countryId: "",
  governorateId: "",
  cityId: "",
  districtId: "",
  addressLine1: "",
  timezone: "Africa/Cairo",
}

function getValues(clinic?: Clinic | null): ClinicFormValues {
  if (!clinic) return initialValues
  return {
    ...initialValues,
    name: clinic.name,
    clinicType: clinic.clinicType || "aesthetic",
    description: clinic.description || "",
    email: clinic.contact?.email || "",
    phone: clinic.contact?.phone || "",
    countryId: clinic.address?.countryId || "",
    governorateId: clinic.address?.governorateId || "",
    cityId: clinic.address?.cityId || "",
    districtId: clinic.address?.districtId || "",
    addressLine1: clinic.address?.addressLine1 || "",
    timezone: clinic.timezone || "Africa/Cairo",
  }
}

export function TenantClinicForm({ clinic, onCancel, onSave }: Props) {
  const { locale } = useI18n()
  const ar = locale === "ar"
  const [values, setValues] = useState<ClinicFormValues>(() => getValues(clinic))

  useEffect(() => {
    setValues(getValues(clinic))
  }, [clinic])
  const [countries, setCountries] = useState<GeoOption[]>([])
  const [governorates, setGovernorates] = useState<GeoOption[]>([])
  const [cities, setCities] = useState<GeoOption[]>([])
  const [districts, setDistricts] = useState<GeoOption[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const copy = ar
    ? {
        title: clinic ? "تعديل بيانات العيادة" : "إضافة عيادة",
        note: "اختر الموقع بالتسلسل الجغرافي الصحيح.",
        name: "اسم العيادة",
        type: "نوع العيادة",
        description: "نبذة",
        contact: "بيانات التواصل",
        email: "البريد الإلكتروني",
        phone: "الهاتف",
        location: "الموقع",
        country: "الدولة",
        governorate: "المحافظة",
        city: "المدينة",
        district: "الحي",
        address: "العنوان بالتفصيل",
        timezone: "المنطقة الزمنية",
        choose: "اختر",
        save: "حفظ العيادة",
        cancel: "إلغاء",
        types: ["جلدية", "تجميل", "جمال", "مركز طبي", "أخرى"],
      }
    : {
        title: clinic ? "Edit clinic" : "Add clinic",
        note: "Choose the location using the correct geographic hierarchy.",
        name: "Clinic name",
        type: "Clinic type",
        description: "Description",
        contact: "Contact details",
        email: "Email",
        phone: "Phone",
        location: "Location",
        country: "Country",
        governorate: "Governorate",
        city: "City",
        district: "District",
        address: "Address line",
        timezone: "Timezone",
        choose: "Select",
        save: "Save clinic",
        cancel: "Cancel",
        types: ["Dermatology", "Aesthetic", "Beauty", "Medical center", "Other"],
      }

  useEffect(() => {
    getTenantGeo("countries").then(setCountries).catch((e) => setError(e.message))
  }, [])

  useEffect(() => {
    if (!values.countryId) {
      setGovernorates([])
      return
    }
    getTenantGeo("governorates", { country_id: values.countryId })
      .then(setGovernorates)
      .catch((e) => setError(e.message))
  }, [values.countryId])

  useEffect(() => {
    if (!values.governorateId) {
      setCities([])
      return
    }
    getTenantGeo("cities", { governorate_id: values.governorateId })
      .then(setCities)
      .catch((e) => setError(e.message))
  }, [values.governorateId])

  useEffect(() => {
    if (!values.cityId) {
      setDistricts([])
      return
    }
    getTenantGeo("districts", { city_id: values.cityId })
      .then(setDistricts)
      .catch((e) => setError(e.message))
  }, [values.cityId])

  function update<K extends keyof ClinicFormValues>(key: K, value: string) {
    setValues((current) => ({
      ...current,
      [key]: value,
      ...(key === "countryId" ? { governorateId: "", cityId: "", districtId: "" } : {}),
      ...(key === "governorateId" ? { cityId: "", districtId: "" } : {}),
      ...(key === "cityId" ? { districtId: "" } : {}),
    }))
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError("")
    const payload = {
      name: values.name.trim(),
      clinicType: values.clinicType,
      description: values.description.trim(),
      timezone: values.timezone,
      contact: {
        ...(values.email.trim() ? { email: values.email.trim() } : {}),
        ...(values.phone.trim() ? { phone: values.phone.trim() } : {}),
      },
      address: {
        ...(values.countryId ? { countryId: values.countryId } : {}),
        ...(values.governorateId ? { governorateId: values.governorateId } : {}),
        ...(values.cityId ? { cityId: values.cityId } : {}),
        ...(values.districtId ? { districtId: values.districtId } : {}),
        ...(values.addressLine1.trim() ? { addressLine1: values.addressLine1.trim() } : {}),
      },
    }
    try {
      await onSave(payload)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save clinic")
    } finally {
      setSaving(false)
    }
  }

  const nameOf = (item: GeoOption) => (ar ? item.name_ar || item.name_en : item.name_en)

  return (
    <Card className="border-violet-200 bg-white shadow-lg shadow-violet-950/5">
      <CardContent className="p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="font-semibold">{copy.title}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{copy.note}</p>
          </div>
          <Button size="icon" variant="ghost" onClick={onCancel} aria-label={copy.cancel}>
            <X className="size-4" />
          </Button>
        </div>

        <form onSubmit={submit} className="space-y-6">
          <section className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="clinic-name">{copy.name} *</Label>
              <Input id="clinic-name" required minLength={2} maxLength={160} value={values.name} onChange={(e) => update("name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clinic-type">{copy.type}</Label>
              <Select id="clinic-type" value={values.clinicType} onChange={(e) => update("clinicType", e.target.value)}>
                {["dermatology", "aesthetic", "beauty", "medical_center", "other"].map((value, index) => (
                  <option key={value} value={value}>{copy.types[index]}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="clinic-description">{copy.description}</Label>
              <Input id="clinic-description" maxLength={2000} value={values.description} onChange={(e) => update("description", e.target.value)} />
            </div>
          </section>

          <section className="space-y-3">
            <h4 className="text-sm font-semibold">{copy.contact}</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="clinic-email">{copy.email}</Label>
                <Input id="clinic-email" type="email" value={values.email} onChange={(e) => update("email", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clinic-phone">{copy.phone}</Label>
                <Input id="clinic-phone" value={values.phone} onChange={(e) => update("phone", e.target.value)} />
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h4 className="text-sm font-semibold">{copy.location}</h4>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <GeoSelect label={copy.country} value={values.countryId} options={countries} disabled={false} onChange={(v) => update("countryId", v)} choose={copy.choose} nameOf={nameOf} />
              <GeoSelect label={copy.governorate} value={values.governorateId} options={governorates} disabled={!values.countryId} onChange={(v) => update("governorateId", v)} choose={copy.choose} nameOf={nameOf} />
              <GeoSelect label={copy.city} value={values.cityId} options={cities} disabled={!values.governorateId} onChange={(v) => update("cityId", v)} choose={copy.choose} nameOf={nameOf} />
              <GeoSelect label={copy.district} value={values.districtId} options={districts} disabled={!values.cityId} onChange={(v) => update("districtId", v)} choose={copy.choose} nameOf={nameOf} />
              <div className="space-y-2 sm:col-span-2 xl:col-span-4">
                <Label htmlFor="clinic-address">{copy.address}</Label>
                <Input id="clinic-address" value={values.addressLine1} onChange={(e) => update("addressLine1", e.target.value)} />
              </div>
              <div className="space-y-2 sm:col-span-2 xl:col-span-4">
                <Label htmlFor="clinic-timezone">{copy.timezone}</Label>
                <Input id="clinic-timezone" value={values.timezone} onChange={(e) => update("timezone", e.target.value)} />
              </div>
            </div>
          </section>

          {error && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <div className="flex flex-wrap gap-2 border-t pt-4">
            <Button type="submit" loading={saving}>{copy.save}</Button>
            <Button type="button" variant="outline" onClick={onCancel}>{copy.cancel}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

type GeoSelectProps = {
  label: string
  value: string
  options: GeoOption[]
  disabled: boolean
  onChange: (value: string) => void
  choose: string
  nameOf: (item: GeoOption) => string
}

function GeoSelect({ label, value, options, disabled, onChange, choose, nameOf }: GeoSelectProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)}>
        <option value="">{choose}</option>
        {options.map((option) => <option key={option.id} value={option.id}>{nameOf(option)}</option>)}
      </Select>
    </div>
  )
}
