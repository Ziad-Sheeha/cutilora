import { createBrowserRouter } from "react-router"
import { App } from "@/App"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { DashboardPage } from "@/features/dashboard/pages/dashboard-page"
import { AdminPlaceholderPage } from "@/pages/admin-placeholder-page"
import { NotFoundPage } from "@/pages/not-found-page"

export const router = createBrowserRouter([
  { path: "/", element: <App /> },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "appointments", element: <AdminPlaceholderPage /> },
      { path: "patients", element: <AdminPlaceholderPage /> },
      { path: "team", element: <AdminPlaceholderPage /> },
      { path: "settings", element: <AdminPlaceholderPage /> },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
])
