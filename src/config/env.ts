const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

export const appEnv = {
  // The hosted Laravel API base URL, including its version prefix (for example: https://api.example.com/v1).
  apiBaseUrl: apiBaseUrl || "/v1",
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const
