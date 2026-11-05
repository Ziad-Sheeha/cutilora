import { tenantApi } from "../../api/tenant-api"
import type { TenantFeatureDefinition, TenantFeatureEndpoint } from "./tenant-feature.types"

export type TenantFeatureRecord = Record<string, unknown> & {
  id?: string
  _id?: string
}

export type TenantFeatureResult<T> = {
  data: T
  pagination?: {
    page?: number
    per_page?: number
    total?: number
    total_pages?: number
  }
}

function toApiPath(path: string) {
  return path.replace(/^\/api\/v1/, "").replace(/^\//, "/")
}

function unwrap<T>(response: unknown): TenantFeatureResult<T> {
  const payload = response as {
    data?: T
    pagination?: TenantFeatureResult<T>["pagination"]
  }
  return {
    data: payload?.data ?? (response as T),
    pagination: payload?.pagination,
  }
}

function isCollectionPath(path: string) {
  return !/\{[^}]+\}/.test(path) && !/\?.*=\{/.test(path)
}

export function getTenantFeatureListEndpoint(feature: TenantFeatureDefinition) {
  return feature.endpoints.find(
    (endpoint) => endpoint.method === "GET" && isCollectionPath(endpoint.path),
  )
}

export function getTenantFeatureCreateEndpoint(feature: TenantFeatureDefinition) {
  const list = getTenantFeatureListEndpoint(feature)
  if (!list) return undefined

  return feature.endpoints.find(
    (endpoint) =>
      endpoint.method === "POST" &&
      isCollectionPath(endpoint.path) &&
      endpoint.path.split("?")[0] === list.path.split("?")[0],
  )
}

export async function fetchTenantFeatureRecords(
  endpoint: TenantFeatureEndpoint,
  params: Record<string, string | number | undefined> = {},
) {
  const { data } = await tenantApi.get(toApiPath(endpoint.path), { params })
  const result = unwrap<TenantFeatureRecord[] | { items?: TenantFeatureRecord[] }>(data)
  const records = Array.isArray(result.data)
    ? result.data
    : Array.isArray(result.data?.items)
      ? result.data.items
      : []

  return { records, pagination: result.pagination }
}

export async function createTenantFeatureRecord(
  endpoint: TenantFeatureEndpoint,
  payload: Record<string, unknown>,
) {
  const { data } = await tenantApi.post(toApiPath(endpoint.path), payload)
  return unwrap<TenantFeatureRecord>(data).data
}
