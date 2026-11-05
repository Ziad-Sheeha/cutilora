import { Navigate, Outlet } from "react-router"
import { getTenantSession } from "./tenant-session"
export function TenantGuard() {
  const session = getTenantSession()
  if (!session) return <Navigate to="/tenant/login" replace />
  if (!["tenant_owner", "tenant_admin"].includes(session.membership.role)) return <Navigate to="/clinic/login" replace />
  return <Outlet />
}
