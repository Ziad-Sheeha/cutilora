import { createBrowserRouter, Navigate } from "react-router"
import { App } from "@/App"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { DashboardPage } from "@/features/dashboard/pages/dashboard-page"
import { AdminPlaceholderPage } from "@/pages/admin-placeholder-page"
import { NotFoundPage } from "@/pages/not-found-page"
import { ClinicLoginPage } from "@/portals/clinic/auth/login-page"
import { SuperAdminLoginPage } from "@/portals/super-admin/auth/login-page"
import { adminNavigation } from "@/config/admin-navigation"

export const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/clinic/login", element: <ClinicLoginPage /> },
  { path: "/super-admin/login", element: <SuperAdminLoginPage /> },
  {
    path: "/clinic",
    element: <AdminLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      ...adminNavigation.filter((item) => item.href !== "/clinic").map((item) => ({
        path: item.href.replace("/clinic/", ""),
        element: <AdminPlaceholderPage />,
      })),
    ],
  },
  // Temporary destination for the Super Admin login preview until its portal shell is implemented.
  { path: "/super-admin", element: <AdminPlaceholderPage /> },
  // Preserve the previous preview URL while moving the portal to its explicit namespace.
  { path: "/admin/*", element: <Navigate to="/clinic" replace /> },
  { path: "*", element: <NotFoundPage /> },
])
