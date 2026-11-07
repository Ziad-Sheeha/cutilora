import { appEnv } from "@/config/env"
import { phoneCountries } from "@/components/ui/phone-country-data"

export type ProfileForm = {
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
export function readEnvelope(value: unknown): Record<string, unknown> {
  let current = value
  for (let i = 0; i < 3; i += 1) {
    if (!current || typeof current !== "object" || !("data" in current)) break
    current = (current as { data: unknown }).data
  }
  const record = current && typeof current === "object" ? current as Record<string, unknown> : {}
  const nested = record.profile ?? record.tenant
  return nested && typeof nested === "object" ? nested as Record<string, unknown> : record
}
export function localizedValue(value: unknown, ar: boolean) {
  const key = String(value ?? "").toLowerCase()
  const values: Record<string, [string, string]> = {
    single_clinic: ["Single clinic", "عيادة واحدة"], clinic_group: ["Clinic group", "مجموعة عيادات"], medical_center: ["Medical center", "مركز طبي"],
    aesthetic_medicine: ["Aesthetic medicine", "الطب التجميلي"], active: ["Active", "نشط"], inactive: ["Inactive", "غير نشط"],
    suspended: ["Suspended", "موقوف"], pending: ["Pending", "قيد الانتظار"], trial: ["Trial", "تجريبي"],
  }
  return values[key]?.[ar ? 1 : 0] ?? String(value ?? "—").replaceAll("_", " ")
}
export function phoneParts(raw?: unknown) {
  const value = String(raw ?? "").trim()
  const country = phoneCountries.filter(item => value.startsWith(item.dial)).sort((a, b) => b.dial.length - a.dial.length)[0]
  return { code: country?.dial ?? "+20", local: country ? value.slice(country.dial.length) : value }
}
export function toInternationalPhone(local: string, code: string) {
  const digits = local.replace(/\D/g, "").replace(/^0+/, "")
  return digits ? `${code}${digits}` : ""
}
export function toForm(profile: Record<string, unknown>): ProfileForm {
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
    contactEmail: String(contact.email ?? ""), contactPhone: phoneParts(contact.phone).local, alternatePhone: phoneParts(contact.alternatePhone).local, whatsapp: phoneParts(contact.whatsapp).local, website: String(contact.website ?? ""),
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
export function assetUrl(path?: string) {
  if (!path) return ""
  try { return new URL(path, appEnv.apiBaseUrl).toString() } catch { return path }
}
export function fileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error("Unable to read image file."))
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Unable to read image file."))
    reader.readAsDataURL(file)
  })
}
