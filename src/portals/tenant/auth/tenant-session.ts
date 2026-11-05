import type { TenantMembership, TenantUser } from "../types/tenant.types"
const SESSION_KEY = "cutilora-tenant-session"
export type TenantSession = { token: string; user: TenantUser; membership: TenantMembership; clinicId: string | null; branchId: string | null }
export function getTenantSession(): TenantSession | null {
  try { const raw = localStorage.getItem(SESSION_KEY); return raw ? JSON.parse(raw) as TenantSession : null } catch { return null }
}
export function saveTenantSession(session: TenantSession) { localStorage.setItem(SESSION_KEY, JSON.stringify(session)) }
export function updateTenantContext(patch: Partial<Pick<TenantSession, "clinicId" | "branchId">>) {
  const current = getTenantSession(); if (!current) return null
  const next = { ...current, ...patch }; saveTenantSession(next); return next
}
export function clearTenantSession() { localStorage.removeItem(SESSION_KEY) }
