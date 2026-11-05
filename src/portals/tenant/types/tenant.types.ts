export type TenantRole =
  | "tenant_owner"
  | "tenant_admin"
  | "billing_admin"
  | "clinic_admin"
  | "clinic_manager"
  | "branch_manager"
  | "staff"
  | "provider"
  | "receptionist"

export type TenantMembership = {
  tenant: string
  clinic: string | null
  branch_ids: string[]
  scope: "tenant" | "clinic" | "branch"
  role: TenantRole
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
    memberships: TenantMembership[]
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
  timezone?: string
  contact?: {
    email?: string
    phone?: string
  }
  address?: {
    countryId?: string
    governorateId?: string
    cityId?: string
    districtId?: string
    addressLine1?: string
  }
  branding?: {
    logoUrl?: string
    coverImageUrl?: string
  }
}

export type Branch = {
  _id: string
  name: string
  slug: string
  status?: string
  address?: string
  timezone?: string
  cityId?: string
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
