import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { ReactNode } from "react"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        const status = (error as { status?: number }).status
        if (status === 401 || status === 403 || status === 404 || status === 422) return false
        return failureCount < 2
      },
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
    mutations: { retry: 0 },
  },
})

export function QueryProvider({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
