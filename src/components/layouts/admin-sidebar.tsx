import { Activity, ChevronDown, LogOut } from "lucide-react"
import { NavLink } from "react-router"
import { adminNavigation } from "@/config/admin-navigation"
import { BrandLogo } from "@/components/brand/brand-logo"

export function AdminSidebar() {
  return (
    <aside className="flex h-full w-full flex-col border-r bg-card">
      <div className="flex h-[76px] items-center border-b px-6"><BrandLogo imageClassName="h-14" /></div>
      <div className="border-b p-4">
        <button type="button" className="flex w-full items-center gap-3 rounded-xl border bg-background p-3 text-left transition-colors hover:bg-muted">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">NC</span>
          <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">Nova Clinic</span><span className="block text-xs text-muted-foreground">Main branch</span></span>
          <ChevronDown className="size-4 text-muted-foreground" />
        </button>
      </div>
      <nav aria-label="Admin navigation" className="flex-1 space-y-1 p-4">
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Workspace</p>
        {adminNavigation.map(({ label, href, icon: Icon }) => (
          <NavLink key={href} to={href} end={href === "/admin"} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
            <Icon className="size-[18px]" aria-hidden="true" />{label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t p-4">
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
