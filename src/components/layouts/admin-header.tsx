import { Bell, Search } from "lucide-react"
import { useLocation } from "react-router"
import { adminNavigation } from "@/config/admin-navigation"

export function AdminHeader() {
  const { pathname } = useLocation()
  const current = adminNavigation.find((item) => item.href === pathname)
  const title = current?.label ?? "Admin workspace"

  return (
    <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b bg-card/95 px-5 backdrop-blur sm:px-8">
      <div>
        <p className="text-xs text-muted-foreground">Clinic portal / Workspace</p>
        <h1 className="mt-1 text-lg font-semibold">{title}</h1>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <button type="button" aria-label="Search (coming soon)" title="Search coming soon" className="flex size-10 items-center justify-center rounded-xl border text-muted-foreground hover:bg-muted">
          <Search className="size-4" />
        </button>
        <button type="button" aria-label="Notifications (coming soon)" title="Notifications coming soon" className="relative flex size-10 items-center justify-center rounded-xl border text-muted-foreground hover:bg-muted">
          <Bell className="size-4" />
          <span className="absolute right-2 top-2 size-1.5 rounded-full bg-primary" />
        </button>
        <span className="ml-1 hidden size-9 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-800 sm:flex">ZA</span>
      </div>
    </header>
  )
}
