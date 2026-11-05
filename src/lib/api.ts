import axios, { AxiosError, type AxiosRequestConfig } from "axios"
import { appEnv } from "@/config/env"
import { beginLoading, endLoading, pushToast, store } from "@/store"
import { expireClinicSession, getClinicSessionContext, getClinicToken } from "@/portals/clinic/auth/clinic-auth"
export type ApiError = { message: string; code?: string; status?: number; errors?: Record<string, string[]>; requestId?: string }
export function normalizeApiError(error: unknown): ApiError {
 if (axios.isAxiosError(error)) {
  const data = error.response?.data as Record<string, unknown> | undefined
  const nested = data?.error && typeof data.error === "object" ? data.error as Record<string, unknown> : undefined
  const validation = data?.errors && typeof data.errors === "object" ? data.errors as Record<string, string[]> : undefined
  return {
   message: typeof nested?.message === "string" ? nested.message : typeof data?.message === "string" ? data.message : error.response ? "The request could not be completed." : "Network error. Check your connection and try again.",
   code: typeof nested?.code === "string" ? nested.code : typeof data?.code === "string" ? data.code : undefined,
   status: error.response?.status,
   errors: validation,
   requestId: typeof data?.request_id === "string" ? data.request_id : undefined,
  }
 }
 return { message: error instanceof Error ? error.message : "An unexpected error occurred." }
}
let activeRequests = 0
export const api = axios.create({ baseURL: appEnv.apiBaseUrl.replace(/\/$/, ""), timeout: 20_000, headers: { Accept: "application/json", "Content-Type": "application/json" } })
api.interceptors.request.use((config) => {
 activeRequests += 1
 store.dispatch(beginLoading())
 const token = typeof window !== "undefined" ? getClinicToken() : null
 if (token) config.headers.Authorization = "Bearer " + token
 return config
})
api.interceptors.response.use(
 (response) => { activeRequests = Math.max(0, activeRequests - 1); store.dispatch(endLoading()); return response },
 (error: AxiosError) => {
  activeRequests = Math.max(0, activeRequests - 1); store.dispatch(endLoading())
  const normalized = normalizeApiError(error)
  if (normalized.status === 401) expireClinicSession()
  if (normalized.status === 401) store.dispatch(pushToast({ id: crypto.randomUUID(), kind: "warning", title: normalized.message, description: normalized.code }))
  else if (normalized.status !== 422) store.dispatch(pushToast({ id: crypto.randomUUID(), kind: "error", title: normalized.message, description: normalized.code }))
  return Promise.reject(normalized)
 },
)
export async function apiGet<T>(url: string, config?: AxiosRequestConfig) { const response = await api.get<T>(url, config); return response.data }
export async function apiPost<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig) { const response = await api.post<T>(url, data, config); return response.data }
export async function apiPatch<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig) { const response = await api.patch<T>(url, data, config); return response.data }
export async function apiDelete<T>(url: string, config?: AxiosRequestConfig) { const response = await api.delete<T>(url, config); return response.data }
