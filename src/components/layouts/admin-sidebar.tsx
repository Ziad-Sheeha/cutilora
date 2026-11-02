import { Activity, ChevronDown, LogOut, Moon, Sun } from "lucide-react"
import { NavLink } from "react-router"
import { adminNavigation, adminNavigationGroups } from "@/config/admin-navigation"
import { BrandLogo } from "@/components/brand/brand-logo"

type AdminSidebarProps = {
  theme: "light" | "dark"
  onToggleTheme: () => void
  onNavigate?: () => void
}

export function AdminSidebar({ theme, onToggleTheme, onNavigate }: AdminSidebarProps) {
  return (
    <aside className="flex h-full w-full flex-col border-r bg-card">
      <div className="flex h-[76px] items-center border-b px-6"><BrandLogo imageClassName="h-11" /></div>
      <div className="border-b p-4">
        <button type="button" className="flex w-full items-center gap-3 rounded-xl border bg-background p-3 text-left transition-colors hover:bg-muted" aria-label="Current clinic and branch">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">NC</span>
          <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">Nova Clinic</span><span className="block text-xs text-muted-foreground">Main branch</span></span>
          <ChevronDown className="size-4 text-muted-foreground" />
        </button>
      </div>
      <nav aria-label="Clinic navigation" className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4">
        {adminNavigationGroups.map((group) => (
          <section key={group}>
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{group}</p>
            <div className="space-y-1">
              {adminNavigation.filter((item) => item.group === group).map(({ label, href, icon: Icon }) => (
                <NavLink key={href} to={href} end={href === "/clinic"} onClick={onNavigate} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                  <Icon className="size-[18px] shrink-0" aria-hidden="true" />{label}
                </NavLink>
              ))}
            </div>
          </section>
        ))}
      </nav>
      <div className="border-t p-4">
        <button type="button" onClick={onToggleTheme} className="mb-3 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}>
          {theme === "light" ? <Moon className="size-[18px]" /> : <Sun className="size-[18px]" />}
          <span>{theme === "light" ? "Dark theme" : "Light theme"}</span>
          <span className="ml-auto text-xs text-muted-foreground"> {theme === "light" ? "Off" : "On"} </span>
        </button>
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-muted/60 p-3">
          <span className="flex size-9 items-center justify-center rounded-full bg-violet-200 text-xs font-bold text-violet-800">ZA</span>
          <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">Clinic Admin</span><span className="block truncate text-xs text-muted-foreground">admin@novaclinic.com</span></span>
          <Activity className="size-4 text-emerald-600" />
        </div>
        <button type="button" disabled title="Authentication will be connected to the backend" className="flex w-full cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground opacity-60"><LogOut className="size-4" /> Sign out <span className="ml-auto text-[10px]">Soon</span></button>
      </div>
    </aside>
  )
}
