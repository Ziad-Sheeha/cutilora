import { memo, useEffect, useMemo, useState } from "react"
import { NavLink, useLocation } from "react-router"
import {
  ChevronDown,
  LogOut,
  BriefcaseBusiness,
  UsersRound,
  WalletCards,
  CreditCard,
  PlugZap,
  ChartNoAxesCombined,
  ClipboardCheck,
  Settings2,
  LayoutDashboard,
  SlidersHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  Search,
  X,
} from "lucide-react"
import { BrandLogo } from "@/components/brand/brand-logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

function TenantSidebarView({ collapsed = false, onToggleCollapse, onNavigate }: Props) {
  const { locale } = useI18n()
  const { pathname } = useLocation()
  const ar = locale === "ar"
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
  const [searchQuery, setSearchQuery] = useState("")
  useEffect(() => {
    const activeGroup = tenantNavigation.find((group) =>
      group.items.some((item) =>
        item.href === "/tenant" ? pathname === item.href : pathname.startsWith(item.href),
      ),
    )
    if (activeGroup) {
      setExpandedGroups((current) => ({ ...current, [activeGroup.key]: true }))
    }
  }, [pathname])

  const labels = useMemo(
    () => Object.fromEntries(
      Object.entries(itemLabels).map(([key, value]) => [key, value[ar ? "ar" : "en"]]),
    ) as Record<string, string>,
    [ar],
  )

  const filteredNavigation = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase(ar ? "ar" : "en")
    if (!query) return tenantNavigation
    return tenantNavigation
      .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          (labels[item.key] || item.key).toLocaleLowerCase(ar ? "ar" : "en").includes(query),
        ),
      }))
      .filter((group) => group.items.length > 0)
  }, [ar, labels, searchQuery])

  async function signOut() {
    try {
      await tenantLogout()
    } finally {
      clearTenantSession()
      window.location.assign("/tenant/login")
    }
  }

  function groupIcon(key: string) {
    const icons = { overview: LayoutDashboard, organization: BriefcaseBusiness, access: UsersRound, configuration: SlidersHorizontal, finance: WalletCards, subscription: CreditCard, integrations: PlugZap, insights: ChartNoAxesCombined, governance: ClipboardCheck, settings: Settings2 }
    return icons[key as keyof typeof icons] || Sparkles
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
              `group relative flex min-h-11 items-center gap-3 rounded-lg border px-3 py-2.5 text-[13px] font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 ${
                isActive
                  ? "border-violet-400/45 bg-gradient-to-r from-violet-500/25 to-violet-400/10 text-white shadow-[0_5px_16px_rgba(109,74,255,.16)] before:absolute before:inset-y-2 before:-start-[17px] before:w-[3px] before:rounded-full before:bg-violet-300"
                  : "border-transparent bg-transparent text-white/65 shadow-none hover:border-transparent hover:bg-white/[.055] hover:text-white"
              } ${collapsed ? "justify-center px-0 before:hidden" : ""}`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`grid size-7 shrink-0 place-items-center rounded-md transition-colors ${isActive ? "bg-violet-400/20 text-violet-100" : "bg-transparent text-white/70"}`}>
                  <Icon className="size-[17px] shrink-0" />
                </span>
                {!collapsed && <span className="min-w-0 truncate">{label}</span>}
              </>
            )}
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
          {!collapsed && (
            <div className="px-1 pb-1">
              <div className="relative">
                <Search className={`pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 text-white/35 ${ar ? "right-3" : "left-3"}`} />
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={ar ? "ابحث في القائمة..." : "Search navigation..."}
                  aria-label={ar ? "ابحث في عناصر القائمة" : "Search navigation"}
                  className={`h-10 border-white/10 bg-white/[.06] text-sm text-white placeholder:text-white/35 focus-visible:ring-violet-400 ${ar ? "pr-9 pl-9" : "pl-9 pr-9"}`}
                />
                {searchQuery && (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label={ar ? "مسح البحث" : "Clear search"}
                    onClick={() => setSearchQuery("")}
                    className={`absolute top-1/2 size-7 -translate-y-1/2 text-white/50 hover:bg-white/10 hover:text-white ${ar ? "left-1" : "right-1"}`}
                  >
                    <X className="size-3.5" />
                  </Button>
                )}
              </div>
            </div>
          )}
          {filteredNavigation.length === 0 && (
            <p className="px-3 py-8 text-center text-xs text-white/45">
              {ar ? "مفيش نتائج مطابقة" : "No navigation results"}
            </p>
          )}
          {filteredNavigation.map((group) => {
            const GroupIcon = groupIcon(group.key)
            const groupLabel = group.label[ar ? "ar" : "en"]
            const isOpen = expandedGroups[group.key] ?? false
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
                          className="w-full rounded-xl text-white/55 hover:bg-white/[.07] hover:text-white"
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
                          <NavLink to={item.href} end={item.href === "/tenant"} onClick={onNavigate} className={({ isActive }) => `flex w-full items-center gap-2 rounded-lg ${isActive ? "bg-violet-100 font-semibold text-violet-800 focus:bg-violet-100 focus:text-violet-900" : ""}`}>
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
              <section key={group.key} className="relative">
                <Button
                  variant="ghost"
                  onClick={() => setExpandedGroups((current) => ({ ...current, [group.key]: !isOpen }))}
                  aria-expanded={isOpen}
                  className={`group mb-2 flex h-10 w-full items-center justify-between rounded-lg px-2.5 text-[10px] font-bold uppercase tracking-[.16em] transition-colors hover:bg-white/[.045] ${isOpen ? "text-violet-200" : "text-white/45 hover:text-white/75"}`}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className={`grid size-7 shrink-0 place-items-center rounded-lg transition-colors ${isOpen ? "bg-violet-500/15 text-violet-300" : "bg-white/[.045] text-white/40 group-hover:text-white/70"}`}>
                      <GroupIcon className="size-4" />
                    </span>
                    <span className="truncate">{groupLabel}</span>
                  </span>
                  <ChevronDown className={`size-3.5 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-violet-300" : "text-white/35"}`} />
                </Button>
                {isOpen && (
                  <div className="ms-[22px] space-y-1 border-s border-white/[.13] pb-2 ps-3">
                    {group.items.map(renderLink)}
                  </div>
                )}
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
