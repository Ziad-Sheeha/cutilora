import { Menu, X } from "lucide-react"
import { useState } from "react"
import { Link, Outlet } from "react-router"
import { AdminHeader } from "@/components/layouts/admin-header"
import { AdminSidebar } from "@/components/layouts/admin-sidebar"
import { BrandLogo } from "@/components/brand/brand-logo"

export function AdminLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  return (
    <div className="min-h-svh bg-background text-foreground lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      <div className="hidden lg:block"><AdminSidebar /></div>
      <div className="min-w-0">
        <div className="flex h-14 items-center justify-between border-b bg-card px-4 lg:hidden">
          <Link to="/" aria-label="Cutilora home"><BrandLogo imageClassName="h-7" /></Link>
          <button type="button" onClick={() => setMobileMenuOpen((open) => !open)} aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"} className="flex size-9 items-center justify-center rounded-lg border">{mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}</button>
        </div>
        {mobileMenuOpen && <div className="fixed inset-x-0 bottom-0 top-14 z-40 lg:hidden"><AdminSidebar /></div>}
        <AdminHeader />
        <main className="mx-auto w-full max-w-[1440px] p-5 sm:p-8"><Outlet /></main>
        <footer className="px-5 pb-6 text-center text-xs text-muted-foreground sm:px-8">Cutilora Clinic Portal · Preview environment</footer>
      </div>
    </div>
  )
}
