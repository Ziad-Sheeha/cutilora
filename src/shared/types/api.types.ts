export type ApiErrorBody = { message?: string; error?: string; errors?: Record<string, string | string[]> }
export type ApiResponse<T> = { data: T; message?: string; meta?: Record<string, unknown> }
export type PaginationMeta = { current_page?: number; last_page?: number; per_page?: number; total?: number; from?: number | null; to?: number | null }
export type ApiListResponse<T> = { data: T[]; meta?: PaginationMeta }
export type SortDirection = "asc" | "desc"
export type ListQuery = { page?: number; per_page?: number; search?: string; sortBy?: string; sortDirection?: SortDirection }
