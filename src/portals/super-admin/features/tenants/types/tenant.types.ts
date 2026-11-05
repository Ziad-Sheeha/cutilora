export type TenantStatus = "active" | "inactive" | "suspended" | "pending" | string
export type TenantBusinessType = "single_clinic" | "clinic_group" | "medical_center" | string

export interface TenantContact {
  email: string | null
  phoneCode: string
  phone: string | null
  alternatePhone: string | null
  whatsapp: string | null
  website: string | null
}
export interface TenantAddress {
  countryId: string | null
  governorateId: string | null
  cityId: string | null
  districtId: string | null
  addressLine1: string
  addressLine2: string
  building: string
  floor: string
  unit: string
  postalCode: string
  latitude: number | null
  longitude: number | null
}
export interface TenantLegal {
  taxNumber: string
  vatNumber: string
  commercialRegistrationNumber: string
}
export interface TenantBranding {
  logoUrl: string
  coverImageUrl: string
  primaryColor: string
}
export interface TenantPreferences {
  timezone: string
  locale: string
  currency: string
  dateFormat: string
  weekStartsOn: number
  supportedLanguages: string[]
}
export interface TenantClinic {
  id: string
  name: string
  slug: string
  code: string
  status: string
  clinicType: string
  description: string
  specialties: string[]
  branding: TenantBranding
}
export interface Tenant {
  id: string
  name: string
  slug: string
  displayName: string
  legalName: string
  businessType: TenantBusinessType
  description: string
  industry: string
  status: TenantStatus
  plan: string
  contact: TenantContact
  address: TenantAddress
  legal: TenantLegal
  branding: TenantBranding
  clinics: TenantClinic[]
  preferences: TenantPreferences
  subscription: TenantSubscription | null
  paymentHistory: TenantPayment[]
  createdAt: string | null
  updatedAt: string | null
}
export interface TenantListResult {
  items: Tenant[]
  page: number
  perPage: number
  total: number
  totalTenants: number
  availableStatuses: string[]
  availablePlans: string[]
  statusCounts: Record<string, number>
  totalKnown: boolean
  hasNext: boolean
}
export interface TenantOwnerPayload { name: string; email: string; password: string }
export interface TenantPayload {
  owner: TenantOwnerPayload
  name: string
  displayName?: string
  legalName?: string
  businessType: TenantBusinessType
  description?: string
  industry: string
  contact?: { email?: string; phone?: string; alternatePhone?: string; whatsapp?: string; website?: string }
  address?: Partial<TenantAddress>
  legal?: Partial<TenantLegal>
  branding?: { logoBase64?: string; coverImageBase64?: string; primaryColor?: string }
  preferences?: Partial<TenantPreferences>
}
export interface TenantSubscription {
  plan: { code: string; name: string; amount: number; currency: string } | null
  billingCycle: string | null
  status: string | null
  trialStartsAt: string | null
  trialEndsAt: string | null
  currentPeriodStartsAt: string | null
  currentPeriodEndsAt: string | null
  nextBillingAt: string | null
  cancelAtPeriodEnd: boolean
  canceledAt: string | null
  notes: string | null
}
export interface TenantPayment {
  amount: number
  currency: string
  status: string
  method: string
  provider: string
  providerReference: string
  invoiceNumber: string
  invoiceUrl: string | null
  paidAt: string | null
  failureReason: string | null
}
