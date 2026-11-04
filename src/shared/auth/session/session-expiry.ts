export type AuthPortal = "platform" | "tenant"

export const SESSION_EXPIRED_EVENT = "cutilora:session-expired"

export function isAccessTokenExpired(token: string, clockSkewSeconds = 30): boolean {
  try {
    const payload = token.split(".")[1]
    if (!payload) return false
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/")
    const decoded = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="))
    const claims = JSON.parse(decoded) as { exp?: unknown }
    if (typeof claims.exp !== "number") return false
    return claims.exp <= Math.floor(Date.now() / 1000) + clockSkewSeconds
  } catch {
    return false
  }
}

export function publishSessionExpired(portal: AuthPortal): void {
  window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT, { detail: { portal } }))
}
