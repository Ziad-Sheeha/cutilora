
import { appEnv } from "@/config/env"
import { getSuperAdminToken } from "@/portals/super-admin/auth/super-admin-auth"

import type {
  GeoId,
  GeoListResult,
  GeoPayload,
  GeoRecord,
} from "./geo-location.types"

const baseUrl = appEnv.apiBaseUrl.replace(/\/$/, "")
const DEFAULT_PAGE_SIZE = 10

interface ApiErrorBody {
  success?: boolean
  error?: { code?: string; message?: string }
  message?: string
  errors?: Record<string, unknown>
}

function asObject(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined
}

function normalizeRecord(value: unknown): GeoRecord {
  const root = asObject(value)
  const nested = asObject(root?.data)
  const item = nested ?? root

  if (!item) throw new Error("UNEXPECTED_RESPONSE")

  const id = item.id
  const nameEn = item.nameEn ?? item.name_en
  const nameAr = item.name_ar ?? item.nameAr

  if (
    (typeof id !== "string" && typeof id !== "number") ||
    typeof nameEn !== "string" ||
    typeof nameAr !== "string"
  ) {
    throw new Error("UNEXPECTED_RESPONSE")
  }

  return {
    id: String(id),
    nameEn,
    name_ar: nameAr,
    ...(typeof item.code === "string" ? { code: item.code } : {}),
    ...(typeof item.country_id === "string" || typeof item.country_id === "number"
      ? { country_id: String(item.country_id) }
      : {}),
    ...(typeof item.governorate_id === "string" || typeof item.governorate_id === "number"
      ? { governorate_id: String(item.governorate_id) }
      : {}),
    ...(typeof item.city_id === "string" || typeof item.city_id === "number"
      ? { city_id: String(item.city_id) }
      : {}),
    ...(typeof item.created_at === "string"
      ? { created_at: item.created_at }
      : {}),
    ...(typeof item.updated_at === "string"
      ? { updated_at: item.updated_at }
      : {}),
  }
}

function readList(
  payload: unknown,
  requestedPage: number,
  requestedPerPage: number,
): GeoListResult {
  const root = asObject(payload)

  if (!root) throw new Error("UNEXPECTED_RESPONSE")

  const data = root.data
  const nested = asObject(data)

  const rows = Array.isArray(data)
    ? data
    : Array.isArray(nested?.data)
      ? nested.data
      : Array.isArray(nested?.items)
        ? nested.items
        : Array.isArray(root.items)
          ? root.items
          : null

  if (!rows) throw new Error("UNEXPECTED_RESPONSE")

  const meta =
    asObject(root.meta) ??
    asObject(nested?.meta) ??
    asObject(root.pagination) ??
    asObject(nested?.pagination) ??
    (root.current_page !== undefined || root.last_page !== undefined
      ? root
      : undefined)

  const totalKnown =
    meta?.total !== undefined ||
    meta?.totalItems !== undefined ||
    meta?.totalCount !== undefined

  const total = Number(
    meta?.total ??
      meta?.totalItems ??
      meta?.totalCount ??
      (requestedPage - 1) * requestedPerPage + rows.length,
  )

  const perPage = Number(
    meta?.per_page ?? meta?.perPage ?? meta?.limit ?? requestedPerPage,
  )

  const page = Number(
    meta?.current_page ?? meta?.currentPage ?? meta?.page ?? requestedPage,
  )

  const inferredTotalPages =
    rows.length >= requestedPerPage ? requestedPage + 1 : requestedPage

  const totalPages = Number(
    meta?.last_page ??
      meta?.totalPages ??
      Math.max(
        1,
        Math.ceil(total / Math.max(perPage, 1)),
        inferredTotalPages,
      ),
  )

  return {
    items: rows.map(normalizeRecord),
    pagination: {
      page: Number.isFinite(page) && page > 0 ? page : requestedPage,
      perPage:
        Number.isFinite(perPage) && perPage > 0
          ? perPage
          : requestedPerPage,
      total: Number.isFinite(total) && total >= 0 ? total : rows.length,
      totalPages:
        Number.isFinite(totalPages) && totalPages > 0 ? totalPages : 1,
      totalKnown,
    },
  }
}

async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = getSuperAdminToken()

  if (!token) throw new Error("UNAUTHENTICATED")

  let response: Response

  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
    })
  } catch {
    throw new Error("NETWORK_ERROR")
  }

  const body: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    const errorBody = body as ApiErrorBody | null
    const firstError = errorBody?.errors
      ? Object.values(errorBody.errors)[0]
      : undefined

    const validationMessage =
      Array.isArray(firstError) && typeof firstError[0] === "string"
        ? firstError[0]
        : undefined

    const message =
      errorBody?.error?.message ??
      errorBody?.message ??
      validationMessage

    throw new Error(
      typeof message === "string" ? message : `HTTP_${response.status}`,
    )
  }

  const errorBody = asObject(body)

  if (errorBody?.success === false) {
    const nestedError = asObject(errorBody.error)
    throw new Error(
      typeof nestedError?.message === "string"
        ? nestedError.message
        : "API_REQUEST_FAILED",
    )
  }

  return body as T
}

function withQuery(
  endpoint: string,
  params: {
    search?: string
    page?: number
    perPage?: number
  },
): string {
  const query = new URLSearchParams()

  if (params.search?.trim()) {
    query.set("search", params.search.trim())
  }

  query.set("page", String(params.page ?? 1))
  query.set("limit", String(params.perPage ?? DEFAULT_PAGE_SIZE))

  return `${endpoint}?${query.toString()}`
}

export const geoLocationApi = {
  list: async (
    endpoint: string,
    params: {
      search?: string
      page?: number
      perPage?: number
    } = {},
  ): Promise<GeoListResult> => {
    const page = params.page ?? 1
    const perPage = params.perPage ?? DEFAULT_PAGE_SIZE

    const response = await request<unknown>(
      withQuery(endpoint, { ...params, page, perPage }),
    )

    return readList(response, page, perPage)
  },

  get: async (endpoint: string, id: GeoId): Promise<GeoRecord> => {
    const response = await request<unknown>(
      `${endpoint}/${encodeURIComponent(String(id))}`,
    )

    return normalizeRecord(response)
  },

  create: (
    endpoint: string,
    payload: GeoPayload,
  ) =>
    request<unknown>(endpoint, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: (
    endpoint: string,
    id: GeoId,
    payload: GeoPayload,
  ) =>
    request<unknown>(`${endpoint}/${encodeURIComponent(String(id))}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  remove: (endpoint: string, id: GeoId) =>
    request<unknown>(
      `${endpoint}/${encodeURIComponent(String(id))}`,
      { method: "DELETE" },
    ),
}
