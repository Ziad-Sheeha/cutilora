import { appEnv } from "@/config/env"
import { getSuperAdminToken } from "@/portals/super-admin/auth/super-admin-auth"
import type { GeoPayload, GeoRecord } from "./geo-location.types"
const base = appEnv.apiBaseUrl.replace(/\/$/, "")
async function request<T>(path: string, init?: RequestInit): Promise<T> {
 let response: Response
 try { response = await fetch(base + path, { ...init, headers: { Accept: "application/json", ...(init?.body ? { "Content-Type": "application/json" } : {}), ...(getSuperAdminToken() ? { Authorization: "Bearer " + getSuperAdminToken() } : {}), ...init?.headers } }) }
 catch { throw new Error("NETWORK_ERROR") }
 const payload: unknown = await response.json().catch(() => null)
 if (!response.ok) {
  const value = payload as { message?: unknown; errors?: Record<string, unknown> } | null
  const first = value?.errors ? Object.values(value.errors)[0] : undefined
  throw new Error(typeof value?.message === "string" ? value.message : Array.isArray(first) && typeof first[0] === "string" ? first[0] : `HTTP_${response.status}`)
 }
 return payload as T
}
function listFrom(payload: unknown): GeoRecord[] {
 if (Array.isArray(payload)) return payload as GeoRecord[]
 if (!payload || typeof payload !== "object") return []
 const root = payload as Record<string, unknown>
 if (Array.isArray(root.data)) return root.data as GeoRecord[]
 if (root.data && typeof root.data === "object") { const nested = root.data as Record<string, unknown>; if (Array.isArray(nested.data)) return nested.data as GeoRecord[]; if (Array.isArray(nested.items)) return nested.items as GeoRecord[] }
 if (Array.isArray(root.items)) return root.items as GeoRecord[]
 return []
}
function recordFrom(payload: unknown): GeoRecord {
 if (payload && typeof payload === "object") { const root = payload as Record<string, unknown>; const data = root.data && typeof root.data === "object" && !Array.isArray(root.data) ? root.data : root; if (data && typeof data === "object" && "id" in data) return data as GeoRecord }
 throw new Error("UNEXPECTED_RESPONSE")
}
export const geoLocationApi = {
 list: async (endpoint: string) => listFrom(await request<unknown>(endpoint)),
 get: async (endpoint: string, id: string | number) => recordFrom(await request<unknown>(endpoint + "/" + encodeURIComponent(String(id)))),
 create: (endpoint: string, payload: GeoPayload) => request(endpoint, { method: "POST", body: JSON.stringify(payload) }),
 update: (endpoint: string, id: string | number, payload: GeoPayload) => request(endpoint + "/" + encodeURIComponent(String(id)), { method: "PUT", body: JSON.stringify(payload) }),
 remove: (endpoint: string, id: string | number) => request(endpoint + "/" + encodeURIComponent(String(id)), { method: "DELETE" }),
}
