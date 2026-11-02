const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

export const appEnv = {
  apiBaseUrl: apiBaseUrl || "/api/v1",
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const
