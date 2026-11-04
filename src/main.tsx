import React from "react"
import ReactDOM from "react-dom/client"
import { RouterProvider } from "react-router/dom"
import { router } from "@/app/router"
import { AppProviders } from "@/app/providers/app-providers"
import { QueryProvider } from "@/app/providers/query-provider"
import { AppErrorBoundary } from "@/app/providers/app-error-boundary"
import "@/index.css"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <AppProviders>
        <QueryProvider>
          <RouterProvider router={router} />
        </QueryProvider>
      </AppProviders>
    </AppErrorBoundary>
  </React.StrictMode>,
)
