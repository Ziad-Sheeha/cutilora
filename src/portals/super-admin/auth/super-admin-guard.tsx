import { Navigate, Outlet, useLocation } from "react-router"
import { getSuperAdminToken } from "@/portals/super-admin/auth/super-admin-auth"

export function SuperAdminGuard() {
  const location = useLocation()
  return getSuperAdminToken()
    ? <Outlet />
    : <Navigate to="/super-admin/login" replace state={{ from: location.pathname }} />
}
