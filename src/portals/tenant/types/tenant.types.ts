export type TenantRole =
  | "tenant_owner"
  | "tenant_admin"
  | "organization_manager"
  | "read_only_analyst"
  | "billing_admin"
  | "clinic_admin"
  | "clinic_manager"
  | "branch_manager"
  | "staff"
  | "provider"
  | "receptionist"

export type TenantResourceReference =
  | string
  | {
      _id?: string
      id?: string
      name?: string
      displayName?: string
      slug?: string
    }
  | null

export type TenantMembership = {
  tenant: string
  tenantName?: string
  clinic: string | null
  branch_ids: string[]
  scope: "tenant" | "clinic" | "branch"
  role: TenantRole
}

export type TenantLoginMembership = Omit<TenantMembership, "tenant" | "clinic"> & {
  tenant: TenantResourceReference
  clinic: TenantResourceReference
}

export type TenantUser = {
  id: string
  name: string
  email: string
}

export type TenantLoginResponse = {
  success: boolean
  data: {
    access_token: string
    token_type: "Bearer"
    user: TenantUser
    memberships: TenantLoginMembership[]
  }
}

export type TenantSummary = {
  _id?: string
  id?: string
  name: string
  displayName?: string
  legalName?: string
  slug?: string
  businessType?: string
  industry?: string
  status?: "active" | "suspended"
  contact?: {
    email?: string
    phone?: string
    website?: string
  }
  address?: Record<string, unknown>
  branding?: {
    logoUrl?: string
    coverImageUrl?: string
    primaryColor?: string
  }
  preferences?: {
    locale?: string
    currency?: string
    timezone?: string
  }
}

export type Clinic = {
  _id: string
  name: string
  slug?: string
  code?: string
  status?: string
  clinicType?: string
  description?: string
  specialties?: string[]
  timezone?: string
  openingDate?: string | null
  preferences?: {
    timezone?: string
    locale?: string
    currency?: string
    dateFormat?: string
    weekStartsOn?: number
    supportedLanguages?: string[]
  }
  contact?: {
    email?: string
    phone?: string
    alternatePhone?: string
    whatsapp?: string
    website?: string
  }
  address?: {
    countryId?: string
    governorateId?: string
    cityId?: string
    districtId?: string
    addressLine1?: string
    addressLine2?: string
    building?: string
    floor?: string
    unit?: string
    postalCode?: string
    latitude?: number | null
    longitude?: number | null
  }
  createdAt?: string
  updatedAt?: string
  branding?: {
    logoUrl?: string
    coverImageUrl?: string
    primaryColor?: string
  }
}

export type Branch = {
  _id: string
  tenantId?: string
  clinicId?: string
  name: string
  slug: string
  code?: string
  status?: "draft" | "active" | "temporarily_closed" | "suspended" | "closed" | string
  closureReason?: string
  temporarilyClosedAt?: string | null
  closedAt?: string | null
  address?: string
  addressDetails?: {
    countryId?: string
    governorateId?: string
    cityId?: string
    districtId?: string
    addressLine1?: string
    addressLine2?: string
    building?: string
    floor?: string
    unit?: string
    postalCode?: string
  }
  contact?: { email?: string; phone?: string; alternatePhone?: string; whatsapp?: string; website?: string }
  contactPerson?: { name?: string; email?: string; phone?: string }
  timezone?: string
  cityId?: string
  postalCode?: string
  latitude?: number | null
  longitude?: number | null
  openingDate?: string | null
  operatingHours?: Array<{ dayOfWeek: number; isClosed: boolean; openTime?: string; closeTime?: string }>
  createdAt?: string
  updatedAt?: string
}

export type TenantContext = {
  tenant: TenantSummary | null
  clinic: Clinic | null
  branch: Branch | null
  access: {
    tenantId: string
    clinicId: string | null
    branchId: string | null
    role: TenantRole
    scope: string
  }
}

export type ApiEnvelope<T> = {
  success: boolean
  data: T
  message?: string
  meta?: {
    current_page: number
    per_page: number
    total: number
    last_page: number
  }
}
