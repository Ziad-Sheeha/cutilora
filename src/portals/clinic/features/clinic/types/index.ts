export type PaginatedResponse<T> = {
  data: T[]
  meta: { current_page: number; per_page: number; total: number; last_page: number }
  links?: { first?: string | null; last?: string | null; prev?: string | null; next?: string | null }
}
export type ApiEnvelope<T> = { data: T; message?: string; meta?: Record<string, unknown> }
export type SelectOption = { label: string; value: string; disabled?: boolean }
export type EntityStatus = "active" | "inactive" | "draft" | "pending" | "suspended" | "archived"
