import {
  Bell,
  Building2,
  ChartNoAxesCombined,
  BarChart3,
  ClipboardList,
  CreditCard,
  Files,
  LayoutDashboard,
  Layers,
  MailPlus,
  MapPinned,
  PlugZap,
  Settings2,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  type LucideIcon,
} from "lucide-react"

export type TenantNavItem = {
  key: string
  href: string
  icon: LucideIcon
}

export type TenantNavGroup = {
  key: string
  label: { en: string; ar: string }
  items: TenantNavItem[]
}

export const tenantNavigation: TenantNavGroup[] = [
  {
    key: "overview",
    label: { en: "Overview", ar: "نظرة عامة" },
    items: [{ key: "dashboard", href: "/tenant", icon: LayoutDashboard }],
  },
  {
    key: "organization",
    label: { en: "Organization", ar: "المؤسسة" },
    items: [
      { key: "organizationProfile", href: "/tenant/organization", icon: Building2 },
      { key: "clinics", href: "/tenant/clinics", icon: Building2 },
      { key: "branches", href: "/tenant/branches", icon: MapPinned },
      { key: "documents", href: "/tenant/documents", icon: Files },
    ],
  },
  {
    key: "access",
    label: { en: "Access Management", ar: "إدارة الوصول" },
    items: [
      { key: "users", href: "/tenant/users", icon: Users },
      { key: "invitations", href: "/tenant/invitations", icon: MailPlus },
      { key: "roles", href: "/tenant/roles", icon: ShieldCheck },
    ],
  },
  {
    key: "configuration",
    label: { en: "Shared Configuration", ar: "الإعدادات المشتركة" },
    items: [
      { key: "catalog", href: "/tenant/catalog", icon: Layers },
      { key: "policies", href: "/tenant/configuration", icon: SlidersHorizontal },
    ],
  },
  {
    key: "finance",
    label: { en: "Finance", ar: "المالية" },
    items: [{ key: "financeOverview", href: "/tenant/finance", icon: ChartNoAxesCombined }],
  },
  {
    key: "subscription",
    label: { en: "Subscription", ar: "الاشتراك" },
    items: [{ key: "subscriptionPlan", href: "/tenant/subscription", icon: CreditCard }],
  },
  {
    key: "integrations",
    label: { en: "Integrations", ar: "التكاملات" },
    items: [{ key: "integrations", href: "/tenant/integrations", icon: PlugZap }],
  },
  {
    key: "insights",
    label: { en: "Insights", ar: "الرؤى والتقارير" },
    items: [{ key: "insights", href: "/tenant/insights", icon: BarChart3 }],
  },
  {
    key: "governance",
    label: { en: "Governance", ar: "الحوكمة" },
    items: [{ key: "governance", href: "/tenant/governance", icon: ClipboardList }],
  },
  {
    key: "settings",
    label: { en: "Settings", ar: "الإعدادات" },
    items: [
      { key: "preferences", href: "/tenant/settings/preferences", icon: Settings2 },
      { key: "notifications", href: "/tenant/settings/notifications", icon: Bell },
      { key: "security", href: "/tenant/settings/security", icon: Shield },
    ],
  },
]
