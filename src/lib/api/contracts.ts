export type ApiError = {
  code: string
  message: string
  details?: Record<string, unknown> | null
}

export type ApiErrorEnvelope = {
  success: false
  error: ApiError
  request_id?: string
}

export type ApiSuccessEnvelope<T> = {
  success: true
  data: T
  meta?: Record<string, unknown>
}

export type PaginatedResponse<T> = {
  data: T[]
  meta: {
    current_page: number
    per_page: number
    total: number
    last_page: number
  }
}
