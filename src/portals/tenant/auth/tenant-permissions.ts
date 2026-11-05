import { getTenantSession } from "./tenant-session"

const fullAdministrators = new Set(["tenant_owner", "tenant_admin"])
const organizationManagers = new Set(["tenant_owner", "tenant_admin", "organization_manager"])
const billingManagers = new Set(["tenant_owner", "tenant_admin", "billing_admin"])

export function getTenantRole() {
  return getTenantSession()?.membership.role ?? null
}

export function canManageOrganization() {
  const role = getTenantRole()
  return Boolean(role && organizationManagers.has(role))
}

export function canManageBilling() {
  const role = getTenantRole()
  return Boolean(role && billingManagers.has(role))
}

export function canManageAccess() {
  const role = getTenantRole()
  return Boolean(role && fullAdministrators.has(role))
}

export function canWriteTenantFeature(featureKey: string) {
  const role = getTenantRole()
  if (!role) return false
  if (fullAdministrators.has(role)) return true
  if (role === "organization_manager") {
    return !["finance", "subscription", "integrations", "roles", "settings/security"].includes(featureKey)
  }
  if (role === "billing_admin") return ["finance", "subscription"].includes(featureKey)
  return false
}
