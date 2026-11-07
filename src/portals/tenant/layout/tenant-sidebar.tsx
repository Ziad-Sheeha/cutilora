import { memo, useEffect, useMemo, useState } from "react"
import { useLocation } from "react-router"
import { Sparkles } from "lucide-react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useI18n } from "@/i18n/i18n-provider"
import { tenantLogout } from "../api/tenant-api"
import { tenantNavigation } from "../config/navigation"
import { clearTenantSession } from "../auth/tenant-session"
import { tenantSidebarLabels } from "./tenant-sidebar/constants"
import { TenantSidebarFooter } from "./tenant-sidebar/sidebar-footer"
import { TenantSidebarHeader } from "./tenant-sidebar/sidebar-header"
import { TenantSidebarNavigation } from "./tenant-sidebar/sidebar-navigation"
import { TenantSidebarSearch } from "./tenant-sidebar/sidebar-search"

type Props = {
  collapsed?: boolean
  onToggleCollapse?: () => void
  onNavigate?: () => void
}

function TenantSidebarView({ collapsed = false, onToggleCollapse, onNavigate }: Props) {
  const { locale } = useI18n()
  const { pathname } = useLocation()
  const isArabic = locale === "ar"
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
  const [searchQuery, setSearchQuery] = useState("")

  const labels = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(tenantSidebarLabels).map(([key, value]) => [
          key,
          value[isArabic ? "ar" : "en"],
        ]),
      ) as Record<string, string>,
    [isArabic],
  )

  const filteredNavigation = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase(isArabic ? "ar" : "en")
    if (!query) return tenantNavigation

    return tenantNavigation
      .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          (labels[item.key] || item.key)
            .toLocaleLowerCase(isArabic ? "ar" : "en")
            .includes(query),
        ),
      }))
      .filter((group) => group.items.length > 0)
  }, [isArabic, labels, searchQuery])

  useEffect(() => {
    const activeGroup = tenantNavigation.find((group) =>
      group.items.some((item) =>
        item.href === "/tenant"
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`),
      ),
    )

    if (activeGroup) {
      setExpandedGroups((current) =>
        current[activeGroup.key] ? current : { ...current, [activeGroup.key]: true },
      )
    }
  }, [pathname])

  async function handleSignOut() {
    try {
      await tenantLogout()
    } finally {
      clearTenantSession()
      window.location.assign("/tenant/login")
    }
  }

  function handleToggleGroup(key: string) {
    setExpandedGroups((current) => ({ ...current, [key]: !(current[key] ?? false) }))
  }

  return (
    <TooltipProvider>
      <aside
        dir={isArabic ? "rtl" : "ltr"}
        data-collapsed={collapsed}
        className={`sticky top-0 flex h-svh min-h-0 flex-col border-e border-white/10 bg-[#171326] text-white transition-[width] duration-200 ${collapsed ? "w-20" : "w-[268px]"}`}
      >
        <TenantSidebarHeader
          collapsed={collapsed}
          isArabic={isArabic}
          onToggleCollapse={onToggleCollapse}
        />

        <nav
          className={`min-h-0 flex-1 space-y-3 overflow-y-auto pb-5 ${collapsed ? "px-2 pt-4" : "px-3"}`}
          aria-label={isArabic ? "التنقل الرئيسي" : "Main navigation"}
        >
          {!collapsed && (
            <TenantSidebarSearch
              value={searchQuery}
              isArabic={isArabic}
              onChange={setSearchQuery}
            />
          )}

          <TenantSidebarNavigation
            groups={filteredNavigation}
            labels={labels}
            isArabic={isArabic}
            collapsed={collapsed}
            expandedGroups={expandedGroups}
            onToggleGroup={handleToggleGroup}
            onNavigate={onNavigate}
          />
        </nav>

        <TenantSidebarFooter
          collapsed={collapsed}
          isArabic={isArabic}
          onSignOut={handleSignOut}
        />
      </aside>
    </TooltipProvider>
  )
}

export const TenantSidebar = memo(TenantSidebarView)
TenantSidebar.displayName = "TenantSidebar"
