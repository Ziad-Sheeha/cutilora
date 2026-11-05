import { Building2, LayoutDashboard, MapPinned, Settings2, type LucideIcon } from "lucide-react"
export type TenantNavItem = { key: "overview" | "clinics" | "branches" | "organization"; href: string; icon: LucideIcon }
export const tenantNavigation: TenantNavItem[] = [
  { key: "overview", href: "/tenant", icon: LayoutDashboard },
  { key: "clinics", href: "/tenant/clinics", icon: Building2 },
  { key: "branches", href: "/tenant/branches", icon: MapPinned },
  { key: "organization", href: "/tenant/organization", icon: Settings2 },
]
