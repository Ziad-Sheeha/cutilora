export type TenantStatus = "active" | "inactive" | "suspended" | "pending" | string
export type TenantBusinessType = "single_clinic" | "clinic_group" | string

export interface TenantContact {
  email: string | null
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
  landmark?: string
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
  preferences: TenantPreferences
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
export interface TenantPayload {
  name: string
  displayName?: string
  legalName?: string
  businessType: TenantBusinessType
  description?: string
  industry: string
  contact?: Partial<TenantContact>
  address?: Partial<TenantAddress> & { landmark?: string }
  legal?: Partial<TenantLegal>
  branding?: Partial<TenantBranding>
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
