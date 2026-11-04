import { createBrowserRouter, Navigate } from "react-router"
import { LandingPage } from "@/app/pages/landing-page"
import { ClinicLayout } from "@/portals/clinic/layout/clinic-layout"
import { DashboardPage } from "@/portals/clinic/features/dashboard/pages/dashboard.page"
import { ClinicModulePage } from "@/portals/clinic/features/clinic/pages/clinic-module.page"
import { NotFoundPage } from "@/app/pages/not-found.page"
import { ClinicLoginPage } from "@/portals/clinic/auth/login-page"
import { SuperAdminLoginPage } from "@/portals/super-admin/auth/login-page"
import { SuperAdminGuard } from "@/portals/super-admin/auth/super-admin-guard"
import { SuperAdminLayout } from "@/portals/super-admin/layout/super-admin-layout"
import { SuperAdminModulePage, SuperAdminOverviewPage } from "@/portals/super-admin/pages/super-admin-pages"
import { GeoLocationPage } from "@/portals/super-admin/features/geo-location/pages/geo-location.page"
import { TenantsPage } from "@/portals/super-admin/features/tenants/pages/tenants.page"
import { TenantDetailsPage } from "@/portals/super-admin/features/tenants/pages/tenant-details.page"
import { TenantFormPage } from "@/portals/super-admin/features/tenants/pages/tenant-form.page"
import { AuditMonitoringPage } from "@/portals/super-admin/features/monitoring/pages/audit-monitoring.page"
import { adminNavigation } from "@/portals/clinic/config/navigation"

export const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  { path: "/clinic/login", element: <ClinicLoginPage /> },
  { path: "/super-admin/login", element: <SuperAdminLoginPage /> },
  {
    path: "/clinic",
    element: <ClinicLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      ...adminNavigation.filter((item) => item.href !== "/clinic").map((item) => ({
        path: item.href.replace("/clinic/", ""),
        element: <ClinicModulePage />,
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
        { path: "tenants", element: <TenantsPage /> },
        { path: "tenants/new", element: <TenantFormPage /> },
        { path: "tenants/:tenantId/edit", element: <TenantFormPage /> },
        { path: "tenants/:tenantId", element: <TenantDetailsPage /> },
        { path: "clinics", element: <SuperAdminModulePage moduleKey="clinics" /> },
        { path: "branches", element: <SuperAdminModulePage moduleKey="branches" /> },
        { path: "users", element: <SuperAdminModulePage moduleKey="users" /> },
        { path: "access", element: <SuperAdminModulePage moduleKey="access" /> },
        { path: "audit", element: <AuditMonitoringPage /> },
        { path: "settings", element: <SuperAdminModulePage moduleKey="settings" /> },
        { path: "geo-location", element: <Navigate to="/super-admin/geo-location/countries" replace /> },
        { path: "geo-location/:kind", element: <GeoLocationPage /> },
      ],
    }],
  },
  { path: "/admin/*", element: <Navigate to="/clinic" replace /> },
  { path: "*", element: <NotFoundPage /> },
])
