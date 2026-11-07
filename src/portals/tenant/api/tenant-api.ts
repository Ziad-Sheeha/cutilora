import axios from "axios"
import { appEnv } from "@/config/env"
import { clearTenantSession, getTenantSession } from "../auth/tenant-session"
import type {
  ApiEnvelope,
  Branch,
  Clinic,
  TenantContext,
} from "../types/tenant.types"

export const tenantApi = axios.create({
  baseURL: appEnv.apiBaseUrl.replace(/\/$/, ""),
  timeout: 20_000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
})

tenantApi.interceptors.request.use((config) => {
  const session = getTenantSession()

  if (session?.token) {
    config.headers.Authorization = `Bearer ${session.token}`
  }
  if (session?.membership.tenant) {
    config.headers["X-Tenant-Id"] = session.membership.tenant
  }
  if (session?.clinicId) {
    config.headers["X-Clinic-Id"] = session.clinicId
  }
  if (session?.branchId) {
    config.headers["X-Branch-Id"] = session.branchId
  }

  return config
})

tenantApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearTenantSession()
    }

    const data = error.response?.data
    const message =
      data?.error?.message ||
      data?.message ||
      error.message ||
      "Request failed"

    return Promise.reject(new Error(message))
  },
)

export type TenantAccess = {
  membershipId: string
  role: string
  scope: "tenant" | "clinic" | "branch"
  clinicId: string | null
  branchId: string | null
  permissions: string[]
  grants: Array<{ permission: string; scope: "tenant" | "clinic" | "branch"; clinicId?: string; branchId?: string; source?: string; inherited?: boolean }>
}

export async function getMyTenantAccess(): Promise<TenantAccess> {
  const { data } = await tenantApi.get<ApiEnvelope<TenantAccess>>("/access/me")
  return data.data
}

export async function getTenantContextFor(token: string, tenantId: string) {
  const client = axios.create({ baseURL: (appEnv.apiBaseUrl.endsWith("/") ? appEnv.apiBaseUrl.slice(0, -1) : appEnv.apiBaseUrl), timeout: 20_000 })
  const { data } = await client.get<ApiEnvelope<TenantContext>>("/tenant/context", {
    headers: { Authorization: `Bearer ${token}`, "X-Tenant-Id": tenantId },
  })
  return data.data
}

export async function getTenantContext() {
  const { data } = await tenantApi.get<ApiEnvelope<TenantContext>>("/tenant/context")
  return data.data
}

export async function getClinics() {
  const { data } = await tenantApi.get<ApiEnvelope<Clinic[]>>("/tenant/clinics")
  return data.data
}

export async function createClinic(payload: Record<string, unknown>) {
  const { data } = await tenantApi.post<ApiEnvelope<Clinic>>("/tenant/clinics", payload)
  return data.data
}

export async function updateClinic(id: string, payload: Record<string, unknown>) {
  const { data } = await tenantApi.patch<ApiEnvelope<Clinic>>(
    `/tenant/clinics/${id}`,
    payload,
  )
  return data.data
}
export async function activateClinic(id: string) {
  const { data } = await tenantApi.post<ApiEnvelope<Clinic>>(`/tenant/clinics/${encodeURIComponent(id)}/activate`)
  return data.data
}
export async function deactivateClinic(id: string) {
  const { data } = await tenantApi.post<ApiEnvelope<Clinic>>(`/tenant/clinics/${encodeURIComponent(id)}/deactivate`)
  return data.data
}

export async function getBranches(clinicId?: string) {
  const { data } = await tenantApi.get<ApiEnvelope<Branch[]>>("/tenant/branches", {
    params: clinicId ? { clinicId } : undefined,
  })
  return data.data
}

export async function updateBranch(id: string, payload: Record<string, unknown>) {
  const { data } = await tenantApi.patch<ApiEnvelope<Branch>>(
    `/tenant/branches/${encodeURIComponent(id)}`,
    payload,
  )
  return data.data
}

export async function getClinicSettings(clinicId: string) {
  const { data } = await tenantApi.get<ApiEnvelope<Record<string, unknown>>>(
    `/tenant/clinics/${encodeURIComponent(clinicId)}/settings`,
  )
  return data.data
}

export async function updateClinicSettings(clinicId: string, payload: Record<string, unknown>) {
  const { data } = await tenantApi.patch<ApiEnvelope<Record<string, unknown>>>(
    `/tenant/clinics/${encodeURIComponent(clinicId)}/settings`,
    payload,
  )
  return data.data
}

export async function updateTenantProfile(payload: Record<string, unknown>) {
  const { data } = await tenantApi.patch<ApiEnvelope<unknown>>("/tenant/profile", payload)
  return data.data
}

export async function createBranch(payload: Record<string, unknown>) {
  const { data } = await tenantApi.post<ApiEnvelope<Branch>>("/tenant/branches", payload)
  return data.data
}

type GeoResource = "countries" | "governorates" | "cities" | "districts"
type GeoOption = { id: string; name_en: string; name_ar?: string | null }

export async function getTenantGeo(
  resource: GeoResource,
  params: Record<string, string> = {},
) {
  const { data } = await tenantApi.get<ApiEnvelope<GeoOption[]>>(
    `/tenant/geo/${resource}`,
    { params: { page: 1, per_page: 100, ...params } },
  )
  return data.data
}

export async function tenantLogout() {
  await tenantApi.post("/auth/logout")
}
