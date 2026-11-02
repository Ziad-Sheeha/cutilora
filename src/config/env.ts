const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

export const appEnv = {
  // API base includes the version prefix; deployments can override it with VITE_API_BASE_URL.
  apiBaseUrl: apiBaseUrl || "https://cutilora.ct.ws/v1",
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const
