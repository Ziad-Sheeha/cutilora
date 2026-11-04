import { appEnv } from "@/config/env"
import { getSuperAdminToken } from "@/portals/super-admin/auth/super-admin-auth"
import type { GeoPayload, GeoRecord } from "./geo-location.types"

const base = appEnv.apiBaseUrl.replace(/\/$/, "")
type GeoListResult = { items: GeoRecord[]; currentPage: number; perPage: number; total: number; lastPage: number }
function object(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : undefined
}
function unwrap(value: unknown): unknown {
  const root = object(value)
  if (!root) return value
  if (root.success === false) {
    const error = object(root.error)
    throw new Error(typeof error?.message === "string" ? error.message : typeof root.message === "string" ? root.message : "The request failed.")
  }
  return root.data ?? value
}
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    const token = getSuperAdminToken()
    response = await fetch(base + path, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: "Bearer " + token } : {}),
        ...init?.headers,
      },
    })
  } catch {
    throw new Error("Network error. Check your connection and try again.")
  }
  const payload: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    const root = object(payload)
    const nested = object(root?.error)
    const errors = object(root?.errors)
    const first = errors ? Object.values(errors)[0] : undefined
    const validationMessage = Array.isArray(first) && typeof first[0] === "string" ? first[0] : undefined
    throw new Error(
      typeof nested?.message === "string" ? nested.message :
      typeof root?.message === "string" ? root.message :
      validationMessage ?? `Request failed (HTTP ${response.status}).`,
    )
  }
  return unwrap(payload) as T
}
function normalizeList(payload: unknown): GeoListResult {
  const root = object(payload)
  const nested = object(root?.data)
  const candidates = [payload, root?.data, nested?.data, nested?.items, root?.items]
  const rows = candidates.find(Array.isArray) as unknown[] | undefined
  const meta = object(root?.meta) ?? object(nested?.meta) ?? object(root?.pagination) ?? {}
  return {
    items: (rows ?? []) as GeoRecord[],
    currentPage: Number(meta.current_page ?? meta.currentPage ?? 1),
    perPage: Number(meta.per_page ?? meta.perPage ?? rows?.length ?? 0),
    total: Number(meta.total ?? rows?.length ?? 0),
    lastPage: Number(meta.last_page ?? meta.lastPage ?? 1),
  }
}
function normalizeRecord(payload: unknown): GeoRecord {
  const value = unwrap(payload)
  const root = object(value)
  const nested = object(root?.data)
  const record = nested ?? root
  if (record && "id" in record) return record as unknown as GeoRecord
  throw new Error("The server returned an unexpected resource response.")
}
export const geoLocationApi = {
  list: async (endpoint: string, page = 1, perPage = 100) =>
    normalizeList(await request<unknown>(`${endpoint}?page=${page}&per_page=${perPage}`)),
  get: async (endpoint: string, id: string | number) =>
    normalizeRecord(await request<unknown>(endpoint + "/" + encodeURIComponent(String(id)))),
  create: (endpoint: string, payload: GeoPayload) =>
    request<unknown>(endpoint, { method: "POST", body: JSON.stringify(payload) }),
  update: (endpoint: string, id: string | number, payload: GeoPayload) =>
    request<unknown>(endpoint + "/" + encodeURIComponent(String(id)), { method: "PUT", body: JSON.stringify(payload) }),
  remove: (endpoint: string, id: string | number) =>
    request<unknown>(endpoint + "/" + encodeURIComponent(String(id)), { method: "DELETE" }),
}
