import { lazy, Suspense, type ReactNode } from "react"
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
import { AuditMonitoringPage } from "@/portals/super-admin/features/monitoring/pages/audit-monitoring.page"
import { adminNavigation } from "@/portals/clinic/config/navigation"
import { TenantGuard } from "@/portals/tenant/auth/tenant-guard"
import { TenantLoginPage } from "@/portals/tenant/auth/tenant-login-page"
import { TenantLayout } from "@/portals/tenant/layout/tenant-layout"

const TenantsPage = lazy(() => import("@/portals/super-admin/features/tenants/pages/tenants.page").then((module) => ({ default: module.TenantsPage })))
const TenantDetailsPage = lazy(() => import("@/portals/super-admin/features/tenants/pages/tenant-details.page").then((module) => ({ default: module.TenantDetailsPage })))
const TenantFormPage = lazy(() => import("@/portals/super-admin/features/tenants/pages/tenant-form.page").then((module) => ({ default: module.TenantFormPage })))
const TenantOverviewPage = lazy(() => import("@/portals/tenant/pages/tenant-overview.page").then((module) => ({ default: module.TenantOverviewPage })))
const TenantClinicsPage = lazy(() => import("@/portals/tenant/pages/tenant-clinics.page").then((module) => ({ default: module.TenantClinicsPage })))
const TenantBranchesPage = lazy(() => import("@/portals/tenant/pages/tenant-branches.page").then((module) => ({ default: module.TenantBranchesPage })))
const TenantOrganizationPage = lazy(() => import("@/portals/tenant/pages/tenant-organization.page").then((module) => ({ default: module.TenantOrganizationPage })))

function TenantRouteFallback() {
  return <div role="status" aria-live="polite" className="flex min-h-[240px] items-center justify-center text-sm text-muted-foreground">Loading tenant module…</div>
}

function TenantRoute({ children }: { children: ReactNode }) {
  return <Suspense fallback={<TenantRouteFallback />}>{children}</Suspense>
}

export const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  { path: "/clinic/login", element: <ClinicLoginPage /> },
  { path: "/tenant/login", element: <TenantLoginPage /> },
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
        { path: "tenants", element: <TenantRoute><TenantsPage /></TenantRoute> },
        { path: "tenants/new", element: <TenantRoute><TenantFormPage /></TenantRoute> },
        { path: "tenants/:tenantId/edit", element: <TenantRoute><TenantFormPage /></TenantRoute> },
        { path: "tenants/:tenantId", element: <TenantRoute><TenantDetailsPage /></TenantRoute> },
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
  {
    path: "/tenant",
    element: <TenantGuard />,
    children: [{
      element: <TenantLayout />,
      children: [
        { index: true, element: <TenantRoute><TenantOverviewPage /></TenantRoute> },
        { path: "clinics", element: <TenantRoute><TenantClinicsPage /></TenantRoute> },
        { path: "branches", element: <TenantRoute><TenantBranchesPage /></TenantRoute> },
        { path: "organization", element: <TenantRoute><TenantOrganizationPage /></TenantRoute> },
      ],
    }],
  },
  { path: "/admin/*", element: <Navigate to="/clinic" replace /> },
  { path: "*", element: <NotFoundPage /> },
])
