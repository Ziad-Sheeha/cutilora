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
  const root = response && typeof response === "object" ? response as Record<string, unknown> : {}
  const nested = root.data && typeof root.data === "object" && !Array.isArray(root.data)
    ? root.data as Record<string, unknown>
    : undefined
  const pagination = (root.pagination ?? root.meta ?? nested?.pagination ?? nested?.meta) as TenantFeatureResult<T>["pagination"]
  return {
    data: (root.data ?? response) as T,
    pagination,
  }
}
function isCollectionPath(path: string) {
  return !/\{[^}]+\}/.test(path) && !/\?.*=\{/.test(path)
}

export function getTenantFeatureListEndpoint(feature: TenantFeatureDefinition) {
  const collectionGets = feature.endpoints.filter(
    (endpoint) => endpoint.method === "GET" && isCollectionPath(endpoint.path),
  )
  const collectionPosts = feature.endpoints.filter(
    (endpoint) => endpoint.method === "POST" && isCollectionPath(endpoint.path),
  )

  // Prefer the collection that supports creation; this avoids treating
  // auxiliary resources (e.g. /permissions) as the module's main directory.
  const matchingCreate = collectionGets.find((getEndpoint) =>
    collectionPosts.some(
      (postEndpoint) =>
        postEndpoint.path.split("?")[0] === getEndpoint.path.split("?")[0],
    ),
  )
  if (matchingCreate) return matchingCreate

  const keyPath = feature.key.split("/").at(-1)?.replace(/s$/, "")
  const matchingResource = collectionGets.find((endpoint) => {
    const segment = endpoint.path.split("?")[0].split("/").filter(Boolean).at(-1)
    return segment === feature.key.split("/").at(-1) || segment === keyPath
  })
  if (matchingResource) return matchingResource

  return collectionGets.find((endpoint) =>
    !/permissions|access\/me|\/me$|catalogue|catalog\/categories/i.test(endpoint.path),
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

export function getTenantFeatureWriteEndpoint(feature: TenantFeatureDefinition) {
  const list = getTenantFeatureListEndpoint(feature)
  if (!list) return undefined
  const basePath = list.path.split("?")[0]
  return feature.endpoints.find((endpoint) =>
    (endpoint.method === "POST" || endpoint.method === "PATCH" || endpoint.method === "PUT") &&
    endpoint.path.split("?")[0] === basePath &&
    !/\\{[^}]+\\}/.test(endpoint.path),
  )
}

export async function fetchTenantFeatureRecords(
  endpoint: TenantFeatureEndpoint,
  params: Record<string, string | number | undefined> = {},
) {
  const { data } = await tenantApi.get(toApiPath(endpoint.path), { params })
  const result = unwrap<unknown>(data)
  const resource = result.data
  const nested = resource && typeof resource === "object" && !Array.isArray(resource)
    ? resource as Record<string, unknown>
    : undefined
  const rows = Array.isArray(resource)
    ? resource
    : Array.isArray(nested?.items)
      ? nested.items
      : Array.isArray(nested?.records)
        ? nested.records
        : Array.isArray(nested?.data)
          ? nested.data
          : resource && typeof resource === "object"
            ? [resource]
            : []
  const pagination = result.pagination ?? (
    nested && (nested.total !== undefined || nested.page !== undefined || nested.current_page !== undefined)
      ? {
          page: Number(nested.page ?? nested.current_page) || undefined,
          per_page: Number(nested.per_page ?? nested.perPage) || undefined,
          total: Number(nested.total) || undefined,
          total_pages: Number(nested.total_pages ?? nested.last_page) || undefined,
        }
      : undefined
  )
  return {
    records: rows as TenantFeatureRecord[],
    pagination,
  }
}
export async function createTenantFeatureRecord(
  endpoint: TenantFeatureEndpoint,
  payload: Record<string, unknown>,
) {
  const { data } = await tenantApi.post(toApiPath(endpoint.path), payload)
  return unwrap<TenantFeatureRecord>(data).data
}

export async function saveTenantFeatureRecord(
  endpoint: TenantFeatureEndpoint,
  payload: Record<string, unknown>,
) {
  const url = toApiPath(endpoint.path)
  const response = endpoint.method === "PATCH"
    ? await tenantApi.patch(url, payload)
    : endpoint.method === "PUT"
      ? await tenantApi.put(url, payload)
      : await tenantApi.post(url, payload)
  return unwrap<TenantFeatureRecord>(response.data).data
}
