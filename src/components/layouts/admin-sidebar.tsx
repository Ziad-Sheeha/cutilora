import { Activity, ChevronDown, LogOut, Moon, Sun } from "lucide-react"
import { NavLink } from "react-router"
import { adminNavigation, adminNavigationGroups } from "@/config/admin-navigation"
import { BrandLogo } from "@/components/brand/brand-logo"

type AdminSidebarProps = {
  collapsed?: boolean
  onNavigate?: () => void
}

export function AdminSidebar({ collapsed = false, onNavigate }: AdminSidebarProps) {
  return (
    <aside className={`flex h-full flex-col border-r bg-card transition-[width] duration-200 ${collapsed ? "w-[76px]" : "w-full"}`}>
      <div className={`flex h-[76px] shrink-0 items-center border-b ${collapsed ? "justify-center px-2" : "px-6"}`}>
        {collapsed ? <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-lg font-bold text-white" aria-label="Cutilora">C</span> : <BrandLogo imageClassName="h-11" />}
      </div>
      <div className={`border-b p-3 ${collapsed ? "flex justify-center" : "p-4"}`}>
        <button type="button" title="Nova Clinic · Main branch" aria-label="Current clinic and branch" className={`flex items-center gap-3 rounded-xl border bg-background p-3 text-left transition-colors hover:bg-muted ${collapsed ? "size-11 justify-center p-0" : "w-full"}`}>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">NC</span>
          {!collapsed && <><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">Nova Clinic</span><span className="block text-xs text-muted-foreground">Main branch</span></span><ChevronDown className="size-4 text-muted-foreground" /></>}
        </button>
      </div>
      <nav aria-label="Clinic navigation" className={`min-h-0 flex-1 space-y-5 overflow-y-auto py-4 ${collapsed ? "px-2" : "px-4"}`}>
        {adminNavigationGroups.map((group) => (
          <section key={group}>
            {!collapsed && <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{group}</p>}
            <div className="space-y-1">
              {adminNavigation.filter((item) => item.group === group).map(({ label, href, icon: Icon }) => (
                <NavLink key={href} to={href} end={href === "/clinic"} onClick={onNavigate} title={collapsed ? label : undefined} aria-label={label} className={({ isActive }) => `flex items-center rounded-xl py-2.5 text-sm font-medium transition-colors ${collapsed ? "justify-center px-0" : "gap-3 px-3"} ${isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                  <Icon className="size-[18px] shrink-0" aria-hidden="true" />{!collapsed && label}
                </NavLink>
              ))}
            </div>
          </section>
        ))}
      </nav>
      <div className={`border-t py-4 ${collapsed ? "px-2" : "px-4"}`}>
        <div className={`mb-3 flex items-center gap-3 rounded-xl bg-muted/60 p-3 ${collapsed ? "justify-center px-0" : ""}`}>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-violet-200 text-xs font-bold text-violet-800">ZA</span>
          {!collapsed && <><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">Clinic Admin</span><span className="block truncate text-xs text-muted-foreground">admin@novaclinic.com</span></span><Activity className="size-4 text-emerald-600" /></>}
        </div>
        <button type="button" disabled title="Authentication will be connected to the backend" aria-label="Sign out" className={`flex w-full cursor-not-allowed items-center rounded-lg py-2 text-sm text-muted-foreground opacity-60 ${collapsed ? "justify-center px-0" : "gap-3 px-3"}`}><LogOut className="size-4" />{!collapsed && <>Sign out <span className="ml-auto text-[10px]">Soon</span></>}</button>
      </div>
    </aside>
  )
}
