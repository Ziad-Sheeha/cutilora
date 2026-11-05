import { NavLink } from "react-router"
import { LogOut, Sparkles } from "lucide-react"
import { BrandLogo } from "@/components/brand/brand-logo"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/i18n/i18n-provider"
import { tenantLogout } from "../api/tenant-api"
import { tenantNavigation } from "../config/navigation"
import { clearTenantSession } from "../auth/tenant-session"

type Props = { onNavigate?: () => void }

export function TenantSidebar({ onNavigate }: Props) {
  const { locale } = useI18n()
  const ar = locale === "ar"
  const labels = ar
    ? {
        overview: "نظرة عامة",
        clinics: "العيادات",
        branches: "الفروع",
        organization: "المؤسسة",
        workspace: "مساحة المؤسسة",
        signOut: "تسجيل الخروج",
        caption: "إدارة مؤسستك بثقة",
      }
    : {
        overview: "Overview",
        clinics: "Clinics",
        branches: "Branches",
        organization: "Organization",
        workspace: "Organization workspace",
        signOut: "Sign out",
        caption: "Run your organization with clarity",
      }

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
      <div className="flex h-[82px] items-center border-b border-white/10 px-6">
        <BrandLogo className="dark" imageClassName="h-10" />
      </div>

      <div className="px-6 py-6">
        <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-violet-300">
          <Sparkles className="size-3.5" />
          CUTILORA
        </div>
        <p className="text-sm font-semibold">{labels.workspace}</p>
        <p className="mt-1 text-xs text-white/45">{labels.caption}</p>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2" aria-label={labels.workspace}>
        {tenantNavigation.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.key}
              to={item.href}
              end={item.href === "/tenant"}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-violet-500/20 text-white shadow-inner shadow-violet-300/10"
                    : "text-white/60 hover:bg-white/[.06] hover:text-white"
                }`
              }
            >
              <Icon className="size-[18px]" />
              {labels[item.key]}
            </NavLink>
          )
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-white/65 hover:bg-white/10 hover:text-white"
          onClick={signOut}
        >
          <LogOut className="size-4" />
          {labels.signOut}
        </Button>
      </div>
    </aside>
  )
}
