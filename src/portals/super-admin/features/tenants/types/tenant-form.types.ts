import type { Tenant, TenantPayload } from "./tenant.types"

export interface TenantFormValues {
  name: string
  displayName: string
  legalName: string
  businessType: string
  description: string
  industry: string
  contact: { email: string; phone: string; alternatePhone: string; whatsapp: string; website: string }
  address: {
    countryId: string; governorateId: string; cityId: string; districtId: string
    addressLine1: string; addressLine2: string; building: string; floor: string
    unit: string; landmark: string; postalCode: string; latitude: string; longitude: string
  }
  legal: { taxNumber: string; vatNumber: string; commercialRegistrationNumber: string }
  branding: { logoUrl: string; coverImageUrl: string; primaryColor: string }
  preferences: { timezone: string; locale: string; currency: string; dateFormat: string; weekStartsOn: string; supportedLanguages: string[] }
}

export const emptyTenantForm: TenantFormValues = {
  name: "", displayName: "", legalName: "", businessType: "single_clinic", description: "", industry: "aesthetic_medicine",
  contact: { email: "", phone: "", alternatePhone: "", whatsapp: "", website: "" },
  address: { countryId: "", governorateId: "", cityId: "", districtId: "", addressLine1: "", addressLine2: "", building: "", floor: "", unit: "", landmark: "", postalCode: "", latitude: "", longitude: "" },
  legal: { taxNumber: "", vatNumber: "", commercialRegistrationNumber: "" },
  branding: { logoUrl: "", coverImageUrl: "", primaryColor: "#2563eb" },
  preferences: { timezone: "Africa/Cairo", locale: "en", currency: "EGP", dateFormat: "YYYY-MM-DD", weekStartsOn: "6", supportedLanguages: ["en", "ar"] },
}

export function tenantToForm(tenant: Tenant): TenantFormValues {
  return {
    name: tenant.name, displayName: tenant.displayName, legalName: tenant.legalName, businessType: tenant.businessType,
    description: tenant.description, industry: tenant.industry,
    contact: { email: tenant.contact.email ?? "", phone: tenant.contact.phone ?? "", alternatePhone: tenant.contact.alternatePhone ?? "", whatsapp: tenant.contact.whatsapp ?? "", website: tenant.contact.website ?? "" },
    address: { countryId: tenant.address.countryId ?? "", governorateId: tenant.address.governorateId ?? "", cityId: tenant.address.cityId ?? "", districtId: tenant.address.districtId ?? "", addressLine1: tenant.address.addressLine1, addressLine2: tenant.address.addressLine2, building: tenant.address.building, floor: tenant.address.floor, unit: tenant.address.unit, landmark: tenant.address.landmark ?? "", postalCode: tenant.address.postalCode, latitude: tenant.address.latitude === null ? "" : String(tenant.address.latitude), longitude: tenant.address.longitude === null ? "" : String(tenant.address.longitude) },
    legal: { taxNumber: tenant.legal.taxNumber, vatNumber: tenant.legal.vatNumber, commercialRegistrationNumber: tenant.legal.commercialRegistrationNumber },
    branding: { logoUrl: tenant.branding.logoUrl, coverImageUrl: tenant.branding.coverImageUrl, primaryColor: tenant.branding.primaryColor },
    preferences: { timezone: tenant.preferences.timezone, locale: tenant.preferences.locale, currency: tenant.preferences.currency, dateFormat: tenant.preferences.dateFormat, weekStartsOn: String(tenant.preferences.weekStartsOn), supportedLanguages: tenant.preferences.supportedLanguages },
  }
}

export function formToPayload(values: TenantFormValues): TenantPayload {
  const clean = (value: string) => value.trim()
  const numericOrNull = (value: string) => value.trim() === "" ? null : Number(value)
  return {
    name: clean(values.name), displayName: clean(values.displayName), legalName: clean(values.legalName),
    businessType: values.businessType, description: clean(values.description), industry: clean(values.industry),
    contact: { email: clean(values.contact.email) || null, phone: clean(values.contact.phone) || null, alternatePhone: clean(values.contact.alternatePhone) || null, whatsapp: clean(values.contact.whatsapp) || null, website: clean(values.contact.website) || null },
    address: { countryId: values.address.countryId || null, governorateId: values.address.governorateId || null, cityId: values.address.cityId || null, districtId: values.address.districtId || null, addressLine1: clean(values.address.addressLine1), addressLine2: clean(values.address.addressLine2), building: clean(values.address.building), floor: clean(values.address.floor), unit: clean(values.address.unit), landmark: clean(values.address.landmark), postalCode: clean(values.address.postalCode), latitude: numericOrNull(values.address.latitude), longitude: numericOrNull(values.address.longitude) },
    legal: { taxNumber: clean(values.legal.taxNumber), vatNumber: clean(values.legal.vatNumber), commercialRegistrationNumber: clean(values.legal.commercialRegistrationNumber) },
    branding: { logoUrl: clean(values.branding.logoUrl), coverImageUrl: clean(values.branding.coverImageUrl), primaryColor: values.branding.primaryColor },
    preferences: { timezone: clean(values.preferences.timezone), locale: values.preferences.locale, currency: values.preferences.currency, dateFormat: values.preferences.dateFormat, weekStartsOn: Number(values.preferences.weekStartsOn), supportedLanguages: values.preferences.supportedLanguages },
  }
}
