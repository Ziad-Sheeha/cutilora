import { appEnv } from "@/config/env"
const TOKEN_KEY = "cutilora.super-admin.access-token"
const API_BASE_URL = appEnv.apiBaseUrl.replace(/\/$/, "")
type LoginResponse = { access_token?: string; accessToken?: string; token?: string; data?: LoginResponse; user?: { name?: string; full_name?: string; email?: string }; message?: string }
export function getSuperAdminToken() { return window.sessionStorage.getItem(TOKEN_KEY) }
export function clearSuperAdminSession() { window.sessionStorage.removeItem(TOKEN_KEY) }
function extractToken(payload: LoginResponse): string | undefined { return payload.access_token ?? payload.accessToken ?? payload.token ?? (payload.data ? extractToken(payload.data) : undefined) }
function getErrorMessage(payload: unknown, fallback: string) {
 if (payload && typeof payload === "object") {
  const data = payload as { message?: unknown; error?: unknown; errors?: unknown }
  const nested = data.error && typeof data.error === "object" ? data.error as { message?: unknown } : undefined
  if (typeof nested?.message === "string") return nested.message
  if (typeof data.message === "string") return data.message
  if (typeof data.error === "string") return data.error
  if (data.errors && typeof data.errors === "object") { const first = Object.values(data.errors as Record<string, unknown>)[0]; if (Array.isArray(first) && typeof first[0] === "string") return first[0]; if (typeof first === "string") return first }
 }
 return fallback
}
export async function loginSuperAdmin(email: string, password: string) {
 let response: Response
 try { response = await fetch(API_BASE_URL + "/auth/platform/login", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ email, password }) }) }
 catch { throw new Error("Unable to reach the authentication server. Check your connection and try again.") }
 const payload: unknown = await response.json().catch(() => null)
 if (!response.ok) throw new Error(getErrorMessage(payload, response.status === 401 ? "Invalid email or password." : "Sign in failed. Please try again."))
 if (!payload || typeof payload !== "object") throw new Error("The server returned an unexpected login response.")
 const token = extractToken(payload as LoginResponse)
 if (!token) throw new Error("Login succeeded but the response did not include a recognized access token. Confirm the API response contract.")
 window.sessionStorage.setItem(TOKEN_KEY, token)
 return payload as LoginResponse
}
export async function logoutSuperAdmin() {
 const token = getSuperAdminToken()
 try {
  if (token) {
   const response = await fetch(API_BASE_URL + "/auth/platform/logout", { method: "POST", headers: { Accept: "application/json", Authorization: "Bearer " + token } })
   if (!response.ok) {
    const payload: unknown = await response.json().catch(() => null)
    throw new Error(getErrorMessage(payload, "Unable to complete server logout."))
   }
  }
 } finally { clearSuperAdminSession() }
}
