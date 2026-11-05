import { NavLink } from "react-router"
import { LogOut, Sparkles } from "lucide-react"
import { BrandLogo } from "@/components/brand/brand-logo"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/i18n/i18n-provider"
import { tenantLogout } from "../api/tenant-api"
import { tenantNavigation } from "../config/navigation"
import { clearTenantSession } from "../auth/tenant-session"

type Props = { onNavigate?: () => void }

const itemLabels: Record<string, { en: string; ar: string }> = {
  dashboard: { en: "Dashboard", ar: "لوحة التحكم" },
  organizationProfile: { en: "Organization Profile", ar: "ملف المؤسسة" },
  clinics: { en: "Clinics", ar: "العيادات" },
  branches: { en: "Branches", ar: "الفروع" },
  documents: { en: "Documents", ar: "المستندات" },
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

export function TenantSidebar({ onNavigate }: Props) {
  const { locale } = useI18n()
  const ar = locale === "ar"

  async function signOut() {
    try {
      await tenantLogout()
    } finally {
      clearTenantSession()
      window.location.assign("/tenant/login")
    }
  }

  return (
    <aside
      dir={ar ? "rtl" : "ltr"}
      className="flex h-full min-h-[calc(100svh-76px)] w-full flex-col border-e border-white/10 bg-[#171326] text-white"
    >
      <div className="flex h-[82px] shrink-0 items-center border-b border-white/10 px-6">
        <BrandLogo className="dark" imageClassName="h-10" />
      </div>

      <div className="px-6 py-6">
        <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-violet-300">
          <Sparkles className="size-3.5" />
          CUTILORA
        </div>
        <p className="text-sm font-semibold">{ar ? "مساحة المؤسسة" : "Organization workspace"}</p>
        <p className="mt-1 text-xs text-white/45">
          {ar ? "إدارة مؤسستك بثقة" : "Run your organization with clarity"}
        </p>
      </div>

      <nav className="min-h-0 flex-1 space-y-5 overflow-y-auto px-3 pb-5" aria-label={ar ? "التنقل الرئيسي" : "Main navigation"}>
        {tenantNavigation.map((group) => (
          <section key={group.key}>
            <p className="mb-2 px-4 text-[10px] font-bold uppercase tracking-[.14em] text-white/35">
              {group.label[ar ? "ar" : "en"]}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon
                const label = itemLabels[item.key]?.[ar ? "ar" : "en"] || item.key
                return (
                  <NavLink
                    key={item.key}
                    to={item.href}
                    end={item.href === "/tenant"}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-4 py-2.5 text-[13px] font-medium transition-all ${
                        isActive
                          ? "bg-violet-500/20 text-white shadow-inner shadow-violet-300/10"
                          : "text-white/60 hover:bg-white/[.06] hover:text-white"
                      }`
                    }
                  >
                    <Icon className="size-[17px] shrink-0" />
                    <span className="min-w-0 truncate">{label}</span>
                  </NavLink>
                )
              })}
            </div>
          </section>
        ))}
      </nav>

      <div className="shrink-0 border-t border-white/10 p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-white/65 hover:bg-white/10 hover:text-white"
          onClick={signOut}
        >
          <LogOut className="size-4" />
          {ar ? "تسجيل الخروج" : "Sign out"}
        </Button>
      </div>
    </aside>
  )
}
