import { useState } from "react"
import { NavLink, Outlet, useNavigate } from "react-router"
import { Activity, Building2, ChevronLeft, ChevronRight, LayoutDashboard, LogOut, Menu, Settings, ShieldCheck, Users, X } from "lucide-react"
import { BrandLogo } from "@/components/brand/brand-logo"
import { logoutSuperAdmin } from "@/portals/super-admin/auth/super-admin-auth"

const groups = [
  { label: "Platform", items: [{ label: "Overview", href: "/super-admin", icon: LayoutDashboard }] },
  { label: "Organization", items: [{ label: "Tenants", href: "/super-admin/tenants", icon: Building2 }, { label: "Clinics", href: "/super-admin/clinics", icon: Building2 }, { label: "Branches", href: "/super-admin/branches", icon: Building2 }] },
  { label: "Identity & access", items: [{ label: "Platform users", href: "/super-admin/users", icon: Users }, { label: "Roles & permissions", href: "/super-admin/access", icon: ShieldCheck }] },
  { label: "Governance", items: [{ label: "Audit & security", href: "/super-admin/audit", icon: Activity }, { label: "Platform settings", href: "/super-admin/settings", icon: Settings }] },
]

export function SuperAdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()

  async function handleLogout() {
    await logoutSuperAdmin()
    navigate("/super-admin/login", { replace: true })
  }

  const sidebar = (
    <aside className={`flex h-full flex-col border-r border-slate-800 bg-[#111329] text-slate-200 ${collapsed ? "w-[76px]" : "w-[264px]"}`}>
      <div className={`flex h-[76px] shrink-0 items-center border-b border-slate-800 ${collapsed ? "justify-center px-2" : "px-6"}`}>
        {collapsed ? <span className="flex size-10 items-center justify-center rounded-xl bg-violet-500 text-lg font-bold text-white">C</span> : <BrandLogo imageClassName="h-10" />}
      </div>
      <div className={`border-b border-slate-800 py-4 ${collapsed ? "px-2 text-center" : "px-5"}`}>
        {!collapsed && <><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-300">Workspace</p><p className="mt-1 text-sm font-semibold text-white">Cutilora Platform</p><p className="mt-0.5 text-xs text-slate-500">Super administrator</p></>}
        {collapsed && <ShieldCheck className="mx-auto size-5 text-violet-300" />}
      </div>
      <nav aria-label="Platform navigation" className={`min-h-0 flex-1 space-y-6 overflow-y-auto py-5 ${collapsed ? "px-2" : "px-4"}`}>
        {groups.map((group) => <section key={group.label}><p className={`mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 ${collapsed ? "sr-only" : ""}`}>{group.label}</p><div className="space-y-1">{group.items.map(({ label, href, icon: Icon }) => <NavLink key={href} to={href} end={href === "/super-admin"} onClick={() => setMobileOpen(false)} title={collapsed ? label : undefined} className={({ isActive }) => `flex items-center rounded-xl py-2.5 text-sm font-medium transition-colors ${collapsed ? "justify-center px-0" : "gap-3 px-3"} ${isActive ? "bg-violet-500/15 text-violet-200" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}><Icon className="size-[18px] shrink-0" />{!collapsed && label}</NavLink>)}</div></section>)}
      </nav>
      <div className={`border-t border-slate-800 py-4 ${collapsed ? "px-2" : "px-4"}`}>
        <button type="button" onClick={handleLogout} title="Sign out" className={`flex w-full items-center rounded-xl py-2.5 text-sm text-slate-400 transition-colors hover:bg-red-400/10 hover:text-red-300 ${collapsed ? "justify-center px-0" : "gap-3 px-3"}`}><LogOut className="size-4" />{!collapsed && "Sign out"}</button>
      </div>
    </aside>
  )

  return (
    <div className="min-h-svh bg-background text-foreground lg:flex">
      <div className="hidden shrink-0 lg:block">{sidebar}</div>
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex h-[68px] items-center justify-between border-b bg-card/95 px-4 backdrop-blur sm:px-7">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setMobileOpen(true)} className="flex size-9 items-center justify-center rounded-lg border lg:hidden" aria-label="Open navigation"><Menu className="size-4" /></button>
            <button type="button" onClick={() => setCollapsed((value) => !value)} className="hidden size-9 items-center justify-center rounded-lg border text-muted-foreground hover:bg-muted lg:flex" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>{collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}</button>
            <div><p className="text-sm font-semibold">Platform administration</p><p className="text-xs text-muted-foreground">Global operations and governance</p></div>
          </div>
          <div className="flex items-center gap-3"><span className="hidden rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 text-xs font-medium text-emerald-600 sm:inline-flex">Secure workspace</span><span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">SA</span></div>
        </header>
        {mobileOpen && <div className="fixed inset-0 z-50 flex lg:hidden"><button className="absolute inset-0 bg-black/60" aria-label="Close navigation" onClick={() => setMobileOpen(false)} /><div className="relative">{sidebar}<button onClick={() => setMobileOpen(false)} aria-label="Close navigation" className="absolute right-3 top-5 flex size-8 items-center justify-center rounded-lg text-slate-400"><X className="size-4" /></button></div></div>}
        <main className="mx-auto w-full max-w-[1500px] p-5 sm:p-8"><Outlet /></main>
        <footer className="px-5 pb-6 text-center text-xs text-muted-foreground">Cutilora Platform · Super Admin</footer>
      </div>
    </div>
  )
}
