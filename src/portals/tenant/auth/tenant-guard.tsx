import { Navigate, Outlet } from "react-router"
import { getTenantSession } from "./tenant-session"

const TENANT_ROLES = ["tenant_owner", "tenant_admin", "organization_manager", "billing_admin", "read_only_analyst"]

export function TenantGuard() {
  const session = getTenantSession()

  if (!session) {
    return <Navigate to="/tenant/login" replace />
  }

  if (!TENANT_ROLES.includes(session.membership.role)) {
    return <Navigate to="/clinic/login" replace />
  }

  return <Outlet />
}
