import { useEffect } from "react"
import { Navigate, Outlet } from "react-router"
import { isAccessTokenExpired } from "@/shared/auth/session/session-expiry"
import { expireTenantSession, getTenantSession, getTenantTokenExpiryMs } from "./tenant-session"

const TENANT_ROLES = ["tenant_owner", "tenant_admin", "organization_manager", "billing_admin", "read_only_analyst"]

export function TenantGuard() {
  const session = getTenantSession()
  const expiresAt = getTenantTokenExpiryMs()

  useEffect(() => {
    if (!session || expiresAt === null) return

    const remaining = expiresAt - Date.now() - 30_000
    if (remaining <= 0 || isAccessTokenExpired(session.token)) {
      expireTenantSession()
      return
    }

    const timeoutId = window.setTimeout(expireTenantSession, remaining)
    return () => window.clearTimeout(timeoutId)
  }, [session?.token, expiresAt])

  if (!session) {
    return <Navigate to="/tenant/login" replace />
  }

  if (!TENANT_ROLES.includes(session.membership.role)) {
    return <Navigate to="/clinic/login" replace />
  }

  return <Outlet />
}
