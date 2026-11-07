import {
  Bell,
  BarChart3,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  ClipboardCheck,
  CreditCard,
  LayoutDashboard,
  PlugZap,
  Settings2,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  UsersRound,
  WalletCards,
  type LucideIcon,
} from "lucide-react"

export const tenantSidebarLabels: Record<string, { en: string; ar: string }> = {
  dashboard: { en: "Dashboard", ar: "لوحة التحكم" },
  organizationProfile: { en: "Organization Profile", ar: "ملف المؤسسة" },
  clinics: { en: "Clinics", ar: "العيادات" },
  branches: { en: "Branches", ar: "الفروع" },
  documents: { en: "Documents", ar: "المستندات" },
  clinicWorkspace: { en: "Clinic Workspace", ar: "مساحة إدارة العيادة" },
  branchOperations: { en: "Branch Hours & Holidays", ar: "مواعيد الفروع والعطلات" },
  users: { en: "Users & Memberships", ar: "المستخدمون والعضويات" },
  invitations: { en: "Invitations", ar: "الدعوات" },
  roles: { en: "Roles & Permissions", ar: "الأدوار والصلاحيات" },
  catalog: { en: "Service & Treatment Defaults", ar: "افتراضات الخدمات والعلاجات" },
  policies: { en: "Organization Policies", ar: "سياسات المؤسسة" },
  financeOverview: { en: "Financial Overview", ar: "النظرة المالية" },
  subscriptionPlan: { en: "Current Plan & Billing", ar: "الخطة الحالية والفوترة" },
  integrations: { en: "Connected Providers & API", ar: "الخدمات المتصلة وAPI" },
  insights: { en: "Group Reports", ar: "تقارير المجموعة" },
  governance: { en: "Activity & Audit Logs", ar: "النشاط وسجلات التدقيق" },
  preferences: { en: "Preferences", ar: "التفضيلات" },
  notifications: { en: "Notifications", ar: "الإشعارات" },
  security: { en: "Security", ar: "الأمان" },
}

const groupIcons: Record<string, LucideIcon> = {
  overview: LayoutDashboard,
  organization: BriefcaseBusiness,
  access: UsersRound,
  configuration: SlidersHorizontal,
  finance: WalletCards,
  subscription: CreditCard,
  integrations: PlugZap,
  insights: ChartNoAxesCombined,
  governance: ClipboardCheck,
  settings: Settings2,
}

export function getTenantSidebarGroupIcon(key: string): LucideIcon {
  return groupIcons[key] ?? Shield
}

export const tenantSidebarDecorativeIcons = {
  Bell,
  BarChart3,
  ShieldCheck,
}
