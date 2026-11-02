import { createBrowserRouter, Navigate } from "react-router"
import { App } from "@/App"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { DashboardPage } from "@/features/dashboard/pages/dashboard-page"
import { AdminPlaceholderPage } from "@/pages/admin-placeholder-page"
import { NotFoundPage } from "@/pages/not-found-page"
import { ClinicLoginPage } from "@/portals/clinic/auth/login-page"
import { SuperAdminLoginPage } from "@/portals/super-admin/auth/login-page"
import { SuperAdminGuard } from "@/portals/super-admin/auth/super-admin-guard"
import { SuperAdminLayout } from "@/portals/super-admin/layout/super-admin-layout"
import { SuperAdminModulePage, SuperAdminOverviewPage } from "@/portals/super-admin/pages/super-admin-pages"
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
  {
    path: "/super-admin",
    element: <SuperAdminGuard />,
    children: [{
      element: <SuperAdminLayout />,
      children: [
        { index: true, element: <SuperAdminOverviewPage /> },
        { path: "tenants", element: <SuperAdminModulePage moduleKey="tenants" /> },
        { path: "clinics", element: <SuperAdminModulePage moduleKey="clinics" /> },
        { path: "branches", element: <SuperAdminModulePage moduleKey="branches" /> },
        { path: "users", element: <SuperAdminModulePage moduleKey="users" /> },
        { path: "access", element: <SuperAdminModulePage moduleKey="access" /> },
        { path: "audit", element: <SuperAdminModulePage moduleKey="audit" /> },
        { path: "settings", element: <SuperAdminModulePage moduleKey="settings" /> },
      ],
    }],
  },
  { path: "/admin/*", element: <Navigate to="/clinic" replace /> },
  { path: "*", element: <NotFoundPage /> },
])
