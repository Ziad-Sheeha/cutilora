import {  BarChart3, Bell, CalendarDays, ClipboardList, CreditCard, LayoutDashboard, Package, Settings, ShieldCheck, Stethoscope, Users,  Building2, type LucideIcon } from "lucide-react"

export type AdminNavigationItem = {
  label: string
  href: string
  group: "Workspace" | "Clinic operations" | "Management" | "Configuration"
  description: string
  icon: LucideIcon
}

export const adminNavigation: AdminNavigationItem[] = [
  { label: "Overview", href: "/clinic", group: "Workspace", description: "Your clinic at a glance", icon: LayoutDashboard },
  { label: "Appointments", href: "/clinic/appointments", group: "Workspace", description: "Schedule and appointment workflows", icon: CalendarDays },
  { label: "Patients", href: "/clinic/patients", group: "Workspace", description: "Patient directory and profiles", icon: Users },
  { label: "Clinical records", href: "/clinic/clinical-records", group: "Workspace", description: "Consultations and clinical documentation", icon: ClipboardList },
  { label: "Services & catalog", href: "/clinic/services", group: "Clinic operations", description: "Treatments, services and pricing", icon: Stethoscope },
  { label: "Packages & memberships", href: "/clinic/packages", group: "Clinic operations", description: "Treatment packages and memberships", icon: Package },
  { label: "Billing & payments", href: "/clinic/billing", group: "Clinic operations", description: "Invoices, payments and balances", icon: CreditCard },
  { label: "Team & access", href: "/clinic/team", group: "Management", description: "Staff, roles and permissions", icon: ShieldCheck },
  { label: "Reports & analytics", href: "/clinic/reports", group: "Management", description: "Operational and financial insights", icon: BarChart3 },
  { label: "Notifications", href: "/clinic/notifications", group: "Management", description: "Clinic alerts and communication", icon: Bell },
  { label: "Branches", href: "/clinic/branches", group: "Configuration", description: "Locations and branch settings", icon: Building2 },
  { label: "Clinic settings", href: "/clinic/settings", group: "Configuration", description: "Clinic profile and preferences", icon: Settings },
]

export const adminNavigationGroups = ["Workspace", "Clinic operations", "Management", "Configuration"] as const
