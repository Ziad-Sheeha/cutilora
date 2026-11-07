import { isAccessTokenExpired, getAccessTokenExpiryMs } from "@/shared/auth/session/session-expiry"
import type { TenantMembership, TenantUser } from "../types/tenant.types"

const SESSION_KEY = "cutilora-tenant-session"
let expirationRedirectStarted = false

export type TenantSession = {
  token: string
  user: TenantUser
  membership: TenantMembership
  clinicId: string | null
  branchId: string | null
}

function readStoredTenantSession(): TenantSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as TenantSession) : null
  } catch {
    localStorage.removeItem(SESSION_KEY)
    return null
  }
}

export function getTenantSession(): TenantSession | null {
  const session = readStoredTenantSession()
  return session
}

export function getTenantTokenExpiryMs(): number | null {
  const session = readStoredTenantSession()
  return session?.token ? getAccessTokenExpiryMs(session.token) : null
}

export function saveTenantSession(session: TenantSession) {
  expirationRedirectStarted = false
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function updateTenantContext(
  patch: Partial<Pick<TenantSession, "clinicId" | "branchId">>,
) {
  const current = getTenantSession()
  if (!current) return null

  const next = { ...current, ...patch }
  saveTenantSession(next)
  return next
}

export function clearTenantSession() {
  localStorage.removeItem(SESSION_KEY)
}

export function expireTenantSession() {
  if (expirationRedirectStarted || typeof window === "undefined") return
  expirationRedirectStarted = true
  clearTenantSession()
  if (window.location.pathname !== "/tenant/login") {
    window.location.replace("/tenant/login?reason=session-expired")
  }
}
