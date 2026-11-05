import { appEnv } from "@/config/env"
import { isAccessTokenExpired } from "@/shared/auth/session/session-expiry"

export const CLINIC_SESSION_EXPIRED_EVENT = "cutilora:clinic-session-expired"
const TOKEN_KEY = "cutilora.clinic.access-token"
const API_BASE_URL = appEnv.apiBaseUrl.replace(/\/$/, "")

type LoginPayload = {
  access_token?: string
  accessToken?: string
  token?: string
  data?: LoginPayload
  message?: string
}

function extractToken(payload: LoginPayload): string | undefined {
  return payload.access_token ?? payload.accessToken ?? payload.token ?? (payload.data ? extractToken(payload.data) : undefined)
}

function errorMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback
  const root = payload as { message?: unknown; error?: unknown }
  const nested = root.error && typeof root.error === "object" ? root.error as { message?: unknown } : undefined
  return typeof nested?.message === "string" ? nested.message : typeof root.message === "string" ? root.message : typeof root.error === "string" ? root.error : fallback
}

export function getClinicToken(): string | null {
  const token = window.sessionStorage.getItem(TOKEN_KEY)
  if (token && isAccessTokenExpired(token)) {
    clearClinicSession()
    return null
  }
  return token
}

export function clearClinicSession() {
  window.sessionStorage.removeItem(TOKEN_KEY)
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
  window.sessionStorage.setItem(TOKEN_KEY, token)
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
