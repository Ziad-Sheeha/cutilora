import { useEffect, useState } from "react"
import { Navigate, Outlet, useLocation, useNavigate } from "react-router"
import { getSuperAdminToken, expireSuperAdminSession } from "@/portals/super-admin/auth/super-admin-auth"
import { getAccessTokenExpiryMs, SESSION_EXPIRED_EVENT } from "@/shared/auth/session/session-expiry"

export function SuperAdminGuard() {
  const location = useLocation()
  const navigate = useNavigate()
  const [authenticated, setAuthenticated] = useState(() => Boolean(getSuperAdminToken()))

  useEffect(() => {
    const handleExpired = (event: Event) => {
      const detail = (event as CustomEvent<{ portal?: string }>).detail
      if (detail?.portal !== "platform") return
      setAuthenticated(false)
      navigate("/super-admin/login", { replace: true, state: { from: location.pathname, reason: "session-expired" } })
    }

    window.addEventListener(SESSION_EXPIRED_EVENT, handleExpired)
    const token = getSuperAdminToken()
    if (!token) {
      setAuthenticated(false)
      return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleExpired)
    }

    setAuthenticated(true)
    const expiresAt = getAccessTokenExpiryMs(token)
    const timeout = expiresAt === null
      ? undefined
      : window.setTimeout(() => {
          expireSuperAdminSession()
          setAuthenticated(false)
          navigate("/super-admin/login", { replace: true, state: { from: location.pathname, reason: "session-expired" } })
        }, Math.max(0, expiresAt - Date.now()))

    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleExpired)
      if (timeout !== undefined) window.clearTimeout(timeout)
    }
  }, [location.pathname, navigate])

  return authenticated
    ? <Outlet />
    : <Navigate to="/super-admin/login" replace state={{ from: location.pathname }} />
}
