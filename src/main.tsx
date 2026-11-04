import React from "react"
import ReactDOM from "react-dom/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "react-router/dom"
import { router } from "@/app/router"
import { AppProviders } from "@/app/providers/app-providers"
import { AppErrorBoundary } from "@/app/providers/app-error-boundary"
import "@/index.css"

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

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <AppProviders>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </AppProviders>
    </AppErrorBoundary>
  </React.StrictMode>,
)
