import { memo, useMemo, useState } from "react"
import { NavLink, useLocation } from "react-router"
import {
  ChevronDown,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
} from "lucide-react"
import { BrandLogo } from "@/components/brand/brand-logo"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useI18n } from "@/i18n/i18n-provider"
import { tenantLogout } from "../api/tenant-api"
import { tenantNavigation } from "../config/navigation"
import { clearTenantSession } from "../auth/tenant-session"

type Props = {
  collapsed?: boolean
  onToggleCollapse?: () => void
  onNavigate?: () => void
}

const itemLabels: Record<string, { en: string; ar: string }> = {
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

const groupIcons = {
  overview: Sparkles,
  organization: Sparkles,
  access: Sparkles,
  configuration: Sparkles,
  finance: Sparkles,
  subscription: Sparkles,
  integrations: Sparkles,
  insights: Sparkles,
  governance: Sparkles,
  settings: Sparkles,
}

function TenantSidebarView({ collapsed = false, onToggleCollapse, onNavigate }: Props) {
  const { locale } = useI18n()
  const { pathname } = useLocation()
  const ar = locale === "ar"
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
  const labels = useMemo(
    () => Object.fromEntries(
      Object.entries(itemLabels).map(([key, value]) => [key, value[ar ? "ar" : "en"]]),
    ) as Record<string, string>,
    [ar],
  )

  async function signOut() {
    try {
      await tenantLogout()
    } finally {
      clearTenantSession()
      window.location.assign("/tenant/login")
    }
  }

  function isGroupActive(group: (typeof tenantNavigation)[number]) {
    return group.items.some((item) =>
      item.href === "/tenant" ? pathname === item.href : pathname.startsWith(item.href),
    )
  }

  function renderLink(item: (typeof tenantNavigation)[number]["items"][number]) {
    const Icon = item.icon
    const label = labels[item.key] || item.key
    return (
      <Tooltip key={item.key}>
        <TooltipTrigger asChild>
          <NavLink
            to={item.href}
            end={item.href === "/tenant"}
            onClick={onNavigate}
            aria-label={label}
            className={({ isActive }) =>
              `group flex min-h-10 items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tenant-primary,var(--primary))] ${
                isActive
                  ? "bg-[var(--tenant-primary,var(--primary))]/20 text-white shadow-inner"
                  : "text-white/65 hover:bg-white/[.07] hover:text-white"
              } ${collapsed ? "justify-center px-0" : ""}`
            }
          >
            <Icon className="size-[18px] shrink-0" />
            {!collapsed && <span className="min-w-0 truncate">{label}</span>}
          </NavLink>
        </TooltipTrigger>
        <TooltipContent side={ar ? "left" : "right"}>{label}</TooltipContent>
      </Tooltip>
    )
  }

  return (
    <TooltipProvider>
      <aside
        dir={ar ? "rtl" : "ltr"}
        data-collapsed={collapsed}
        className={`sticky top-0 flex h-svh min-h-0 flex-col border-e border-white/10 bg-[#171326] text-white transition-[width] duration-200 ${collapsed ? "w-20" : "w-[268px]"}`}
      >
        <div className={`flex h-[76px] shrink-0 items-center border-b border-white/10 ${collapsed ? "justify-center px-2" : "justify-between px-5"}`}>
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="grid size-10 place-items-center rounded-xl bg-white/[.06] text-violet-200">
                  <Sparkles className="size-5" />
                </span>
              </TooltipTrigger>
              <TooltipContent side={ar ? "left" : "right"}>Cutilora</TooltipContent>
            </Tooltip>
          ) : (
            <BrandLogo className="dark" imageClassName="h-9" />
          )}
          {onToggleCollapse && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggleCollapse}
                  aria-label={collapsed ? (ar ? "توسيع القائمة" : "Expand sidebar") : (ar ? "طي القائمة" : "Collapse sidebar")}
                  className="size-9 text-white/65 hover:bg-white/10 hover:text-white"
                >
                  {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side={ar ? "left" : "right"}>
                {collapsed ? (ar ? "توسيع القائمة" : "Expand sidebar") : (ar ? "طي القائمة" : "Collapse sidebar")}
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {!collapsed && (
          <div className="shrink-0 px-5 py-5">
            <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-violet-300">
              <Sparkles className="size-3.5" />
              CUTILORA
            </div>
            <p className="text-sm font-semibold">{ar ? "مساحة المؤسسة" : "Organization workspace"}</p>
            <p className="mt-1 text-xs text-white/45">
              {ar ? "إدارة مؤسستك بثقة" : "Run your organization with clarity"}
            </p>
          </div>
        )}

        <nav
          className={`min-h-0 flex-1 space-y-3 overflow-y-auto pb-5 ${collapsed ? "px-2 pt-4" : "px-3"}`}
          aria-label={ar ? "التنقل الرئيسي" : "Main navigation"}
        >
          {tenantNavigation.map((group) => {
            const GroupIcon = groupIcons[group.key as keyof typeof groupIcons] || Sparkles
            const groupLabel = group.label[ar ? "ar" : "en"]
            const isOpen = expandedGroups[group.key] ?? isGroupActive(group)
            if (collapsed) {
              return (
                <DropdownMenu key={group.key}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={groupLabel}
                          className={`w-full text-white/65 hover:bg-white/10 hover:text-white ${isGroupActive(group) ? "bg-white/10 text-white" : ""}`}
                        >
                          <GroupIcon className="size-[18px]" />
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent side={ar ? "left" : "right"}>{groupLabel}</TooltipContent>
                  </Tooltip>
                  <DropdownMenuContent side={ar ? "left" : "right"} align="start" className="min-w-56">
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{groupLabel}</div>
                    {group.items.map((item) => {
                      const Icon = item.icon
                      return (
                        <DropdownMenuItem key={item.key} asChild>
                          <NavLink to={item.href} end={item.href === "/tenant"} onClick={onNavigate} className="flex w-full items-center gap-2">
                            <Icon className="size-4" />
                            <span>{labels[item.key] || item.key}</span>
                          </NavLink>
                        </DropdownMenuItem>
                      )
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              )
            }

            return (
              <section key={group.key}>
                <Button
                  variant="ghost"
                  onClick={() => setExpandedGroups((current) => ({ ...current, [group.key]: !isOpen }))}
                  aria-expanded={isOpen}
                  className="mb-1 h-9 w-full justify-between rounded-lg px-3 text-[10px] font-bold uppercase tracking-[.14em] text-white/40 hover:bg-white/[.05] hover:text-white/75"
                >
                  <span>{groupLabel}</span>
                  <ChevronDown className={`size-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </Button>
                {isOpen && <div className="space-y-1">{group.items.map(renderLink)}</div>}
              </section>
            )
          })}
        </nav>

        <div className={`shrink-0 border-t border-white/10 p-3 ${collapsed ? "flex justify-center" : ""}`}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size={collapsed ? "icon" : "md"}
                className={`text-white/65 hover:bg-white/10 hover:text-white ${collapsed ? "" : "w-full justify-start"}`}
                onClick={signOut}
              >
                <LogOut className="size-4" />
                {!collapsed && (ar ? "تسجيل الخروج" : "Sign out")}
              </Button>
            </TooltipTrigger>
            {collapsed && <TooltipContent side={ar ? "left" : "right"}>{ar ? "تسجيل الخروج" : "Sign out"}</TooltipContent>}
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  )
}

export const TenantSidebar = memo(TenantSidebarView)
TenantSidebar.displayName = "TenantSidebar"
