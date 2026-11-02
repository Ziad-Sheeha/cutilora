import { CalendarDays, LayoutDashboard, Settings, Users, type LucideIcon } from "lucide-react"

export type AdminNavigationItem = {
  label: string
  href: string
  icon: LucideIcon
}

export const adminNavigation: AdminNavigationItem[] = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Appointments", href: "/admin/appointments", icon: CalendarDays },
  { label: "Patients", href: "/admin/patients", icon: Users },
  { label: "Team & access", href: "/admin/team", icon: Users },
  { label: "Settings", href: "/admin/settings", icon: Settings },
]
