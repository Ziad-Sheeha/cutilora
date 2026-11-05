import type { ReactNode } from "react"
import { Navigate } from "react-router"
import { getClinicToken } from "./clinic-auth"

export function ClinicGuard({ children }: { children: ReactNode }) {
  return getClinicToken() ? <>{children}</> : <Navigate to="/clinic/login" replace />
}
