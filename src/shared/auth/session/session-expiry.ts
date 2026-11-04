export type AuthPortal = "platform" | "tenant"

export const SESSION_EXPIRED_EVENT = "cutilora:session-expired"

export function getAccessTokenExpiryMs(token: string): number | null {
  try {
    const payload = token.split(".")[1]
    if (!payload) return null
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/")
    const decoded = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="))
    const claims = JSON.parse(decoded) as { exp?: unknown }
    return typeof claims.exp === "number" ? claims.exp * 1000 : null
  } catch {
    return null
  }
}

export function isAccessTokenExpired(token: string, clockSkewSeconds = 30): boolean {
  const expiresAt = getAccessTokenExpiryMs(token)
  return expiresAt !== null && expiresAt <= Date.now() + clockSkewSeconds * 1000
}

export function publishSessionExpired(portal: AuthPortal): void {
  window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT, { detail: { portal } }))
}
