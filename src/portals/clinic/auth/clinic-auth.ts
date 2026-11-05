import { appEnv } from "@/config/env"
import { isAccessTokenExpired } from "@/shared/auth/session/session-expiry"
import { clearBranchContext, clearClinicContext, clearTenantContext, setBranchId, setClinicId, setCurrentBranch, setTenantId, store } from "@/store"

export const CLINIC_SESSION_EXPIRED_EVENT = "cutilora:clinic-session-expired"
const TOKEN_KEY = "cutilora.clinic.access-token"
const CONTEXT_KEY = "cutilora.clinic.session-context"
const API_BASE_URL = appEnv.apiBaseUrl.replace(/\/$/, "")

type LoginPayload = {
  access_token?: string
  accessToken?: string
  token?: string
  data?: LoginPayload
  user?: Record<string, unknown>
  membership?: Record<string, unknown>
  context?: Record<string, unknown>
  message?: string
}
export type ClinicSessionContext = { tenantId: string | null; clinicId: string | null; branchId: string | null; userName: string | null; email: string | null }

function object(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : undefined
}
function firstString(...values: unknown[]) {
  return values.find((value): value is string => typeof value === "string" && value.length > 0) ?? null
}
function extractToken(payload: LoginPayload): string | undefined {
  return payload.access_token ?? payload.accessToken ?? payload.token ?? (payload.data ? extractToken(payload.data) : undefined)
}
function extractContext(payload: unknown): ClinicSessionContext {
  const root = object(payload) ?? {}
  const data = object(root.data) ?? {}
  const membership = object(root.membership) ?? object(data.membership) ?? {}
  const context = object(root.context) ?? object(data.context) ?? {}
  const user = object(root.user) ?? object(data.user) ?? {}
  const tenant = object(root.tenant) ?? object(data.tenant) ?? object(membership.tenant) ?? {}
  const clinic = object(root.clinic) ?? object(data.clinic) ?? object(membership.clinic) ?? {}
  const branch = object(root.branch) ?? object(data.branch) ?? object(membership.branch) ?? {}
  return {
    tenantId: firstString(root.tenantId, data.tenantId, context.tenantId, membership.tenantId, tenant.id, tenant._id),
    clinicId: firstString(root.clinicId, data.clinicId, context.clinicId, membership.clinicId, clinic.id, clinic._id),
    branchId: firstString(root.branchId, data.branchId, context.branchId, membership.branchId, branch.id, branch._id),
    userName: firstString(user.fullName, user.full_name, user.name, root.name, data.name),
    email: firstString(user.email, root.email, data.email),
  }
}
function errorMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback
  const root = payload as { message?: unknown; error?: unknown }
  const nested = root.error && typeof root.error === "object" ? root.error as { message?: unknown } : undefined
  return typeof nested?.message === "string" ? nested.message : typeof root.message === "string" ? root.message : typeof root.error === "string" ? root.error : fallback
}
export function getClinicSessionContext(): ClinicSessionContext {
  try {
    const raw = window.sessionStorage.getItem(CONTEXT_KEY)
    if (raw) return JSON.parse(raw) as ClinicSessionContext
  } catch { /* Recover with an empty context if stored session metadata is malformed. */ }
  return { tenantId: null, clinicId: null, branchId: null, userName: null, email: null }
}
export function getClinicToken(): string | null {
  const token = window.sessionStorage.getItem(TOKEN_KEY)
  if (token && isAccessTokenExpired(token)) {
    expireClinicSession()
    return null
  }
  return token
}
export function clearClinicSession() {
  window.sessionStorage.removeItem(TOKEN_KEY)
  window.sessionStorage.removeItem(CONTEXT_KEY)
  store.dispatch(clearTenantContext())
  store.dispatch(clearClinicContext())
  store.dispatch(clearBranchContext())
}
export function expireClinicSession() {
  clearClinicSession()
  window.dispatchEvent(new Event(CLINIC_SESSION_EXPIRED_EVENT))
}
export async function loginClinic(email: string, password: string) {
  let response: Response
  try {
    response = await fetch(API_BASE_URL + "/auth/login", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
  } catch {
    throw new Error("Unable to reach the authentication server. Check your connection and try again.")
  }
  const payload: unknown = await response.json().catch(() => null)
  if (!response.ok) throw new Error(errorMessage(payload, response.status === 401 ? "Invalid email or password." : "Sign in failed. Please try again."))
  if (!payload || typeof payload !== "object") throw new Error("The server returned an unexpected login response.")
  const token = extractToken(payload as LoginPayload)
  if (!token) throw new Error("Login succeeded but the response did not include an access token.")
  const context = extractContext(payload)
  window.sessionStorage.setItem(TOKEN_KEY, token)
  window.sessionStorage.setItem(CONTEXT_KEY, JSON.stringify(context))
  if (context.tenantId) store.dispatch(setTenantId(context.tenantId))
  if (context.clinicId) store.dispatch(setClinicId(context.clinicId))
  if (context.branchId) {
    store.dispatch(setBranchId(context.branchId))
    store.dispatch(setCurrentBranch(context.branchId))
  }
  return payload
}
export async function logoutClinic() {
  const token = getClinicToken()
  try {
    if (token) {
      const response = await fetch(API_BASE_URL + "/auth/logout", {
        method: "POST",
        headers: { Accept: "application/json", Authorization: "Bearer " + token },
      })
      if (!response.ok) {
        const payload: unknown = await response.json().catch(() => null)
        throw new Error(errorMessage(payload, "Unable to complete server logout."))
      }
    }
  } finally {
    clearClinicSession()
  }
}
