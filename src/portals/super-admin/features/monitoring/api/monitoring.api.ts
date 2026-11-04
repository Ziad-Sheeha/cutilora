import { appEnv } from "@/config/env"
import { expireSuperAdminSession, getSuperAdminToken } from "@/portals/super-admin/auth/super-admin-auth"

const baseUrl = appEnv.apiBaseUrl.replace(/\/$/, "")

export interface MonitoringLog {
  id: string
  level: string
  category: string
  module: string
  message: string
  statusCode: string
  method: string
  path: string
  timestamp: string
  actor: string
  duration: string
  raw: Record<string, unknown>
}

export interface MonitoringStats {
  total: number
  byLevel: Array<{ name: string; count: number }>
  byCategory: Array<{ name: string; count: number }>
  timeline: Array<{ date: string; count: number; errors: number }>
}

export interface MonitoringTimelinePoint {
  date: string
  count: number
  errors: number
}

export interface MonitoringListResult {
  items: MonitoringLog[]
  page: number
  limit: number
  total: number
  totalKnown: boolean
  hasNext: boolean
}

type RecordValue = Record<string, unknown>

function object(value: unknown): RecordValue | undefined {
  return value && typeof value === "object" && !Array.isArray(value) ? value as RecordValue : undefined
}

function text(value: unknown, fallback = ""): string {
  if (typeof value === "string" || typeof value === "number") return String(value)
  return fallback
}

function first(record: RecordValue, keys: string[], fallback = ""): string {
  for (const key of keys) {
    const value = record[key]
    if (value !== undefined && value !== null && value !== "") return text(value, fallback)
  }
  return fallback
}

function rowsFrom(value: unknown): unknown[] {
  if (Array.isArray(value)) return value
  const root = object(value)
  if (!root) return []
  const data = object(root.data)
  if (Array.isArray(root.data)) return root.data
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.logs)) return data.logs
  if (Array.isArray(data?.timeline)) return data.timeline
  if (Array.isArray(root.timeline)) return root.timeline
  if (Array.isArray(root.items)) return root.items
  if (Array.isArray(root.logs)) return root.logs
  return []
}

function normalizeLog(value: unknown, index: number): MonitoringLog {
  const row = object(value) ?? {}
  const actorValue = object(row.actor) ?? object(row.user) ?? object(row.causer)
  const request = object(row.request) ?? {}
  const response = object(row.response) ?? {}
  return {
    id: first(row, ["id", "_id", "uuid"], String(index)),
    level: first(row, ["level", "severity"], "info").toLowerCase(),
    category: first(row, ["category", "type"], "general").toLowerCase(),
    module: first(row, ["module", "service", "source"], "—"),
    message: first(row, ["message", "description", "summary", "event"], "—"),
    statusCode: first(row, ["statusCode", "status_code", "httpStatus", "status"], text(response.status, "—")),
    method: first(row, ["method", "httpMethod"], text(request.method, "—")).toUpperCase(),
    path: first(row, ["path", "url", "endpoint"], text(request.path, "—")),
    timestamp: first(row, ["timestamp", "created_at", "createdAt", "loggedAt", "time"]),
    actor: first(row, ["actor_name", "user_name", "performed_by"], first(actorValue ?? {}, ["name", "email"], "System")),
    duration: first(row, ["duration", "duration_ms", "responseTime"], "—"),
    raw: row,
  }
}

function normalizeStats(value: unknown): MonitoringStats {
  const root = object(value) ?? {}
  const data = object(root.data) ?? root
  const countRows = (key: string) => {
    const source = Array.isArray(data[key]) ? data[key] as unknown[] : []
    return source.map((item) => {
      const row = object(item) ?? {}
      return { name: first(row, ["_id", "name", "label"], "Other"), count: Number(row.count ?? row.total ?? 0) || 0 }
    })
  }
  const timeline = Array.isArray(data.timeline) ? data.timeline : []
  return {
    total: Number(data.total ?? data.count ?? 0) || 0,
    byLevel: countRows("byLevel"),
    byCategory: countRows("byCategory"),
    timeline: timeline.map((item) => {
      const row = object(item) ?? {}
      return {
        date: first(row, ["_id", "date", "day", "label"]),
        count: Number(row.count ?? row.total ?? 0) || 0,
        errors: Number(row.errors ?? row.errorCount ?? 0) || 0,
      }
    }),
  }
}

async function request(path: string): Promise<unknown> {
  const token = getSuperAdminToken()
  if (!token) throw new Error("UNAUTHENTICATED")
  let response: Response
  try {
    response = await fetch(`${baseUrl}${path}`, {
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    })
  } catch {
    throw new Error("NETWORK_ERROR")
  }
  if (response.status === 401) expireSuperAdminSession()
  const payload: unknown = await response.json().catch(() => null)
  const body = object(payload)
  if (!response.ok || body?.success === false) {
    const error = object(body?.error)
    throw new Error(text(error?.message ?? body?.message, `HTTP_${response.status}`))
  }
  return payload
}

function queryString(params: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && String(value).trim() !== "") query.set(key, String(value))
  })
  const value = query.toString()
  return value ? `?${value}` : ""
}

export const monitoringApi = {
  view: async (from?: string, to?: string) =>
    normalizeStats(await request(`/platform/monitoring/view${queryString({ from, to })}`)),
  stats: async (from?: string, to?: string) =>
    normalizeStats(await request(`/platform/monitoring/logs/stats${queryString({ from, to })}`)),
  timeline: async (from?: string, to?: string): Promise<MonitoringTimelinePoint[]> => {
    const payload = await request(`/platform/monitoring/logs/timeline${queryString({ from, to })}`)
    const normalized = normalizeStats(payload).timeline
    if (normalized.length) return normalized
    return rowsFrom(payload).map((item) => {
      const row = object(item) ?? {}
      return {
        date: first(row, ["_id", "date", "day", "timestamp", "created_at", "createdAt", "time"]),
        count: Number(row.count ?? row.total ?? 0) || 0,
        errors: Number(row.errors ?? row.errorCount ?? 0) || 0,
      }
    })
  },
  logs: async (params: {
    page: number; limit: number; level?: string; category?: string; module?: string;
    statusCode?: string; search?: string; from?: string; to?: string
  }): Promise<MonitoringListResult> => {
    const payload = await request(`/platform/monitoring/logs${queryString(params)}`)
    const root = object(payload) ?? {}
    const data = object(root.data)
    const items = rowsFrom(payload).map(normalizeLog)
    const meta = object(root.meta) ?? object(data?.meta) ?? object(root.pagination) ?? object(data?.pagination) ?? data ?? root
    const totalValue = Number(meta.total ?? meta.totalItems ?? meta.totalCount)
    const totalKnown = Number.isFinite(totalValue) && (meta.total !== undefined || meta.totalItems !== undefined || meta.totalCount !== undefined)
    const page = Number(meta.current_page ?? meta.page ?? params.page) || params.page
    const limit = Number(meta.per_page ?? meta.limit ?? params.limit) || params.limit
    return {
      items, page, limit,
      total: totalKnown ? totalValue : (page - 1) * limit + items.length,
      totalKnown,
      hasNext: meta.has_next === true || meta.hasNext === true || meta.next_page_url != null ||
        (totalKnown ? page * limit < totalValue : items.length === limit),
    }
  },
  detail: async (id: string): Promise<MonitoringLog> => {
    const payload = await request(`/platform/monitoring/logs/${encodeURIComponent(id)}`)
    const root = object(payload) ?? {}
    return normalizeLog(root.data ?? payload, 0)
  },
}
