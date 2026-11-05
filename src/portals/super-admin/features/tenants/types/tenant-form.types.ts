import type { Tenant, TenantPayload } from "./tenant.types"
import { phoneCountries } from "@/components/ui/phone-country-data"

export interface TenantFormValues {
  owner: { name: string; email: string; password: string; passwordConfirmation: string }
  name: string
  displayName: string
  legalName: string
  businessType: string
  description: string
  industry: string
  contact: { email: string; phoneCode: string; phone: string; alternatePhone: string; whatsapp: string; website: string }
  address: {
    countryId: string; governorateId: string; cityId: string; districtId: string
    addressLine1: string; addressLine2: string; building: string; floor: string
    unit: string; postalCode: string; latitude: string; longitude: string
  }
  legal: { taxNumber: string; vatNumber: string; commercialRegistrationNumber: string }
  branding: { logoUrl: string; coverImageUrl: string; primaryColor: string }
  preferences: { timezone: string; locale: string; currency: string; dateFormat: string; weekStartsOn: string; supportedLanguages: string[] }
}

export const emptyTenantForm: TenantFormValues = {
  name: "", owner: { name: "", email: "", password: "", passwordConfirmation: "" }, displayName: "", legalName: "", businessType: "single_clinic", description: "", industry: "aesthetic_medicine",
  contact: { email: "", phoneCode: "+20", phone: "", alternatePhone: "", whatsapp: "", website: "" },
  address: { countryId: "", governorateId: "", cityId: "", districtId: "", addressLine1: "", addressLine2: "", building: "", floor: "", unit: "", postalCode: "", latitude: "", longitude: "" },
  legal: { taxNumber: "", vatNumber: "", commercialRegistrationNumber: "" },
  branding: { logoUrl: "", coverImageUrl: "", primaryColor: "#2563eb" },
  preferences: { timezone: "Africa/Cairo", locale: "en", currency: "EGP", dateFormat: "YYYY-MM-DD", weekStartsOn: "6", supportedLanguages: ["en", "ar"] },
}

function inferPhoneCode(value: string | null): string {
  if (!value?.startsWith("+")) return "+20"
  const digits = value.replace(/\D/g, "")
  const match = [...phoneCountries].sort((a, b) => b.dial.length - a.dial.length)
    .find((country) => digits.startsWith(country.dial.replace(/\D/g, "")))
  return match?.dial ?? "+20"
}

function toLocalPhone(value: string | null, phoneCode: string): string {
  if (!value) return ""
  const digits = value.replace(/\D/g, "")
  const code = phoneCode.replace(/\D/g, "")
  const national = digits.startsWith(code) ? digits.slice(code.length) : digits
  return national ? "0" + national.replace(/^0+/, "") : ""
}

export function tenantToForm(tenant: Tenant): TenantFormValues {
  const phoneCode = inferPhoneCode(tenant.contact.phone)
  return {
    name: tenant.name, owner: { name: "", email: "", password: "", passwordConfirmation: "" }, displayName: tenant.displayName, legalName: tenant.legalName, businessType: tenant.businessType,
    description: tenant.description, industry: tenant.industry,
    contact: { email: tenant.contact.email ?? "", phoneCode, phone: toLocalPhone(tenant.contact.phone, phoneCode), alternatePhone: toLocalPhone(tenant.contact.alternatePhone, phoneCode), whatsapp: toLocalPhone(tenant.contact.whatsapp, phoneCode), website: tenant.contact.website ?? "" },
    address: { countryId: tenant.address.countryId ?? "", governorateId: tenant.address.governorateId ?? "", cityId: tenant.address.cityId ?? "", districtId: tenant.address.districtId ?? "", addressLine1: tenant.address.addressLine1, addressLine2: tenant.address.addressLine2, building: tenant.address.building, floor: tenant.address.floor, unit: tenant.address.unit, postalCode: tenant.address.postalCode, latitude: tenant.address.latitude === null ? "" : String(tenant.address.latitude), longitude: tenant.address.longitude === null ? "" : String(tenant.address.longitude) },
    legal: { taxNumber: tenant.legal.taxNumber, vatNumber: tenant.legal.vatNumber, commercialRegistrationNumber: tenant.legal.commercialRegistrationNumber },
    branding: { logoUrl: tenant.branding.logoUrl, coverImageUrl: tenant.branding.coverImageUrl, primaryColor: tenant.branding.primaryColor },
    preferences: { timezone: tenant.preferences.timezone, locale: tenant.preferences.locale, currency: tenant.preferences.currency, dateFormat: tenant.preferences.dateFormat, weekStartsOn: String(tenant.preferences.weekStartsOn), supportedLanguages: tenant.preferences.supportedLanguages },
  }
}

export function formToPayload(values: TenantFormValues): TenantPayload {
  const clean = (value: string) => value.trim()
  const numericOrNull = (value: string) => value.trim() === "" ? null : Number(value)
  const apiPhone = (value: string) => clean(value).replace(/\D/g, "").replace(/^0/, "")
  return {
    name: clean(values.name), owner: { name: clean(values.owner.name), email: clean(values.owner.email), password: values.owner.password }, displayName: clean(values.displayName), legalName: clean(values.legalName),
    businessType: values.businessType, description: clean(values.description), industry: clean(values.industry),
    contact: { email: clean(values.contact.email) || undefined, phone: values.contact.phone.trim() ? values.contact.phoneCode + apiPhone(values.contact.phone) : "", alternatePhone: values.contact.alternatePhone.trim() ? values.contact.phoneCode + apiPhone(values.contact.alternatePhone) : "", whatsapp: values.contact.whatsapp.trim() ? values.contact.phoneCode + apiPhone(values.contact.whatsapp) : "", website: clean(values.contact.website) || undefined },
    address: { countryId: clean(values.address.countryId) || undefined, governorateId: clean(values.address.governorateId) || undefined, cityId: clean(values.address.cityId) || undefined, districtId: clean(values.address.districtId) || undefined, addressLine1: clean(values.address.addressLine1), addressLine2: clean(values.address.addressLine2), building: clean(values.address.building), floor: clean(values.address.floor), unit: clean(values.address.unit), postalCode: clean(values.address.postalCode), latitude: numericOrNull(values.address.latitude), longitude: numericOrNull(values.address.longitude) },
    legal: { taxNumber: clean(values.legal.taxNumber), vatNumber: clean(values.legal.vatNumber), commercialRegistrationNumber: clean(values.legal.commercialRegistrationNumber) },
    branding: {
      ...(values.branding.logoUrl.startsWith("data:image/") ? { logoBase64: values.branding.logoUrl } : {}),
      ...(values.branding.coverImageUrl.startsWith("data:image/") ? { coverImageBase64: values.branding.coverImageUrl } : {}),
      primaryColor: values.branding.primaryColor,
    },
    preferences: { timezone: clean(values.preferences.timezone), locale: values.preferences.locale, currency: values.preferences.currency, dateFormat: values.preferences.dateFormat, weekStartsOn: Number(values.preferences.weekStartsOn), supportedLanguages: values.preferences.supportedLanguages },
  }
}
