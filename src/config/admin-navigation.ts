import { CalendarDays, LayoutDashboard, Settings, Users, type LucideIcon } from "lucide-react"

export type AdminNavigationItem = {
  label: string
  href: string
  icon: LucideIcon
}

export const adminNavigation: AdminNavigationItem[] = [
  { label: "Overview", href: "/clinic", icon: LayoutDashboard },
  { label: "Appointments", href: "/clinic/appointments", icon: CalendarDays },
  { label: "Patients", href: "/clinic/patients", icon: Users },
  { label: "Team & access", href: "/clinic/team", icon: Users },
  { label: "Settings", href: "/clinic/settings", icon: Settings },
]
