import { Construction } from "lucide-react"
import { useLocation } from "react-router"
import { adminNavigation } from "@/config/admin-navigation"

export function AdminPlaceholderPage() {
  const { pathname } = useLocation()
  const current = adminNavigation.find((item) => item.href === pathname)
  return (
    <section className="flex min-h-[55vh] flex-col items-center justify-center rounded-2xl border border-dashed bg-card px-6 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Construction className="size-6" /></span>
      <h2 className="mt-5 text-xl font-semibold">{current?.label ?? "Page"} module</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">The route and admin shell are ready. This module’s workflows will be implemented in its dedicated frontend and backend scope.</p>
    </section>
  )
}
