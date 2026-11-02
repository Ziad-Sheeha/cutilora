import { Bell, ChevronLeft, ChevronRight, Moon, Search, Sun } from "lucide-react"
import { useLocation } from "react-router"
import { adminNavigation } from "@/config/admin-navigation"
import { LanguageSwitch } from "@/i18n/language-switch"
import { useI18n } from "@/i18n/i18n-provider"

type AdminHeaderProps = {
  theme: "light" | "dark"
  onToggleTheme: () => void
  sidebarCollapsed: boolean
  onToggleSidebar: () => void
}

export function AdminHeader({ theme, onToggleTheme, sidebarCollapsed, onToggleSidebar }: AdminHeaderProps) {
  const { pathname } = useLocation()
  const { locale } = useI18n()
  const current = [...adminNavigation].sort((a, b) => b.href.length - a.href.length).find((item) => item.href === pathname)
  const title = current?.label ?? "Clinic workspace"

  return (
    <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b bg-card/95 px-5 backdrop-blur sm:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button type="button" onClick={onToggleSidebar} aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"} title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"} className="hidden size-9 shrink-0 items-center justify-center rounded-lg border text-muted-foreground transition-colors hover:bg-muted lg:flex">
          {sidebarCollapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </button>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Clinic portal / Workspace</p>
          <h1 className="mt-1 truncate text-lg font-semibold">{title}</h1>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3"><LanguageSwitch />
        <button type="button" onClick={onToggleTheme} aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"} title={theme === "light" ? "Dark theme" : "Light theme"} className="flex size-10 items-center justify-center rounded-xl border text-muted-foreground transition-colors hover:bg-muted">
          {theme === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}
        </button>
        <button type="button" aria-label="Search (coming soon)" title="Search coming soon" className="flex size-10 items-center justify-center rounded-xl border text-muted-foreground hover:bg-muted"><Search className="size-4" /></button>
        <button type="button" aria-label="Notifications (coming soon)" title="Notifications coming soon" className="relative flex size-10 items-center justify-center rounded-xl border text-muted-foreground hover:bg-muted"><Bell className="size-4" /><span className="absolute right-2 top-2 size-1.5 rounded-full bg-primary" /></button>
        <span className="ml-1 hidden size-9 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-800 sm:flex">ZA</span>
      </div>
    </header>
  )
}
