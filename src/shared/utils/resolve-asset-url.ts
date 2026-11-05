import { appEnv } from "@/config/env"

const apiOrigin = new URL(appEnv.apiBaseUrl).origin

/** Resolve API asset paths such as /uploads/... without breaking absolute or data URLs. */
export function resolveAssetUrl(path?: string | null): string {
  if (!path) return ""
  const value = path.trim()
  if (!value) return ""
  if (/^(?:https?:|data:|blob:)/i.test(value)) return value
  return new URL(value.replace(/^\/+/, ""), apiOrigin + "/").toString()
}
